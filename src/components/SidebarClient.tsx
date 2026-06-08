'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface SidebarClientProps {
  navItems: NavItem[];
  user: { name: string | null; email: string };
  role: string;
  signOutAction: () => Promise<void>;
}


export default function SidebarClient({ navItems, user, role, signOutAction }: SidebarClientProps) {
  const pathname = usePathname();

  const initials = user.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email[0].toUpperCase();

  return (
    <aside className="dashboard-sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div className="sidebar-logo-text">InventoryPro</div>
          <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)', marginTop: '2px' }}>
            v1.0.0
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <span className="sidebar-section-label">Main Menu</span>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link${isActive ? ' active' : ''}`}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user-badge">
          <div className="sidebar-avatar">{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="sidebar-user-name">{user.name || user.email}</div>
            <div className="sidebar-user-role">{role}</div>
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              title="Sign Out"
              style={{
                background: 'none',
                border: 'none',
                padding: '4px',
                cursor: 'pointer',
                color: 'rgba(255,255,255,0.35)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
