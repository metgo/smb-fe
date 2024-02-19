const deg2rad = (deg: number): number => deg * (Math.PI / 180);

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a
      = Math.sin(dLat / 2) * Math.sin(dLat / 2)
      + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2))
      * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = 6371 * c;
  return distance;
};

export const getNearestBusiness = (lat: number, long: number, businesses) => {
  const sortedBusinesses = businesses.map(business => {
    const distance = calculateDistance(lat, long, business.location.coordinates[1], business.location.coordinates[0]);
    // eslint-disable-next-line no-underscore-dangle
    return { ...business._doc, distance };
  })
    .filter(business => business !== null)
    .sort((a, b) => {
      if (a.distance < b.distance) return -1;
      if (a.distance > b.distance) return 1;

      const latDiffA = Math.abs(a.location.coordinates[1] - lat);
      const latDiffB = Math.abs(b.location.coordinates[1] - lat);
      const longDiffA = Math.abs(a.location.coordinates[0] - long);
      const longDiffB = Math.abs(b.location.coordinates[0] - long);

      const diffA = latDiffA + longDiffA;
      const diffB = latDiffB + longDiffB;
      return diffA - diffB;
    });

  const sortBusinessData = sortedBusinesses.map(({ distance, ...rest }) => rest);
  return sortBusinessData;
};
