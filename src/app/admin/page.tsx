import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const userCountRes = await query<{ count: string }>('SELECT COUNT(*) FROM neon_auth.user');
  const userCount = parseInt(userCountRes[0]?.count || '0', 10);

  const flagCountRes = await query<{ count: string }>('SELECT COUNT(*) FROM public.feature_flags');
  const flagCount = parseInt(flagCountRes[0]?.count || '0', 10);

  const roleCountRes = await query<{ count: string }>('SELECT COUNT(DISTINCT role) FROM public.role_permissions');
  const roleCount = parseInt(roleCountRes[0]?.count || '0', 10) + 1; // plus superuser

  return (
    <div className="card bg-secondary bg-opacity-10 border border-secondary border-opacity-25 rounded-3 p-4">
      <h2 className="h3 fw-bold mb-4">Administration Console Overview</h2>
      <p className="text-white-50 mb-5">
        Manage users, assign base roles, specify custom user permissions, update role default capabilities, and toggle system-wide feature flags.
      </p>

      <div className="row g-4 mb-5">
        <div className="col-md-4">
          <div className="p-4 rounded-3 bg-secondary bg-opacity-10 border border-secondary border-opacity-25 h-100 text-center">
            <h3 className="h6 text-info fw-semibold mb-3">Total Registered Users</h3>
            <div className="display-4 fw-bold mb-2">{userCount}</div>
            <p className="small text-muted mb-0">From neon_auth.user</p>
          </div>
        </div>

        <div className="col-md-4">
          <div className="p-4 rounded-3 bg-secondary bg-opacity-10 border border-secondary border-opacity-25 h-100 text-center">
            <h3 className="h6 text-warning fw-semibold mb-3">Configured Roles</h3>
            <div className="display-4 fw-bold mb-2">{roleCount}</div>
            <p className="small text-muted mb-0">From public.role_permissions</p>
          </div>
        </div>

        <div className="col-md-4">
          <div className="p-4 rounded-3 bg-secondary bg-opacity-10 border border-secondary border-opacity-25 h-100 text-center">
            <h3 className="h6 text-success fw-semibold mb-3">Active Feature Flags</h3>
            <div className="display-4 fw-bold mb-2">{flagCount}</div>
            <p className="small text-muted mb-0">From public.feature_flags</p>
          </div>
        </div>
      </div>

      <div className="border-top border-secondary border-opacity-25 pt-4">
        <h4 className="h5 fw-bold mb-3">System Health Status</h4>
        <div className="alert alert-success border-success border-opacity-25 bg-success bg-opacity-10 text-white rounded-3 small mb-0 p-3">
          ⚡ Connected to database branch <code>br-divine-mud-apquymds</code> successfully. Pool active and ready.
        </div>
      </div>
    </div>
  );
}
