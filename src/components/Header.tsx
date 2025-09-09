import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function Header() {
  const { user, signOut, signInWithGoogle } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSignIn = async () => {
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        console.error('Error signing in:', error);
        alert('Erreur de connexion. Assurez-vous que Google OAuth est configuré dans Supabase.');
      }
    } catch (error) {
      console.error('Error signing in:', error);
      alert('Erreur de connexion. Vérifiez la configuration Supabase.');
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
                <button
                  onClick={handleSignIn}
                  className="btn btn-primary px-4 py-2 text-sm"
                >
                  Se connecter avec Google
                </button>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
