import { ReactNode, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface AuthGateProps {
  children: ReactNode;
}

export default function AuthGate({ children }: AuthGateProps) {
  const { user, signInWithGoogle } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
          
          {/* Bouton de connexion principal avec dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="btn btn-primary w-full py-4 px-6 text-lg font-semibold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Se connecter
              <svg 
                className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Menu dropdown */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                <div className="py-2">
                  {/* Option Google */}
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      signInWithGoogle();
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                  >
                    <div className="w-8 h-8 flex items-center justify-center">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Google</div>
                      <div className="text-sm text-gray-500">Se connecter avec Google</div>
                    </div>
                  </button>

                  {/* Séparateur */}
                  <div className="border-t border-gray-100 my-1"></div>

                  {/* Option Apple */}
                  <button
                    disabled
                    className="w-full px-4 py-3 text-left opacity-50 cursor-not-allowed flex items-center gap-3"
                  >
                    <div className="w-8 h-8 flex items-center justify-center">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#000000">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Apple</div>
                      <div className="text-sm text-gray-500">En attente de validation</div>
                    </div>
                  </button>

                  {/* Séparateur */}
                  <div className="border-t border-gray-100 my-1"></div>

                  {/* Option Email (future) */}
                  <button
                    disabled
                    className="w-full px-4 py-3 text-left opacity-50 cursor-not-allowed flex items-center gap-3"
                  >
                    <div className="w-8 h-8 flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Email</div>
                      <div className="text-sm text-gray-500">Bientôt disponible</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Fermer le dropdown si on clique à l'extérieur */}
          {isDropdownOpen && (
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsDropdownOpen(false)}
            />
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
