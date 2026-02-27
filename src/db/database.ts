import Dexie, { type Table } from 'dexie';
import type { Salesperson } from '../models/Salesperson';
import type { QueueEntry } from '../models/QueueEntry';
import type { Attendance } from '../models/Attendance';

export class AppDatabase extends Dexie {
  salespersons!: Table<Salesperson, number>;
  queueEntries!: Table<QueueEntry, number>;
  attendances!: Table<Attendance, number>;

  constructor() {
    super('ListaDaVezDB');
    this.version(1).stores({
      salespersons: '++id, name, active',
      queueEntries: '++id, salespersonId, status, shiftDate, position',
      attendances: '++id, salespersonId, queueEntryId, date',
    });
  }
}

export const db = new AppDatabase();
