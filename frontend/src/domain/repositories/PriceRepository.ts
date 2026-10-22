import type { TDailyStats } from "@/domain/entities/TDailyStats";
import type { TIngestionRun } from "@/domain/entities/TIngestionRun";
import type { TPriceAskResult } from "@/domain/entities/TPriceAskResult";
import type { TPricePoint } from "@/domain/entities/TPricePoint";
import type { TPriceRangeQuery } from "@/domain/entities/TPriceRangeQuery";

export const PriceRepositorySymbol = Symbol.for("PriceRepository");

export interface IPriceRepository {
  listPrices(query: TPriceRangeQuery): Promise<TPricePoint[]>;
  listDailyStats(query: TPriceRangeQuery): Promise<TDailyStats[]>;
  listIngestionRuns(limit: number): Promise<TIngestionRun[]>;
  ask(question: string): Promise<TPriceAskResult>;
}
