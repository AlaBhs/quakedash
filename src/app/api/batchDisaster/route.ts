import { NextRequest, NextResponse } from "next/server";
import { getBatchDb } from "../../lib/mongodb";

const VALID_SOURCES = ["usgs", "eonet", "gdacs"] as const;
type Source = (typeof VALID_SOURCES)[number];

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);

    // 1) read & validate query params
    const collection = (url.searchParams.get("collection") ?? "usgs") as string;
    if (!VALID_SOURCES.includes(collection as Source)) {
      return NextResponse.json(
        { error: `Invalid collection: ${collection}` },
        { status: 400 }
      );
    }
    const source = collection as Source;
    const range = (url.searchParams.get("range") ?? "hour") as
      | "hour"
      | "day"
      | "week"
      | "month";

    // 2) compute threshold date
    // bigdata_to_change_later to :
    // const now = new Date();
    // and comment or delete the next line
    const now = new Date("2025-04-30T23:58:52.660Z");
    const fromDate = new Date(now);
    switch (range) {
      case "hour":
        fromDate.setHours(now.getHours() - 1);
        break;
      case "day":
        fromDate.setDate(now.getDate() - 1);
        break;
      case "week":
        fromDate.setDate(now.getDate() - 7);
        break;
      case "month":
        fromDate.setMonth(now.getMonth() - 1);
        break;
    }

    // 3) fetch raw docs
    const db = await getBatchDb();
    const raw = await db.collection(source).find().toArray();
    // 4) parseTime helper
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function parseTime(doc: any): Date {
      // 1) If the driver already gave us a Date, use it:
      if (doc.time instanceof Date) return doc.time;
      if (doc.date_time instanceof Date) return doc.date_time;

      // 2) Grab whichever string field exists
      const rawStr: string =
        typeof doc.time === "string"
          ? doc.time
          : typeof doc.date_time === "string"
          ? doc.date_time
          : "";

      let str = rawStr.trim();

      // 3) If it looks like "YYYY-MM-DD HH:mm:ss(.SSS)", convert to ISO:
      //    i.e. insert a "T" between date and time, and ensure a trailing "Z" for UTC
      if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(str)) {
        str = str.replace(" ", "T") + "Z";
      }

      // 4) Delegate to Date.parse for ISO, RFC-1123, etc.
      return new Date(str);
    }

    // 5) normalize + filter in one pipeline
    const normalized = raw
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((d: any) => {
        const parsed = parseTime(d);

        // determine magnitude + unit + type
        let magnitude_value: number;
        let magnitude_unit: string;
        let type: string;

        if (source === "usgs") {
          magnitude_value = d.magnitude_value;
          magnitude_unit = d.magnitude_unit ?? "Richter";
          type = "Earthquake";
        } else if (source === "eonet") {
          magnitude_value = d.magnitude_value ?? 0;

          magnitude_unit = d.magnitude_unit ?? "";
          type = d.type === "Wildfire" ? "Wildfires" : d.type;
          if (type === "Wildfires") magnitude_unit = "acres";
        } else {
          magnitude_value = parseFloat(d.magnitude) ?? 0;
          magnitude_unit = d.magnitude_unit ?? "";
          type = d.type === "Wildfire" ? "Wildfires" : d.type;
        }

        return {
          _id: d._id,
          magnitude_value,
          latitude: source === "gdacs" ? parseFloat(d.latitude) : d.latitude,
          longitude: source === "gdacs" ? parseFloat(d.longitude) : d.longitude,
          place: d.place,
          description: d.description ?? null,
          time: parsed.toISOString(),
          magnitude_unit,
          source: source.toUpperCase(),
          type,
          parsed,
        };
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((item: any) => new Date(item.time) >= fromDate);
    return NextResponse.json({ data: normalized }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
