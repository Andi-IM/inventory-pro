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



};

export default async function DashboardLayout({ children, pageTitle }: { children: React.ReactNode; pageTitle?: string }) {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    redirect('/auth/sign-in');
  }

  const user = session.user;
  const role = await getUserRole(user.id);

  // Build nav items based on feature flags + permissions
  const navItems = [];

  // Tools
  if (await isFeatureEnabled('tool_management', user.id)) {
    navItems.push({ href: '/tools', label: 'Tools', icon: Icons.tools });
  }
// Roles
  if (await isFeatureEnabled('role_management', user.id) && await hasPermission(user.id, 'role:manage')) {
    navItems.push({ href: '/roles', label: 'Roles', icon: Icons.roles });
  }
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
