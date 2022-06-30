#!/usr/bin/env node --no-warnings

import fs from 'fs';
import ora from 'ora';
import fetch from 'node-fetch';
import {
    splitUrl
} from './worker.js';

const login_token = {
    "headers": {
        "accept": "application/json, text/plain, */*",
        "accept-language": "th-TH,th;q=0.9",
        "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"102\", \"Google Chrome\";v=\"102\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "cookie": "bstar-web-lang=th; buvid3=a163c1b0-beae-4356-a2d8-f788f195fedd33048infoc; DedeUserID=2094190466; DedeUserID__ckMd5=080006ae2c69fc7f; SESSDATA=07221ff2%2C1671857522%2Ccb3d8%2A61; bili_jct=bb77b42c84d3b168e841de5dcbf0bf8a; sid=juzdm4kn",
        "Referer": "https://www.bilibili.tv/th",
        "Referrer-Policy": "no-referrer-when-downgrade"
    },
    "body": null,
    "method": "GET"
};

//ask link and generate ids
var url = 'https://www.bilibili.tv/th/play/1050808/11275804'

let {
    seasonid,
    epid
} = splitUrl(url);
console.log(`seasonid: ${seasonid} epid: ${epid}`);
const spinner = ora('Loading...').start();
if (!fs.existsSync('./tmp/')) {
    fs.mkdirSync('./tmp/');
}
//seasonurl
var seasonurl = 'https://api.bilibili.tv/intl/gateway/web/v2/ogv/play/episodes?platform=web?s_locale=th_TH&season_id=' + seasonid;
var seasontd = './tmp/' + seasonid + '/';
//fetch url data
fetch(seasonurl).then(function (response) {
    return response.json();
}).then(function (data) {
    const d = data.data.sections[0].episodes;
    //loop data and output episode_id
    for (let i = 0; i < d.length; i++) {
        //get playurl files
        fetch('https://api.bilibili.tv/intl/gateway/web/playurl?device=wap&platform=web&qn=64&tf=0&type=0&ep_id=' + d[i].episode_id, login_token)
            .then(function (response) {
                return response.json();
            }).then(function (data) {
                if (!fs.existsSync(seasontd)) {
                    fs.mkdirSync(seasontd);
                }
                fs.writeFileSync(seasontd + d[i].episode_id + '.json', JSON.stringify(data));
                spinner.succeed('Saved ' + d[i].title_display);
                //get subtitle files
                fetch('https://api.bilibili.tv/intl/gateway/m/subtitle?ep_id=' + d[i].episode_id, login_token).then(function (response) {
                    return response.json();
                }).then(function (data) {
                    fs.writeFileSync(seasontd + d[i].episode_id + '-sub' + '.json', JSON.stringify(data));
                });
            });
    }
    spinner.succeed('Loaded');
});