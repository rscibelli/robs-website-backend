import { load } from 'cheerio';
import { GOLF_COURSES } from './constants.js';

async function getTeeTimesForCourse(courseName, date) {
  const bookingUrl = GOLF_COURSES[courseName];
  
  if (!bookingUrl) {
    throw new Error(`Course "${courseName}" not found in available courses`);
  }

  try {
    const response = await fetch(bookingUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Node.js; +https://example.com)'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    console.log('HTML length:', html.length);
    console.log('First 2000 chars of HTML:\n', html.substring(0, 2000));
    
    const $ = load(html);
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

      console.log('Found matching card:', text.substring(0, 200));
      cards.push(text);
    });

    console.log('Total cards found:', cards.length);


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
    return teeTimesData;
  } catch (err) {
    throw new Error(`Failed to fetch tee times for ${courseName}: ${err.message}`);
  }
}

export { getTeeTimesForCourse };