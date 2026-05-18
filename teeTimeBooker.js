import { GOLF_COURSES } from './constants.js';

async function getTeeTimesForCourse(courseName, date) {
  const courseInfo = GOLF_COURSES[courseName];
  
  if (!courseInfo) {
    throw new Error(`Course "${courseName}" not found in available courses`);
  }

  try {
    const apiUrl = `https://phx-api-be-east-1b.kenna.io/v2/tee-times?date=${date}&facilityIds=${courseInfo.facilityId}`;
    console.log('API URL:', apiUrl);
    
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
            const priceCents = rate.greenFeeCart || 0;
            const priceString = `$${(priceCents / 100).toFixed(2)}`;
            const bookingUrl = `https://${courseInfo.alias}.book.teeitup.com/?course=${courseInfo.facilityId}&date=${date}&max=999999`;

            teeTimesData.push({
              courseName: courseInfo.name,
              time: timeString,
              date: date,
              holes: rate.holes,
              playerCapacity: `${rate.minPlayers} - ${rate.maxPlayers}`,
              price: priceString,
              bookingUrl
            });
          });
        });
      }
    }

    console.log('Organized Tee Times Object:', JSON.stringify(teeTimesData, null, 2));
    return teeTimesData;
  } catch (err) {
    throw new Error(`Failed to fetch tee times for ${courseName}: ${err.message}`);
  }
}

export { getTeeTimesForCourse };