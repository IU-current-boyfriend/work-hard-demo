// 引入express
const express = require('express');
// 引入bodyParser
const bodyParser = require('body-parser');
// 引入处理路径的resolve方法
const { resolve } = require('path');
// 创建express应用
const app = express();
// 处理post请求数据的格式问题
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// 跨域问题
app.all('*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST');
  next();
});

app.post('/upload', (req, res) => {
  console.log('req: =>', req.params);

  setTimeout(() => {
    res.json({
      code: 200,
      msg: 'ok',
      data: [],
    });
  }, 2000);
});

// 监听接口
app.listen('3000', () => {
  console.log('watching 3000 port....');
});
