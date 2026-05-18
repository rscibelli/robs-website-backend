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
  }
};
