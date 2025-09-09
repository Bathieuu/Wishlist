import { formatPrice } from '@/lib/price';
import { getFaviconUrl, getDomainDisplayName } from '@/lib/domain';

interface PreviewCardProps {
  url: string;
  domain: string;
  title: string;
  imageUrl: string | null;
  priceCents: number | null;
  currency: string | null;
  onAddToWishlist: () => void;
  loading?: boolean;
}

export default function PreviewCard({
  url,
  domain,
  title,
  imageUrl,
  priceCents,
  currency,
  onAddToWishlist,
  loading = false,
}: PreviewCardProps) {
  return (
    <div className="card p-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Image */}
        <div className="flex-shrink-0 w-full md:w-48 h-48">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.src = getFaviconUrl(domain);
                img.className = "w-16 h-16 mx-auto mt-16 object-contain";
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
              <img
                src={getFaviconUrl(domain)}
                alt={`${domain} favicon`}
                className="w-16 h-16 object-contain opacity-50"
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
              {title}
            </h3>
            {priceCents !== null && (
              <div className="text-2xl font-bold text-primary-600 ml-4">
                {formatPrice(priceCents, currency)}
              </div>
            )}
          </div>

          {/* Domain info */}
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <img
              src={getFaviconUrl(domain)}
              alt=""
              className="w-4 h-4 mr-2"
            />
            <span>{getDomainDisplayName(domain)}</span>
          </div>

          {/* URL */}
          <div className="mb-4">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 underline break-all focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            >
              {url}
            </a>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onAddToWishlist}
              disabled={loading}
              className="btn btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Ajout...
                </div>
              ) : (
                'Ajouter à ma wishlist'
              )}
            </button>
            
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Voir sur le site
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
