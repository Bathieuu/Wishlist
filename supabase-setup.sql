-- Script SQL pour créer les tables nécessaires dans Supabase
-- Exécutez ce script dans l'éditeur SQL de votre projet Supabase

-- Créer la table wishlist_items
CREATE TABLE IF NOT EXISTS wishlist_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  domain TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  price_cents INTEGER,
  currency TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer un index sur user_id pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_wishlist_items_user_id ON wishlist_items(user_id);

-- Créer un index sur domain pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_wishlist_items_domain ON wishlist_items(domain);

-- Activer la politique de sécurité RLS (Row Level Security)
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

-- Créer les politiques de sécurité
-- Les utilisateurs ne peuvent voir que leurs propres items
CREATE POLICY "Users can view own items" ON wishlist_items
    FOR SELECT USING (auth.uid() = user_id);

-- Les utilisateurs ne peuvent insérer que leurs propres items
CREATE POLICY "Users can insert own items" ON wishlist_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs ne peuvent mettre à jour que leurs propres items
CREATE POLICY "Users can update own items" ON wishlist_items
    FOR UPDATE USING (auth.uid() = user_id);

-- Les utilisateurs ne peuvent supprimer que leurs propres items
CREATE POLICY "Users can delete own items" ON wishlist_items
    FOR DELETE USING (auth.uid() = user_id);

-- Créer une fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Créer le trigger pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_wishlist_items_updated_at
    BEFORE UPDATE ON wishlist_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
