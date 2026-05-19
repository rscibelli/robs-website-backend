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
    bookingUrl: 'https://foreupsoftware.com/index.php/booking/22869/12166#teetimes',
    showExactUrl: false,
    teeTimeUrl: 'https://foreupsoftware.com/index.php/api/booking/times?time=all&date={date}&holes=all&players=0&booking_class=51332&schedule_id={facilityId}&schedule_ids%5B%5D={facilityId}&specials_only=0',
    system: 'foreup'
  },
  'cold-spring': {
    name: 'Cold Spring Country Club',
    facilityId: 9516,
    alias: 'cold-spring-country-club',
    bookingUrl: 'https://www.coldspringcc.com/public-tee-times/',
    showExactUrl: false,
    teeTimeUrl: 'https://phx-api-be-east-1b.kenna.io/v2/tee-times?date={date}&facilityIds={facilityId}&returnPromotedRates=true',
    system: 'golfnow'
  },
  'agawam': {
    name: 'Agawam Municipal Golf Course',
    facilityId: 8592,
    alias: 'agawam-municipal-golf-course',
    bookingUrl: 'https://www.agawamgolfcourse.com/tee-times/',
    showExactUrl: false,
    teeTimeUrl: 'https://phx-api-be-east-1b.kenna.io/v2/tee-times?date={date}&facilityIds={facilityId}&returnPromotedRates=true',
    system: 'golfnow'
  },
  'green-hills': {
    name: 'Green Hills Golf Course',
    facilityId: 7270,
    alias: 'green-hills-golf-course',
    bookingUrl: 'https://foreupsoftware.com/index.php/booking/21206/7270?_gl=1*1u5rnao*_ga*NTQzNjI4NzIuMTc3OTIwOTMxOQ..*_ga_WQPLP348DP*czE3NzkyMDkzMTkkbzEkZzEkdDE3NzkyMDk0NjgkajYwJGwwJGgw#teetimes',
    showExactUrl: false,
    teeTimeUrl: 'https://foreupsoftware.com/index.php/api/booking/times?time=all&date={date}&holes=all&players=0&booking_class=false&schedule_id={facilityId}&schedule_ids%5B%5D={facilityId}&specials_only=0',
    system: 'foreup'
  },
};
