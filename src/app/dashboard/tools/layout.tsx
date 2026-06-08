import { auth } from '@/lib/auth/server';
import { isFeatureEnabled } from '@/lib/auth/authorization';
import { notFound, redirect } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';

export const dynamic = 'force-dynamic';

export default async function ToolsLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect('/auth/sign-in');

  const enabled = await isFeatureEnabled('tool_management', session.user.id);
  if (!enabled) notFound();

  return <DashboardLayout pageTitle="Tools Management">{children}</DashboardLayout>;
}
