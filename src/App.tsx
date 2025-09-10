import { Routes, Route } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Home from '@/pages/Home';
import Me from '@/pages/Me';
import AuthGate from '@/components/AuthGate';
import Header from '@/components/Header';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-primary-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-primary-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route 
            path="/me" 
            element={
              <AuthGate>
                <Me />
              </AuthGate>
            } 
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
