const BASE_URL = 'https://api.thenewsapi.com/v1/news/all';
const API_KEY = process.env.NEWS_API_KEY;

function buildUrl(queryParams = {}) {
  if (!API_KEY) {
    throw new Error('Missing NEWS_API_KEY environment variable for News API request.');
  }

  const params = new URLSearchParams({ apikey: API_KEY });

  for (const [key, value] of Object.entries(queryParams)) {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  }

  return `${BASE_URL}?${params.toString()}`;
}

export async function fetchAllNews(queryParams = {}) {
  const url = buildUrl(queryParams);
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = payload?.message || text || response.statusText;
    throw new Error(`News API request failed (${response.status}): ${message}`);
  }

  return payload;
}

export default {
  fetchAllNews,
};
