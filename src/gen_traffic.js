const puppeteer = require('puppeteer');
const csv = require('csv-parser');
const fs = require('fs');

/* The length of the experiment in ms (60 seconds * 10 minutes * 1000 ms) */
// const TOTAL_TIME = 60 * 10 * 1000;
const TOTAL_TIME = 10 * 1000;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

function get_urllist() {
    return new Promise(resolve => {
        const results = [];
        fs.createReadStream('urllist.csv')
        .pipe(csv())
        .on('data', (row) => {
        results.push(row);
        })
        .on('end', () => {
        console.log('CSV file successfully processed');
        resolve(results);
        });
    });
}

async function access_url(url, browser, wait) {
    var page = await browser.newPage();
    await page.setViewport({
        width: 2560,
        height: 1600,
        deviceScaleFactor: 1,
    });
    await page.goto(url, {waituntil: 'networkidle0', timeout: wait}).catch(error => console.log("ERROR >> " + error.name + " when accessing " + url));
}

async function runExp() {
    // launching puppeteer with arguments
    args = process.argv.slice(2);

    if (args.length < 1)
    {
        exp_length = TOTAL_TIME;
    }
    else 
    {
        exp_length = parseInt(args[0]) * 1000;
    }
    console.log(`Generating traffic for ${exp_length/1000} second(s)`);

    a = ['--no-sandbox',
        '--disable-gpu',
        '--disable-quic'];
    const browser = await puppeteer.launch({
        args: a,
        headless: true,
    });

    urllist = await get_urllist();
    var i = 10;

    start_time = Date.now();
    
    while (Date.now() - start_time < TOTAL_TIME)
    {
        wait = parseInt(urllist[i]['wait']) * 1000;
        url = urllist[i]['url'];
        console.log("Accessing " + url + " and waiting for " + wait/1000 + " second(s)")
        await access_url(url, browser, wait);
        await sleep(100);
        i = (i + 1) % (urllist.length);
    }

    await browser.close();
}

function main() {
    runExp()
}

main();