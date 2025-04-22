'use client';

import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { LatLngExpression } from 'leaflet';
import { Earthquake } from '../types/earthquake.type';

interface Props {
  earthquakes: Earthquake[];
}

export default function EarthquakeMap({ earthquakes }: Props) {
  return (
    <MapContainer
      center={[20, 0] as LatLngExpression}
      zoom={2}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {earthquakes.map((eq) => {
        const [lng, lat] = eq.geometry.coordinates;
        const center = [lat, lng] as LatLngExpression;

        return (
          <Circle
            key={eq.id}
            center={center}
            radius={eq.properties.mag * 20000}
            pathOptions={{ color: 'red' }}
          >
            <Popup>
              <strong>{eq.properties.place}</strong>
              <br />
              Magnitude: {eq.properties.mag}
              <br />
              Time: {new Date(eq.properties.time).toLocaleString()}
            </Popup>
          </Circle>
        );
      })}
    </MapContainer>
  );
}
