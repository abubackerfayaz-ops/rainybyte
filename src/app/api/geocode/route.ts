import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q');
  if (!q || q.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    // Attempt 1: Open-Meteo geocoding
    const omRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=5&language=en&format=json`,
      { next: { revalidate: 3600 } }
    );
    if (omRes.ok) {
      const omData = await omRes.json();
      if (omData.results && omData.results.length > 0) {
        return NextResponse.json({ results: omData.results, source: 'open-meteo' });
      }
    }

    // Attempt 2: Nominatim (OpenStreetMap) — better coverage of smaller towns
    const nomRes = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&addressdetails=1`,
      {
        headers: { 'User-Agent': 'RainyByte/1.0 (weather app)' },
        next: { revalidate: 3600 },
      }
    );
    if (nomRes.ok) {
      const nomData = await nomRes.json();
      if (nomData && nomData.length > 0) {
        const results = nomData.map((item: any) => ({
          id: item.place_id,
          name: item.display_name.split(',')[0].trim(),
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
          country: item.address?.country || '',
          country_code: (item.address?.country_code || '').toUpperCase(),
          admin1: item.address?.state || item.address?.region || '',
          source: 'nominatim',
        }));
        return NextResponse.json({ results, source: 'nominatim' });
      }
    }

    // Attempt 3: Web search for geocoding (falls back to extracting from Wikipedia or similar)
    const webResults = await geocodeViaWebSearch(q);
    if (webResults.length > 0) {
      return NextResponse.json({ results: webResults, source: 'web' });
    }

    return NextResponse.json({ results: [] });
  } catch {
    return NextResponse.json({ results: [] });
  }
}

async function geocodeViaWebSearch(query: string): Promise<any[]> {
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query + ' location')}&format=json&srlimit=3`;
    const res = await fetch(searchUrl, { headers: { 'User-Agent': 'RainyByte/1.0' } });
    if (!res.ok) return [];

    const data = await res.json();
    const pages = data?.query?.search || [];

    for (const page of pages) {
      const title = page.title;
      // Try to get coordinates from Wikipedia
      const coordUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=coordinates&titles=${encodeURIComponent(title)}&format=json`;
      const coordRes = await fetch(coordUrl, { headers: { 'User-Agent': 'RainyByte/1.0' } });
      if (!coordRes.ok) continue;

      const coordData = await coordRes.json();
      const pages = coordData?.query?.pages || {};
      const pageId = Object.keys(pages)[0];
      const coords = pages[pageId]?.coordinates?.[0];

      if (coords) {
        return [{
          id: pageId,
          name: title,
          latitude: coords.lat,
          longitude: coords.lon,
          country: '',
          country_code: '',
          admin1: '',
          source: 'wikipedia',
        }];
      }
    }

    return [];
  } catch {
    return [];
  }
}
