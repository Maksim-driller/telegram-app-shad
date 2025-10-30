import { Link, Outlet, useLocation } from 'react-router-dom';

export default function Layout() {
  const { pathname } = useLocation();
  return (
    <div className="app-shell">
      <div className="app-frame">
        <header className="app-header">
          <div className="app-title">ШАД • Подготовка</div>
        </header>
        <main className="app-main">
          <Outlet />
        </main>
        <nav className="app-nav">
          <div className="app-nav-grid">
            <NavItem to="/" current={pathname === '/'} label="Главная" />
            <NavItem to="/plan" current={pathname.startsWith('/plan')} label="План" />
            <NavItem to="/diary" current={pathname.startsWith('/diary')} label="Дневник" />
            <NavItem to="/settings" current={pathname.startsWith('/settings')} label="Настройки" />
          </div>
        </nav>
      </div>
    </div>
  );
}

function NavItem({ to, label, current }: { to: string; label: string; current: boolean }) {
  return (
    <Link
      to={to}
      className={current ? 'current' : undefined}
    >
      {label}
    </Link>
  );
}


