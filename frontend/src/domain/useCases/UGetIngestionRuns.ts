import { inject, injectable } from "inversify";
import {
  PriceRepositorySymbol,
  type IPriceRepository,
} from "@/domain/repositories/PriceRepository";
import type { TIngestionRun } from "@/domain/entities/TIngestionRun";

@injectable()
export class UGetIngestionRuns {
  static readonly symbol = Symbol.for("UGetIngestionRuns");

  constructor(
    @inject(PriceRepositorySymbol)
    private readonly prices: IPriceRepository,
  ) {}

  execute(limit = 50): Promise<TIngestionRun[]> {
    return this.prices.listIngestionRuns(limit);
  }
}
