"use client";

import { useEffect, useState } from "react";
import { fetchEarthquakes } from "../lib/fetchEarthquakes";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectValue,
  SelectGroup,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Earthquake } from "../types/earthquake.type";

export default function StatisticsPage() {

  const [earthquakes, setEarthquakes] = useState<Earthquake[]>([]);
  const [range, setRange] = useState<"hour" | "day" | "week" | "month">("hour");
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  // Load seenIds from localStorage on mount
  useEffect(() => {
    const storedSeenIds = localStorage.getItem("seenIds");
    if (storedSeenIds) {
      setSeenIds(new Set(JSON.parse(storedSeenIds)));
    }
  }, []);

  // Save seenIds to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("seenIds", JSON.stringify(Array.from(seenIds)));
  }, [seenIds]);

  useEffect(() => {
    const fetchAndDetect = async () => {
      setLoading(true);
      // Fetch the latest earthquake data based on selected range
      try {
        const newData = await fetchEarthquakes(range);
        setEarthquakes(newData);
      } catch (error) {
        console.error("Error fetching earthquake data:", error);
      } finally {
        setLoading(false); // End loading regardless of success/failure
      }

      // Filter out previously seen earthquakes

      //   const newQuakes: Earthquake[] = newData.filter(
      //     (eq: Earthquake) => !seenIds.has(eq.id)
      //   );

      //   // If there are new earthquakes, process them
      //   if (newQuakes.length > 0) {
      //     newQuakes.forEach((quake) => {
      //       const { properties } = quake;
      //       const magnitude = properties.mag;
      //       const place = properties.place;
      //       if (range === "hour") {
      //         if (magnitude >= 6.0) {
      //           toast.error(`⚠️ Major Earthquake - M${magnitude}`, {
      //             description: `Occurred near ${place}`,
      //             duration: 8000,
      //           });
      //         } else if (magnitude >= 1.0) {
      //           toast(`🌍 Minor Earthquake - M${magnitude}`, {
      //             description: `Occurred near ${place}`,
      //             duration: 5000,
      //           });
      //         }
      //       }
      //       // Show toast based on earthquake magnitude
      //     });

      //     // Update the seen earthquakes
      //     setSeenIds((prev) => {
      //       const updated = new Set(prev);
      //       newQuakes.forEach((q) => updated.add(q.id));
      //       return updated;
      //     });
      //   }

      // Update the state with new earthquake data
    };

    // Initial fetch when the component mounts
    fetchAndDetect();

    // Set interval to fetch data every 1 minute
    const intervalId = setInterval(fetchAndDetect, 60000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [range]);

  const total = earthquakes.length;
  const magnitudes = earthquakes.map((eq) => eq.properties.mag || 0);
  const strongest = Math.max(...magnitudes);
  const weakest = Math.min(...magnitudes);

  const regionCount: Record<string, number> = {};
  earthquakes.forEach((eq) => {
    const region = eq.properties.place.split(", ").pop() || "Unknown";
    regionCount[region] = (regionCount[region] || 0) + 1;
  });

  const topRegions = Object.entries(regionCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const magnitudeBins = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  const magDistribution = magnitudeBins.map((bin) => {
    const count = magnitudes.filter(
      (mag) => mag >= bin && mag < bin + 1
    ).length;
    return { range: `${bin}-${bin + 1}`, count };
  });

  const timeGrouped: Record<string, number> = {};
  earthquakes.forEach((eq) => {
    const date = new Date(eq.properties.time);
    let label = "";

    if (range === "hour") {
      label = `${date.getMinutes()} min`;
    } else if (range === "day") {
      label = `${date.getHours()}:00`;
    } else if (range === "week") {
      label = date.toDateString();
    } else if (range === "month") {
      const week = Math.ceil(date.getDate() / 7);
      label = `Week ${week} - ${date.toLocaleString("default", {
        month: "short",
      })}`;
    }

    timeGrouped[label] = (timeGrouped[label] || 0) + 1;
  });

  const timeData = Object.entries(timeGrouped)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([time, count]) => ({ time, count }));
  const sendNormalAlert = () => {
    toast("🌍 Minor Earthquake", {
      description:
        "A 3.2 magnitude earthquake occurred near San Francisco. No damage reported.",
      duration: 5000,
    });
  };

  const sendDestructiveAlert = () => {
    toast.error("⚠️ Major Earthquake", {
      description:
        "A 7.8 magnitude earthquake hit Tokyo. Evacuate immediately!",
      duration: 8000,
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Earthquake General Statistics
        </h1>
        {/* Alert buttons */}
        <button
          onClick={sendNormalAlert}
          className="bg-yellow-100 text-yellow-700 px-4 py-1 rounded hover:bg-yellow-200 transition"
        >
          Send Normal Alert
        </button>
        <button
          onClick={sendDestructiveAlert}
          className="bg-red-100 text-red-700 px-4 py-1 rounded hover:bg-red-200 transition"
        >
          Send Destructive Alert
        </button>
        <Select
          value={range}
          onValueChange={(value) =>
            setRange(value as "hour" | "day" | "week" | "month")
          }
        >
          <SelectTrigger className="border rounded px-3 py-1 text-sm w-[180px] cursor-pointer">
            <SelectValue placeholder="Select to Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Filter by Time</SelectLabel>
              <SelectItem value="hour">Last Hour</SelectItem>
              <SelectItem value="day">Last Day</SelectItem>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {loading ? (
          <>
            <Skeleton className="h-[120px] w-full rounded-xl" />
            <Skeleton className="h-[120px] w-full rounded-xl" />
            <Skeleton className="h-[120px] w-full rounded-xl" />
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Total Earthquakes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{total}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Strongest Magnitude</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{strongest}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weakest Magnitude</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{weakest}</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Separator className="bg-gray-400" />
      {loading ? (
        <Skeleton className="h-[200px] w-full rounded-xl" />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Affected Regions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              {topRegions.map(([region, count]) => (
                <li key={region}>
                  <span className="font-medium text-foreground">{region}</span>:{" "}
                  {count} earthquakes
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Separator className="bg-gray-400" />
      {loading ? (
        <Skeleton className="h-[400px] w-full rounded-xl" />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Magnitude Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={magDistribution}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f35f75" stopOpacity={0.9} />
                    <stop
                      offset="95%"
                      stopColor="#f2c4a0ff"
                      stopOpacity={0.3}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="url(#barGradient)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Separator className="bg-gray-400" />
      {loading ? (
        <Skeleton className="h-[400px] w-full rounded-xl" />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Earthquakes Over Time</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#f35f75"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
// The code above is a Next.js component that fetches and displays earthquake statistics. It includes a filter for time ranges, total earthquakes, strongest and weakest magnitudes, affected regions, magnitude distribution, and earthquakes over time. The data is visualized using charts from the Recharts library.
// The component uses React hooks for state management and side effects, and it utilizes Tailwind CSS for styling. The charts are responsive and adapt to the size of their containers.
