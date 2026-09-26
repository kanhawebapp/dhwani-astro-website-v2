const BASE_URL = process.env.ASTROLOGY_API_BASE_URL ;

export async function astrologySeo(endpoint, body) {
const USER_ID = process.env.NEXT_PUBLIC_ASTROLOGY_USER_ID ;
const API_KEY = process.env.NEXT_PUBLIC_ASTROLOGY_API_KEY ;
  const auth = Buffer.from(`${USER_ID}:${API_KEY}`).toString("base64");
  const response = await fetch(`${BASE_URL}/${endpoint}`, {
    method: "POST",

    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },

    body: JSON.stringify(body),

    next: {
      revalidate: 3600,
    },

    cache: "force-cache",
  });

  if (!response.ok) {
    throw new Error(`Astrology API Failed (${response.status})`);
  }

  return response.json();
}
