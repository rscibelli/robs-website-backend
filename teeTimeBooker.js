import { chromium } from 'playwright';
import cheerio from 'cheerio';
import { GOLF_COURSES } from './constants.js';

async function getTeeTimesForCourse(courseName, date) {
  const bookingUrl = GOLF_COURSES[courseName];
  
  if (!bookingUrl) {
    throw new Error(`Course "${courseName}" not found in available courses`);
  }

  try {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(bookingUrl);

    // FIX: Wait for the action buttons inside the tee time cards to load
    await page.waitForSelector('button:has-text("RATE"), button:has-text("NOW")');

    const html = await page.content();
    const $ = cheerio.load(html);
    const timeRegex = /\b\d{1,2}:\d{2}\s*(?:AM|PM)\b/i;
    const rateMarkerRegex = /BOOK NOW|CHOOSE RATE|RATE|NOW/i;

    const cards = [];
    $('div, section, article, li').each((_, element) => {
      const text = $(element).text().replace(/\s+/g, ' ').trim();
      if (!text) return;
      if (!timeRegex.test(text)) return;
      if (!rateMarkerRegex.test(text)) return;

      const parentText = $(element).parent().text().replace(/\s+/g, ' ').trim();
      if (parentText === text) return;

      cards.push(text);
    });

    const uniqueCards = [...new Set(cards)];
    const teeTimesData = uniqueCards.map((text) => {
      const lines = text.split(/\s{2,}|\n/).map((line) => line.trim()).filter(Boolean);
      const timeLine = lines.find((line) => timeRegex.test(line)) || null;
      const golfersLine = lines.find((line) => /\d+\s*-\s*\d+|\d+\s*players?/i.test(line)) || null;
      const holesLine = lines.find((line) => /(?:9|18)\s*holes?|\d+\s*hole/i.test(line)) || null;
      const priceMatch = text.match(/\$\d+(?:\.\d+)?(?:\s*(?:–|-|to)\s*\$\d+(?:\.\d+)?)?/);
      const priceText = priceMatch ? priceMatch[0] : null;

      return {
        courseName,
        time: timeLine,
        priceRange: priceText,
        golferCapacity: golfersLine,
        holesAvailable: holesLine,
        bookingUrl: bookingUrl
      };
    });

    console.log('Organized Tee Times Object:', JSON.stringify(teeTimesData, null, 2));

    await browser.close();
    return teeTimesData;
  } catch (err) {
    throw new Error(`Failed to fetch tee times for ${courseName}: ${err.message}`);
  }
}

export { getTeeTimesForCourse };