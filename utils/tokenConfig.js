const fs = require("fs");
const path = require("path");
const http = require("axios");
const folderUrl = path.resolve(__dirname, "../json");
const fileUrl = path.resolve(__dirname, "../json/token.json");
const MPAPPID = process.env.MPAPPID; // 测试号的 APPID
const MPAPPSECRET = process.env.MPAPPSECRET; // 测试号的 APPSECRET
let INTERTIME = (7200 - 60) * 1000; // 设置一个默认的定期获取token的时间

// 保存Token
function setToken() {
    return new Promise(async (resolve, reject) => {
        try {
            const res = await http.get(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${MPAPPID}&secret=${MPAPPSECRET}`);
            console.log(res.data)
            INTERTIME = (res.data.expires_in - 60) * 1000;
            fs.mkdirSync(folderUrl);
            fs.writeFile(
                fileUrl,
                JSON.stringify({
                    mpToken: res.data.access_token
                }),
                () => {
                    // 通知外界Tonken获取成功
                    resolve();
                }
            );
        } catch (error) {
            reject(error);
        }
    })
}


// 定时获取Token
function timingSetToken() {
    // 定时刷新token
    setInterval(() => {
        setToken();
    }, INTERTIME);
}

// 获取MpToken
function getMpToken() {
    return new Promise((resolve, reject) => {
        // 从json中读取保存的Token
        fs.readFile(fileUrl, (err, data) => {
            // 返回获取到的token
            resolve(JSON.parse(data).mpToken);
        });
    });
}

// 导出封装好的方法
module.exports = {
    setToken, // 更新token
    timingSetToken, // 定时更新token
    getMpToken, // 返回小程序token
};
