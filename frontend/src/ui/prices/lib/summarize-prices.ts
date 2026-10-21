import type { TPricePoint } from "@/domain/entities/TPricePoint";

export type TPriceSummary = {
  latest: number;
  latestAt: string;
  min: number;
  max: number;
  average: number;
  count: number;
  unit: string;
};

export function summarizePrices(points: TPricePoint[]): TPriceSummary | null {
  if (points.length === 0) {
    return null;
  }

  const last = points[points.length - 1];
  const prices = points.map((point) => point.price);

  return {
    latest: last.price,
    latestAt: last.occurredAt,
    min: Math.min(...prices),
    max: Math.max(...prices),
    average: prices.reduce((total, price) => total + price, 0) / prices.length,
    count: points.length,
    unit: last.unit,
  };
}
