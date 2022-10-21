const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv/config');

const express = require('express');
const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK || '';
  
const app = express();
const PORT = process.env.PORT || 3000;

const init  = async (res) => {
  if (!DISCORD_WEBHOOK || DISCORD_WEBHOOK === '') {
    return res.status(400).send('UNABLE TO SEND WEBHOOK'); 
  }
  const args = process.argv.slice(2);
  const url = `https://sf.bullgamez.com/`;
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const missions =  $('h2:contains("Missions of The Day")');
    missions.pop(); // remove vip mission
    // const container = $(mission).closest('li').html();

    if (missions.length) {
        var params = {
            username: "SF Bull",
            avatar_url: "https://epins-gamestore.com/image/cache/catalog/bullsf/13239044_851643544979507_4216959116671837103_n-300x300.jpg",
            content: "",
            embeds: []
        }
        for (let m = 0; m < missions.length; m++) {
            const mission = missions[m];
            const index = params.embeds.push({
                "title": $(mission).text(),
                "color": m === 0 ? 22015 : 15258703,
                "thumbnail": {
                    "url": "",
                },
                "fields": []
            }) - 1;

            const tr = $(mission).closest('li').find('table').find('tr');
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
            return res.status(400).send(e.message);
        });
        
    }
  } catch (e) {
    console.error(e);
  }
}
app.get('/', async (req, res)=>{
    await init(res);
    res.status(200).send('Webhook success');
});
  
app.listen(PORT, (error) =>{
    if(!error)
        console.log("Server is Successfully Running", PORT);
    else 
        console.log("Error occurred, server can't start", error);
    }
);