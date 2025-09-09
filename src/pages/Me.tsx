import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { WishlistItem, Item } from '@/lib/supabase';
import ItemCard from '@/components/ItemCard';
import { getDomainDisplayName } from '@/lib/domain';

interface Filters {
  domain: string;
  sortBy: 'created_at' | 'updated_at' | 'price_cents' | 'title';
  sortOrder: 'asc' | 'desc';
}

export default function Me() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshingItems, setRefreshingItems] = useState<Set<string>>(new Set());
  const [domains, setDomains] = useState<string[]>([]);
  const [filters, setFilters] = useState<Filters>({
    domain: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  const loadItems = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('You must be logged in');
      }

      // Utiliser Supabase directement (plus simple et fiable)
      console.log('📊 Chargement des articles depuis Supabase...');
      
      let query = supabase
        .from('items')
        .select('*');

      // Appliquer les filtres
      if (filters.domain) {
        query = query.eq('domain', filters.domain);
      }

      // Appliquer le tri
      query = query.order(filters.sortBy, { ascending: filters.sortOrder === 'asc' });

      const { data, error: supabaseError } = await query;

      if (supabaseError) {
        console.error('❌ Erreur Supabase:', supabaseError);
        throw new Error(supabaseError.message);
      }

      console.log('✅ Articles chargés:', data?.length || 0, 'articles');

      // Convertir le format Supabase vers le format WishlistItem attendu
      const formattedItems: WishlistItem[] = (data || []).map(item => ({
        id: item.id,
        user_id: item.user_id,
        url: item.url,
        domain: item.domain || '',
        title: item.title,
        image_url: item.image_url,
        price_cents: null, // On n'a pas de priceCents dans notre schema actuel
        currency: null,
        created_at: item.created_at,
        updated_at: item.updated_at,
        last_checked_at: null,
        status: 'active' as const
      }));

      setItems(formattedItems);

      // Extraire les domaines uniques pour le filtre
      const uniqueDomains = Array.from(
        new Set(formattedItems.map(item => item.domain).filter(Boolean))
      ).sort();
      setDomains(uniqueDomains);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [filters]);

  const handleRefresh = async (itemId: string) => {
    setRefreshingItems(prev => new Set([...prev, itemId]));
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('You must be logged in');
      }

      const response = await fetch(`/.netlify/functions/items/${itemId}/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.errors?.join(', ') || 'Failed to refresh item');
      }

      // Update the item in the list
      setItems(prev => 
        prev.map(item => 
          item.id === itemId ? { ...item, ...data.data } : item
        )
      );

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh item');
    } finally {
      setRefreshingItems(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('You must be logged in');
      }

      console.log('🗑️ Suppression de l\'article:', itemId);

      // Utiliser Supabase directement pour la suppression
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', itemId)
        .eq('user_id', session.user.id);

      if (error) {
        console.error('❌ Erreur suppression:', error);
        throw new Error(error.message);
      }

      console.log('✅ Article supprimé avec succès');

      // Remove the item from the list
      setItems(prev => prev.filter(item => item.id !== itemId));

    } catch (err) {
      console.error('❌ Erreur lors de la suppression:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete item');
    }
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">
          Ma Wishlist ({items.length})
        </h1>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-48">
            <label htmlFor="domain-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Filtrer par domaine
            </label>
            <select
              id="domain-filter"
              value={filters.domain}
              onChange={(e) => handleFilterChange('domain', e.target.value)}
              className="input w-full"
            >
              <option value="">Tous les domaines</option>
              {domains.map(domain => (
                <option key={domain} value={domain}>
                  {getDomainDisplayName(domain)} ({items.filter(item => item.domain === domain).length})
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-36">
            <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-1">
              Trier par
            </label>
            <select
              id="sort-by"
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value as Filters['sortBy'])}
              className="input w-full"
            >
              <option value="created_at">Date d'ajout</option>
              <option value="updated_at">Dernière modification</option>
              <option value="price_cents">Prix</option>
              <option value="title">Nom</option>
            </select>
          </div>

          <div className="flex-1 min-w-32">
            <label htmlFor="sort-order" className="block text-sm font-medium text-gray-700 mb-1">
              Ordre
            </label>
            <select
              id="sort-order"
              value={filters.sortOrder}
              onChange={(e) => handleFilterChange('sortOrder', e.target.value as Filters['sortOrder'])}
              className="input w-full"
            >
              <option value="desc">Décroissant</option>
              <option value="asc">Croissant</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          <p>{error}</p>
        </div>
      )}

      {/* Items grid */}
      {items.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Votre wishlist est vide
          </h2>
          <p className="text-gray-600 mb-6">
            Commencez par ajouter des produits depuis la page d'accueil
          </p>
          <a
            href="/"
            className="btn btn-primary px-6 py-3 inline-block no-underline"
          >
            Ajouter des produits
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {items.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              onRefresh={handleRefresh}
              onDelete={handleDelete}
              refreshing={refreshingItems.has(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
