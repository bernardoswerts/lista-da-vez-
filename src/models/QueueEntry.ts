export type QueueStatus = 'waiting' | 'attending' | 'left';

export interface QueueEntry {
  id?: number;
  salespersonId: number;
  position: number;
  status: QueueStatus;
  enteredAt: Date;
  shiftDate: string; // YYYY-MM-DD
}
