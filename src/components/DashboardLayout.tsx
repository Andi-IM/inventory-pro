import { auth } from '@/lib/auth/server';
import { getUserRole, isFeatureEnabled, hasPermission } from '@/lib/auth/authorization';
import { redirect } from 'next/navigation';
import SidebarClient from '@/components/SidebarClient';
import { signOut } from '@/lib/auth/actions';

export { signOut };

export const dynamic = 'force-dynamic';

// SVG Icons
const Icons = {
  tools: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width={18} height={18}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  users: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width={18} height={18}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  roles: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width={18} height={18}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  flags: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width={18} height={18}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
    </svg>
  ),
};

export default async function DashboardLayout({ children, pageTitle }: { children: React.ReactNode; pageTitle?: string }) {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    redirect('/auth/sign-in');
  }

  const user = session.user;

  // Fetch role once; React.cache() ensures sub-calls (isFeatureEnabled,
  // hasPermission) reuse this result without extra DB round-trips.
  const role = await getUserRole(user.id);

  // Run all feature-flag + permission checks in parallel.
  // Previously these were sequential awaits → N×RTT waterfall.
  const [
    showTools,
    showUsers,
    showRoles,
    showFlags,
  ] = await Promise.all([
    isFeatureEnabled('tool_management', user.id),
    Promise.all([
      isFeatureEnabled('user_management', user.id),
      hasPermission(user.id, 'user:manage'),
    ]).then(([flag, perm]) => flag && perm),
    Promise.all([
      isFeatureEnabled('role_management', user.id),
      hasPermission(user.id, 'role:manage'),
    ]).then(([flag, perm]) => flag && perm),
    Promise.all([
      isFeatureEnabled('flag_management', user.id),
      hasPermission(user.id, 'flag:manage'),
    ]).then(([flag, perm]) => flag && perm),
  ]);

  // Build nav items from resolved results
  const navItems = [];
  if (showTools)  navItems.push({ href: '/dashboard/tools', label: 'Tools', icon: Icons.tools });
  if (showUsers)  navItems.push({ href: '/dashboard/users', label: 'Users', icon: Icons.users });
  if (showRoles)  navItems.push({ href: '/dashboard/roles', label: 'Roles', icon: Icons.roles });
  if (showFlags)  navItems.push({ href: '/dashboard/flags', label: 'Feature Flags', icon: Icons.flags });

  return (
    <div className="dashboard-root">
      <SidebarClient
        navItems={navItems}
        user={{ name: user.name ?? null, email: user.email ?? '' }}
        role={role}
        signOutAction={signOut}
      />
      <div className="dashboard-main">
        {pageTitle && (
          <header className="dashboard-topbar">
            <span className="dashboard-page-title">{pageTitle}</span>
          </header>
        )}
        <div className="dashboard-content">
          {children}
        </div>
      </div>
    </div>
  );
}
