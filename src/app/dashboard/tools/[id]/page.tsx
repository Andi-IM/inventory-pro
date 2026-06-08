import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getToolById } from '@/lib/tools';
import { auth } from '@/lib/auth/server';
import { getUserRole } from '@/lib/auth/authorization';
import { deleteToolAction } from '../actions';

export const dynamic = 'force-dynamic';

export default async function ToolDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Make sure we wait for params in nextjs 15+ 
  const { id } = await params;
  const tool = await getToolById(id);
  
  if (!tool) {
    notFound();
  }

  const { data: session } = await auth.getSession();
  const role = session?.user ? await getUserRole(session.user.id) : null;
  const canManage = role === 'superuser' || role === 'operator';

  return (
    <div className="max-w-3xl mx-auto">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Tool Details</h1>
        <div className="d-flex gap-2">
          <Link href="/dashboard/tools" className="btn btn-outline-light">
            Back to List
          </Link>
          {canManage && (
            <>
              <Link href={`/dashboard/tools/${tool.id}/edit`} className="btn btn-warning">
                Edit
              </Link>
              <form action={deleteToolAction.bind(null, tool.id)}>
                <button type="submit" className="btn btn-danger" onClick={(e) => {
                  if (!confirm('Are you sure you want to delete this tool?')) e.preventDefault();
                }}>
                  Delete
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      <div className="card bg-secondary bg-opacity-10 border-secondary border-opacity-25 text-white">
        <div className="card-body">
          <dl className="row mb-0">
            <dt className="col-sm-3 text-info">ID</dt>
            <dd className="col-sm-9 text-white-50 small font-monospace">{tool.id}</dd>

            <dt className="col-sm-3 text-info mt-3">Name</dt>
            <dd className="col-sm-9 mt-3 fs-5 fw-semibold">{tool.name}</dd>

            <dt className="col-sm-3 text-info mt-3">Description</dt>
            <dd className="col-sm-9 mt-3">{tool.description || <em className="text-muted">No description provided</em>}</dd>

            <dt className="col-sm-3 text-info mt-3">Status</dt>
            <dd className="col-sm-9 mt-3">
              <span className={`badge ${
                tool.status === 'available' ? 'bg-success' :
                tool.status === 'in_use' ? 'bg-warning text-dark' :
                tool.status === 'maintenance' ? 'bg-info text-dark' :
                'bg-danger'
              }`}>
                {tool.status.replace('_', ' ').toUpperCase()}
              </span>
            </dd>

            <dt className="col-sm-3 text-info mt-3">Created At</dt>
            <dd className="col-sm-9 mt-3 text-white-50">
              {new Date(tool.created_at).toLocaleString()}
            </dd>

            <dt className="col-sm-3 text-info mt-3">Updated At</dt>
            <dd className="col-sm-9 mt-3 text-white-50">
              {new Date(tool.updated_at).toLocaleString()}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  );
}
