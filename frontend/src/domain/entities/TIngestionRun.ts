export type TIngestionStatus = "running" | "succeeded" | "failed";

export type TIngestionRun = {
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
