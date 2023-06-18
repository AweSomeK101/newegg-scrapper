const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { Cluster } = require("@drtz/puppeteer-cluster");
const scrapeProductPage = require("./Scrapper/productPage");
const scrapeLinksFromPage = require("./Scrapper/pageLinks");
const { saveToJson, appendToJson } = require("./utils/saveToJson");
const jsonToObj = require("./utils/jsonToObj");
const botCheckInterceptor = require("./Scrapper/botCheckInterceptor");

const newEggScrapper = {
  browser: null,
  page: null,
  cluster: null,
  links: [],
  products: [],

  createInstance: async function (headless = "new") {
    puppeteer.use(StealthPlugin());
    this.browser = await puppeteer.launch({ headless, userDataDir: "./tmp" });
    this.page = await this.browser.newPage();
    await this.setRandomViewport();
  },

  createClusterInstance: async function (headless = "new") {
    puppeteer.use(StealthPlugin());
    this.cluster = await Cluster.launch({
      concurrency: Cluster.CONCURRENCY_PAGE,
      maxConcurrency: 2,
      puppeteer,
      puppeteerOptions: { headless },
      monitor: true,
      timeout: 5 * 60 * 1000,
    });
  },

  closeInstance: async function () {
    await this.browser.close();
  },

  closeClusterInstance: async function () {
    await this.cluster.close();
  },

  populateLinksFromFile: function (file) {
    this.links = jsonToObj(file);
  },

  scrapeForLinks: async function (url) {
    this.links = await scrapeLinksFromPage(this.page, url);
    this.saveToJson(this.links, "products-links.json");
  },

  scrapeAllProduct: async function (links = this.links) {
    this.cluster.on("taskerror", (err, data) => {
      console.log(`Error crawling ${data}: ${err.message}`);
    });

    await this.cluster.task(async ({ page, data: url }) => {
      await this.setRandomViewport(page);
      await page.setRequestInterception(true);
      page.on("request", botCheckInterceptor);

      const data = await scrapeProductPage(page, url);
      data && appendToJson(data, "products.json");

      // await page.goto("https://bot.sannysoft.com", { waitUntil: "domcontentloaded" });
      // await page.waitForTimeout(5000);
      // await page.screenshot({ path: "testresult.png", fullPage: true });
    });

    links.forEach((link) => this.cluster.queue(link));

    await this.cluster.idle();
  },

  scrapeSingleProduct: async function (url) {
    const data = await scrapeProductPage(this.page, url);
    this.saveToJson(data, "product.json");
  },

  setRandomViewport: async function (page = this.page) {
    await page.setViewport({
      width: 1920 + Math.floor(Math.random() * 100),
      height: 3000 + Math.floor(Math.random() * 100),
      deviceScaleFactor: 1,
      hasTouch: false,
      isLandscape: false,
      isMobile: false,
    });
  },

  saveToJson: saveToJson,
  jsonToObj: jsonToObj,
};

(async function () {
  const newEgg = newEggScrapper;
  await newEgg.createClusterInstance();

  const arr = [
    "https://www.newegg.com/amd-ryzen-threadripper-pro-5955wx/p/N82E16819113776",
    "https://www.newegg.com/intel-core-i5-11400-core-i5-11th-gen/p/N82E16819118241",
    "https://www.newegg.com/intel-core-i7-10700f-core-i7-10th-gen/p/N82E16819118131",
    "https://www.newegg.com/amd-ryzen-7-3800x/p/N82E16819113104",
    "https://www.newegg.com/amd-ryzen-7-5800x/p/274-000M-001F7",
    "https://www.newegg.com/intel-core-i7-10700k-core-i7-10th-gen/p/N82E16819118123",
    "https://www.newegg.com/intel-core-i7-4th-gen-core-i7-4790k/p/N82E16819117369",
    "https://www.newegg.com/intel-core-i7-10700-core-i7-10th-gen/p/N82E16819118126",
    "https://www.newegg.com/amd-ryzen-9-3950x/p/N82E16819113616",
    "https://www.newegg.com/amd-ryzen-5-5600g-ryzen-5-5000-g-series/p/N82E16819113740",
    "https://www.newegg.com/amd-ryzen-7-3700x/p/N82E16819113567",
  ];
  await newEgg.scrapeAllProduct(arr);

  await newEgg.closeClusterInstance();
})();
