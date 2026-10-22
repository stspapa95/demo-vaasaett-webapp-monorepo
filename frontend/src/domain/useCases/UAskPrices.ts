import { inject, injectable } from "inversify";
import type { TPriceAskResult } from "@/domain/entities/TPriceAskResult";
import {
  PriceRepositorySymbol,
  type IPriceRepository,
} from "@/domain/repositories/PriceRepository";

@injectable()
export class UAskPrices {
  static readonly symbol = Symbol.for("UAskPrices");

  constructor(
    @inject(PriceRepositorySymbol)
    private readonly prices: IPriceRepository,
  ) {}

  execute(question: string): Promise<TPriceAskResult> {
    return this.prices.ask(question);
  }
}
