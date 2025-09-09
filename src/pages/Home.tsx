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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Wishlist Link Collector
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Ajoutez facilement des produits à votre wishlist
        </p>
      </div>

      {/* URL Form */}
      <UrlForm onSubmit={handleFormSubmit} loading={loading} />

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          <p className="font-medium">Erreur</p>
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
          <p className="font-medium">Succès</p>
          <p>{success}</p>
        </div>
      )}

      {/* Instructions */}
      {!loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-3">
            Comment ça marche ?
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Saisissez le nom du produit que vous souhaitez ajouter</li>
            <li>Indiquez le prix (optionnel) et l'URL du produit</li>
            <li>Cliquez sur "Ajouter à ma wishlist"</li>
            <li>L'image sera automatiquement recherchée sur Google Images</li>
            <li>Retrouvez tous vos articles dans la section "Ma Wishlist"</li>
          </ol>
          
          <div className="mt-4 p-3 bg-white border border-blue-300 rounded">
            <p className="text-sm text-blue-700">
              <strong>Avantage :</strong> Plus besoin de dépendre du scraping de sites web ! 
              Vous saisissez les informations et nous trouvons automatiquement 
              une belle image pour illustrer votre produit.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
