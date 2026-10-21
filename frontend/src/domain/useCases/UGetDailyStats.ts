import { inject, injectable } from "inversify";
import {
  PriceRepositorySymbol,
  type IPriceRepository,
} from "@/domain/repositories/PriceRepository";
import type { TDailyStats } from "@/domain/entities/TDailyStats";
import type { TPriceRangeQuery } from "@/domain/entities/TPriceRangeQuery";

@injectable()
export class UGetDailyStats {
  static readonly symbol = Symbol.for("UGetDailyStats");

  constructor(
    @inject(PriceRepositorySymbol)
    private readonly prices: IPriceRepository,
  ) {}

  execute(query: TPriceRangeQuery): Promise<TDailyStats[]> {
    return this.prices.listDailyStats(query);
  }
}
