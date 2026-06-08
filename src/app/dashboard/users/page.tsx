import { prisma } from '@/lib/db';
import { getAvailableRoles } from '@/lib/auth/authorization';
import { updateUserRole, addUserPermission, removeUserPermission } from './actions';

export const dynamic = 'force-dynamic';

export default async function UserManagementAdmin() {
  const [users, overrides, availableRoles] = await Promise.all([
    prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true },
      orderBy: [{ name: 'asc' }, { email: 'asc' }]
    }),
    prisma.userPermission.findMany({
      select: { userId: true, permission: true },
      orderBy: { permission: 'asc' }
    }),
    getAvailableRoles(),
  ]);

  // Group overrides by userId
  const userOverrides: Record<string, string[]> = {};
  overrides.forEach((o) => {
    if (!userOverrides[o.userId]) {
      userOverrides[o.userId] = [];
    }
    userOverrides[o.userId].push(o.permission);
  });

  return (
    <div className="card bg-secondary bg-opacity-10 border border-secondary border-opacity-25 rounded-3 p-4">
      <h2 className="h3 fw-bold mb-4">User Management & Permissions</h2>
      <p className="text-white-50 small mb-5">
        Manage base roles and fine-grained custom permission overrides for registered users.
      </p>

      {/* Form to assign a custom permission override */}
      <div className="card bg-dark border border-secondary border-opacity-25 rounded-3 p-3 mb-5">
        <h3 className="h6 fw-semibold mb-3 text-info">Assign Custom Permission Override</h3>
        <form action={async (formData: FormData) => {
          'use server';
          const userId = formData.get('userId') as string;
          const permission = (formData.get('permission') as string)?.trim().toLowerCase();
          if (userId && permission) {
            await addUserPermission(userId, permission);
          }
        }} className="row g-3">
          <div className="col-md-5">
            <select name="userId" required className="form-select form-select-sm bg-dark text-white border-secondary border-opacity-50">
              <option value="">Select User...</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name || 'No Name'} ({u.email})
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-5">
            <input 
              name="permission" 
              type="text" 
              required 
              placeholder="e.g. loan:bypass-limit, extra:access"
              className="form-control form-control-sm bg-dark text-white border-secondary border-opacity-50"
            />
          </div>
          <div className="col-md-2">
            <button type="submit" className="btn btn-primary btn-sm w-100 fw-semibold rounded-2">
              Assign Override
            </button>
          </div>
        </form>
      </div>

      {/* Users Table */}
      <div className="table-responsive">
        <table className="table table-dark table-striped align-middle border border-secondary border-opacity-25 mb-0">
          <thead>
            <tr>
              <th scope="col" style={{ width: '30%' }}>User Name & Email</th>
              <th scope="col" style={{ width: '30%' }}>Base Role</th>
              <th scope="col" style={{ width: '40%' }}>Custom Permission Overrides</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center text-muted py-4">No users registered in database.</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="fw-semibold text-white">{u.name || 'No Name'}</div>
                    <div className="text-white-50 small">{u.email}</div>
                  </td>
                  <td>
                    <form action={async (formData: FormData) => {
                      'use server';
                      const newRole = formData.get('role') as string;
                      if (newRole) {
                        await updateUserRole(u.id, newRole);
                      }
                    }} className="d-flex align-items-center gap-2">
                      <select 
                        name="role" 
                        defaultValue={u.role || 'peminjam'} 
                        className="form-select form-select-sm bg-dark text-white border-secondary border-opacity-50 w-auto"
                      >
                        {availableRoles.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                      <button type="submit" className="btn btn-outline-info btn-xs rounded-2 px-2 py-1" style={{ fontSize: '0.75rem' }}>
                        Save
                      </button>
                    </form>
                  </td>
                  <td>
                    <div className="d-flex flex-wrap gap-2">
                      {!(userOverrides[u.id]) || userOverrides[u.id].length === 0 ? (
                        <span className="text-muted small">None</span>
                      ) : (
                        userOverrides[u.id].map((perm) => (
                          <div 
                            key={perm} 
                            className="badge bg-secondary bg-opacity-10 text-white border border-secondary border-opacity-25 d-flex align-items-center gap-2 px-2 py-1 rounded-2 small"
                          >
                            <code>{perm}</code>
                            <form action={removeUserPermission.bind(null, u.id, perm)} className="d-inline">
                              <button 
                                type="submit" 
                                className="btn-close btn-close-white" 
                                aria-label="Close"
                                style={{ width: '0.5em', height: '0.5em', padding: 0 }}
                              ></button>
                            </form>
                          </div>
                        ))
                      )}
                    </div>
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
