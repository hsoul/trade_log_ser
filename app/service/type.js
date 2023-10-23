'use strict'

const Service = require('egg').Service

const DIR_TYPE = {
  '多': 1,
  '空': 2,
  '总': 3,
}

const TRADE_TYPE = {
  '长': 1,
  '中': 2,
  '短': 3,
  '极': 4,
}

class TypeService extends Service {
  async list(id) { // 获取标签列表
    const { ctx, app } = this
    try {
      const all_list = await ctx.service.trade.list(id, 'id, dir, trade_type')
      const filter_types = all_list.reduce((obj, item) => {
      if (!obj.dir[item.dir]) {
        obj.dir[item.dir] = true
      }
      if (!obj.trade_type[item.trade_type]) {
        obj.trade_type[item.trade_type] = true
      }
      return obj
      }, {
        dir: {},
        trade_type: {},
      })
      
      let dir = []
      Object.keys(filter_types.dir).forEach((key) => {
        if (DIR_TYPE[key])
          dir.push({id: DIR_TYPE[key], name: key})
      })
      dir.push({id: DIR_TYPE["总"], name: "总"})

      let trade_type = []
      Object.keys(filter_types.trade_type).forEach((key) => {
        if (TRADE_TYPE[key])
          trade_type.push({id: TRADE_TYPE[key], name: key})
      })

      return {
        dir,
        trade_type,
      }
    } catch (error) {
      console.log(error)
      return null
    }
  }
}

module.exports = TypeService
