-- =============================================
-- LIVERTRACK - Schéma base de données Supabase
-- Exécuter dans l'éditeur SQL de Supabase
-- =============================================

-- 1. LIVREURS
create table livreurs (
  id uuid default gen_random_uuid() primary key,
  nom text not null,
  telephone text,
  actif boolean default true,
  created_at timestamptz default now()
);

-- 2. PRODUITS
create table produits (
  id uuid default gen_random_uuid() primary key,
  nom text not null,
  prix_unitaire numeric(10,2) not null default 0,
  actif boolean default true,
  created_at timestamptz default now()
);

-- 3. BOUTIQUES (compagnies)
create table boutiques (
  id uuid default gen_random_uuid() primary key,
  nom text not null,
  couleur text default '#F59E0B',
  actif boolean default true,
  created_at timestamptz default now()
);

-- 4. STOCKS (stock actuel par livreur et produit)
create table stocks (
  id uuid default gen_random_uuid() primary key,
  livreur_id uuid references livreurs(id) on delete cascade,
  produit_id uuid references produits(id) on delete cascade,
  quantite_depart integer default 0,
  quantite_actuelle integer default 0,
  date_depart date default current_date,
  updated_at timestamptz default now(),
  unique(livreur_id, produit_id, date_depart)
);

-- 5. VENTES
create table ventes (
  id uuid default gen_random_uuid() primary key,
  livreur_id uuid references livreurs(id) on delete cascade,
  boutique_id uuid references boutiques(id) on delete cascade,
  client_nom text not null,
  date_vente date default current_date,
  montant_total numeric(10,2) default 0,
  created_at timestamptz default now()
);

-- 6. LIGNES DE VENTE (détail produits par vente)
create table vente_lignes (
  id uuid default gen_random_uuid() primary key,
  vente_id uuid references ventes(id) on delete cascade,
  produit_id uuid references produits(id) on delete cascade,
  quantite integer not null default 0,
  prix_unitaire numeric(10,2) not null,
  sous_total numeric(10,2) generated always as (quantite * prix_unitaire) stored
);

-- 7. GESTIONNAIRES (profils utilisateurs)
create table gestionnaires (
  id uuid references auth.users(id) primary key,
  nom text not null,
  email text not null,
  role text default 'gestionnaire' check (role in ('admin', 'gestionnaire')),
  created_at timestamptz default now()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
alter table livreurs enable row level security;
alter table produits enable row level security;
alter table boutiques enable row level security;
alter table stocks enable row level security;
alter table ventes enable row level security;
alter table vente_lignes enable row level security;
alter table gestionnaires enable row level security;

-- Politique : seuls les utilisateurs connectés peuvent lire/écrire
create policy "Authenticated users full access" on livreurs for all using (auth.role() = 'authenticated');
create policy "Authenticated users full access" on produits for all using (auth.role() = 'authenticated');
create policy "Authenticated users full access" on boutiques for all using (auth.role() = 'authenticated');
create policy "Authenticated users full access" on stocks for all using (auth.role() = 'authenticated');
create policy "Authenticated users full access" on ventes for all using (auth.role() = 'authenticated');
create policy "Authenticated users full access" on vente_lignes for all using (auth.role() = 'authenticated');
create policy "Authenticated users full access" on gestionnaires for all using (auth.role() = 'authenticated');

-- =============================================
-- DONNÉES DE DÉMO (optionnel)
-- =============================================
insert into produits (nom, prix_unitaire) values
  ('Eau 1.5L', 50),
  ('Eau 0.5L', 30),
  ('Jus Orange', 80),
  ('Jus Pomme', 80),
  ('Soda Cola', 70),
  ('Soda Citron', 70),
  ('Lait', 90),
  ('Yaourt', 60);

insert into boutiques (nom, couleur) values
  ('Boutique Alpha', '#F59E0B'),
  ('Boutique Beta', '#10B981'),
  ('Boutique Gamma', '#6366F1'),
  ('Boutique Delta', '#EF4444');

insert into livreurs (nom, telephone) values
  ('Karim Benali', '06 12 34 56 78'),
  ('Sofiane Merad', '06 98 76 54 32'),
  ('Yacine Hamidi', '07 11 22 33 44'),
  ('Nassim Touati', '06 55 44 33 22'),
  ('Riadh Kerrar', '07 66 77 88 99');
