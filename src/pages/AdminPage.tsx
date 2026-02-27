import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';

export default function AdminPage() {
  const [name, setName] = useState('');
  const salespersons = useLiveQuery(() =>
    db.salespersons.orderBy('name').toArray()
  );

  const handleAdd = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    await db.salespersons.add({
      name: trimmed,
      active: true,
      createdAt: new Date(),
    });
    setName('');
  };

  const toggleActive = async (id: number, currentActive: boolean) => {
    await db.salespersons.update(id, { active: !currentActive });
  };

  return (
    <div className="space-y-6 pb-4">
      <section>
        <h2 className="text-sm font-bold text-pink-600 uppercase tracking-wide mb-3">
          Cadastrar Vendedora
        </h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Apelido / 1º nome"
            className="flex-1 border-2 border-pink-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-pink-400 bg-white min-h-[56px]"
          />
          <button
            onClick={handleAdd}
            disabled={!name.trim()}
            className="bg-pink-500 hover:bg-pink-600 active:bg-pink-700 disabled:bg-pink-200 text-white font-bold px-6 rounded-xl min-h-[56px] transition-colors"
          >
            Adicionar
          </button>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-bold text-pink-600 uppercase tracking-wide mb-3">
          Vendedoras ({salespersons?.length ?? 0})
        </h2>
        {(!salespersons || salespersons.length === 0) ? (
          <div className="bg-white rounded-xl border border-pink-100 p-8 text-center">
            <p className="text-gray-400">Nenhuma vendedora cadastrada</p>
          </div>
        ) : (
          <div className="space-y-2">
            {salespersons.map((sp) => (
              <div
                key={sp.id}
                className={`bg-white rounded-xl border p-4 flex items-center justify-between ${
                  sp.active ? 'border-pink-100' : 'border-gray-200 opacity-60'
                }`}
              >
                <span className={`font-semibold text-lg ${sp.active ? 'text-gray-800' : 'text-gray-400 line-through'}`}>
                  {sp.name}
                </span>
                <button
                  onClick={() => toggleActive(sp.id!, sp.active)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium min-h-[44px] transition-colors ${
                    sp.active
                      ? 'bg-red-50 text-red-500 hover:bg-red-100'
                      : 'bg-green-50 text-green-600 hover:bg-green-100'
                  }`}
                >
                  {sp.active ? 'Desativar' : 'Ativar'}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
