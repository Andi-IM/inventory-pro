import Image from "next/image";

export default function Home() {
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
              NextHerts
            </span>
            <span className="badge bg-secondary-subtle text-secondary border border-secondary border-opacity-25 rounded-pill px-2 py-1 fs-7">
              v1.0.0
            </span>
          </div>
          <nav className="d-flex gap-4">
            <a href="https://nextjs.org/docs" className="text-white-50 text-decoration-none hover-white transition-all">Docs</a>
            <a href="https://getbootstrap.com" className="text-white-50 text-decoration-none hover-white transition-all">Bootstrap</a>
            <a href="https://github.com" className="text-white-50 text-decoration-none hover-white transition-all">GitHub</a>
          </nav>
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
                  background: "linear-gradient(45deg, #6f42c1, #0d6efd)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}
              >
                Bootstrap CSS
              </span>
            </h1>
            <p className="lead text-white-50 mb-5">
              Experience the power of Next.js App Router, TypeScript, and ESLint combined with the responsive components of Bootstrap CSS. Complete with interactive client-side hydration.
            </p>
            <div className="d-flex gap-3 flex-wrap">
              <a href="https://nextjs.org" className="btn btn-primary btn-lg px-4 py-3 fw-semibold rounded-3 shadow-sm hover-translate-y">
                Get Started
              </a>
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
            </div>

            {/* Interactive Collapse Demo (to verify Bootstrap JS works!) */}
            <div className="collapse mt-4" id="demoCollapse">
              <div className="card card-body bg-secondary bg-opacity-10 border border-secondary border-opacity-25 rounded-3 text-white">
                <h5 className="card-title text-info">🎉 Bootstrap JavaScript is Working!</h5>
                <p className="card-text text-white-50">
                  This collapse panel was triggered using Bootstrap&apos;s native client-side collapse component. This verifies the dynamic loader is rendering correctly.
                </p>
              </div>
            </div>
          </div>
          <div className="col-lg-6 d-flex justify-content-center">
            <div 
              className="position-relative p-5 bg-gradient rounded-5 border border-secondary border-opacity-25 shadow-lg" 
              style={{
                background: "radial-gradient(circle at top left, rgba(13, 110, 253, 0.1), transparent 70%)"
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
                <div className="display-3 fw-bold" style={{ color: "#6f42c1" }}>B</div>
                <p className="mt-3 text-muted">TypeScript &bull; ESLint &bull; App Router</p>
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
              <h3 className="h5 text-info mb-3">App Router</h3>
              <p className="text-white-50 small mb-0">
                Leverages Next.js server components, nested layouts, and robust client/server routing conventions.
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
          <p className="text-muted small mb-0">&copy; {new Date().getFullYear()} NextHerts. All rights reserved.</p>
          <div className="d-flex gap-3">
            <a href="#" className="text-muted text-decoration-none hover-white small">Privacy</a>
            <a href="#" className="text-muted text-decoration-none hover-white small">Terms</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
