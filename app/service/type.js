'use strict'

const Service = require('egg').Service

const DIR_TYPE = {
  '多': "more",
  '空': "less",
  '总': "all",
}

global.ID_DIR_TYPE = {
  more: '多',
  less: '空',
  all: 'all',
}

const TRADE_TYPE = {
  '长': "long",
  '中': "middle",
  '短': "short",
  '极': "ponit",
  '总': "all",
}

global.ID_TRADE_TYPE = {
   long: '长',
   middle: '中',
   short: '短',
   ponit: '极',
   all: 'all',
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
      dir.push({id: DIR_TYPE["总"], name: "总"})
      Object.keys(filter_types.dir).forEach((key) => {
        if (DIR_TYPE[key])
          dir.push({id: DIR_TYPE[key], name: key})
      })

      let trade_type = []
      trade_type.push({id: TRADE_TYPE["总"], name: "总"})
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
