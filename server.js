require("dotenv").config();
const axios = require("axios");
const fs = require('fs');
const path = require('path');
const express = require("express");
const mongoose = require("mongoose");
const { User, Ticket, Notice } = require("./model/main");
const date = require("silly-datetime");
const http = require('http')
const xmlparser = require('express-xml-bodyparser'); // 解析 xml

const { setToken, timingSetToken, getToken, getMpToken } = require("./utils/tokenConfig"); // token工具包
// 项目启动后自动执行获取token的方法
setToken().then(() => {
    // token 获取成功后开始定时刷新token操作
    timingSetToken();
});

let bodyParser = require("body-parser"); // 引入中间件
// let jsonParser = bodyParser.json({ extended: false }); // 解析json类型
const app = express();
app.use(express.raw());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});
const server = http.createServer(app)

server.listen(process.env.PORT)
console.log('START:' + date.format(new Date(), "YYYY-MM-DD HH:mm"));

app.get("/maimo", async (req, res) => {
    // console.log(date.format(new Date(), "YYYY-MM-DD HH:mm"), "/maimo");
    res.send('MAIMO')
});

app.get("/getmpcode", bodyParser.json({ extended: false }), async (req, res) => {
    const ipAddress = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection.remoteAddress;
    console.log(`${date.format(new Date(), "YYYY-MM-DD HH:mm")} ${ipAddress} ${req.method} ${req.path}`);
    let mpToken = await getMpToken()
    let data = {
        path: decodeURIComponent(req.query.path),
        is_hyaline: true,
        auto_color: true
    }
    console.log(data)
    try {
        axios({ url: `https://api.weixin.qq.com/wxa/getwxacode?access_token=${mpToken}`, method: 'post', data, responseType: 'stream' })
            .then(response => {
                // 将二进制数据转换为 Base64 字符串
                res.setHeader('Content-Type', 'image/jpeg');
                response.data.pipe(res);
            }).catch(error => {
                console.error(error);
                res.send('Something wrong.')
            })
    } catch (error) {
        res.send('Something wrong.')
    }
});

app.all("*", function (req, res, next) {
    res.send({
        code: 404,
        codeDesc: "NotFound",
        message: "404 not found",
    });

});
