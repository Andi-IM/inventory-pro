import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { getUserRole } from "@/lib/auth/authorization";

export const dynamic = 'force-dynamic';

async function signOut() {
  'use server';
  await auth.signOut();
  redirect('/');
}

export default async function Home() {
  const { data: session } = await auth.getSession();
  const user = session?.user;
  const role = user ? await getUserRole(user.id) : null;

  return (
    <main className="min-vh-100 bg-dark text-white d-flex flex-column justify-content-between">
      {/* Navigation */}
      <header className="border-bottom border-secondary border-opacity-25">
        <div className="container py-3 d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <span 
              className="fs-4 fw-bold" 
              style={{
                background: "linear-gradient(45deg, #0d6efd, #0dcaf0)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}
            >
              InventoryPro
            </span>
            <span className="badge bg-secondary-subtle text-secondary border border-secondary border-opacity-25 rounded-pill px-2 py-1 fs-7">
              v1.0.0
            </span>
          </div>
          <div className="d-flex align-items-center gap-4">
            <nav className="d-flex gap-4">
              <a href="https://nextjs.org/docs" className="text-white-50 text-decoration-none hover-white transition-all">Docs</a>
              <a href="https://getbootstrap.com" className="text-white-50 text-decoration-none hover-white transition-all">Bootstrap</a>
            </nav>
            <div className="vr text-secondary border-opacity-25 d-none d-sm-block"></div>
            
            {user ? (
              <div className="d-flex align-items-center gap-3">
                <span className="small text-white-50 d-none d-sm-inline">
                  Hi, <strong className="text-white">{user.name}</strong>
                </span>
                {role === 'superuser' && (
                  <Link href="/admin" className="btn btn-outline-warning btn-sm px-3 rounded-2 fw-semibold">
                    Admin Console
                  </Link>
                )}
                <form action={signOut}>
                  <button type="submit" className="btn btn-outline-danger btn-sm px-3 rounded-2 fw-semibold">
                    Sign Out
                  </button>
                </form>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Link href="/auth/sign-in" className="btn btn-outline-light btn-sm px-3 rounded-2 fw-semibold">
                  Sign In
                </Link>
                <Link href="/auth/sign-up" className="btn btn-primary btn-sm px-3 rounded-2 fw-semibold">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container my-auto py-5">
        <div className="row align-items-center g-5">
          <div className="col-lg-6">
            <h1 className="display-4 fw-bold lh-sm mb-4">
              Next.js Boilerplate with{" "}
              <span 
                style={{
                  background: "linear-gradient(45deg, #0d6efd, #0dcaf0)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}
              >
                Neon Auth
              </span>
            </h1>
            <p className="lead text-white-50 mb-5">
              Experience the power of Next.js App Router, TypeScript, and ESLint combined with the responsive components of Bootstrap CSS. Complete with native Neon Auth (Better Auth) session management.
            </p>
            <div className="d-flex gap-3 flex-wrap">
              {user ? (
                <div className="alert alert-success border-success border-opacity-25 bg-success bg-opacity-10 text-white rounded-3 p-3 w-100">
                  <h5 className="alert-heading fw-bold mb-2">🎉 Welcome Back, {user.name}!</h5>
                  <p className="small text-white-50 mb-0">You are securely signed in using Neon Auth. Your email is <code>{user.email}</code>.</p>
                </div>
              ) : (
                <>
                  <Link href="/auth/sign-up" className="btn btn-primary btn-lg px-4 py-3 fw-semibold rounded-3 shadow-sm hover-translate-y">
                    Create Free Account
                  </Link>
                  <button 
                    type="button"
                    className="btn btn-outline-light btn-lg px-4 py-3 fw-semibold rounded-3"
                    data-bs-toggle="collapse"
                    data-bs-target="#demoCollapse"
                    aria-expanded="false"
                    aria-controls="demoCollapse"
                  >
                    Toggle Interactive Demo
                  </button>
                </>
              )}
            </div>

            {/* Interactive Collapse Demo (to verify Bootstrap JS works!) */}
            {!user && (
              <div className="collapse mt-4" id="demoCollapse">
                <div className="card card-body bg-secondary bg-opacity-10 border border-secondary border-opacity-25 rounded-3 text-white">
                  <h5 className="card-title text-info">🎉 Bootstrap JavaScript is Working!</h5>
                  <p className="card-text text-white-50">
                    This collapse panel was triggered using Bootstrap&apos;s native client-side collapse component. This verifies the dynamic loader is rendering correctly.
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="col-lg-6 d-flex justify-content-center">
            <div 
              className="position-relative p-5 bg-gradient rounded-5 border border-secondary border-opacity-25 shadow-lg w-100" 
              style={{
                background: "radial-gradient(circle at top left, rgba(13, 110, 253, 0.1), transparent 70%)",
                maxWidth: '450px'
              }}
            >
              <div className="text-center">
                <Image
                  src="/next.svg"
                  alt="Next.js Logo"
                  width={180}
                  height={37}
                  className="img-fluid mb-4"
                  style={{ filter: "invert(1)" }}
                  priority
                />
                <div className="fs-1 fw-bold text-secondary-emphasis">+</div>
                <div 
                  className="display-5 fw-bold" 
                  style={{
                    background: "linear-gradient(45deg, #0d6efd, #0dcaf0)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent"
                  }}
                >
                  Neon Auth
                </div>
                <p className="mt-4 text-muted small">TypeScript &bull; ESLint &bull; Bootstrap CSS</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mb-5 py-4 border-top border-secondary border-opacity-25">
        <div className="row g-4">
          <div className="col-md-4">
            <div className="p-4 rounded-3 h-100 bg-secondary bg-opacity-10 border border-secondary border-opacity-10">
              <h3 className="h5 text-info mb-3">Neon Auth</h3>
              <p className="text-white-50 small mb-0">
                Managed authentication built on Better Auth that branches with your database environment.
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="p-4 rounded-3 h-100 bg-secondary bg-opacity-10 border border-secondary border-opacity-10">
              <h3 className="h5 mb-3" style={{ color: "#a07cf8" }}>Bootstrap Layout</h3>
              <p className="text-white-50 small mb-0">
                Familiar CSS grid system, layouts, utilities, and components loaded instantly with clean imports.
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="p-4 rounded-3 h-100 bg-secondary bg-opacity-10 border border-secondary border-opacity-10">
              <h3 className="h5 text-success mb-3">TypeScript Enabled</h3>
              <p className="text-white-50 small mb-0">
                Full static typing with custom definitions for a safer and more predictable codebase.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-4 border-top border-secondary border-opacity-25 bg-black bg-opacity-50">
        <div className="container d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3">
          <p className="text-muted small mb-0">&copy; {new Date().getFullYear()} InventoryPro. All rights reserved.</p>
          <div className="d-flex gap-3">
            <a href="#" className="text-muted text-decoration-none hover-white small">Privacy</a>
            <a href="#" className="text-muted text-decoration-none hover-white small">Terms</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
