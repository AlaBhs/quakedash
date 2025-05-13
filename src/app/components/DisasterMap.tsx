"use client";

import { MapContainer, TileLayer, Popup, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import earthquakeImg from "@/app/assets/earthquake.png";
import wildfireImg from "@/app/assets/wildfire.png";
import explosionImg from "@/app/assets/explosion.png";
import glacierImg from "@/app/assets/glacier.png";
import floodImg from "@/app/assets/flood.png";
import "../styles/map.css";
import { Disaster } from "../types/disaster.type";
import { getColorForMagnitude } from "../lib/getColorForMagnitude";
import { MAX_BY_TYPE } from "../lib/getMaxByType";
interface Props {
  disasters: Disaster[];
  tileUrl: string;
}

export default function DisasterMap({ disasters, tileUrl }: Props) {
  return (
    <MapContainer
      center={[20, 0] as LatLngExpression}
      zoom={2}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url={tileUrl} />
      {disasters.map((eq) => {
        const lat = eq.latitude;
        const lng = eq.longitude;
        const center = [lat, lng] as LatLngExpression;
        const maxMag = MAX_BY_TYPE[eq.type] ?? 10;
        const color = getColorForMagnitude(eq.magnitude_value ?? 0, maxMag);
        const iconUrl =
          eq.type === "Earthquake"
            ? earthquakeImg.src
            : eq.type === "Wildfires"
            ? wildfireImg.src
            : eq.type === "Sea and Lake Ice"
            ? glacierImg.src
            : eq.type === "Flood"
            ? floodImg.src
            : explosionImg.src;
        const html = `
          <div class="custom-pin" style="background:${color}">
            <img src="${iconUrl}" class="pin-image" />
            <div class="custom-pin-triangle" style="border-top-color:${color}">
            </div>
          </div>`;
        const pinIcon = L.divIcon({
          className: "",
          html,
          iconSize: [40, 40],
          iconAnchor: [20, 40],
        });
        return (
          <Marker key={eq._id} position={center} icon={pinIcon}>
            <Popup>{renderPopupContent(eq)}</Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
function renderPopupContent(eq: Disaster) {
  return (
    <>
      <strong>{eq.place ?? "Unknown location"}</strong>
      <br />
      Type: {eq.type}
      <br />
      Magnitude: {eq.magnitude_value}
      {eq.magnitude_unit ? ` ${eq.magnitude_unit}` : ""}
      <br />
      Time: {new Date(eq.time).toLocaleString()}
      <br />
      {eq.source && (
        <>
          Source: {eq.source}
          <br />
        </>
      )}
      {eq.description && <>Description: {eq.description}</>}
    </>
  );
}
