export async function getTeeTimesFromForeup(courseInfo, date) {
  try {
    const template =
      courseInfo.teeTimeUrl ||
      'https://foreupsoftware.com/index.php/api/booking/times?time=all&date={date}&holes=all&players=0&booking_class={bookingClassId}&schedule_id={scheduleId}&schedule_ids%5B%5D={scheduleId}&specials_only=0';

    const apiUrl = template
      .replace('{date}', formatDateForForeup(date))
      .replaceAll('{facilityId}', String(courseInfo.facilityId));

    console.log('ForeUp API URL:', apiUrl);

    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Node.js; +https://example.com)',
        'Accept': 'application/json'
      }
    });

    console.log('API Response Status:', response.status);

    const responseText = await response.text();

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}: ${response.statusText} - ${responseText}`
      );
    }

    const data = JSON.parse(responseText);
    const teeTimesData = [];

    if (Array.isArray(data) && data.length > 0) {
      data.forEach((teetime) => {
        const totalPrice =
          (teetime.green_fee || 0) + (teetime.cart_fee || 0);

        const priceString = `$${totalPrice.toFixed(2)}`;

        // Convert "2026-05-19 10:46" -> Date object
        const teeTimeDate = new Date(
          teetime.time.replace(' ', 'T')
        );

        const timeString = teeTimeDate.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });

        teeTimesData.push({
          courseName: courseInfo.name || teetime.course_name,
          time: timeString,
          date: date,
          holes: teetime.holes,
          playerCapacity: teetime.available_spots,
          price: priceString,
          bookingUrl: courseInfo.bookingUrl,
          details: teetime.schedule_name
        });
      });
    }

    return teeTimesData;
  } catch (err) {
    throw new Error(
      `Failed to fetch ForeUp tee times for ${courseInfo.name}: ${err.message}`
    );
  }
}

function formatDateForForeup(dateInput) {
  const [year, month, day] = dateInput.split('-');

  return `${month.padStart(2, '0')}-${day.padStart(2, '0')}-${year}`;
}