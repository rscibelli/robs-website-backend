import { GOLF_COURSES } from './constants.js';

export async function getTeeTimesFromGolfnow(courseInfo, date) {
  try {
    const template = courseInfo.teeTimeUrl || 'https://phx-api-be-east-1b.kenna.io/v2/tee-times?date={date}&facilityIds={facilityId}&returnPromotedRates=true';
    const apiUrl = template.replace('{date}', date).replace('{facilityId}', String(courseInfo.facilityId));
    console.log('GolfNow API URL:', apiUrl);

    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Node.js; +https://example.com)',
        'Accept': 'application/json',
        'x-be-alias': courseInfo.alias
      }
    });

    console.log('API Response Status:', response.status);
    const responseText = await response.text();
    console.log('API Response Body:', responseText);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${responseText}`);
    }

    const data = JSON.parse(responseText);
    const teeTimesData = [];

    if (data && data.length > 0) {
      const dayData = data[0];

      if (dayData.teetimes && dayData.teetimes.length > 0) {
        dayData.teetimes.forEach((teetime) => {
          const teeTimeDate = new Date(teetime.teetime);
          const timeString = teeTimeDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });

          teetime.rates.forEach((rate) => {
            const priceCents = rate.greenFeeCart || rate.greenFeeWalking || 0;
            const priceString = `$${(priceCents / 100).toFixed(2)}`;

            teeTimesData.push({
              courseName: courseInfo.name,
              time: timeString,
              date: date,
              holes: rate.holes,
              playerCapacity: Math.max(0, 4 - teetime.bookedPlayers),
              price: priceString,
              bookingUrl: courseInfo.bookingUrl,
              details: rate.name
            });
          });
        });
      }
    }

    return teeTimesData;
  } catch (err) {
    throw new Error(`Failed to fetch GolfNow tee times for ${courseInfo.name}: ${err.message}`);
  }
}
