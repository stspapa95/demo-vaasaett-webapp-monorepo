import { inject, injectable } from "inversify";
import {
  PriceRepositorySymbol,
  type IPriceRepository,
} from "@/domain/repositories/PriceRepository";
import type { TPricePoint } from "@/domain/entities/TPricePoint";
import type { TPriceRangeQuery } from "@/domain/entities/TPriceRangeQuery";

@injectable()
export class UGetPrices {
  static readonly symbol = Symbol.for("UGetPrices");

  constructor(
    @inject(PriceRepositorySymbol)
    private readonly prices: IPriceRepository,
  ) {}

  execute(query: TPriceRangeQuery): Promise<TPricePoint[]> {
    return this.prices.listPrices(query);
  }
}
