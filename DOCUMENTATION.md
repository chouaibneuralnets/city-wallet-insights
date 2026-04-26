# MIA: Context-Aware Retail Engine — Documentation

> **Live Demo:** https://city-wallet-insights.vercel.app
> **Repo:** https://github.com/chouaibneuralnets/city-wallet-insights

---

## 1. Vue d'ensemble

MIA est un moteur temps réel concu pour les commercants independants de Stuttgart. Il combine des signaux IoT (meteo, densite de paiements, evenements locaux) avec une IA locale (SLM) pour transformer les heures creuses en revenus, sans compromettre la vie privee des clients (RGPD by design).

**Paradigme : Sense → Decide → Convert**

| Etape | Description |
|-------|-------------|
| **Sense** | Telemetrie temps reel via Payone (densite paiements) + OpenWeather |
| **Decide** | SLM on-device propose des regles (ex: IF Rain AND Density < 35% THEN -20% cafes) |
| **Convert** | Notifications push aux utilisateurs City-Wallet par geofencing 200m |

---

## 2. Architecture — 3 Modules

### M01 — Detection Center
Capture les signaux environnementaux :
- Meteo Stuttgart (OpenWeather API via Edge Function)
- Densite de paiements Payone (foot-traffic anonymise)
- Evenements locaux Stuttgart
- Radar de proximite geofencing 200m autour du magasin

### M02 — AI Automations
- **Visual Rule Builder** : l'IA traduit le contexte en offres personnalisees
- Logique de declenchement : `Customers >= 1 AND Density < 35%`
- Suggestions generees par le SLM local (aucune donnee ne quitte l'appareil)
- Simulateur MIA pour tester les regles avant activation

### M03 — Live Operations
- Vue temps reel des offres actives et flux de transactions
- Previsualisation iPhone live (apercu client City-Wallet)
- Stream Supabase Realtime avec REPLICA IDENTITY FULL

---

## 3. Stack Technique

| Couche | Technologie | Role |
|--------|-------------|------|
| **Frontend** | React 18, Vite, TypeScript | SPA type-safe |
| **UI** | shadcn/ui, Radix UI, Tailwind CSS | Design "Frosted Pastel" glassmorphism |
| **State** | TanStack Query v5 | Streams temps reel + cache serveur |
| **Charts** | Recharts | Graphiques analytics |
| **Backend** | Supabase (Lovable Cloud) | PostgreSQL, Auth, Edge Functions, Realtime |
| **AI Layer** | Local-First SLM | Strategiste RGPD-safe, on-device |
| **Forms** | React Hook Form + Zod | Validation schema |
| **Routing** | React Router DOM v6 | Navigation SPA |
| **Build** | Vite + SWC | Bundler rapide |
| **Tests** | Vitest + Testing Library | Tests unitaires |
| **Deploy** | Vercel | Production |

---

## 4. Structure du projet

```
city-wallet-insights/
├── public/
├── src/
│   ├── App.tsx                    # Routeur principal
│   ├── pages/
│   │   ├── Dashboard.tsx          # Vue principale (/)
│   │   ├── Automations.tsx        # M02 Rule Builder (/automations)
│   │   ├── Offers.tsx             # Offres actives (/offers)
│   │   ├── Transactions.tsx       # Flux transactions (/transactions)
│   │   ├── Analytics.tsx          # Rapports (/analytics)
│   │   ├── Settings.tsx           # Configuration (/settings)
│   │   ├── Help.tsx               # Aide (/help)
│   │   └── NotFound.tsx           # 404 (*)
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── AppLayout.tsx
│   │   │   ├── AppHeader.tsx
│   │   │   ├── AppSidebar.tsx
│   │   │   ├── KpiCards.tsx
│   │   │   ├── ContextPanel.tsx
│   │   │   ├── InputSignals.tsx
│   │   │   ├── RuleBuilder.tsx
│   │   │   ├── ConditionChips.tsx
│   │   │   ├── CompositeState.tsx
│   │   │   ├── Module2Signals.tsx
│   │   │   ├── AiActivityLog.tsx
│   │   │   ├── AiStrategyLog.tsx
│   │   │   ├── AiSimulator.tsx
│   │   │   ├── MiaSimulator.tsx
│   │   │   ├── IPhonePreview.tsx
│   │   │   ├── ProximityMap.tsx
│   │   │   ├── LiveOpportunities.tsx
│   │   │   ├── LiveAnalytics.tsx
│   │   │   ├── MarketStatus.tsx
│   │   │   ├── OffersTable.tsx
│   │   │   ├── TransactionsTable.tsx
│   │   │   ├── TransactionChart.tsx
│   │   │   ├── RevenueComparison.tsx
│   │   │   └── AnalyticsReports.tsx
│   │   ├── ui/                    # Composants shadcn/ui generiques
│   │   └── NavLink.tsx
│   ├── hooks/
│   │   ├── useStuttgartWeather.ts
│   │   ├── useTrafficDensity.ts
│   │   ├── useProximityPings.ts
│   │   ├── useKpiMetrics.ts
│   │   ├── useTypewriter.ts
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   ├── context/
│   ├── data/
│   ├── integrations/supabase/
│   └── lib/
├── supabase/
│   ├── config.toml
│   ├── functions/get-weather/     # Edge Function meteo
│   └── migrations/               # 9 migrations SQL
├── .env
├── package.json
└── vite.config.ts
```

---

## 5. Routes de l'application

| Route | Page | Description |
|-------|------|-------------|
| `/` | Dashboard | KPIs + contexte + signaux temps reel |
| `/automations` | Automations | M02 — Visual Rule Builder IA |
| `/offers` | Offers | Gestion des offres actives |
| `/transactions` | Transactions | Flux et historique des transactions |
| `/analytics` | Analytics | Rapports et graphiques de performance |
| `/settings` | Settings | Configuration du systeme |
| `/help` | Help | Documentation utilisateur |
| `*` | NotFound | Page 404 |

---

## 6. Schema Base de Donnees (Supabase / PostgreSQL)

### Table `public.offers_config`
Table principale de configuration des offres automatisees.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | Identifiant unique auto-genere |
| `weather` | TEXT NOT NULL | Condition meteo declenchante |
| `discount_percent` | INTEGER (default: 20) | Pourcentage de remise |
| `product` | TEXT (default: 'Cafe') | Produit cible par l'offre |
| `traffic_condition` | TEXT (default: 'low') | Condition de densite trafic |
| `active` | BOOLEAN (default: true) | Offre active ou non |
| `created_at` | TIMESTAMPTZ | Date de creation |
| `updated_at` | TIMESTAMPTZ | Mise a jour automatique (trigger) |

**Securite :** Row Level Security (RLS) activee — policies publiques SELECT/INSERT/UPDATE.
**Realtime :** Table dans la publication `supabase_realtime` avec `REPLICA IDENTITY FULL`.

### Table `public.system_state`
Stocke l'etat global du systeme.

| Colonne | Description |
|---------|-------------|
| `id` | Identifiant (ex: 'global') |
| `rules_enabled` | BOOLEAN — active/desactive les regles IA globalement |

---

## 7. Backend — Edge Functions Supabase

### `supabase/functions/get-weather/`
Edge Function Deno qui proxifie les appels a l'API OpenWeather pour Stuttgart.
- Protege la cle API cote serveur
- Retourne les donnees meteo en temps reel au frontend
- Appelee par le hook `useStuttgartWeather`

---

## 8. Hooks personnalises

| Hook | Role |
|------|------|
| `useStuttgartWeather` | Fetch meteo Stuttgart via Edge Function |
| `useTrafficDensity` | Densite de paiements Payone (foot-traffic) |
| `useProximityPings` | Gestion des pings de geofencing 200m |
| `useKpiMetrics` | Agregation des metriques KPI du dashboard |
| `useTypewriter` | Animation typewriter pour l'UI |
| `use-mobile` | Detection responsive mobile |
| `use-toast` | Notifications toast |

---

## 9. Installation & Demarrage

```bash
# 1. Cloner le repo
git clone https://github.com/chouaibneuralnets/city-wallet-insights.git
cd city-wallet-insights

# 2. Installer les dependances
npm install
# ou avec bun
bun install

# 3. Variables d'environnement
# Creer un fichier .env a la racine :
VITE_SUPABASE_URL=<votre_url_supabase>
VITE_SUPABASE_ANON_KEY=<votre_anon_key>

# 4. Lancer le serveur de developpement
npm run dev
```

### Scripts disponibles

| Commande | Action |
|----------|--------|
| `npm run dev` | Serveur de developpement Vite |
| `npm run build` | Build de production |
| `npm run build:dev` | Build en mode developpement |
| `npm run preview` | Previsualiser le build |
| `npm run lint` | Lint ESLint |
| `npm run test` | Tests avec Vitest |
| `npm run test:watch` | Tests en mode watch |

---

## 10. Partenaires & Integrations

| Partenaire | Role dans MIA |
|------------|---------------|
| **Payone** | Telemetrie de densite de paiements anonymisee |
| **OpenWeather** | API meteo Stuttgart en temps reel |
| **Sparkasse** | Couche identite City-Wallet + interactions anonymes |
| **DSV** | Signaux logistiques et contexte environnemental |

---

## 11. Principes RGPD & Privacy by Design

- **Local-First AI** : tout le raisonnement se fait on-device via le SLM — aucune donnee personnelle ne quitte le controle du commercant
- **Tokens anonymes** : City-Wallet utilise uniquement des tokens de proximite anonymes
- **Zero PII** : aucune donnee personnellement identifiable n'est envoyee au backend
- **RLS** : Row Level Security active sur toutes les tables Supabase

---

## 12. Variables d'environnement

| Variable | Description | Requis |
|----------|-------------|--------|
| `VITE_SUPABASE_URL` | URL du projet Supabase | Oui |
| `VITE_SUPABASE_ANON_KEY` | Cle publique anonyme Supabase | Oui |

---

*Documentation generee le 26 avril 2026*
