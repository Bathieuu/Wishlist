import { useState } from 'react';

interface UrlFormProps {
  onSubmit: (data: { name: string; price: string; url: string }) => void;
  loading?: boolean;
}

export default function UrlForm({ onSubmit, loading = false }: UrlFormProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [url, setUrl] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Veuillez saisir le nom du produit';
    }

    if (!url.trim()) {
      newErrors.url = 'Veuillez saisir une URL';
    } else {
      try {
        new URL(url.trim());
      } catch {
        newErrors.url = 'URL invalide';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit({
      name: name.trim(),
      price: price.trim(),
      url: url.trim()
    });
  };

  return (
    <div className="card p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
            Nom du produit *
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="iPhone 15 Pro, MacBook Air, etc."
            className="input w-full"
            disabled={loading}
          />
          {errors.name && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
            Prix (optionnel)
          </label>
          <input
            type="text"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="999€, $1200, 50€, etc."
            className="input w-full"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
            URL du produit *
          </label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://exemple.com/produit"
            className="input w-full"
            disabled={loading}
          />
          {errors.url && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
              {errors.url}
            </p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Recherche d'image...
            </div>
          ) : (
            'Ajouter à ma wishlist'
          )}
        </button>
      </form>
    </div>
  );
}
