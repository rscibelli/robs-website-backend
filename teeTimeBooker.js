import { chromium } from 'playwright';
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

    const teeTimesData = await page.evaluate((courseName) => {
        // Find all tee time block containers (usually grouped inside rows/cols)
        // We look for elements containing a time format (e.g., "4:10 PM")
        const cardElements = Array.from(document.querySelectorAll('div')).filter(el => 
        el.innerText && /\d{1,2}:\d{2}\s(AM|PM)/.test(el.innerText) && (el.innerText.includes('CHOOSE RATE') || el.innerText.includes('BOOK NOW'))
        );

        return cardElements.map(card => {
        const text = card.innerText || '';
        const lines = text.split('\n').map(line => line.trim()).filter(Boolean);

        // Parsing based on the layout structure:
        // Line 0: "4:10 PM"
        // Line 1: "1 - 4" (Golfers)
        // Line 2: "9 - 18" (Holes)
        // Line 3: "Westover Golf Course"
        const time = lines[0];
        const golfers = lines[1];
        const holes = lines[2];
        
        // Dynamically extract price ranges or single prices from the text block
        const priceMatch = text.match(/\$\d+\.\d+(?:\s*–\s*\$\d+\.\d+)?/);
        const priceText = priceMatch ? priceMatch[0] : null;

        return {
            courseName,
            time: time,
            priceRange: priceText,
            golferCapacity: golfers,
            holesAvailable: holes,
            bookingUrl: window.location.href
        };
        });
    }, courseName);

    console.log('Organized Tee Times Object:', JSON.stringify(teeTimesData, null, 2));

    await browser.close();
    return teeTimesData;
  } catch (err) {
    throw new Error(`Failed to fetch tee times for ${courseName}: ${err.message}`);
  }
}

export { getTeeTimesForCourse };