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
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Éléments flottants décoratifs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="floating-element absolute top-20 left-10 w-16 h-16 rounded-full bg-gradient-to-r from-secondary-400/20 to-tertiary-400/20 backdrop-blur-sm"></div>
          <div className="floating-element absolute top-40 right-20 w-20 h-20 rounded-full bg-gradient-to-r from-primary-400/20 to-secondary-400/20 backdrop-blur-sm"></div>
          <div className="floating-element absolute bottom-40 left-20 w-12 h-12 rounded-full bg-gradient-to-r from-tertiary-400/20 to-primary-400/20 backdrop-blur-sm"></div>
        </div>

        <div className="max-w-md mx-auto px-6">
          <div className="glass-card p-10 text-center">
            <div className="mb-8">
              <div className="text-6xl mb-6 floating-element">🔐</div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent mb-4">
                Accès Sécurisé
              </h2>
              <p className="text-primary-700/80 text-lg leading-relaxed">
                Connectez-vous pour accéder à votre wishlist personnalisée
              </p>
            </div>
            
            {/* Bouton de connexion principal avec dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="btn btn-primary w-full py-4 px-6 text-lg font-semibold flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Se connecter
                <svg 
                  className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Menu dropdown */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-4 glass rounded-2xl overflow-hidden animate-in shadow-2xl">
                  <div className="py-3">
                    {/* Option Google */}
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        signInWithGoogle();
                      }}
                      className="w-full px-6 py-4 text-left hover:bg-white/20 hover:backdrop-blur-lg flex items-center gap-4 transition-all duration-300 group"
                    >
                      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      </div>
                      <div>
                        <div className="font-semibold text-primary-700">Google</div>
                        <div className="text-sm text-primary-600/80">Connexion rapide et sécurisée</div>
                      </div>
                    </button>

                    {/* Séparateur */}
                    <div className="border-t border-white/20 my-2 mx-4"></div>

                    {/* Option Apple */}
                    <button
                      disabled
                      className="w-full px-6 py-4 text-left opacity-50 cursor-not-allowed flex items-center gap-4"
                    >
                      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-black/80">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                        </svg>
                      </div>
                      <div>
                        <div className="font-semibold text-primary-700">Apple</div>
                        <div className="text-sm text-primary-600/80">En attente de validation</div>
                      </div>
                    </button>

                    {/* Séparateur */}
                    <div className="border-t border-white/20 my-2 mx-4"></div>

                    {/* Option Email (future) */}
                    <button
                      disabled
                      className="w-full px-6 py-4 text-left opacity-50 cursor-not-allowed flex items-center gap-4"
                    >
                      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-primary-400 to-secondary-400">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-semibold text-primary-700">Email</div>
                        <div className="text-sm text-primary-600/80">Bientôt disponible</div>
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
            
            <div className="mt-8 text-center">
              <p className="text-sm text-primary-600/60">
                🔒 Vos données sont sécurisées et privées
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
