const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const axios = require("axios");

exports.getTitle = async (req, res, next) => {
  const data = [];
  let coin = ["axie-infinity", "ethereum", "small-love-potion"];
  let url = ""
  for(coinIndex in coin){
    url = `https://coinmarketcap.com/currencies/${coin[coinIndex]}`;
    console.log(url)
    const aux = await makeRequestTitle(url)
    data.push(aux)
  }
  res.status(200).json({
    message: "ok",
    data,
  })
};

const makeRequestTitle = async (url) => {
  try {
    const content = await getRequest(url);
    const $ = await cheerio.load(content);
    const coinName = await $("p.hNpJqV").first().text();
    const price = await $("table > tbody > tr:nth-child(1) > td")
      .first()
      .text();
    return({coinName, price});
  } catch (error) {
    console.log(error);
  }
};

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      var totalHeight = 0;
      var distance = 100;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 50);
    });
  });
}

const optimizePage = async (page) => {
  await page.setRequestInterception(true);
  await page.on("request", (request) => {
    if (["image", "stylesheet", "font"].includes(request.resourceType())) {
      request.abort();
    } else {
      request.continue();
    }
  });
};

const getRequest = async (url) => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};
