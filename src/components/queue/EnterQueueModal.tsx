import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (salespersonId: number) => void;
  inQueueIds: Set<number>;
}

export default function EnterQueueModal({ open, onClose, onSelect, inQueueIds }: Props) {
  const salespersons = useLiveQuery(
    () => db.salespersons.filter((sp) => sp.active).toArray()
  );

  if (!open) return null;

  const available = (salespersons ?? []).filter((sp) => !inQueueIds.has(sp.id!));

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-pink-100">
          <h2 className="text-lg font-bold text-pink-700 text-center">
            Quem chegou?
          </h2>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          {available.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              Todas as vendedoras já estão na fila
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {available.map((sp) => (
                <button
                  key={sp.id}
                  onClick={() => {
                    onSelect(sp.id!);
                    onClose();
                  }}
                  className="bg-pink-50 hover:bg-pink-100 active:bg-pink-200 border-2 border-pink-200 rounded-xl py-4 px-3 text-pink-700 font-semibold text-lg transition-colors min-h-[56px]"
                >
                  {sp.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-pink-100">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-gray-100 text-gray-600 font-semibold min-h-[56px]"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
