import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { useState } from 'react';

export default function Header() {
  const { user, signOut, signInWithGoogle } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="header-glass sticky top-0 z-[100]">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <Link 
            to="/" 
            className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300 glow-text"
          >
            ✨ Wishlist Collector
          </Link>
          
          <nav className="flex items-center space-x-6">
            <Link 
              to="/" 
              className="text-primary-700 dark:text-white hover:text-secondary-500 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 hover:backdrop-blur-lg hover:bg-white/30 dark:hover:bg-primary-600/30"
            >
              🏠 Accueil
            </Link>
            
            {user && (
              <Link 
                to="/me" 
                className="text-primary-700 dark:text-white hover:text-secondary-500 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 hover:backdrop-blur-lg hover:bg-white/30 dark:hover:bg-primary-600/30"
              >
                💝 Ma Wishlist
              </Link>
            )}
            
            <div className="border-l border-white/30 dark:border-primary-600/40 pl-6">
              <div className="flex items-center space-x-4">
                {/* Bouton de changement de thème */}
                <button
                  onClick={toggleTheme}
                  className="btn btn-ghost p-2 rounded-full hover:bg-white/20 hover:backdrop-blur-lg transition-all duration-300"
                  title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
                >
                  {theme === 'dark' ? (
                    <svg className="w-5 h-5 text-accent-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                  )}
                </button>

                {user ? (
                  <div className="flex items-center space-x-4">
                    <div className="glass px-3 py-2 rounded-lg">
                      <span className="text-sm text-primary-700 dark:text-white font-medium">
                        👋 {user.email}
                      </span>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="btn btn-secondary px-4 py-2 text-sm"
                    >
                      🚪 Déconnexion
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
                      <div className="absolute top-full right-0 mt-2 glass rounded-xl w-64 overflow-hidden animate-in z-[60] shadow-2xl">
                        <div className="py-2">
                          {/* Option Google */}
                          <button
                            onClick={() => {
                              setIsDropdownOpen(false);
                              signInWithGoogle();
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-white/20 dark:hover:bg-primary-600/20 hover:backdrop-blur-lg flex items-center gap-3 transition-all duration-300"
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
                              <div className="font-medium text-primary-700 dark:text-white text-sm">Google</div>
                              <div className="text-xs text-primary-500 dark:text-gray-300">Connexion rapide</div>
                            </div>
                          </button>

                          {/* Séparateur */}
                          <div className="border-t border-white/20 dark:border-primary-600/40 my-1 mx-2"></div>

                          {/* Option Apple */}
                          <button
                            disabled
                            className="w-full px-4 py-3 text-left opacity-50 cursor-not-allowed flex items-center gap-3"
                          >
                            <div className="w-6 h-6 flex items-center justify-center">
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#000000">
                                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                              </svg>
                            </div>
                            <div>
                              <div className="font-medium text-primary-700 dark:text-white text-sm">Apple</div>
                              <div className="text-xs text-primary-500 dark:text-gray-300">En attente de validation</div>
                            </div>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Fermer le dropdown si on clique à l'extérieur */}
                    {isDropdownOpen && (
                      <div 
                        className="fixed inset-0 z-[55]" 
                        onClick={() => setIsDropdownOpen(false)}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
