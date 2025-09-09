import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface AuthGateProps {
  children: ReactNode;
}

export default function AuthGate({ children }: AuthGateProps) {
  const { user, signInWithGoogle } = useAuth();

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-8 text-center">
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Connexion requise
          </h2>
          <p className="text-gray-600 mb-6">
            Vous devez être connecté pour accéder à votre wishlist.
          </p>
          <button
            onClick={() => signInWithGoogle()}
            className="btn btn-primary w-full py-3"
          >
            Se connecter avec Google
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
