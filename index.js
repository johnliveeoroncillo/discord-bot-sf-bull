const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv/config');

const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK || '';

(async () => {
  if (!DISCORD_WEBHOOK || DISCORD_WEBHOOK === '') {
    console.log('UNABLE TO SEND WEBHOOK'); 
    return false; 

  }
  const args = process.argv.slice(2);
  const url = `https://sf.bullgamez.com/`;
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const missions =  $('h2:contains("Missions of The Day")');
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
            console.error(e);
        });
        
    }
  } catch (e) {
    console.error(e);
  }
})();


