async function scrapeLinksFromPage(page, url, timeout = 120000) {
  await page.goto(url, {
    timeout,
  });
  const links = [];
  let isNext = true;

  while (isNext) {
    await page.waitForSelector("div.item-cells-wrap");
    //   await this.scrollToBottom();

    const products = await page.$$("div.item-cells-wrap > div.item-cell");
    console.log("Products: ", products.length);

    await getLinksFromPage(products, links, page);

    await page.waitForSelector("div.list-tool-pagination");
    const nextBtn = await page.$('button.btn[title="Next"]');
    const isDisabled = await nextBtn.evaluate((btn) => btn.hasAttribute("disabled"));
    console.log(isDisabled);

    if (isDisabled) {
      console.log("end of last page");
      isNext = false;
    } else {
      console.log("navigaing...");
      await Promise.all([
        page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60 * 1000 }),
        nextBtn.click(),
      ]);
    }
  }

  return links;
}

async function getLinksFromPage(products, links, page) {
  for (let product of products) {
    const link = await page.evaluate(
      (e) => e.querySelector("a.item-img").getAttribute("href"),
      product
    );
    if (link.includes("ComboDealDetails")) continue;
    if (!links.includes(link)) links.push(link);
  }
}

module.exports = scrapeLinksFromPage;
