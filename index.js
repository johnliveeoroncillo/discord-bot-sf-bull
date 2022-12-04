const axios = require('axios');
const cheerio = require('cheerio');
const moment = require('moment-timezone');
require('moment-countdown');
moment.tz.setDefault('Asia/Manila');

require('dotenv/config');

const express = require('express');
const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK || '';
  
const app = express();
const PORT = process.env.PORT || 3000;

const sendDiscord = async(params, res) => {
    if (!DISCORD_WEBHOOK || DISCORD_WEBHOOK === '') {
        return res.status(400).send('UNABLE TO SEND WEBHOOK'); 
    }
        
    console.log(JSON.stringify(params, null, 2));

    axios.post(DISCORD_WEBHOOK, params, {
        headers: {
            'Content-type': 'application/json',
        }
    }).then(res => {
        const { data } = res;
        console.log('RESPONSE', data);
    }).catch(e => {
        console.error(e.message, e.stack, JSON.stringify(e, null,4));
    });
}

const dailyMission  = async (res) => {
  const url = `https://sf.bullgamez.com/`;
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const missions =  $('h2:contains("Missions of The Day")');
    // const container = $(mission).closest('li').html();
    var params = {
        username: "SF Bull",
        avatar_url: "https://epins-gamestore.com/image/cache/catalog/bullsf/13239044_851643544979507_4216959116671837103_n-300x300.jpg",
        content: "",
        embeds: []
    }

    if (missions.length) {
        const regular_mission = missions[0];
        const index = params.embeds.push({
            "title": $(regular_mission).text(),
            "color": 22015,
            "thumbnail": {
                "url": "",
            },
            "fields": []
        }) - 1;

        const tr = $(regular_mission).closest('li').find('table').find('tr');
        const td = $(tr).find('td');
        if (td.length) {
            let child_index = -1;
            for (let r = 1; r < tr.length; r++) {
                const tds = $(tr[r]).find('td');
                const isOdd = (r%2);
                if (isOdd) {
                    let name = [];
                    for (let t = 0; t < tds.length; t++) {
                        name.push($(tds[t]).text());
                    }
                    child_index = params.embeds[index].fields.push({
                        name: "🎯" + name.join(' - '),
                        value: "",
                        inline: false,
                    }) - 1;
                } else if (child_index !== -1 && !isOdd) {
                    const td = $(tr[r]).find('td');
                    params.embeds[index].fields[child_index].value = $(td[1]).html();
                    child_index = -1;
                }
            }
        }

        const vip_regular_mission = missions[1];
        const vip_index = params.embeds.push({
            "title": $(vip_regular_mission).text(),
            "color": 15258703,
            "thumbnail": {
                "url": "",
            },
            "fields": []
        }) - 1;

        const vip_tr = $(vip_regular_mission).closest('li').find('table').find('tr');
        const vip_td = $(vip_tr).find('td');
        if (vip_td.length) {
            let vip_child_index = -1;
            for (let r = 1; r < vip_tr.length; r++) {
                const vip_tds = $(vip_tr[r]).find('td');
                const isOdd = (r%2);
                if (isOdd) {
                    let name = [];
                    for (let t = 0; t < vip_tds.length; t++) {
                        name.push($(vip_tds[t]).text());
                    }
                    vip_child_index = params.embeds[vip_index].fields.push({
                        name: "🎯" + name.join(' - '),
                        value: "",
                        inline: false,
                    }) - 1;
                } else if (vip_child_index !== -1 && !isOdd) {
                    const td = $(vip_tr[r]).find('td');
                    params.embeds[vip_index].fields[vip_child_index].value = $(td[1]).html();
                    vip_child_index = -1;
                }
            }
        }

        await sendDiscord(params, res);
    }
  } catch (e) {
    console.error(e);
  }
}

const dailyLogin  = async (res) => {
    const url = `https://sf.bullgamez.com/`;
    try {
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);
      const daily_logins =  $('h2:contains("Login Event on date")');
      // const container = $(mission).closest('li').html();
      var params = {
          username: "SF Bull",
          avatar_url: "https://epins-gamestore.com/image/cache/catalog/bullsf/13239044_851643544979507_4216959116671837103_n-300x300.jpg",
          content: "",
          embeds: []
      }
  
      if (daily_logins.length) {
          const daily_login = daily_logins[0];
          const index = params.embeds.push({
              "title": $(daily_login).text(),
              "color": 15258703,
              "thumbnail": {
                  "url": "",
              },
              "fields": []
          }) - 1;
  
          const tr = $(daily_login).closest('li').find('table').find('tr');
          const span = $(tr).find('td').find('span');
          if (span.length) {
                const today = moment(new Date(), 'YYYY-MM-DD HH:mm:ss');
                const next_day = moment(today, 'YYYY-MM-DD HH:mm:ss').add(1, 'day');
                next_day.set({hour:0,minute:0,second:0,millisecond:0})
                const countdown = moment(today).countdown(next_day);

                const h = countdown.hours.toString().length === 1 ? '0' + countdown.hours : countdown.hours;
                const m = countdown.minutes.toString().length === 1 ? '0' + countdown.minutes : countdown.minutes;
                const s = countdown.seconds.toString().length === 1 ? '0' + countdown.seconds : countdown.seconds;
                params.embeds[index].fields.push({
                    name: `📅 Daily Login Notification (${h} hours ${m} minutes ${s} seconds) left`,
                    value: $(span).text(),
                    inline: false,
                });
          }


          await sendDiscord(params, res);
      }
    } catch (e) {
      console.error('ERROR', e);
    }
}

app.get('/webhook', async (req, res)=>{
    await dailyMission(res);
    return res.status(200).send('Webhook success');
});
app.get('/daily-login', async (req, res)=>{
    await dailyLogin(res);
    res.status(200).send('Webhook success');
});

app.get('/', async (req, res)=>{
    res.status(200).send('Hello');
});
  
app.listen(PORT, (error) =>{
    if(!error)
        console.log("Server is Successfully Running", PORT);
    else 
        console.log("Error occurred, server can't start", error);
    }
);
    