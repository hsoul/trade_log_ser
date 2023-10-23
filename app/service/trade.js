'use strict'

const Service = require('egg').Service

class TradeLogService extends Service {
    async add(params) {
        const { ctx, app } = this
        try {
            const result = await app.mysql.insert('trade_log', params)
            return result
        } catch (error) {
            console.log(error)
            return null
        }
    }

    async list (id, query_str) {
        const { ctx, app } = this
        // const QUEWRY_STR = 'id, start_time, end_time, num, dir, start_reason, to_rate, promise_money, start_price, finish_price, force_price, income, summarize, exit_reason'
        let sql = `select ${query_str} from trade_log where user_id = ${id}`
        try {
            const result = await app.mysql.query(sql)
            return result
        } catch (error) {
            console.log(error)
            return null
        }
    }

    async detail(id, user_id) {
      const { ctx, app } = this
      try {
        const result = await app.mysql.get('trade_log', {id, user_id})
        return result
      } catch (error) {
        console.log(error)
        return null
      }
    }

    async update(params) {
        const { ctx, app } = this
        const filter_params = Object.keys(params).reduce((acc, key) => { // 过滤掉undefined的参数
            if (params[key] !== undefined) {
                acc[key] = params[key];
            }
            return acc;
        }, {})
        console.log("trade_log update", filter_params)
        try {
            let result = await app.mysql.update('trade_log', { ...filter_params }, {
                id: filter_params.id,
                user_id: filter_params.user_id
            })
        } catch (error) {
            console.log(error)
            return null
        }
    }

    async delete(id, user_id) {
        const { ctx, app } = this
        try {
            const result = await app.mysql.delete('trade_log', {id, user_id})
            console.log(result, id, user_id)
            return result
        } catch (error) {
            console.log(error)
            return null
        }
    }
}

module.exports = TradeLogService