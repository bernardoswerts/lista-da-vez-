import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { useQueue } from '../hooks/useQueue';
import QueueCard from '../components/queue/QueueCard';
import AttendanceCard from '../components/queue/AttendanceCard';
import EnterQueueModal from '../components/queue/EnterQueueModal';


export default function QueuePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const {
    waitingEntries,
    attendingEntries,
    enterQueue,
    startAttendance,
    startNewAttendance,
    finishSingleAttendance,
    leaveQueue,
    endShift,
  } = useQueue();

  const salespersons = useLiveQuery(() => db.salespersons.toArray()) ?? [];
  const nameMap = new Map(salespersons.map((sp) => [sp.id!, sp.name]));

  // Get active attendances for attending entries
  const attendingIds = attendingEntries.map((e) => e.id!);
  const activeAttendances = useLiveQuery(
    () =>
      db.attendances
        .filter((a) => attendingIds.includes(a.queueEntryId) && !a.finishedAt)
        .toArray(),
    [attendingIds.join(',')]
  );

  const inQueueIds = new Set([
    ...waitingEntries.map((e) => e.salespersonId),
    ...attendingEntries.map((e) => e.salespersonId),
  ]);

  const handleEndShift = () => {
    if (window.confirm('Encerrar o turno? Isso finaliza todos os atendimentos e limpa a fila.')) {
      endShift();
    }
  };

  return (
    <div className="space-y-6 pb-4">
      {/* Active Attendances */}
      {(activeAttendances ?? []).length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-pink-600 uppercase tracking-wide mb-3">
            Atendendo agora
          </h2>
          <div className="space-y-3">
            {(() => {
              const sorted = [...(activeAttendances ?? [])].sort(
                (a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
              );
              // Build attendance number per salesperson
              const counterMap = new Map<number, number>();
              const numberedAtts = sorted.map((att) => {
                const count = (counterMap.get(att.salespersonId) ?? 0) + 1;
                counterMap.set(att.salespersonId, count);
                return { att, num: count };
              });
              return numberedAtts.map(({ att, num }) => (
                <AttendanceCard
                  key={att.id}
                  attendance={att}
                  name={nameMap.get(att.salespersonId) ?? '?'}
                  attendanceNumber={num}
                  onFinish={() => finishSingleAttendance(att.id!)}
                  onNewAttendance={() => startNewAttendance(att.queueEntryId)}
                />
              ));
            })()}
          </div>
        </section>
      )}

      {/* Queue */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-pink-600 uppercase tracking-wide">
            Fila de espera ({waitingEntries.length})
          </h2>
        </div>

        {waitingEntries.length === 0 ? (
          <div className="bg-white rounded-xl border border-pink-100 p-8 text-center">
            <p className="text-gray-400">Nenhuma vendedora na fila</p>
          </div>
        ) : (
          <div className="space-y-2">
            {waitingEntries.map((entry, i) => (
              <QueueCard
                key={entry.id}
                position={i + 1}
                name={nameMap.get(entry.salespersonId) ?? '?'}
                isFirst={i === 0}
                onLeave={() => leaveQueue(entry.id!)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => setModalOpen(true)}
          className="flex-1 bg-pink-500 hover:bg-pink-600 active:bg-pink-700 text-white font-bold py-4 rounded-xl shadow-md min-h-[56px] transition-colors"
        >
          + Entrar na Lista
        </button>
        {waitingEntries.length > 0 && (
          <button
            onClick={startAttendance}
            className="flex-1 bg-pink-600 hover:bg-pink-700 active:bg-pink-800 text-white font-bold py-4 rounded-xl shadow-md min-h-[56px] transition-colors"
          >
            Atender Cliente
          </button>
        )}
      </div>

      {(waitingEntries.length > 0 || attendingEntries.length > 0) && (
        <button
          onClick={handleEndShift}
          className="w-full py-3 rounded-xl border-2 border-red-300 text-red-500 font-semibold min-h-[56px] hover:bg-red-50 transition-colors"
        >
          Encerrar Turno
        </button>
      )}

      <EnterQueueModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelect={(id) => enterQueue(id)}
        inQueueIds={inQueueIds}
      />
    </div>
  );
}
