import Link from 'next/link';
import { createToolAction } from '../actions';
import { auth } from '@/lib/auth/server';
import { getUserRole } from '@/lib/auth/authorization';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function NewToolPage() {
  const { data: session } = await auth.getSession();
  const role = session?.user ? await getUserRole(session.user.id) : null;
  
  if (role !== 'superuser' && role !== 'operator') {
    redirect('/tools');
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Add New Tool</h1>
        <Link href="/tools" className="btn btn-outline-light">
          Back to List
        </Link>
      </div>

      <div className="card bg-secondary bg-opacity-10 border-secondary border-opacity-25 text-white">
        <div className="card-body">
          <form action={createToolAction}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label text-info">Name *</label>
              <input 
                type="text" 
                className="form-control bg-dark text-white border-secondary" 
                id="name" 
                name="name" 
                required 
                placeholder="e.g. Bor Listrik Bosch" 
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="description" className="form-label text-info">Description</label>
              <textarea 
                className="form-control bg-dark text-white border-secondary" 
                id="description" 
                name="description" 
                rows={3} 
                placeholder="Optional details about the tool..."
              ></textarea>
            </div>
            
            <div className="mb-4">
              <label htmlFor="status" className="form-label text-info">Status</label>
              <select className="form-select bg-dark text-white border-secondary" id="status" name="status">
                <option value="available">Available</option>
                <option value="in_use">In Use</option>
                <option value="maintenance">Maintenance</option>
                <option value="broken">Broken</option>
              </select>
            </div>
            
            <div className="d-flex justify-content-end gap-2">
              <Link href="/tools" className="btn btn-secondary">
                Cancel
              </Link>
              <button type="submit" className="btn btn-primary">
                Save Tool
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
