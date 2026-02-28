import { useState } from 'react';
import { useReports, type Period } from '../hooks/useReports';
import { todayStr, getWeekRange, getMonthRange, formatTime } from '../utils/dateUtils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

function getDateRange(period: Period): [string, string] {
  switch (period) {
    case 'today':
      return [todayStr(), todayStr()];
    case 'week':
      return getWeekRange();
    case 'month':
      return getMonthRange();
  }
}

const periodLabels: Record<Period, string> = {
  today: 'Hoje',
  week: 'Semana',
  month: 'Mês',
};

const COLORS = ['#ec4899', '#f472b6', '#f9a8d4', '#fbcfe8', '#db2777', '#be185d'];

export default function ReportsPage() {
  const [period, setPeriod] = useState<Period>('today');
  const [start, end] = getDateRange(period);
  const { loading, getStats } = useReports(start, end);
  const stats = getStats();

  return (
    <div className="space-y-6 pb-4">
      {/* Period Selector */}
      <div className="flex gap-2">
        {(['today', 'week', 'month'] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm min-h-[48px] transition-colors ${
              period === p
                ? 'bg-pink-500 text-white shadow-md'
                : 'bg-white text-pink-600 border border-pink-200'
            }`}
          >
            {periodLabels[p]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400">Carregando...</div>
      ) : (
        <>
          {/* Store Summary */}
          <section className="bg-white rounded-xl border border-pink-100 p-4">
            <h2 className="text-sm font-bold text-pink-600 uppercase tracking-wide mb-3">
              Resumo da Loja
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-pink-600">{stats.total}</p>
                <p className="text-sm text-gray-500">Atendimentos</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-pink-600">
                  {stats.avgMs > 0 ? formatTime(stats.avgMs) : '-'}
                </p>
                <p className="text-sm text-gray-500">Tempo médio</p>
              </div>
            </div>
          </section>

          {/* Chart */}
          {stats.individual.length > 0 && (
            <section className="bg-white rounded-xl border border-pink-100 p-4">
              <h2 className="text-sm font-bold text-pink-600 uppercase tracking-wide mb-3">
                Atendimentos por Vendedora
              </h2>
              <ResponsiveContainer width="100%" height={Math.max(200, stats.individual.length * 50)}>
                <BarChart data={stats.individual} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 13 }} />
                  <Tooltip
                    formatter={(value) => [String(value), 'Atendimentos']}
                  />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={28}>
                    {stats.individual.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </section>
          )}

          {/* Individual Stats */}
          {stats.individual.length > 0 && (
            <section>
              <h2 className="text-sm font-bold text-pink-600 uppercase tracking-wide mb-3">
                Desempenho Individual
              </h2>
              <div className="space-y-2">
                {stats.individual.map((s) => (
                  <div
                    key={s.salespersonId}
                    className="bg-white rounded-xl border border-pink-100 p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">{s.name}</p>
                      <p className="text-sm text-gray-500">
                        Tempo médio: {formatTime(s.avgMs)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-pink-600">{s.count}</p>
                      <p className="text-xs text-gray-400">atendimentos</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {stats.total === 0 && (
            <div className="bg-white rounded-xl border border-pink-100 p-8 text-center">
              <p className="text-gray-400">Nenhum atendimento no período</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
