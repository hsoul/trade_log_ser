'use strict'

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app
  const _jwt = app.middleware.jwtErr(app.config.jwt.secret)
  router.get('/', controller.home.index)
  router.get('/user', controller.home.user)
  router.post('/add', controller.home.add)
  router.post('/add_user', controller.home.addUser)
  router.post('/edit_user', controller.home.editUser)
  router.post('/delete_user', controller.home.deleteUser)
  router.post('/api/user/register', controller.user.register)
  router.post('/api/user/login', controller.user.login)
  router.get('/api/user/test', _jwt, controller.user.test)
  router.get('/api/user/get_userinfo', _jwt, controller.user.getUserInfo)
  router.post('/api/user/edit_userinfo', _jwt, controller.user.editUserInfo)
  router.post('/api/upload', controller.upload.upload)
  router.post('/api/tradelog/add', _jwt, controller.trade.add)
  router.get('/api/tradelog/list', _jwt, controller.trade.list)
  router.get('/api/tradelog/detail', _jwt, controller.trade.detail)
  router.post('/api/tradelog/update', _jwt, controller.trade.update)
  router.post('/api/tradelog/delete', _jwt, controller.trade.delete)
  router.get('/api/tradelog/data', _jwt, controller.trade.data)
  router.get('/api/tradelog/types', _jwt, controller.type.list)
}