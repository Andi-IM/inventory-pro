export interface AuthSession {
  user: {
    id: string;
    email: string;
    name: string | null;
    role?: string;
  };
}

export interface AuthResponse<T> {
  data: T | null;
  error: { message: string } | null;
}

export interface AuthAdapter {
  getSession(): Promise<AuthResponse<AuthSession>>;
  signOut(): Promise<void>;
  signUp: {
    email(credentials: { email: string; password: string; name: string }): Promise<AuthResponse<{ user: { id: string } }>>;
  };
  signIn: {
    email(credentials: { email: string; password: string }): Promise<AuthResponse<{ session: { user: { id: string } } }>>;
  };
  handler(): { 
    GET: (req: Request) => Promise<Response>; 
    POST: (req: Request) => Promise<Response>; 
  };
}
