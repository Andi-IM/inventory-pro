import { auth } from '@/lib/auth/server';
import { isFeatureEnabled, hasPermission } from '@/lib/auth/authorization';
import { notFound, redirect } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';

export const dynamic = 'force-dynamic';

export default async function RolesLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect('/auth/sign-in');

  const enabled = await isFeatureEnabled('role_management', session.user.id);
  if (!enabled) notFound();

  const allowed = await hasPermission(session.user.id, 'role:manage');
  if (!allowed) notFound();

  return <DashboardLayout pageTitle="Role Management">{children}</DashboardLayout>;
}
