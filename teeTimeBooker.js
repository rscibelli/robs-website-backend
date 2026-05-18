import { GOLF_COURSES } from './constants.js';
import { getTeeTimesFromGolfnow } from './teeTimeBookerGolfnow.js';
import { getTeeTimesFromTeesnap } from './teeTimeBookerTeesnap.js';
import { getTeeTimesFromForeup } from './teeTimeBookerForeup.js';

async function getTeeTimesForCourse(courseName, date) {
  const courseInfo = GOLF_COURSES[courseName];

  if (!courseInfo) {
    throw new Error(`Course ${courseName} not found in available courses`);
  }

  try {
    const system = (courseInfo.system || '').toLowerCase();

    switch (system) {
      case 'teesnap':
        return await getTeeTimesFromTeesnap(courseInfo, date);
      case 'golfnow':
        return await getTeeTimesFromGolfnow(courseInfo, date);
      case 'foreup':
        return await getTeeTimesFromForeup(courseInfo, date);
      default:
        throw new Error(`Tee time system ${system} isn't supported`);
    }
  } catch (err) {
    throw new Error(`Failed to fetch tee times for ${courseName}: ${err.message}`);
  }
}

export { getTeeTimesForCourse };