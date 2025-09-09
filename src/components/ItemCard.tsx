import { formatPrice } from '@/lib/price';
import { getFaviconUrl, getDomainDisplayName } from '@/lib/domain';
import type { WishlistItem } from '@/lib/supabase';

interface ItemCardProps {
  item: WishlistItem;
  onRefresh: (id: string) => void;
  onDelete: (id: string) => void;
  refreshing?: boolean;
}

export default function ItemCard({ 
  item, 
  onRefresh, 
  onDelete, 
  refreshing = false 
}: ItemCardProps) {
  const formattedDate = new Date(item.created_at).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const lastChecked = item.last_checked_at 
    ? new Date(item.last_checked_at).toLocaleDateString('fr-FR')
    : null;

  return (
    <div className="card p-4 hover:shadow-lg transition-all duration-200">
      {/* Image */}
      <div className="aspect-square mb-3 relative overflow-hidden rounded-lg bg-gray-100">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.src = getFaviconUrl(item.domain);
              img.className = "w-12 h-12 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 object-contain opacity-50";
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <img
              src={getFaviconUrl(item.domain)}
              alt={`${item.domain} favicon`}
              className="w-12 h-12 object-contain opacity-50"
            />
          </div>
        )}
        
        {/* Price overlay */}
        {item.price_cents !== null && (
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded px-2 py-1 text-sm font-semibold text-primary-600">
            {formatPrice(item.price_cents, item.currency)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-3">
        {/* Title */}
        <h3 className="font-medium text-gray-900 line-clamp-2 text-sm leading-tight">
          {item.title}
        </h3>

        {/* Domain */}
        <div className="flex items-center text-xs text-gray-500">
          <img
            src={getFaviconUrl(item.domain)}
            alt=""
            className="w-3 h-3 mr-1"
          />
          <span className="truncate">{getDomainDisplayName(item.domain)}</span>
        </div>

        {/* Metadata */}
        <div className="text-xs text-gray-400 space-y-1">
          <div>Ajouté le {formattedDate}</div>
          {lastChecked && (
            <div>Prix vérifié le {lastChecked}</div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => onRefresh(item.id)}
            disabled={refreshing}
            className="flex-1 btn btn-secondary px-3 py-2 text-xs disabled:opacity-50"
            title="Actualiser le prix et les informations"
          >
            {refreshing ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-600 mr-1"></div>
                <span className="sr-only">Actualisation...</span>
              </div>
            ) : (
              '🔄'
            )}
          </button>
          
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 btn btn-primary px-3 py-2 text-xs text-center no-underline focus:outline-none focus:ring-2 focus:ring-primary-500"
            title="Voir sur le site"
          >
            👁️
          </a>
          
          <button
            onClick={() => onDelete(item.id)}
            className="btn btn-danger px-3 py-2 text-xs"
            title="Supprimer de la wishlist"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
