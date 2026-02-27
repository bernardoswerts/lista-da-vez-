import { NavLink, Outlet } from 'react-router-dom';

const tabs = [
  { to: '/', label: 'Fila' },
  { to: '/relatorios', label: 'Relatórios' },
  { to: '/admin', label: 'Admin' },
] as const;

export default function AppShell() {
  return (
    <div className="flex flex-col h-full">
      <header className="bg-pink-500 text-white px-4 py-3 text-center shadow-md">
        <h1 className="text-xl font-bold tracking-wide">Lista da Vez</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <Outlet />
      </main>

      <nav className="bg-white border-t border-pink-200 flex">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) =>
              `flex-1 text-center py-4 text-sm font-semibold transition-colors ${
                isActive
                  ? 'text-pink-600 border-t-2 border-pink-500 bg-pink-50'
                  : 'text-gray-500'
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
