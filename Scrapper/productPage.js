const puppeteer = require("puppeteer");
const { appendToJson } = require("../utils/saveToJson");

async function scrapPage(url) {
  const browser = await puppeteer.launch({ headless: "new", userDataDir: "/tmp" });
  const page = await browser.newPage();
  try {
    const data = await scrapeProductPage(page, url);
    console.log(data);
  } catch (err) {
    console.log(err);
  } finally {
    await browser.close();
  }
}

async function scrapeProductPage(page, url) {
  try {
    await page.goto(url, { timeout: 3 * 60 * 1000 });
    await page.waitForSelector("div.product-wrap");
    // Get title
    const productTitle = await page.evaluate(() => {
      return document.querySelector("div.product-wrap h1.product-title").textContent;
    });

    // Open Spec Tab
    await page.waitForSelector("div.tab-pane");

    // Get all tables
    const tables = await page.$$("div.tab-pane table.table-horizontal");
    const productDetails = {};

    // Get each row
    for (let table of tables) {
      const caption = await page.evaluate((e) => {
        return e.querySelector("caption").textContent;
      }, table);
      const data = {};
      const rows = await table.$$("tbody tr");

      // Extract data from row
      for (let row of rows) {
        const key = await page.evaluate((e) => {
          return e.querySelector("th").textContent;
        }, row);
        const value = await page.evaluate((e) => {
          return e.querySelector("td").textContent;
        }, row);
        data[key] = value;
      }
      if (caption.trim() === "") continue;
      productDetails[caption] = data;
    }
    return { title: productTitle, specificatons: productDetails };
  } catch (error) {
    const pageUrl = await page.url();
    const errData = { url: pageUrl, error };
    appendToJson(errData, "errors.json");
    console.log("errror while scrapping page: ", pageUrl);
    console.log(error);
  }
}

// scrapPage(
//   "https://www.newegg.com/black-lian-li-o11-dynamic-e-atx-full-tower-case/p/2AM-000Z-00049"
// );

module.exports = scrapeProductPage;
