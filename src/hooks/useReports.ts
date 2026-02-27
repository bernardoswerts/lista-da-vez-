import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import type { Attendance } from '../models/Attendance';

export type Period = 'today' | 'week' | 'month';

export interface IndividualStats {
  salespersonId: number;
  name: string;
  count: number;
  totalMs: number;
  avgMs: number;
}

export function useReports(startDate: string, endDate: string) {
  const attendances = useLiveQuery(
    () =>
      db.attendances
        .where('date')
        .between(startDate, endDate, true, true)
        .filter((a) => !!a.finishedAt)
        .toArray(),
    [startDate, endDate]
  );

  const salespersons = useLiveQuery(() => db.salespersons.toArray());

  function getStats(): { individual: IndividualStats[]; total: number; avgMs: number } {
    if (!attendances || !salespersons) return { individual: [], total: 0, avgMs: 0 };

    const byPerson = new Map<number, Attendance[]>();
    for (const a of attendances) {
      const arr = byPerson.get(a.salespersonId) ?? [];
      arr.push(a);
      byPerson.set(a.salespersonId, arr);
    }

    const individual: IndividualStats[] = [];
    for (const sp of salespersons) {
      const records = byPerson.get(sp.id!) ?? [];
      if (records.length === 0) continue;
      const totalMs = records.reduce((sum, r) => sum + (r.durationMs ?? 0), 0);
      individual.push({
        salespersonId: sp.id!,
        name: sp.name,
        count: records.length,
        totalMs,
        avgMs: Math.round(totalMs / records.length),
      });
    }

    individual.sort((a, b) => b.count - a.count);

    const total = attendances.length;
    const totalMs = attendances.reduce((sum, a) => sum + (a.durationMs ?? 0), 0);

    return {
      individual,
      total,
      avgMs: total > 0 ? Math.round(totalMs / total) : 0,
    };
  }

  return {
    loading: !attendances || !salespersons,
    getStats,
  };
}
