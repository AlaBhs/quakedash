
# 🌍 Earthquake Realtime Map and Stats

A web application that visualizes statistics and recent earthquakes on an interactive map using Leaflet and USGS (United States Geological Survey) earthquake data.

## 🎯 Purpose of the Project

This dashboard is part of a larger **Big Data pipeline** project focused on:

🔄 Real-time data collection from USGS Earthquake API every minute with redundancy filtering.

🗃️ Raw storage in an HDFS-based Data Lake.

🔥 Streaming processing using Spark Structured Streaming for live updates.

🧮 Batch processing via Apache Spark for cleaning, stats, and aggregations.

🧷 MongoDB for storing streaming results, HDFS for batch outputs.

📊 Visualization with this dashboard (Leaflet.js) and future stats panels.

The goal is to provide an interactive interface for users to **visualize earthquake activity** filtered by time and magnitude, based on data ingested and processed through the Big Data pipeline.

## 🚀 Features

- 📊 Displays recent earthquakes on a dynamic map
- 🕒 Filter earthquakes by time range:
  - Last hour
  - Last day
  - Last week
  - Last month
- 📈 Filter earthquakes by minimum magnitude
- ⚡ Real-time loading indicator during data fetch
- 💻 Built with Next.js, React, TailwindCSS, Leaflet

## 🧠 How it works

- Fetches earthquake data from the USGS GeoJSON feed
- Uses Leaflet to render interactive map with markers for each earthquake
- React state updates the map in real time when filters change

## 🛠 Tech Stack

- **Frontend**: Next.js (App Router), Tailwind CSS, Shadcn
- **Map**: Leaflet with React integration
- **Data Source**: [USGS Earthquake API](https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php)

## 📦 Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/AlaBhs/quakedash.git
   cd earthquake-map
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000` in your browser.

## 📷 Screenshots

### 🌍 Earthquake Map View
![Earthquake Map](./public/screenshots/map.png)

### 🔍 Filter by min magnitude Example
![Filter by Magnitude](./public/screenshots/filter.png)

### 📈 General Statistics
![Last Stats](./public/screenshots/stats.png)

## 📄 License

MIT License – [AlaBhs](https://github.com/AlaBhs)
