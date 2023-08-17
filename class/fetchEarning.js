const puppeteer = require('puppeteer');

const getEarning = async({
    browser = null, 
    symbol, url, 
}) => {
    let json = {
        symbol, url, 
        is_stock: null, 
        next_date: null, 
        next_days: null, 
    };
    
    try{
        if(browser === null)
            browser = await puppeteer.launch({ headless: 'new' });

        const page = await browser.newPage();
        const selector_chart = `a[class^="goToChartButton"]`;
        const selector_days = `div[class^="apply-common-tooltip common-tooltip-html daysCounter"]`;
        let is_stock = null;
        let next_date = null;
        let next_days = null;

        //  open the symbol
        await page.goto(url);
        
        const symbol_title = await page.evaluate(() => document.title);
        is_stock = symbol_title.includes("Stock");
        
        if(is_stock){
            await page.waitForSelector(selector_chart);
            
            const url_chart = await page.evaluate(selector_chart => {
                return document.querySelector(selector_chart).href;
            }, selector_chart);

            //  update the symbol url
            url = url_chart;
            
            await page.goto(url);
            await page.waitForSelector(selector_days);

            next_days = await page.evaluate(selector_days => {
                return parseInt(document.querySelector(selector_days).textContent || -1);
            }, selector_days);
    
            //  calculate the next earning date
            let d = new Date();
            d.setDate(d.getDate() + next_days);
            next_date = d.toISOString().substring(0, 10);
        }
        
        await page.close();
        return {
            ...json, 
            is_stock, next_date, next_days, 
        };
    }catch(err){
        console.error(err);
        console.log(`[getEarning] Execute error`);

        return json;
    }
}

const getEarningList = async({ 
    browser = null, 
    watchlist_url, 
}) => {
    try{
        if(browser === null)
            browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        const url = watchlist_url;
        const selector_list = `a[class^="symbol"]`;
        
        await page.goto(url);
        await page.waitForSelector(selector_list);

        let symbol_list = await page.evaluate(selector_list => {
            return [...document.querySelectorAll(selector_list)].map(ele => ({
                symbol: ele.textContent, 
                url: ele.href
            }));
        }, selector_list);

        await page.close();
        return symbol_list;
    }
    catch(err){
        console.error(err);
        console.log(`[getEarningList] Execute error`);

        return [];
    }
}

module.exports = { getEarning, getEarningList };