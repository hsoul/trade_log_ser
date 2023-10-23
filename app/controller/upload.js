'use strict'

const fs = require('fs')
const moment = require('moment')
const { mkdirp }  = require('mkdirp')
const path = require('path')

const Controller = require('egg').Controller

class UploadController extends Controller {
  async upload() {
    const { ctx } = this
    console.log('ctx.request.files', ctx.request.files)
    let file = ctx.request.files[0]
    let upLoadDir = ''

    try {
      let f = fs.readFileSync(file.filepath)
      let day = moment(new Date()).format('YYYYMMDD') // 获取当前日期
      console.log(this.config.upLoadDir)
      let dir = path.join(this.config.upLoadDir, day) // 创建图片保存的路径
      let date = Date.now() // 毫秒数
      // console.log(dir)
      await mkdirp(dir) // 不存在就创建目录
      upLoadDir = path.join(dir, date + path.extname(file.filename)) // 拼接文件名
      fs.writeFileSync(upLoadDir, f) // 写入文件
    } finally {
      ctx.cleanupRequestFiles() // 清除临时文件
    }
    console.log(upLoadDir)
    ctx.body = {
      code:200,
      msg: '上传成功',
      data: upLoadDir.replace(/app/g, '') // 这里要注意的是，需要将 app 去除，因为我们在前端访问路径的时候，是不需要 app 这个路径的
    }
  }
}

module.exports = UploadController