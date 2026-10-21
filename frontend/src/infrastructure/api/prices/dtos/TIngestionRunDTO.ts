import type { TIngestionStatus } from "@/domain/entities/TIngestionRun";

export type TIngestionRunDTO = {
  id: string;
  biddingZone: string;
  status: TIngestionStatus;
  startedAt: string;
  finishedAt: string | null;
  fetchedCount: number;
  upsertedCount: number;
  skippedNullCount: number;
  skippedDuplicateCount: number;
  skippedUnrealisticCount: number;
  errorMessage: string | null;
};
