'use client';

import { useActionState } from 'react';
import { signUpWithEmail } from './actions';
import Link from 'next/link';

export default function SignUpForm() {
  const [state, formAction, isPending] = useActionState(signUpWithEmail, null);
  const allowSignUp = process.env.NEXT_PUBLIC_ALLOW_SIGN_UP !== 'false';

  return (
    <main className="min-vh-100 bg-dark text-white d-flex align-items-center justify-content-center p-3">
      <div 
        className="card bg-secondary bg-opacity-10 border border-secondary border-opacity-25 rounded-4 shadow-lg p-4 w-100" 
        style={{ maxWidth: '420px' }}
      >
        <div className="text-center mb-4">
          <h1 
            className="h3 fw-bold" 
            style={{
              background: "linear-gradient(45deg, #0d6efd, #0dcaf0)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}
          >
            InventoryPro Auth
          </h1>
          <p className="text-white-50 small">Create a new account to get started</p>
        </div>

        {!allowSignUp && (
          <div className="alert alert-warning border-warning border-opacity-25 bg-warning bg-opacity-10 text-warning rounded-3 py-2 text-center small mb-4">
            Registration is currently disabled by the administrator.
          </div>
        )}

        <form action={formAction}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label text-white-50 small fw-semibold">Name</label>
            <input 
              id="name" 
              name="name" 
              type="text" 
              required 
              disabled={!allowSignUp}
              placeholder="John Doe"
              className="form-control bg-dark text-white border-secondary border-opacity-50"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="email" className="form-label text-white-50 small fw-semibold">Email address</label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              required 
              disabled={!allowSignUp}
              placeholder="john@my-company.com"
              className="form-control bg-dark text-white border-secondary border-opacity-50"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="form-label text-white-50 small fw-semibold">Password</label>
            <input 
              id="password" 
              name="password" 
              type="password" 
              required 
              disabled={!allowSignUp}
              placeholder="••••••••"
              className="form-control bg-dark text-white border-secondary border-opacity-50"
            />
          </div>

          {state?.error && (
            <div className="alert alert-danger border-danger border-opacity-25 bg-danger bg-opacity-10 text-danger rounded-3 py-2 text-center small mb-3">
              {state.error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isPending || !allowSignUp}
            className="btn btn-primary w-100 py-2 fw-semibold rounded-3 mb-3"
          >
            {isPending ? (
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            ) : null}
            {isPending ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="text-center mt-2">
          <p className="text-white-50 small mb-0">
            Already have an account?{' '}
            <Link href="/auth/sign-in" className="text-info text-decoration-none fw-semibold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
