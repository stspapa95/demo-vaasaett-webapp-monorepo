import type { Container } from "inversify";
import { PriceRepositorySymbol } from "@/domain/repositories/PriceRepository";
import { UGetDailyStats } from "@/domain/useCases/UGetDailyStats";
import { UGetIngestionRuns } from "@/domain/useCases/UGetIngestionRuns";
import { UGetPrices } from "@/domain/useCases/UGetPrices";
import { PriceRepositoryAPI } from "@/infrastructure/api/prices/PriceRepositoryAPI";

export const registerPriceBindings = (rl: Container) => {
  rl.bind(PriceRepositorySymbol).to(PriceRepositoryAPI).inSingletonScope();
  rl.bind(UGetPrices.symbol).to(UGetPrices).inSingletonScope();
  rl.bind(UGetDailyStats.symbol).to(UGetDailyStats).inSingletonScope();
  rl.bind(UGetIngestionRuns.symbol).to(UGetIngestionRuns).inSingletonScope();
};
