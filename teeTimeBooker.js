import { chromium } from 'playwright';
import { GOLF_COURSES } from './constants.js';

async function getTeeTimesForCourse(courseName, date) {
  const bookingUrl = GOLF_COURSES[courseName];
  
  if (!bookingUrl) {
    throw new Error(`Course "${courseName}" not found in available courses`);
  }

  try {
    // Setup browser and navigate to booking page
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    await page.goto(bookingUrl);
    await page.waitForSelector('div.flex-column.align-center');

    // Extract tee times data from page
    const teeTimesData = await page.evaluate((courseName) => {
      const cards = Array.from(document.querySelectorAll('div[style*="cursor: pointer"]'));
      
      return cards.map(card => ({
        courseName,
        time: card.querySelector('.text-h6')?.innerText.trim(),
        priceRange: card.querySelector('.v-card__text div.text-subtitle-1')?.innerText.trim() ?? null,
        golferCapacity: card.querySelector('.mdi-account-group-outline')?.parentElement?.innerText.trim(),
        holesAvailable: card.querySelector('.mdi-flag-outline')?.parentElement?.innerText.trim(),
        bookingUrl: window.location.href
      }));
    }, courseName);

    await browser.close();
    return teeTimesData;
  } catch (err) {
    throw new Error(`Failed to fetch tee times for ${courseName}: ${err.message}`);
  }
}

export { getTeeTimesForCourse };