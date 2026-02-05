import { SPEED_KMH } from "./constant";

export const getRandomSpeedKmh = () => {
  const values = Object.values(SPEED_KMH);
  const i = Math.floor(Math.random() * values.length);
  return values[i];
};

export const kmhToMps = (kmh) => kmh / 3.6;