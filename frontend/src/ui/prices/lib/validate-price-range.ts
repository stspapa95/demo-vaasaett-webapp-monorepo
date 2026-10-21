const MAX_RANGE_DAYS = 31;

export function validatePriceRange(from: string, to: string): string | null {
  if (!from || !to) {
    return "From and to dates are required.";
  }

  if (from > to) {
    return "From must be on or before to.";
  }

  if (dayCount(from, to) > MAX_RANGE_DAYS) {
    return "Date range cannot exceed 31 days.";
  }

  return null;
}

function dayCount(from: string, to: string): number {
  const fromUtc = Date.parse(`${from}T00:00:00Z`);
  const toUtc = Date.parse(`${to}T00:00:00Z`);
  return Math.round((toUtc - fromUtc) / 86_400_000) + 1;
}
