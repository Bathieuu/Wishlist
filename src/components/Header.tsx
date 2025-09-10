import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

export default function Header() {
  const { user, signOut, signInWithGoogle, signInWithApple } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link 
            to="/" 
            className="text-xl font-bold text-gray-900 hover:text-primary-600 transition-colors"
          >
            🔗 Wishlist Collector
          </Link>
          
          <nav className="flex items-center space-x-4">
            <Link 
              to="/" 
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              Accueil
            </Link>
            
            {user && (
              <Link 
                to="/me" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                Ma Wishlist
              </Link>
            )}
            
            <div className="border-l border-gray-300 pl-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">
                    {user.email}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="btn btn-secondary px-3 py-1.5 text-sm"
                  >
                    Déconnexion
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="btn btn-primary px-4 py-2 text-sm flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Se connecter
                    <svg 
                      className={`w-3 h-3 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Menu dropdown */}
                  {isDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden animate-in">
                      <div className="py-2">
                        {/* Option Google */}
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            signInWithGoogle();
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                        >
                          <div className="w-6 h-6 flex items-center justify-center">
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 text-sm">Google</div>
                            <div className="text-xs text-gray-500">Connexion rapide</div>
                          </div>
                        </button>

                        {/* Séparateur */}
                        <div className="border-t border-gray-100 my-1"></div>

                        {/* Option Apple */}
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            signInWithApple();
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                        >
                          <div className="w-6 h-6 flex items-center justify-center">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#000000">
                              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                            </svg>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 text-sm">Apple</div>
                            <div className="text-xs text-gray-500">Sign In with Apple</div>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Fermer le dropdown si on clique à l'extérieur */}
                  {isDropdownOpen && (
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsDropdownOpen(false)}
                    />
                  )}
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
