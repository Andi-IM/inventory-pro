import { auth } from '@/lib/auth/server';
import { getUserRole } from '@/lib/auth/authorization';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = await auth.getSession();
  const user = session?.user;

  if (!user) {
    redirect('/auth/sign-in');
  }

  const role = await getUserRole(user.id);
  if (role !== 'superuser') {
    redirect('/?error=Access+Denied');
  }

  return (
    <div className="min-vh-100 bg-dark text-white d-flex flex-column">
      {/* Admin Navbar */}
      <header className="border-bottom border-secondary border-opacity-25 bg-black bg-opacity-30">
        <div className="container py-3 d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <Link href="/admin" className="fs-4 fw-bold text-decoration-none" style={{
              background: "linear-gradient(45deg, #0d6efd, #0dcaf0)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              NextHerts Admin
            </Link>
            <span className="badge bg-danger rounded-pill px-2 py-1 fs-7 fw-semibold">
              Superuser Mode
            </span>
          </div>
          <div className="d-flex gap-2">
            <Link href="/" className="btn btn-outline-light btn-sm px-3 rounded-2">
              Back to App
            </Link>
          </div>
        </div>
      </header>

      {/* Admin Panel Body */}
      <div className="container my-5 flex-grow-1">
        <div className="row g-4">
          {/* Navigation Sidebar */}
          <aside className="col-lg-3">
            <div className="card bg-secondary bg-opacity-10 border border-secondary border-opacity-25 rounded-3 p-3">
              <nav className="nav flex-column nav-pills gap-2">
                <Link href="/admin" className="nav-link text-white hover-bg-secondary rounded-2 px-3 py-2 fw-semibold">
                  Dashboard Overview
                </Link>
                <Link href="/admin/users" className="nav-link text-white hover-bg-secondary rounded-2 px-3 py-2 fw-semibold">
                  User Management
                </Link>
                <Link href="/admin/roles" className="nav-link text-white hover-bg-secondary rounded-2 px-3 py-2 fw-semibold">
                  Role Permissions
                </Link>
                <Link href="/admin/flags" className="nav-link text-white hover-bg-secondary rounded-2 px-3 py-2 fw-semibold">
                  Feature Flags
                </Link>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="col-lg-9">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
