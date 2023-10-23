// controller/user.js
'use strict'

const Controller = require('egg').Controller

class UserController extends Controller {
  async register() {
    const { ctx } = this
    const { username, password } = ctx.request.body
    ctx.logger.info('ctx.logger');
    if (!username || !password) {
      ctx.body = {
        code: 500,
        msg: '账号或密码不能为空',
        data: null
      }
      return
    }

    const user = await ctx.service.user.getUserByName(username)
    if (user && user.id) {
      ctx.body = {
        code: 500,
        msg: '账户名已存在, 请更换用户名继续注册',
        data: null
      }
      return
    }

    const defaultAvatar = 'http://s.yezgea02.com/1615973940679/WeChat77d6d2ac093e247c361f0b8a7aeb6c2a.png'
    const ctime = new Date().getTime()
    const result = await ctx.service.user.register({
      username,
      password,
      signature: '世界和平',
      avatar: defaultAvatar,
      ctime
    })

    if (result) {
      ctx.body = {
        code: 200,
        msg: '注册成功',
        data: null
      }
    } else {
      ctx.body = {
        code: 500,
        msg: '注册失败',
        data: null
      }
    }
  }

  async login() {
    const { ctx, app } = this
    const { username, password } = ctx.request.body
    if (!username || !password) {
      ctx.body = {
        code: 500,
        msg: '账号或密码不能为空',
        data: null
      }
      return
    }

    const user = await ctx.service.user.getUserByName(username, password)
    if (!user || !user.id) {
      ctx.body = {
        code: 500,
        msg: '账号不存在',
        data: null
      }
      return
    }

    if(user && user.password !== password) {
      ctx.body = {
        code: 500,
        msg: '密码输入错误',
        data: null
      }
      return
    }

    const token = app.jwt.sign({
      id: user.id,
      username: user.username,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) * 5
    }, app.config.jwt.secret)

    ctx.body = {
      code: 200,
      msg: '登录成功',
      data: {
        token
      }
    }
  }

  async test() {
    const { ctx, app } = this
    const token = ctx.request.header.authorization
    const decode = await this.app.jwt.verify(token, app.config.jwt.secret)

    ctx.body = {
      code: 200,
      msg: '获取成功',
      data: {
        ...decode
      }
    }
  }

  async getUserInfo() {
    const { ctx, app } = this
    const token = ctx.request.header.authorization
    const decode = await app.jwt.verify(token, app.config.jwt.secret)
    const user = await ctx.service.user.getUserByName(decode.username)
    ctx.body = {
      code: 200,
      msg: '获取成功',
      data: {
        id: user.id,
        username: user.username,
        signature: user.signature,
        avatar: user.avatar
      }
    }
  }

  async editUserInfo() {
    const { ctx, app } = this
    const { signature = '', avatar = '' } = ctx.request.body
    try {
      let user_id
      const token = ctx.request.header.authorization
      const decode = await app.jwt.verify(token, app.config.jwt.secret)
      if (!decode)
        return
      user_id = decode.id
      const user = await ctx.service.user.getUserByName(decode.username)
      const result = await ctx.service.user.editUserInfo({
        ...user,
        signature,
        avatar,
      })

      ctx.body = {
        code: 200,
        msg: '更新成功',
        data: {
          id: user_id,
          username: user.username,
          signature,
          avatar,
        }
      }
    } catch (error) {
      console.log(error)
      return
    }
  }
}

module.exports = UserController