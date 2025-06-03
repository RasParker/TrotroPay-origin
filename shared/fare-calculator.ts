// Fare calculation utilities for trotro routes

export interface FareCalculation {
  amount: number;
  boardingStop: string;
  alightingStop: string;
  distance: number;
  route: string;
}

export function calculateFare(
  route: { stops: string[]; fares: string[] },
  boardingStop: string,
  alightingStop: string
): FareCalculation {
  const stops = route.stops;
  const fareMap = new Map<string, number>();
  
  // Parse fares array into a map
  route.fares.forEach(fareStr => {
    const [stop, fare] = fareStr.split(':');
    fareMap.set(stop, parseFloat(fare));
  });

  const boardingIndex = stops.indexOf(boardingStop);
  const alightingIndex = stops.indexOf(alightingStop);

  if (boardingIndex === -1 || alightingIndex === -1) {
    throw new Error('Invalid stop names');
  }

  if (boardingIndex >= alightingIndex) {
    throw new Error('Alighting stop must be after boarding stop');
  }

  // Calculate fare as difference between cumulative fares
  const boardingFare = fareMap.get(boardingStop) || 0;
  const alightingFare = fareMap.get(alightingStop) || 0;
  const amount = alightingFare - boardingFare;

  // Calculate distance (number of stops)
  const distance = alightingIndex - boardingIndex;

  return {
    amount,
    boardingStop,
    alightingStop,
    distance,
    route: `${boardingStop} → ${alightingStop}`
  };
}

export function getValidStops(
  route: { stops: string[] },
  boardingStop?: string
): string[] {
  if (!boardingStop) {
    return route.stops;
  }

  const boardingIndex = route.stops.indexOf(boardingStop);
  if (boardingIndex === -1) {
    return route.stops;
  }

  // Return only stops after the boarding stop
  return route.stops.slice(boardingIndex + 1);
}

export function formatFareAmount(amount: number): string {
  return `GH₵ ${amount.toFixed(2)}`;
}