/**
 * Returns the distances between two latitude/longitude points in meters.
 *
 * Algorithm adapted from:
 * https://stackoverflow.com/questions/639695/how-to-convert-latitude-or-longitude-to-meters
 *
 * @param lat1 Latitude of point 1.
 * @param lon1 Longitude of point 1.
 * @param lat2 Latitude of point 2.
 * @param lon2 Longitude of point 2.
 */
export function distanceInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const radiusOfEarthMeters = 6378137;
  const dLat = (lat2 * Math.PI) / 180 - (lat1 * Math.PI) / 180;
  const dLon = (lon2 * Math.PI) / 180 - (lon1 * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return radiusOfEarthMeters * c;
}
