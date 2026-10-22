import type { TDailyStats } from "@/domain/entities/TDailyStats";
import type { TIngestionRun } from "@/domain/entities/TIngestionRun";
import type { TPriceAskResult } from "@/domain/entities/TPriceAskResult";
import type { TPricePoint } from "@/domain/entities/TPricePoint";
import type { TPriceRangeQuery } from "@/domain/entities/TPriceRangeQuery";
import type { IPriceRepository } from "@/domain/repositories/PriceRepository";
import type { TDailyStatsDTO } from "@/infrastructure/api/prices/dtos/TDailyStatsDTO";
import type { TIngestionRunDTO } from "@/infrastructure/api/prices/dtos/TIngestionRunDTO";
import type { TPriceAskDTO } from "@/infrastructure/api/prices/dtos/TPriceAskDTO";
import type { TPricePointDTO } from "@/infrastructure/api/prices/dtos/TPricePointDTO";
import { injectable } from "inversify";

@injectable()
export class PriceRepositoryAPI implements IPriceRepository {
  async listPrices(query: TPriceRangeQuery): Promise<TPricePoint[]> {
    const url = this.buildUrl("/prices", {
      biddingZone: query.biddingZone,
      from: query.from,
      to: query.to,
    });

    const rows = await this.getJson<TPricePointDTO[]>(url, "Could not load prices. Try again.");

    return rows.map((row) => ({
      occurredAt: row.occurredAt,
      price: Number(row.price),
      unit: row.unit,
      biddingZone: row.biddingZone,
    }));
  }

  async listDailyStats(query: TPriceRangeQuery): Promise<TDailyStats[]> {
    const url = this.buildUrl("/prices/daily-stats", {
      biddingZone: query.biddingZone,
      from: query.from,
      to: query.to,
    });
    const rows = await this.getJson<TDailyStatsDTO[]>(
      url,
      "Could not load daily stats. Try again.",
    );

    return rows.map((row) => ({
      day: row.day,
      min: Number(row.min),
      max: Number(row.max),
      average: Number(row.average),
      count: row.count,
    }));
  }

  async listIngestionRuns(limit: number): Promise<TIngestionRun[]> {
    const url = this.buildUrl("/ingestion-runs", { limit: String(limit) });
    const rows = await this.getJson<TIngestionRunDTO[]>(
      url,
      "Could not load ingestion runs. Try again.",
    );

    return rows.map((row) => ({
      id: row.id,
      biddingZone: row.biddingZone,
      status: row.status,
      startedAt: row.startedAt,
      finishedAt: row.finishedAt,
      fetchedCount: row.fetchedCount,
      upsertedCount: row.upsertedCount,
      skippedNullCount: row.skippedNullCount,
      skippedDuplicateCount: row.skippedDuplicateCount,
      skippedUnrealisticCount: row.skippedUnrealisticCount,
      errorMessage: row.errorMessage,
    }));
  }

  async ask(question: string): Promise<TPriceAskResult> {
    const url = this.buildUrl("/prices/ask", {});
    const row = await this.postJson<TPriceAskDTO>(
      url,
      { question },
      "Could not answer that question. Try again.",
    );

    return { answer: row.answer };
  }

  private buildUrl(path: string, params: Record<string, string>): string {
    const url = new URL(path, apiBaseUrl());
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }

    return url.toString();
  }

  private async getJson<T>(url: string, fallbackMessage: string): Promise<T> {
    return this.parseJson(this.get(url), fallbackMessage);
  }

  private async postJson<T>(url: string, payload: unknown, fallbackMessage: string): Promise<T> {
    return this.parseJson(this.post(url, payload), fallbackMessage);
  }

  private async get(url: string): Promise<Response> {
    try {
      return await fetch(url);
    } catch {
      throw new Error("Could not reach the API. Is it running?");
    }
  }

  private async post(url: string, payload: unknown): Promise<Response> {
    try {
      return await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      throw new Error("Could not reach the API. Is it running?");
    }
  }

  private async parseJson<T>(
    responsePromise: Promise<Response>,
    fallbackMessage: string,
  ): Promise<T> {
    const response = await responsePromise;
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      throw new Error(body?.message ?? fallbackMessage);
    }

    return (await response.json()) as T;
  }
}

function apiBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error("API URL is not configured.");
  }
  return url.endsWith("/") ? url : `${url}/`;
}
