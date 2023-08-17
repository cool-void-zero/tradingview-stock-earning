const puppeteer = require('puppeteer');
const express = require('express');
//  Custom Class
const { getEarning, getEarningList } = require('./class/fetchEarning');
const port = 1234;
const app = express();
const events = require('events');
events.EventEmitter.defaultMaxListeners = 100;

app.set('view engine', 'ejs');
app.use(express.json());

//  global browser
let browser = null;
const launchBrowser = async() => {
    browser = await puppeteer.launch({ headless: 'new' });
}
launchBrowser();

app.get('/earning', (req, res) => {
    const { symbol, url } = req.query;

    if(url)
        getEarning({ browser, symbol, url }).then(json => res.json(json));
    else
        res.json({
            symbol: "", 
            url: "", 
            next_date: null, 
            next_days: null, 
        });
});

app.get('/earning-list', (req, res) => {
    const watchlist_url = req.query.watchlist_url || "";
    
    (watchlist_url)?
        getEarningList({ browser, watchlist_url }).then(symbol_list => res.json(symbol_list)): 
        res.json([]);
});

app.get('/', (req, res) => {
    res.render('view-earning-list');
});

app.get('/view-earning-list', (req, res) => {
    res.render('view-earning-list');
});

app.listen(port, () => console.log(`Fetch earning list service on "${[port]}" port.`));