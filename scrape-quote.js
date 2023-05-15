const puppeteer = require('puppeteer-extra');
// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const fs = require("fs");

const getQuotes = async () => {
  // Start a Puppeteer session with:
  // - a visible browser (`headless: false` - easier to debug because you'll see the browser in action)
  // - no default viewport (`defaultViewport: null` - website page will in full width and height)
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  // Open a new page
  const page = await browser.newPage();

  // On this new page:
  // - open the "http://quotes.toscrape.com/" website
  // - wait until the dom content is loaded (HTML is ready)
  await page.goto("http://quotes.toscrape.com/", {
    waitUntil: "domcontentloaded",
  });

  let quoting = [];
  while (await page.$(".pager > .next > a")) {
    await page.click(".pager > .next > a");
    // Get page data
    const quotes = await page.evaluate(() => {
      // Fetch the first element with class "quote"
      // Get the displayed text and returns it
      const quoteList = document.querySelectorAll(".quote");

      // Convert the quoteList to an iterable array
      // For each quote fetch the text and author
      return Array.from(quoteList).map((quote) => {
        // Get the sub-elements from the previously fetched quote element
        const text = quote.querySelector(".text").innerText;
        const author = quote.querySelector(".author").innerText;

        return { text, author };
      });
    });
    quoting.push(quotes);
  }

  fs.writeFile("scraped-quotes.json", JSON.stringify(quoting), (err) => {
	if (err) {
	  throw err;
	}
	console.log("JSON data is saved.");
  });


  // Close the browser
  await browser.close();
};

// Start the scraping
getQuotes();
