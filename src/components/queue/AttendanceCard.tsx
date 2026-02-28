import { useTimer } from '../../hooks/useAttendance';
import type { Attendance } from '../../models/Attendance';

interface Props {
  attendance: Attendance;
  name: string;
  attendanceNumber: number;
  onFinish: () => void;
  onNewAttendance: () => void;
}

export default function AttendanceCard({ attendance, name, attendanceNumber, onFinish, onNewAttendance }: Props) {
  const timer = useTimer(attendance.startedAt);

  return (
    <div className="bg-white rounded-xl border-2 border-pink-300 p-4 flex items-center justify-between shadow-sm">
      <div>
        <p className="font-bold text-pink-700 text-lg">{name} - atendimento {attendanceNumber}</p>
        <p className="text-pink-400 font-mono text-2xl">{timer}</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onNewAttendance}
          className="bg-purple-500 hover:bg-purple-600 active:bg-purple-700 text-white font-semibold px-4 py-3 rounded-xl min-h-[56px] transition-colors text-sm"
        >
          Novo Atend.
        </button>
        <button
          onClick={onFinish}
          className="bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-semibold px-5 py-3 rounded-xl min-h-[56px] transition-colors"
        >
          Finalizar
        </button>
      </div>
    </div>
  );
}
