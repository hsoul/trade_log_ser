'use strict'

const moment = require('moment')

const Controller = require('egg').Controller

class TradeLogController extends Controller {
  async add() {
    const { ctx, app } = this
    const {
      start_time, 
      end_time, 
      num, 
      dir, 
      trade_type, 
      strategy, 
      start_reason, 
      to_rate, 
      start_price,
      stop_loss,
      promise_money, 
      finish_price, 
      force_price, 
      income, 
      summarize, 
      exit_reason
    } = this.ctx.request.body
    if (!start_time || 
      !num || 
      !dir || 
      !trade_type || 
      !strategy || 
      !start_reason || 
      !to_rate || 
      !promise_money || 
      !stop_loss ||
      !start_price || 
      !force_price) 
    {
      this.ctx.body = {
        code: 400,
        msg: '必要参数不完整',
        data: null
      }
      return
    }

    try {
      let user_id
      const token = ctx.request.header.authorization
      const decode = await app.jwt.verify(token, app.config.jwt.secret)
      if (!decode)
        return
      user_id = decode.id
      const result = await ctx.service.trade.add({
        start_time,
        end_time,
        num,
        dir,
        trade_type, 
        strategy, 
        start_reason,
        to_rate,
        promise_money,
        stop_loss,
        start_price,
        finish_price,
        force_price,
        income,
        summarize,
        exit_reason,
        user_id
      })
      if (result == null) {
        ctx.body = {
          code: 500,
          msg: '添加失败',
          data: null
        }
        return
      }
      ctx.body = {
        code: 200,
        msg: '添加成功',
        data: null
      }
    } catch (error) {
      console.log(error)
      ctx.body = {
        code: 500,
        msg: '系统错误',
        data: null
      }
    }
  }

  async list() {
    const { ctx, app } = this
    const { filter_date, end_date, page = 1, page_size = 5, time_filter_type = 'all', dir_filter_type = 'all', trade_type = 'all', strategy = 'all'} = ctx.query

    try {
      let user_id
      const token = ctx.request.header.authorization
      const decode = await app.jwt.verify(token, app.config.jwt.secret)
      if (!decode)
        return
      user_id = decode.id

      if (time_filter_type == 'period')
      {
        if (!filter_date || !end_date) {
          ctx.body = {
            code: 400,
            msg: '必要参数不完整',
            data: null
          }
          return
        }
      }

      const all_list = await ctx.service.trade.list(user_id, 'id, trade_type, strategy, start_time, end_time, num, dir, to_rate, income')
      // console.log(all_list, all_list)
      const time_list = all_list.filter(item => { // 日期过滤
        if (time_filter_type == 'all') 
          return true
        else if (time_filter_type == 'year')
          return moment(item.start_time * 1000).format('YYYY') === filter_date
        else if (time_filter_type == 'month')
          return moment(item.start_time * 1000).format('YYYY-MM') === filter_date
        else if (time_filter_type == 'date')
          return moment(item.start_time * 1000).format('YYYY-MM-DD') === filter_date
        else if (time_filter_type == 'period')
          return moment(item.start_time * 1000).isBetween(moment(filter_date), moment(end_date))
      })
      // console.log("time_list", time_list)
      const dir_list = time_list.filter(item => { // 方向过滤
        // console.log("item.dir", ID_DIR_TYPE[dir_filter_type] )
        if (dir_filter_type == 'all')
          return true
        else
          return item.dir === ID_DIR_TYPE[dir_filter_type]
      })
      // console.log("dir_list", dir_list)

      const trade_type_list = dir_list.filter(item => { // 交易类型过滤
        // console.log("item.dir", trade_type, ID_TRADE_TYPE[trade_type] )
        if (trade_type == 'all')
          return true
        else
          return item.trade_type === ID_TRADE_TYPE[trade_type]
      })

      const strategy_type_list = trade_type_list.filter(item => { // 交易类型过滤
        if (strategy == 'all')
          return true
        else
          return item.strategy === strategy
      })

      // console.log("trade_type_list", trade_type_list)
      const prop_filter_list = strategy_type_list.map(({start_reason, ...rest}) => rest) // 过滤掉不需要的字段
      // console.log("prop_filter_list", prop_filter_list)

      let list_map = prop_filter_list.reduce((curr, item) => { // curr 默认是一个空数组
        const date = moment(item.start_time * 1000).format('YYYY-MM-DD')
        if (curr && curr.length && curr.findIndex(item => item.date === date) > -1) {
          const index = curr.findIndex(item => item.date === date)
          curr[index].list.push(item)
        }

        if (curr && curr.length && curr.findIndex(item => item.date === date) === -1) {
          curr.push({
            date,
            list: [item]
          })
        }

        if (!curr.length) {
          curr.push({
            date,
            list: [item]
          })
        }

        return curr
      }, []).sort((a, b) => moment(b.date).valueOf() - moment(a.date).valueOf()) // 时间顺序为倒序

      const filter_list_map = list_map.slice((page - 1) * page_size, page * page_size)

      let total_income = strategy_type_list.reduce((num, item) => {
        if (item.income > 0) {
          num += Number(item.income)
          return num
        }
        return num
      }, 0)

      let total_out = strategy_type_list.reduce((num, item) => {
        if (item.income < 0) {
          num += Number(item.income)
          return num
        }
        return num
      }, 0)

      ctx.body = {
        code: 200,
        msg: '获取成功',
        data: {
          list: filter_list_map || [],
          total_page: Math.ceil(list_map.length / page_size),
          total_income: total_income || 0,
          total_out: total_out || 0,
        }
      }
    } catch (error) {
      console.log(error)
      ctx.body = {
        code: 500,
        msg: '系统错误',
        data: null
      }
    }
  }

  async detail() {
      const { ctx, app } = this
      const { id = '' } = ctx.query
      let user_id
      const token = ctx.request.header.authorization
      const decode = await app.jwt.verify(token, app.config.jwt.secret)
      if (!decode)
          return
      user_id = decode.id
      if (!id) {
          ctx.body = {
              code: 500,
              msg: 'id不能为空',
              data: null
          }
          return
      }
      try {
          const detail = await ctx.service.trade.detail(id, user_id)
          ctx.body = {
              code: 200,
              msg: '请求成功',
              data: detail
          }
      } catch (error) {
          console.log(error)
          ctx.body = {
              code: 500,
              msg: '系统错误',
              data: null
          }
      }
  }

  async update() {
    const { ctx, app } = this
    const { 
      id, 
      start_time,
      end_time,
      num, 
      dir, 
      trade_type, 
      strategy, 
      start_reason, 
      to_rate, 
      stop_loss,
      promise_money, 
      start_price, 
      finish_price, 
      force_price, 
      income, 
      summarize, 
      exit_reason 
    } = ctx.request.body
    if (!id)  {
      ctx.body = {
        code: 400,
        msg: '必要参数不完整',
        data: null
      }
      return
    }
    console.log("update", start_reason)
    try {
      let user_id
      const token = ctx.request.header.authorization
      const decode = await app.jwt.verify(token, app.config.jwt.secret)
      if (!decode)
        return
      user_id = decode.id
      const result = await ctx.service.trade.update({
        id,
        start_time,
        end_time,
        num,
        dir,
        trade_type, 
        strategy, 
        start_reason,
        to_rate,
        stop_loss,
        promise_money,
        start_price,
        finish_price,
        force_price,
        income,
        summarize,
        exit_reason,
        user_id
      })
      ctx.body = {
        code: 200,
        msg: '更新成功',
        data: null
      }
    } catch (error) {
      console.log(error)
      ctx.body = {
        code: 500,
        msg: '系统错误',
        data: null
      }
    }
  }

  async delete() {
    const { ctx, app } = this
    const { id } = ctx.request.body
    if (!id) {
      ctx.body = {
        code: 400,
        msg: '必要参数不完整',
        data: null
      }
      return
    }

    try {
      const token = ctx.request.header.authorization
      const decode = await app.jwt.verify(token, app.config.jwt.secret)
      if (!decode)
        return
      let user_id = decode.id
      if (!user_id) {
        ctx.body = {
          code: 400,
          msg: 'token无效',
          data: null
        }
        return
      }
      const result = await ctx.service.trade.delete(id, user_id)
      ctx.body = {
        code: 200,
        msg: '删除成功',
        data: null
      }
    } catch (error) {
      console.log(error)
      ctx.body = {
        code: 500,
        msg: '系统错误',
        data: null
      }
    }
  }

  summarize(list, dir) {
    // 多、空、总
    // 累计收益 = 总收益 - 总亏损
    // 累计收益率 = 累计收益 / 总投入
    // 单笔交易平均收益率 = 累计收益率 / 交易笔数
    // 交易笔数 = 交易次数
    // 胜率 = 盈利次数 / 交易次数
    // 平均盈亏比率 = 单笔交易平均收益率 / 胜率
    // 月化收益率 = 累计收益率 / 交易天数 * 30

    // 单笔最大亏损
    // 单日最大亏损
    // 亏损单平均亏损 = 总亏损 / 亏损次数
    // 亏损单平均亏损率 = 总亏损 / 亏损次数 / 总投入
    // 最大连续亏损日数 = 亏损次数

    // 单笔最大盈利
    // 单日最大盈利
    // 盈利单平均盈利 = 总收益 / 盈利次数
    // 盈利单平均盈利率 = 总收益 / 盈利次数 / 总投入
    // 最大连续盈利日数 = 盈利次数

    try {
      // const dir_filter_list = list.filter(item => {
      //   if (dir == 'all') 
      //     return true
      //   else if (dir == item.dir)
      //     return true
      //   return false;
      // })

      // console.log("dir_filter_list", dir_filter_list)

      const iter_data = list.reduce((obj, item) => {
        obj['total_income'] += Number(item.income)
        obj['total_num'] += 1
        if (item.income > 0) {
          obj['total_win_times'] += 1
          obj['total_win_num'] += Number(item.income)
        }
        else {
          obj['total_loss_times'] += 1
          obj['total_loss_num'] += Number(item.income)
        }
        if (item.start_time < obj.start_time || obj.start_time === 0) {
          obj.start_time = item.start_time
        }
        if (item.start_time > obj.end_time) {
          obj.end_time = item.start_time
        }
        return obj
      }, {
        total_income: 0,
        total_win_num: 0,
        total_loss_num: 0,
        total_num: 0,
        total_win_times: 0,
        total_loss_times: 0,
        start_time: 0,
        end_time: 0,
      })

      // console.log(iter_data)

      // 计算各项指标
      const total_investment = 100 // 总投入10000先写死,后续加一个账单表,记录投入支出
      const total_profit = iter_data.total_income // 累计收益
      const total_profit_rate = total_profit / total_investment // 累计收益率
      const average_profit_rate = total_profit_rate / iter_data.total_num // 单笔交易平均收益率
      const total_num = iter_data.total_num // 交易笔数
      const win_rate = iter_data.total_win_times / iter_data.total_num // 胜率
      const average_profit_loss_ratio = average_profit_rate / win_rate // 平均盈亏比率
      const monthly_profit_rate = total_profit_rate / (moment(iter_data.start_time).diff(moment(iter_data.end_time), 'days') + 1) * 30

      const day_filter_list = list.reduce((arr, item) => {
        const date = moment(item.start_time*1000).format('YYYY-MM-DD')
        console.log("date", date)
        const index = arr.findIndex(item => item.date === date)
        if (index === -1) {
          arr.push({ date, loss: Number(item.income) < 0 ? Number(item.income) : 0, profit: Number(item.income) > 0 ? Number(item.income) : 0, list_begin_time: item.start_time, list_end_time: item.start_time })
        } else {
          if (Number(item.income) > 0)
            arr[index].profit += Number(item.income)
          else
            arr[index].loss += Number(item.income)
        }
        return arr
      }, [])

      console.log("trade_days", day_filter_list)

      const max_loss_per_trade = -1 * Math.max(...list.map(item => -1 * Number(item.income))); // 单笔最大亏损
      const max_loss_per_day = Math.min(...day_filter_list.map(item => Number(item.loss))) // 单日最大亏损
      const average_loss_per_loss_trade = iter_data.total_loss_num / iter_data.total_loss_times // 亏损单平均亏损
      const average_loss_rate_per_loss_trade = average_loss_per_loss_trade / total_investment // 亏损单平均亏损率
      const max_consecutive_loss_days = list.reduce((obj, item) => { // 最大连续亏损日数
        if (Number(item.income) < 0) {
          obj.current += 1
          obj.max = Math.max(obj.max, obj.current)
        } else {
          obj.current = 0
        }
        return obj
      }, { current: 0, max: 0 }).max

      const max_profit_per_trade = Math.max(...list.map(item => Number(item.income))) // 单笔最大盈利
      const max_profit_per_day = Math.max(...day_filter_list.map(item => item.profit)) // 单日最大盈利
      const average_profit_per_win_trade = iter_data.total_win_num / iter_data.total_win_times // 盈利单平均盈利
      const average_profit_rate_per_win_trade = average_profit_per_win_trade / total_investment // 盈利单平均盈利率
      const max_consecutive_win_days = list.reduce((obj, item) => { // 最大连续盈利日数 = 盈利次数
        if (Number(item.income) > 0) {
          obj.current += 1
          obj.max = Math.max(obj.max, obj.current)
        } else {
          obj.current = 0
        }
        return obj
      }, { current: 0, max: 0 }).max

      console.log("max_consecutive_win_days", max_loss_per_day, max_profit_per_day)

      // 返回计算结果
      return {
        total_investment,
        total_profit,
        total_loss_num: iter_data.total_loss_num,
        total_num,
        total_profit_rate,
        average_profit_rate,
        win_rate,
        average_profit_loss_ratio,
        monthly_profit_rate,
        max_loss_per_trade: max_loss_per_trade < 0 ? max_loss_per_trade : 0,
        max_loss_per_day: max_loss_per_day < 0 ? max_loss_per_day : 0,
        average_loss_per_loss_trade,
        average_loss_rate_per_loss_trade,
        max_consecutive_loss_days,
        max_profit_per_trade: max_profit_per_trade > 0 ? max_profit_per_trade : 0,
        max_profit_per_day: max_profit_per_day > 0 ? max_profit_per_day : 0,
        average_profit_per_win_trade,
        average_profit_rate_per_win_trade,
        max_consecutive_win_days,
        trade_start_day: moment(iter_data.start_time * 1000).format('YYYY-MM-DD'),
        trade_end_day: moment(iter_data.end_time * 1000).format('YYYY-MM-DD'),
        total_win_times: iter_data.total_win_times,
        total_loss_times: iter_data.total_loss_times,
        trade_days: day_filter_list.length,
      }
    } catch (error) {
      console.log(error)
      return null
    }
  }

  async data() {
    const { ctx, app } = this
    const { date, begin_date, end_date , dir = 'all', trade_type = 'all', strategy = 'all'} = ctx.query
    const token = ctx.request.header.authorization
    const decode = await app.jwt.verify(token, app.config.jwt.secret)
    if (!decode)
      return
    let user_id = decode.id
    console.log("data", date, begin_date, end_date, dir, trade_type)
    try {
      const all_list = await ctx.service.trade.list(user_id, 'id, trade_type, strategy, start_time, end_time, num, dir, to_rate, income')
      const time_list = all_list.filter(item => {
        if (date){
          return moment(item.start_time * 1000).format('YYYY-MM') === date
        }
        else if (begin_date && end_date) {
          const begin_day = moment(begin_date).startOf('day').unix()
          const end_day = moment(end_date).endOf('day').unix()
          const trade_start_day = moment(item.start_time * 1000).unix()
          return trade_start_day >= begin_day && trade_start_day <= end_day
        }
        else
          return true;
      })

      const dir_list = time_list.filter(item => { // 方向过滤
        console.log("item.dir", ID_DIR_TYPE[dir], dir, item.dir)
        if (dir == 'all')
          return true
        else
          return item.dir === ID_DIR_TYPE[dir]
      })

      const trade_type_list = dir_list.filter(item => { // 交易类型过滤
        if (trade_type == 'all')
          return true
        else
          return item.trade_type === ID_TRADE_TYPE[trade_type]
      })

      const strategy_type_list = trade_type_list.filter(item => { // 交易类型过滤
        if (strategy == 'all')
          return true
        else
          return item.strategy === strategy
      })

      // console.log("trade_type_list", trade_type_list)

      const ret_data = this.summarize(strategy_type_list, dir)
      console.log(ret_data)
      ctx.body = {
        code: 200,
        msg: '获取成功',
        data: ret_data || {},
      }
    } catch (error) {
      ctx.body = {
        code: 500,
        msg: '系统错误',
        data: null
      }
    }
  }
}

module.exports = TradeLogController