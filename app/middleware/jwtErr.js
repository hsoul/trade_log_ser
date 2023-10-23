'use strict'

module.exports = (secret) => {
    return async function jwtErr(ctx, next) {
        const token = ctx.request.header.authorization
        let decode
        if (token != 'null' && token) {
            try {
                decode = ctx.app.jwt.verify(token, secret) // 如果是存在且有效，则通过验证 await next() 继续执行后续的接口逻辑
                await next()
            } catch (error) {
                console.log(error)
                ctx.status = 200
                ctx.body = {
                    code: 401,
                    msg: 'token已过期，请重新登录',
                }
                return
            }
        } else {
            ctx.status = 200
            ctx.body = {
                code: 401,
                msg: '没有token，请重新登录',
            }
            return
        }
    }
}