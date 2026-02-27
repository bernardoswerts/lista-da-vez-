interface Props {
  position: number;
  name: string;
  isFirst: boolean;
  onLeave: () => void;
}

export default function QueueCard({ position, name, isFirst, onLeave }: Props) {
  return (
    <div
      className={`bg-white rounded-xl border p-4 flex items-center justify-between shadow-sm ${
        isFirst ? 'border-pink-400 ring-2 ring-pink-200' : 'border-pink-100'
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            isFirst ? 'bg-pink-500 text-white' : 'bg-pink-100 text-pink-600'
          }`}
        >
          {position}
        </span>
        <span className="font-semibold text-gray-800 text-lg">{name}</span>
      </div>
      <button
        onClick={onLeave}
        className="text-gray-400 hover:text-red-400 active:text-red-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        Sair
      </button>
    </div>
  );
}
