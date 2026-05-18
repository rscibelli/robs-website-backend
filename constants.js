export const GOLF_COURSES = {
  'westover': {
    name: 'Westover Golf Course',
    facilityId: 5059,
    alias: 'westover-golf-course',
    bookingUrl: 'https://westover-golf-course.book.teeitup.com/',
    showExactUrl: true,
    teeTimeUrl: 'https://phx-api-be-east-1b.kenna.io/v2/tee-times?date={date}&facilityIds={facilityId}&returnPromotedRates=true',
    system: 'golfnow'
  },
  'ledges': {
    name: 'Ledges Golf Club',
    facilityId: 4934,
    alias: 'ledges-golf-club',
    bookingUrl: 'https://www.ledgesgc.com/tee-times/',
    showExactUrl: false,
    teeTimeUrl: 'https://phx-api-be-east-1b.kenna.io/v2/tee-times?date={date}&facilityIds={facilityId}&returnPromotedRates=true',
    system: 'golfnow'
  },
  'quaboag': {
    name: 'Quaboag Country Club',
    facilityId: 530,
    alias: 'quaboagcountryclub',
    bookingUrl: 'https://quaboagcountryclub.teesnap.net/',
    teeTimeUrl: 'https://quaboagcountryclub.teesnap.net/customer-api/teetimes-day?course=530&date={date}&players=1&holes=18&addons=off',
    showExactUrl: false,
    system: 'teesnap'
  },
  'chicopee': {
    name: 'Chicopee Country Club',
    facilityId: 5659,
    alias: 'chicopee-country-club',
    bookingUrl: 'https://www.chicopeecountryclub.com/tee-times/',
    showExactUrl: false,
    teeTimeUrl: 'https://phx-api-be-east-1b.kenna.io/v2/tee-times?date={date}&facilityIds={facilityId}&returnPromotedRates=true',
    system: 'golfnow'
  },
  'franconia': {
    name: 'Franconia Country Club',
    facilityId: 12165,
    alias: 'franconiacountryclub',
    bookingUrl: 'https://foreupsoftware.com/index.php/booking/22868/12165#teetimes',
    showExactUrl: false,
    teeTimeUrl: 'https://foreupsoftware.com/index.php/api/booking/times?time=all&date={date}&holes=all&players=0&booking_class=51332&schedule_id={facilityId}&schedule_ids%5B%5D={facilityId}&specials_only=0',
    system: 'foreup'
  },
  'veterans': {
    name: 'Veterans Memorial Golf Course',
    facilityId: 12166,
    alias: 'veterans-memorial-golf-course',
    bookingUrl: 'https://www.veteransmemorialgc.com/tee-times/',
    showExactUrl: false,
    teeTimeUrl: 'https://foreupsoftware.com/index.php/api/booking/times?time=all&date={date}&holes=all&players=0&booking_class=51332&schedule_id={facilityId}&schedule_ids%5B%5D={facilityId}&specials_only=0',
    system: 'foreup'
  }
};
