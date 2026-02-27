export interface Attendance {
  id?: number;
  salespersonId: number;
  queueEntryId: number;
  startedAt: Date;
  finishedAt?: Date;
  durationMs?: number;
  date: string; // YYYY-MM-DD
}
