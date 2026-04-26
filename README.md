# 🚀 MIA: Context-Aware Retail Engine

> **Note:** For a complete strategic overview, download our [Executive Summary (PDF)](./MIA_Project_Summary.pdf).

**MIA** is a real-time, context-aware retail engine built for Stuttgart's independent merchants. [cite_start]It combines IoT signals—such as weather, foot traffic, and local events—with a **Local-First AI** strategist to convert off-peak hours into revenue without compromising customer privacy[cite: 13, 14].

---

## 📉 The Problem
[cite_start]European city-center retailers lose up to **40% of their daily revenue** during low-traffic windows like rainy mornings or off-peak afternoons[cite: 25]. [cite_start]Traditional marketing tools are static and often require sharing sensitive customer data, which is incompatible with strict EU privacy regulations[cite: 26].

## 💡 The Solution: Sense, Decide, Convert
[cite_start]MIA continuously senses the merchant's micro-environment to trigger automated, targeted offers[cite: 28].
* [cite_start]**Sense**: Real-time telemetry from **Payone** (payment density) and OpenWeather feeds[cite: 40].
* [cite_start]**Decide**: An on-device Small Language Model (SLM) proposes contextual rules (e.g., *IF Rain AND Density < 35% THEN -20% on hot drinks*)[cite: 28, 71].
* [cite_start]**Convert**: Instant push notifications are sent to nearby **City-Wallet** users via geofencing[cite: 28].

---

## 🏗 System Architecture
[cite_start]The platform is composed of three integrated modules, each accessible via the merchant dashboard[cite: 37]:

### M01: Detection Center
[cite_start]Captures environmental signals including Stuttgart weather data, **Payone** foot-traffic density, local events, and a 200m geofence proximity radar[cite: 39, 40].

### M02: AI Automations
[cite_start]A visual rule builder where the AI strategist translates context into personalized offers[cite: 43, 44]. [cite_start]The core trigger logic requires: **Customers ≥ 1 AND Density < 35%**[cite: 44, 67].

### M03: Live Operations
[cite_start]Provides a real-time view of active offers, transaction streams, and a live iPhone preview showing exactly what the customer sees in their City-Wallet[cite: 47, 48].

---

## 🛠 Tech Stack
| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, TypeScript | [cite_start]Type-safe SPA architecture [cite: 89] |
| **Backend** | Supabase (Lovable Cloud) | [cite_start]Real-time DB, Auth, & Edge Functions [cite: 89] |
| **AI Layer** | Local-First SLM | [cite_start]GDPR-safe strategist & suggestions [cite: 89] |
| **Design** | Tailwind CSS, shadcn/ui | [cite_start]"Frosted Pastel" glassmorphism system [cite: 89, 90] |
| **State** | TanStack Query | [cite_start]Live signal streams & server cache [cite: 89] |

---

## 🔒 Privacy & GDPR by Design
* [cite_start]**Local-First AI**: All reasoning runs on-device through a local SLM; no personal data leaves the merchant's control[cite: 115, 116].
* [cite_start]**Anonymity**: The City-Wallet uses anonymous proximity tokens only[cite: 116].
* [cite_start]**No PII**: No Personally Identifiable Information is ever sent to our backend[cite: 117].

---

## 🚀 Setup & Installation

1. **Clone the repository**
   ```bash
   git clone [https://github.com/chouaibneuralnets/city-wallet-insights.git](https://github.com/chouaibneuralnets/city-wallet-insights.git)
   
2. **Install dependencies**
Using npm (Node Package Manager), install all required libraries defined in package.json:

4. **Environment Variables**
MIA requires connection strings for Supabase. Create a .env file in the root directory:

4.**Run development server**
Start the local development server with Vite



## 🤝 Strategic Partners
MIA is a collaborative ecosystem. Each partner is wired into a distinct module:


Payone: Provides anonymized payment density telemetry to identify low-traffic windows.


Sparkasse: Powers the City-Wallet identity layer and secure anonymous interactions.


DSV: Contributes logistics signals and environmental context for the detection engine.

