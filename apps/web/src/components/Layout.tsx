import { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Brand from './Brand';
import Icon, { type IconName } from './Icon';

const navigation: { name: string; path: string; icon: IconName }[] = [
  { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
  { name: 'Projects', path: '/projects', icon: 'projects' },
  { name: 'Tasks', path: '/tasks', icon: 'tasks' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const area = navigation.find(item => location.pathname.startsWith(item.path))?.name || 'Workspace';
  const initials = user?.fullName.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'T';
  const handleLogout = () => { logout(); navigate('/login'); };
  const links = navigation.map(item => <NavLink key={item.path} to={item.path} onClick={() => setMenuOpen(false)} className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}><Icon name={item.icon} /><span>{item.name}</span></NavLink>);

  return <div className="app-shell">
    <a href="#main-content" className="skip-link">Skip to content</a>
    <aside className="app-sidebar">
      <div className="px-3 pb-12 pt-2"><Brand /></div>
      <p className="eyebrow px-4 pb-4">Workspace</p>
      <nav aria-label="Main navigation" className="space-y-2">{links}</nav>
      <div className="mt-auto border-t border-line pt-5">
        <div className="flex min-w-0 items-center gap-3 px-3 pb-5"><span className="avatar">{initials}</span><div className="min-w-0"><p className="truncate text-sm font-semibold">{user?.fullName}</p><p className="mt-1 truncate text-xs text-secondary">{user?.email}</p></div></div>
        <button onClick={handleLogout} className="nav-item w-full"><Icon name="logout" />Logout</button>
      </div>
    </aside>
    <div className="flex min-w-0 flex-1 flex-col">
      <header className="app-topbar">
        <div className="flex min-w-0 items-center gap-3">
          <button className="btn-icon md:hidden" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(!menuOpen)}><Icon name={menuOpen ? 'close' : 'menu'} /></button>
          <span className="md:hidden"><Brand /></span><span className="hidden text-sm text-secondary md:inline">Workspace</span><span className="hidden text-line-strong md:inline" aria-hidden="true">/</span><span className="hidden text-sm font-medium md:inline">{area}</span>
        </div>
        <div className="flex items-center gap-5">
          <span className="hidden items-center gap-2 text-xs text-secondary lg:inline-flex"><Icon name="calendar" className="h-4 w-4" />{new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date())}</span>
          <details className="account-menu group">
            <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full" aria-label="Account menu"><span className="avatar h-9 w-9">{initials}</span><span className="hidden text-sm font-medium sm:inline">{user?.fullName.split(' ')[0]}</span></summary>
            <div className="account-popover"><p className="break-words text-sm font-semibold">{user?.fullName}</p><p className="mt-1 break-all text-xs text-secondary">{user?.email}</p><button onClick={handleLogout} className="btn-secondary mt-4 w-full"><Icon name="logout" className="h-4 w-4" />Logout</button></div>
          </details>
        </div>
      </header>
      {menuOpen && <nav id="mobile-navigation" aria-label="Mobile navigation" className="border-b border-line bg-surface px-5 py-4 md:hidden"><div className="mb-4"><Brand /></div><div className="space-y-2">{links}</div></nav>}
      <main id="main-content" tabIndex={-1} className="min-h-0 flex-1 overflow-y-auto px-5 py-7 sm:px-8 lg:px-10 lg:py-9"><div className="mx-auto w-full max-w-[1400px]"><Outlet /></div></main>
    </div>
  </div>;
}
