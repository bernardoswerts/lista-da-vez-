import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { todayStr } from '../utils/dateUtils';

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

  async function startNewAttendance(queueEntryId: number) {
    const entry = await db.queueEntries.get(queueEntryId);
    if (!entry || entry.status !== 'attending') return;

    await db.attendances.add({
      salespersonId: entry.salespersonId,
      queueEntryId: entry.id!,
      startedAt: new Date(),
      date: shiftDate,
    });
  }

  async function finishSingleAttendance(attendanceId: number) {
    const attendance = await db.attendances.get(attendanceId);
    if (!attendance || attendance.finishedAt) return;

    const now = new Date();
    const durationMs = now.getTime() - new Date(attendance.startedAt).getTime();
    await db.attendances.update(attendanceId, {
      finishedAt: now,
      durationMs,
    });

    // Check if there are remaining active attendances for this queueEntry
    const remaining = await db.attendances
      .where({ queueEntryId: attendance.queueEntryId })
      .filter((a) => !a.finishedAt)
      .count();

    if (remaining === 0) {
      const entry = await db.queueEntries.get(attendance.queueEntryId);
      if (!entry) return;

      // Mark current entry as left and re-enqueue
      await db.queueEntries.update(attendance.queueEntryId, { status: 'left' });
      const position = await getNextPosition();
      await db.queueEntries.add({
        salespersonId: entry.salespersonId,
        position,
        status: 'waiting',
        enteredAt: new Date(),
        shiftDate,
      });
    }
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
      const openAttendances = await db.attendances
        .where({ queueEntryId: entry.id! })
        .filter((a) => !a.finishedAt)
        .toArray();
      for (const attendance of openAttendances) {
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
    startNewAttendance,
    finishSingleAttendance,
    leaveQueue,
    endShift,
  };
}
