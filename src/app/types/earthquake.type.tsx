export interface Earthquake {
    id: string;
    geometry: {
      coordinates: [number, number];
    };
    properties: {
      mag: number;
      place: string;
      time: number;
    };
  }