import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import UrlForm from '@/components/UrlForm';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFormSubmit = async (data: { name: string; price: string; url: string }) => {
    if (!user) {
      setError('Vous devez être connecté pour ajouter des articles à votre wishlist');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log(`🔄 Ajout de l'article: ${data.name}`);

      // Rechercher une image (local vs production)
      let imageUrl = null;
      try {
        console.log('📸 Recherche d\'image...');
        
        // Choisir l'endpoint selon l'environnement
        const isDev = import.meta.env.DEV;
        const imageApiUrl = isDev 
          ? 'http://localhost:3001/api/search-image'  // Serveur local en dev
          : '/.netlify/functions/search-image';       // Fonction Netlify en prod
        
        const imageResponse = await fetch(imageApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: data.name }),
        });

        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          if (imageData.success && imageData.imageUrl) {
            imageUrl = imageData.imageUrl;
            console.log('✅ Image trouvée:', imageUrl, `(source: ${imageData.source || 'unknown'})`);
          } else {
            console.log('⚠️ Aucune image trouvée');
          }
        } else {
          console.log('⚠️ Erreur lors de la recherche d\'image:', imageResponse.status);
        }
      } catch (imageError) {
        console.log('⚠️ Erreur image:', imageError);
        // On continue sans image si la recherche échoue
      }

      // Extraire le domaine de l'URL
      let domain = null;
      try {
        const urlObj = new URL(data.url);
        domain = urlObj.hostname;
      } catch {
        // URL invalide, on continue quand même
      }

      // Ajouter l'élément à la base de données
      console.log('💾 Sauvegarde en base de données...');
      const { error: insertError } = await supabase
        .from('items')
        .insert({
          user_id: user.id,
          url: data.url,
          title: data.name,
          price: data.price || null,
          image_url: imageUrl,
          domain: domain,
        });

      if (insertError) {
        console.error('❌ Erreur insertion:', insertError);
        throw insertError;
      }

      console.log('✅ Article ajouté avec succès !');
      setSuccess('Article ajouté avec succès à votre wishlist !');
      
    } catch (err) {
      console.error('❌ Erreur lors de l\'ajout:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Éléments flottants décoratifs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="floating-element absolute top-20 left-10 w-20 h-20 rounded-full bg-gradient-to-r from-secondary-400/20 to-tertiary-400/20 backdrop-blur-sm"></div>
        <div className="floating-element absolute top-40 right-20 w-16 h-16 rounded-full bg-gradient-to-r from-primary-400/20 to-secondary-400/20 backdrop-blur-sm"></div>
        <div className="floating-element absolute bottom-40 left-20 w-24 h-24 rounded-full bg-gradient-to-r from-tertiary-400/20 to-primary-400/20 backdrop-blur-sm"></div>
        <div className="floating-element absolute bottom-20 right-10 w-12 h-12 rounded-full bg-gradient-to-r from-secondary-400/20 to-primary-400/20 backdrop-blur-sm"></div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-block mb-6">
            <div className="text-8xl mb-4 floating-element">✨</div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary-600 via-secondary-500 to-tertiary-500 bg-clip-text text-transparent leading-tight">
              Wishlist Collector
            </h1>
            <p className="text-xl md:text-2xl text-primary-700/80 max-w-3xl mx-auto leading-relaxed">
              Créez votre wishlist parfaite avec des visuels magnifiques
              <span className="block text-lg mt-2 text-primary-600/60">
                🎯 Organisez vos envies • 🖼️ Images automatiques • 💝 Partagez vos coups de cœur
              </span>
            </p>
          </div>
        </div>

        {/* Formulaire principal */}
        <div className="max-w-2xl mx-auto mb-16">
          <div className="glass-card p-8 md:p-10">
            <UrlForm 
              onSubmit={handleFormSubmit} 
              loading={loading}
            />
          </div>
        </div>

        {/* Messages d'état */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="glass border-red-200/50 bg-red-50/80 text-red-700 px-6 py-4 rounded-2xl shadow-lg">
              <div className="flex items-center gap-3">
                <div className="text-2xl">❌</div>
                <div>
                  <p className="font-semibold">Erreur</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="glass border-green-200/50 bg-green-50/80 text-green-700 px-6 py-4 rounded-2xl shadow-lg">
              <div className="flex items-center gap-3">
                <div className="text-2xl">✅</div>
                <div>
                  <p className="font-semibold">Succès</p>
                  <p className="text-sm">{success}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Guide d'utilisation */}
        {!loading && (
          <div className="max-w-4xl mx-auto">
            <div className="glass-card p-8 md:p-10">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent mb-4">
                  Comment ça marche ?
                </h3>
                <p className="text-primary-700/70 text-lg">Suivez ces étapes simples pour créer votre wishlist de rêve</p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="glass-card p-6 hover:scale-105 transition-transform duration-300">
                  <div className="text-4xl mb-4 text-center">🎯</div>
                  <h4 className="font-bold text-primary-700 mb-2 text-center">1. Saisissez</h4>
                  <p className="text-primary-600/80 text-sm text-center">
                    Entrez le nom du produit, son prix et l'URL de la page
                  </p>
                </div>
                
                <div className="glass-card p-6 hover:scale-105 transition-transform duration-300">
                  <div className="text-4xl mb-4 text-center">🖼️</div>
                  <h4 className="font-bold text-primary-700 mb-2 text-center">2. Image auto</h4>
                  <p className="text-primary-600/80 text-sm text-center">
                    Une belle image est automatiquement trouvée sur Google Images
                  </p>
                </div>
                
                <div className="glass-card p-6 hover:scale-105 transition-transform duration-300 md:col-span-2 lg:col-span-1">
                  <div className="text-4xl mb-4 text-center">💝</div>
                  <h4 className="font-bold text-primary-700 mb-2 text-center">3. Profitez</h4>
                  <p className="text-primary-600/80 text-sm text-center">
                    Retrouvez tous vos articles dans votre wishlist personnelle
                  </p>
                </div>
              </div>
              
              <div className="mt-8 glass bg-gradient-to-r from-primary-50/50 to-secondary-50/50 p-6 rounded-2xl">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">🚀</div>
                  <div>
                    <h5 className="font-bold text-primary-700 mb-2">Nouvelle approche révolutionnaire</h5>
                    <p className="text-primary-600/80 text-sm">
                      Fini les problèmes de scraping ! Vous renseignez les informations manuellement 
                      et nous nous occupons de trouver les plus belles images pour illustrer vos envies. 
                      Simple, rapide, et toujours fonctionnel !
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
