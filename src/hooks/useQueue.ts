import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { todayStr } from '../utils/dateUtils';
import type { QueueEntry } from '../models/QueueEntry';

export function useQueue() {
  const shiftDate = todayStr();

  const waitingEntries = useLiveQuery(
    () =>
      db.queueEntries
        .where({ shiftDate, status: 'waiting' })
        .sortBy('position'),
    [shiftDate]
  );

  const attendingEntries = useLiveQuery(
    () =>
      db.queueEntries
        .where({ shiftDate, status: 'attending' })
        .toArray(),
    [shiftDate]
  );

  const allTodayEntries = useLiveQuery(
    () => db.queueEntries.where({ shiftDate }).toArray(),
    [shiftDate]
  );

  async function getNextPosition(): Promise<number> {
    const entries = await db.queueEntries.where({ shiftDate }).toArray();
    if (entries.length === 0) return 1;
    return Math.max(...entries.map((e) => e.position)) + 1;
  }

  async function enterQueue(salespersonId: number) {
    // Check if already in queue today (waiting or attending)
    const existing = await db.queueEntries
      .where({ shiftDate, salespersonId })
      .filter((e) => e.status === 'waiting' || e.status === 'attending')
      .first();
    if (existing) return;

    const position = await getNextPosition();
    await db.queueEntries.add({
      salespersonId,
      position,
      status: 'waiting',
      enteredAt: new Date(),
      shiftDate,
    });
  }

  async function startAttendance() {
    const waiting = await db.queueEntries
      .where({ shiftDate, status: 'waiting' })
      .sortBy('position');
    if (waiting.length === 0) return;

    const entry = waiting[0];
    await db.queueEntries.update(entry.id!, { status: 'attending' });
    await db.attendances.add({
      salespersonId: entry.salespersonId,
      queueEntryId: entry.id!,
      startedAt: new Date(),
      date: shiftDate,
    });
  }

  async function finishAttendance(queueEntryId: number) {
    const entry = await db.queueEntries.get(queueEntryId);
    if (!entry) return;

    const now = new Date();
    const attendance = await db.attendances
      .where({ queueEntryId })
      .filter((a) => !a.finishedAt)
      .first();

    if (attendance) {
      const durationMs = now.getTime() - new Date(attendance.startedAt).getTime();
      await db.attendances.update(attendance.id!, {
        finishedAt: now,
        durationMs,
      });
    }

    // Mark current entry as left and create new entry at end of queue
    await db.queueEntries.update(queueEntryId, { status: 'left' });
    const position = await getNextPosition();
    await db.queueEntries.add({
      salespersonId: entry.salespersonId,
      position,
      status: 'waiting',
      enteredAt: new Date(),
      shiftDate,
    });
  }

  async function leaveQueue(queueEntryId: number) {
    await db.queueEntries.update(queueEntryId, { status: 'left' });
  }

  async function endShift() {
    // Finish all active attendances
    const attending = await db.queueEntries
      .where({ shiftDate, status: 'attending' })
      .toArray();

    const now = new Date();
    for (const entry of attending) {
      const attendance = await db.attendances
        .where({ queueEntryId: entry.id! })
        .filter((a) => !a.finishedAt)
        .first();
      if (attendance) {
        const durationMs = now.getTime() - new Date(attendance.startedAt).getTime();
        await db.attendances.update(attendance.id!, {
          finishedAt: now,
          durationMs,
        });
      }
    }

    // Mark all remaining entries as left
    const active = await db.queueEntries
      .where({ shiftDate })
      .filter((e) => e.status === 'waiting' || e.status === 'attending')
      .toArray();

    for (const entry of active) {
      await db.queueEntries.update(entry.id!, { status: 'left' });
    }
  }

  return {
    waitingEntries: waitingEntries ?? [],
    attendingEntries: attendingEntries ?? [],
    allTodayEntries: allTodayEntries ?? [],
    enterQueue,
    startAttendance,
    finishAttendance,
    leaveQueue,
    endShift,
  };
}
