/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1696836448291_5769';

  // add your middleware config here
  config.middleware = ['logger'];

  config.security = {
    csrf: {
      enable: false,
      ignoreJSON: true,
    },
    domainWhiteList: ['*'], // 配置白名单
  };

  config.view = {
    mapping: {
      '.html': 'ejs', // 左边写成html后缀，会自动渲染.html文件
    },
  };

  config.jwt = {
    secret : "NICK"
  }

  config.multipart = {
    mode: 'file',
    fileExtensions: ['.xls', '.doc', '.ppt', '.docx', '.xlsx', '.pptx', '.pdf'],
    fileSize: '5mb',
  }

  config.cors = {
    origin: '*', // 允许所有跨域访问，注释掉则允许上面白名单访问
    credentials: true, // 允许跨域请求携带cookies
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH'
  }

  exports.mysql = {
    // 单数据库信息配置
    client: {
      // host
      host: '127.0.0.1',
      // 端口号
      port: '3306',
      // 用户名
      user: 'hdq',
      // 密码
      password: '123456',
      // 数据库名
      database: 'test',
    },
    // 是否加载到 app 上，默认开启
    app: true,
    // 是否加载到 agent 上，默认关闭
    agent: false,
  };

  // add your user config here
  const userConfig = {
    myAppName: 'trade_log',
    upLoadDir: 'app/public/upload',
  };

  // config.cluster = {
  //   https: {
  //     key: './server.key',
  //     cert: './server.crt'
  //   }
  // };

  return {
    ...config,
    ...userConfig,
  };
};
