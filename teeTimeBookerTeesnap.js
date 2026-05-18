export async function getTeeTimesFromTeesnap(courseInfo, date) {
  try {
    if (!courseInfo.teeTimeUrl) {
      throw new Error('No teeTimeUrl defined for course');
    }

    const apiUrl = courseInfo.teeTimeUrl.replace('{date}', date);
    console.log('Teesnap API URL:', apiUrl);

    const resp = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Node.js; +https://example.com)',
        'Accept': 'application/json'
      }
    });

    const text = await resp.text();
    console.log('Teesnap Response Status:', resp.status);
    console.log('Teesnap Response Body:', text);

    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}: ${resp.statusText} - ${text}`);
    }

    const data = JSON.parse(text);
    const teeTimesData = [];

    // Teesnap response nests tee times under data.teeTimes.teeTimes
    const root = data && data.teeTimes ? data.teeTimes : data;
    const list = root.teeTimes || [];

    // build a map of bookings by bookingId for quick lookup
    const bookingMap = (root.bookings || []).reduce((m, b) => {
      if (b && b.bookingId != null) m[b.bookingId] = b;
      return m;
    }, {});

    list.forEach((entry) => {
      const teeTimeDate = new Date(entry.teeTime || entry.teeTimeString || entry.tee_time || entry.tee_time);
      const timeString = isNaN(teeTimeDate) ? '' : teeTimeDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      // collect booking IDs referenced in teeOffSections
      const sectionBookingIds = (entry.teeOffSections || []).reduce((arr, sec) => {
        if (sec && Array.isArray(sec.bookings)) return arr.concat(sec.bookings);
        return arr;
      }, []);

      // sum golfers across matching bookings
      const totalGolfers = sectionBookingIds.reduce((sum, id) => {
        const b = bookingMap[id];
        if (b && Array.isArray(b.golfers)) return sum + b.golfers.length;
        return sum;
      }, 0);

      const playerCapacity = Math.max(0, 4 - totalGolfers);

      (entry.prices || []).forEach((p) => {
        const priceVal = parseFloat(p.price || '0') || 0;
        const priceString = `$${priceVal.toFixed(2)}`;
        const holes = (p.roundType === 'NINE_HOLE' || (p.roundType && p.roundType.toUpperCase().includes('NINE'))) ? 9 : 18;

        teeTimesData.push({
          courseName: courseInfo.name,
          time: timeString,
          date: date,
          holes,
          playerCapacity,
          price: priceString,
          bookingUrl: courseInfo.bookingUrl || apiUrl
        });
      });
    });

    return teeTimesData;
  } catch (err) {
    throw new Error(`Failed to fetch Teesnap tee times for ${courseInfo.name}: ${err.message}`);
  }
}
