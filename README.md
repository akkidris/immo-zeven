# ImmoAgent Pro – Zeven

Live-Marktanalyse für Mehrfamilienhäuser in Zeven + Umkreis.

## Features

- **Manuelle Link-Analyse** — Exposé-URL einfügen, KI extrahiert Daten und bewertet
- **24h URL-Check** — täglicher Cron prüft jedes Inserat, tote werden archiviert
- **Auto-Discovery** — täglicher Crawl von Stegeberg, Grimberg, Immowelt → neue Objekte landen automatisch in der DB
- **Analyse-Verlauf** — jede Bewertung wird mit Timestamp gespeichert (Preis-/Score-Historie)
- **Profi-Kennzahlen** — Cashflow, Brutto/Netto-Rendite, Mietfaktor, Score, Rating

## Setup

```bash
npm install
cp .env.example .env.local
# Werte eintragen (siehe .env.example)
```

DB initialisieren — `supabase/schema.sql` im Supabase SQL-Editor ausführen.

```bash
npm run dev
```

## Deploy auf Vercel

1. Repo mit Vercel verbinden
2. Environment Variables aus `.env.example` setzen
3. Deploy — Cron Jobs starten automatisch laut `vercel.json`

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- Supabase (Postgres) für Daten + Verlauf
- Anthropic Claude Haiku für Daten-Extraktion (~0,01€ pro Analyse)
- Vercel Cron für 24h-Checks und Discovery
