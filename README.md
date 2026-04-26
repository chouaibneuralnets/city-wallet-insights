# 🚀 MIA: Context-Aware Retail Engine

> **Note:** For a complete strategic overview, download our [Executive Summary (PDF)](./MIA_Project_Summary.pdf).

[cite_start]**MIA** is a real-time, context-aware retail engine built for Stuttgart's independent merchants[cite: 1, 9, 13]. [cite_start]It combines IoT signals—such as weather, foot traffic, and local events—with a **Local-First AI** strategist to convert off-peak hours into revenue without compromising customer privacy[cite: 14, 15, 29].

---

## 📉 The Problem
[cite_start]European city-center retailers lose up to **40% of their daily revenue** during low-traffic windows like rainy mornings or off-peak afternoons[cite: 25]. [cite_start]Traditional marketing tools are static and often require sharing sensitive customer data, which is incompatible with strict EU privacy regulations[cite: 26].

## 💡 The Solution: Sense, Decide, Convert
[cite_start]MIA continuously senses the merchant's micro-environment to trigger automated, targeted offers[cite: 14, 28].
* [cite_start]**Sense**: Real-time telemetry from **Payone** (payment density) and OpenWeather feeds[cite: 31, 40, 60].
* [cite_start]**Decide**: An on-device Small Language Model (SLM) proposes contextual rules (e.g., *IF Rain AND Density < 35% THEN -20% on hot drinks*)[cite: 28, 71].
* [cite_start]**Convert**: Instant push notifications are sent to nearby **City-Wallet** users via geofencing[cite: 28, 31, 62].

---

## 🏗 System Architecture
[cite_start]The platform is composed of three integrated modules, each accessible via the merchant dashboard[cite: 37]:

### M01: Detection Center
[cite_start]Captures environmental signals including Stuttgart weather data, **Payone** foot-traffic density, local events, and a 200m geofence proximity radar[cite: 40].

### M02: AI Automations
[cite_start]A visual rule builder where the AI strategist translates context into personalized offers[cite: 44, 66]. [cite_start]The core trigger logic requires: **Customers ≥ 1 AND Density < 35%**[cite: 44, 67].

### M03: Live Operations
[cite_start]Provides a real-time view of active offers, transaction streams, and a live iPhone preview showing exactly what the customer sees in their City-Wallet[cite: 48].

---

## 🛠 Tech Stack
| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, TypeScript | [cite_start]Type-safe SPA architecture [cite: 89] |
| **Backend** | Supabase (Lovable Cloud) | [cite_start]Real-time DB, Auth, & Edge Functions [cite: 89] |
| **AI Layer** | Local-First SLM | [cite_start]GDPR-safe strategist & suggestions [cite: 71, 89] |
| **Design** | Tailwind CSS, shadcn/ui | [cite_start]"Frosted Pastel" glassmorphism system [cite: 80, 89, 90] |
| **State** | TanStack Query | [cite_start]Live signal streams & server cache [cite: 89] |

---

## 🔒 Privacy & GDPR by Design
* [cite_start]**Local-First AI**: All reasoning runs on-device through a local SLM; no personal data leaves the merchant's control[cite: 5, 21, 116].
* [cite_start]**Anonymity**: The City-Wallet uses anonymous proximity tokens only[cite: 116].
* [cite_start]**No PII**: No Personally Identifiable Information is ever sent to the backend[cite: 117].

---

## 🚀 Setup & Installation

1. **Clone the repository**
   ```bash
   git clone [https://github.com/your-username/mia-stuttgart-retail.git](https://github.com/your-username/mia-stuttgart-retail.git)

   Install dependenciesBashnpm install
Environment VariablesCreate a .env file at the root:Extrait de codeVITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
Run development serverBashnpm run dev
🤝 Strategic PartnersPayone: Provides anonymized payment density telemetry.Sparkasse: Powers the City-Wallet identity layer and secure payments.DSV: Contributes logistics and micro-environment signals.
