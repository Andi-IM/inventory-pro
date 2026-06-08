'use client';

import { useActionState } from 'react';
import { signInWithEmail } from './actions';
import Link from 'next/link';

export default function SignInForm() {
  const [state, formAction, isPending] = useActionState(signInWithEmail, null);

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
          <p className="text-white-50 small">Sign in to your account to continue</p>
        </div>

        <form action={formAction}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label text-white-50 small fw-semibold">Email address</label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              required 
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
            disabled={isPending}
            className="btn btn-primary w-100 py-2 fw-semibold rounded-3 mb-3"
          >
            {isPending ? (
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            ) : null}
            {isPending ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-2">
          <p className="text-white-50 small mb-0">
            Don&apos;t have an account?{' '}
            <Link href="/auth/sign-up" className="text-info text-decoration-none fw-semibold">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
