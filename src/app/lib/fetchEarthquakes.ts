export async function fetchEarthquakes(range: "hour" | "day" | "week" | "month" = "hour") {
    const res = await fetch(`https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_${range}.geojson`);
    if (!res.ok) throw new Error('Failed to fetch earthquakes');
    const data = await res.json();
    return data.features;
  }
  