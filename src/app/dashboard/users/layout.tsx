import { auth } from '@/lib/auth/server';
import { isFeatureEnabled, hasPermission } from '@/lib/auth/authorization';
import { notFound, redirect } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';

export const dynamic = 'force-dynamic';

export default async function UsersLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect('/auth/sign-in');

  const enabled = await isFeatureEnabled('user_management', session.user.id);
  if (!enabled) notFound();

  const allowed = await hasPermission(session.user.id, 'user:manage');
  if (!allowed) notFound();

  return <DashboardLayout pageTitle="User Management">{children}</DashboardLayout>;
}
