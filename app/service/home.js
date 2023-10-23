// app/service/home.js
'use strict';

const { Service } = require('egg');

class HomeService extends Service {
  async user() {
    const { ctx, app } = this
    const QUERY_STR = 'id, name'
    let sql = `select ${QUERY_STR} from list`
    try {
      const result = await app.mysql.query(sql);
      console.log(result)
      return result
    } catch (error) {
      console.log(error)
      return null
    }
  }

  async addUser(name) {
    const { ctx, app } = this
    try {
      const result = await app.mysql.insert('list', { name })
      return result
    }
    catch (error) {
      console.log(error)
      return null
    }
  }

  async editUser(id, name) {
    const { ctx, app } = this
    try {
      let result = await app.mysql.update('list', { name }, {
        where: {
            id
        }
      })
      console.log(id, name)
      return result
    } catch (error) {
      console.log(error)
      return null
    }
  }

  async deleteUser(id) {
    const { ctx, app } = this
    try {
      let result = await app.mysql.delete('list', { id })
      return result
    } catch (error) {
      console.log(error)
      return null
    }
  }
}

module.exports = HomeService;