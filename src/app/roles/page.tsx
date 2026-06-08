import { query } from '@/lib/db';
import { getAvailableRoles, getAvailablePermissions } from '@/lib/auth/authorization';
import { addRolePermission, removeRolePermission } from './actions';
import SearchableCombobox from '@/components/SearchableCombobox';

export const dynamic = 'force-dynamic';

export default async function RolePermissionsAdmin() {
  const [mappings, availableRoles, availablePermissions] = await Promise.all([
    query<{ role: string; permission: string }>(
      'SELECT role, permission FROM public.role_permissions ORDER BY role ASC, permission ASC'
    ),
    getAvailableRoles(),
    getAvailablePermissions(),
  ]);

  // Group permissions by role
  const roleGroups: Record<string, string[]> = {};
  mappings.forEach((mapping) => {
    if (!roleGroups[mapping.role]) {
      roleGroups[mapping.role] = [];
    }
    roleGroups[mapping.role].push(mapping.permission);
  });

  return (
    <div className="card bg-secondary bg-opacity-10 border border-secondary border-opacity-25 rounded-3 p-4">
      <h2 className="h3 fw-bold mb-4">Role Permission Mapping</h2>
      <p className="text-white-50 small mb-5">
        Configure default capability maps for application roles. Users inheriting these roles automatically receive these permissions.
      </p>

      {/* Form to assign a permission to a role */}
      <div className="card bg-dark border border-secondary border-opacity-25 rounded-3 p-3 mb-5">
        <h3 className="h6 fw-semibold mb-3 text-info">Assign Permission to Role</h3>
        <form action={async (formData: FormData) => {
          'use server';
          const role = (formData.get('role') as string)?.trim().toLowerCase();
          const permission = (formData.get('permission') as string)?.trim().toLowerCase();
          if (role && permission) {
            await addRolePermission(role, permission);
          }
        }} className="row g-3">

          {/* Role — searchable combobox */}
          <div className="col-md-5">
            <SearchableCombobox
              name="role"
              options={availableRoles}
              label="Role"
              placeholder="e.g. operator, peminjam, audit"
              allowNew={true}
              required
            />
          </div>

          {/* Permission — searchable combobox */}
          <div className="col-md-5">
            <SearchableCombobox
              name="permission"
              options={availablePermissions}
              label="Permission"
              placeholder="e.g. loan:approve, user:delete"
              allowNew={true}
              required
            />
          </div>

          <div className="col-md-2 d-flex align-items-end">
            <button type="submit" className="btn btn-primary btn-sm w-100 fw-semibold rounded-2">
              Assign
            </button>
          </div>
        </form>
      </div>

      {/* Grid of roles and permissions */}
      <div className="row g-4">
        {Object.keys(roleGroups).length === 0 ? (
          <div className="col-12 text-center text-muted py-4">No role permissions mapped in database.</div>
        ) : (
          Object.entries(roleGroups).map(([role, permissions]) => (
            <div className="col-md-6" key={role}>
              <div className="card bg-dark bg-opacity-40 border border-secondary border-opacity-25 rounded-3 h-100 p-3">
                <div className="d-flex justify-content-between align-items-center mb-3 border-bottom border-secondary border-opacity-25 pb-2">
                  <h4 className="h5 fw-bold text-warning capitalize mb-0">{role}</h4>
                  <span className="badge bg-secondary text-white-50">{permissions.length} Default Keys</span>
                </div>
                <ul className="list-group list-group-flush bg-transparent mb-0">
                  {permissions.map((perm) => (
                    <li
                      key={perm}
                      className="list-group-item bg-transparent text-white border-secondary border-opacity-10 d-flex justify-content-between align-items-center px-0 py-2 small"
                    >
                      <code>{perm}</code>
                      <form action={removeRolePermission.bind(null, role, perm)}>
                        <button
                          type="submit"
                          className="btn btn-outline-danger btn-xs px-2 py-1 rounded-2"
                          style={{ fontSize: '0.75rem' }}
                        >
                          Revoke
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

