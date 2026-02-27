import { useTimer } from '../../hooks/useAttendance';
import type { Attendance } from '../../models/Attendance';

interface Props {
  attendance: Attendance;
  name: string;
  onFinish: () => void;
}

export default function AttendanceCard({ attendance, name, onFinish }: Props) {
  const timer = useTimer(attendance.startedAt);

  return (
    <div className="bg-white rounded-xl border-2 border-pink-300 p-4 flex items-center justify-between shadow-sm">
      <div>
        <p className="font-bold text-pink-700 text-lg">{name}</p>
        <p className="text-pink-400 font-mono text-2xl">{timer}</p>
      </div>
      <button
        onClick={onFinish}
        className="bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-semibold px-5 py-3 rounded-xl min-h-[56px] transition-colors"
      >
        Finalizar
      </button>
    </div>
  );
}
