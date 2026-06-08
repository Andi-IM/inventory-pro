import Link from 'next/link';
import { getTools } from '@/lib/tools';
import { auth } from '@/lib/auth/server';
import { getUserRole } from '@/lib/auth/authorization';
import { deleteToolAction } from './actions';
import { DeleteButton } from './DeleteButton';

export const dynamic = 'force-dynamic';

export default async function ToolsListPage() {
  const tools = await getTools();
  
  const { data: session } = await auth.getSession();
  const role = session?.user ? await getUserRole(session.user.id) : null;
  const canManage = role === 'superuser' || role === 'operator';

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Tools List</h1>
        {canManage && (
          <Link href="/dashboard/tools/new" className="btn btn-primary">
            + Add Tool
          </Link>
        )}
      </div>

      <div className="card bg-secondary bg-opacity-10 border-secondary border-opacity-25 text-white">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-dark table-hover mb-0">
              <thead>
                <tr>
                  <th className="border-secondary border-opacity-25 bg-transparent">Name</th>
                  <th className="border-secondary border-opacity-25 bg-transparent">Status</th>
                  <th className="border-secondary border-opacity-25 bg-transparent">Added On</th>
                  <th className="border-secondary border-opacity-25 bg-transparent text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tools.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-white-50 border-0 bg-transparent">
                      No tools found.
                    </td>
                  </tr>
                ) : (
                  tools.map((tool) => (
                    <tr key={tool.id}>
                      <td className="align-middle border-secondary border-opacity-25 bg-transparent">
                        <Link href={`/dashboard/tools/${tool.id}`} className="text-decoration-none text-info fw-semibold">
                          {tool.name}
                        </Link>
                      </td>
                      <td className="align-middle border-secondary border-opacity-25 bg-transparent">
                        <span className={`badge ${
                          tool.status === 'available' ? 'bg-success' :
                          tool.status === 'in_use' ? 'bg-warning text-dark' :
                          tool.status === 'maintenance' ? 'bg-info text-dark' :
                          'bg-danger'
                        }`}>
                          {tool.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="align-middle border-secondary border-opacity-25 bg-transparent text-white-50">
                        {new Date(tool.createdAt).toLocaleDateString()}
                      </td>
                      <td className="align-middle border-secondary border-opacity-25 bg-transparent text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <Link href={`/dashboard/tools/${tool.id}`} className="btn btn-sm btn-outline-light">
                            View
                          </Link>
                          {canManage && (
                            <>
                              <Link href={`/dashboard/tools/${tool.id}/edit`} className="btn btn-sm btn-outline-warning">
                                Edit
                              </Link>
                              <form action={deleteToolAction.bind(null, tool.id)}>
                                <DeleteButton className="btn btn-sm btn-outline-danger" />
                              </form>
                            </>
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
      </div>
    </div>
  );
}
