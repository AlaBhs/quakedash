"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Earthquake } from "../types/earthquake.type";
import { fetchEarthquakes } from "../lib/fetchEarthquakes";

const EarthquakeMap = dynamic(() => import("../components/EarthquakeMap"), {
  ssr: false,
});

export default function MapPage() {
  const [earthquakes, setEarthquakes] = useState<Earthquake[]>([]);
  const [range, setRange] = useState<"hour" | "day" | "week" | "month">("hour");
  const [loading, setLoading] = useState(false);
  const [minMagnitudeInput, setMinMagnitudeInput] = useState<number>(0);
  const [minMagnitude, setMinMagnitude] = useState<number>(0);

  useEffect(() => {
    const fetchAndDetect = async () => {
      setLoading(true);
      const newData = await fetchEarthquakes(range);
      setEarthquakes(newData);
      setLoading(false);
    };
    fetchAndDetect();
  }, [range]);

  useEffect(() => {
    const delay = setTimeout(() => {
      setMinMagnitude(minMagnitudeInput);
    }, 1000); // 300ms delay

    return () => clearTimeout(delay); // clear previous timeout
  }, [minMagnitudeInput]);

  return (
    <div className="w-full h-[100vh] relative">
      {/* Time Filter */}
      <Select
        value={range}
        onValueChange={(value) =>
          setRange(value as "hour" | "day" | "week" | "month")
        }
      >
        <SelectTrigger className="bg-gray-300 absolute right-[33px] top-[33px] z-[401] border rounded px-3 py-1 text-sm w-[180px] cursor-pointer shadow-md">
          <SelectValue placeholder="Select to Filter" />
        </SelectTrigger>
        <SelectContent className="z-[401]">
          <SelectGroup>
            <SelectLabel>Filter by Time</SelectLabel>
            <SelectItem value="hour">Last Hour</SelectItem>
            <SelectItem value="day">Last Day</SelectItem>
            <SelectItem value="week">Last Week</SelectItem>
            <SelectItem value="month">Last Month</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      {/* Magnitude Filter Input */}
      <input
        type="number"
        value={minMagnitude}
        onChange={(e) => setMinMagnitudeInput(Number(e.target.value))}
        placeholder="Min Magnitude"
        className="absolute right-[220px] top-[33px] z-[401] border rounded px-3 py-1 text-sm w-[60px] h-[36px] bg-gray-300 shadow-md"
        min={0}
        step={0.1}
      />

      {/* Map or Loading */}
      {typeof window !== "undefined" && loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-600 text-lg animate-pulse">
            Loading earthquakes...
          </div>
        </div>
      ) : (
        <EarthquakeMap
          earthquakes={earthquakes.filter(
            (eq) => eq.properties.mag >= minMagnitude
          )}
        />
      )}
    </div>
  );
}
