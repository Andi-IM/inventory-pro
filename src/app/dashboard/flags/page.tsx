import { query } from '@/lib/db';
import { toggleFeatureFlag } from './actions';

export const dynamic = 'force-dynamic';

export default async function FeatureFlagsAdmin() {
  const flags = await query<{ key: string; enabled: boolean }>(
    'SELECT key, enabled FROM public.feature_flags ORDER BY key ASC'
  );

  return (
    <div className="card bg-secondary bg-opacity-10 border border-secondary border-opacity-25 rounded-3 p-4">
      <h2 className="h3 fw-bold mb-4">Application Feature Flags</h2>
      <p className="text-white-50 small mb-4">
        Toggle application features on or off dynamically at runtime. This affects all users instantly without code updates.
      </p>

      <div className="table-responsive">
        <table className="table table-dark table-striped align-middle border border-secondary border-opacity-25 mb-0">
          <thead>
            <tr>
              <th scope="col" style={{ width: '40%' }}>Feature Key</th>
              <th scope="col" style={{ width: '30%' }}>Status</th>
              <th scope="col" style={{ width: '30%' }} className="text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            {flags.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center text-muted py-4">No feature flags configured in database.</td>
              </tr>
            ) : (
              flags.map((flag) => (
                <tr key={flag.key}>
                  <td>
                    <code>{flag.key}</code>
                  </td>
                  <td>
                    {flag.enabled ? (
                      <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-2 rounded-pill small">
                        Active
                      </span>
                    ) : (
                      <span className="badge bg-secondary bg-opacity-10 text-white-50 border border-secondary border-opacity-25 px-3 py-2 rounded-pill small">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="text-end">
                    <form action={toggleFeatureFlag.bind(null, flag.key, !flag.enabled)}>
                      <button 
                        type="submit" 
                        className={`btn btn-sm ${flag.enabled ? 'btn-outline-danger' : 'btn-primary'} px-3 rounded-2 fw-semibold`}
                      >
                        {flag.enabled ? 'Disable' : 'Enable'}
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
