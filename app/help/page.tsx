import Link from 'next/link'
import { glossary } from '@/lib/glossary'

export const metadata = {
  title: 'Hilfe & Anleitung · ImmoAgent Pro',
}

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-sm text-slate-600 hover:text-slate-900">
            ← Zurück zur Übersicht
          </Link>
          <h1 className="font-semibold text-slate-900">Hilfe & Anleitung</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Intro */}
        <section className="bg-gradient-to-br from-slate-900 to-slate-700 text-white rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-2">Was ist ImmoAgent Pro?</h2>
          <p className="text-slate-100 leading-relaxed">
            Dein persönlicher Immobilien-Analyst. Du fügst Exposé-Links ein, die KI extrahiert alle
            Daten, berechnet Cashflow + Renditen + Score, prüft täglich ob die Inserate noch online
            sind und findet automatisch neue Angebote. Konzipiert für den Markt Zeven + Umkreis.
          </p>
        </section>

        {/* Quick Start */}
        <Card title="🚀 In 3 Minuten loslegen">
          <div className="space-y-4">
            <Step n={1} title="Profil einrichten (optional, aber empfohlen)">
              Oben rechts <strong>⚙️ Profil</strong> klicken. Trag dein Eigenkapital, Zinssatz deiner
              Bank, Tilgungsrate und Grenzsteuersatz ein. Diese Werte gelten für alle Berechnungen —
              sparst du dir bei jedem Objekt neu einzutippen.
              <Tip>
                <strong>Tipp:</strong> Zinssatz frag bei der Sparkasse oder Volksbank — die geben
                dir eine grobe Indikation auch ohne Kreditantrag. Bei 0€ Eigenkapital ist 3,8-4,2%
                realistisch.
              </Tip>
            </Step>
            <Step n={2} title="Erstes Inserat analysieren">
              Auf der <Link href="/" className="text-sky-700 underline">Übersichts-Seite</Link>{' '}
              eine Exposé-URL einfügen → <strong>Analysieren</strong>. Die KI braucht ~5 Sekunden,
              dann erscheint die Karte mit Score + Cashflow.
            </Step>
            <Step n={3} title="Detail-Seite ansehen">
              Klick auf eine Karte → du siehst alle Kennzahlen, Pro/Contra, Finanzierungs-Szenarien.
              Probier den <strong>🎚️ Interaktiven Rechner</strong> aus — schieb die Slider und sieh
              wie sich Cashflow ändert.
            </Step>
          </div>
        </Card>

        {/* Funktionen im Detail */}
        <Card title="🎯 Was kann das Tool im Detail?">
          <FeatureBlock
            icon="🤖"
            title="KI-Extraktion aus jedem Link"
            description="URL eingeben → Claude Haiku liest die ganze Seite und extrahiert: Preis, Wohnfläche, Grundstück, Einheiten, Zimmer, Baujahr, Sanierungs-Jahr, Heizung, Energiekennwert, Mieteinnahmen, Vermietungsstatus, Mietart (Wohn/Gewerbe). Funktioniert mit Immowelt, Stegeberg, Grimberg, Sparkasse direkt."
          />
          <FeatureBlock
            icon="📋"
            title="Paste-Modus für blockierte Portale"
            description="ImmoScout24 und Kleinanzeigen blockieren Bot-Anfragen. Lösung: Öffne das Inserat im Browser, kopier den Text (Cmd+A, Cmd+C), füg ihn ins Paste-Feld ein — KI extrahiert genauso. Funktioniert mit JEDEM Portal der Welt."
          />
          <FeatureBlock
            icon="💰"
            title="Interaktiver Finanzierungs-Rechner"
            description="Auf jeder Detail-Seite: 3 Slider für Eigenkapital, Zinssatz und Tilgung. Sobald du schiebst, rechnen sich Monatsrate, Cashflow nach Steuer, Vermögensaufbau und Break-Even-Jahre LIVE neu. Plus House-Hacking-Modus: was würde ich monatlich zahlen wenn ich eine Einheit selbst bewohne?"
          />
          <FeatureBlock
            icon="📊"
            title="Score 0-100 mit Verdict"
            description="Jedes Objekt bekommt eine Note (A-D) und ein klares Verdict: KAUFEN / PRÜFEN / VERHANDELN / ÜBERSPRINGEN. Score basiert auf Preis vs. Markt, Cashflow, Mietfaktor, Mietsteigerungspotenzial, Baujahr und mehr."
          />
          <FeatureBlock
            icon="📈"
            title="Mietsteigerungs-Analyse"
            description="Wenn die aktuellen Mieter unter Marktmiete zahlen, rechnet das Tool aus: Wie viel Upside hast du pro Jahr wenn du bei Mieterwechsel auf Marktniveau erhöhst? Das ist oft der Hebel der ein 'mittleres' Objekt zum Top-Investment macht."
          />
          <FeatureBlock
            icon="🔬"
            title="Sensitivity-Analyse"
            description="Was wenn die Miete -10% einbricht? Was wenn der Zins auf 4,5% steigt? Du siehst sofort wie robust dein Cashflow gegen externe Schocks ist."
          />
          <FeatureBlock
            icon="✏️"
            title="Manuelles Override"
            description="Falls die KI etwas falsch erkannt hat (z.B. Warmmiete statt Kaltmiete) — auf der Detail-Seite das Formular nutzen, Werte korrigieren → Score und Cashflow rechnen sich automatisch neu. Jede Änderung wird mit Timestamp im Verlauf gespeichert."
          />
          <FeatureBlock
            icon="🟢"
            title="24h Status-Check (automatisch)"
            description="Cron-Job pingt jeden Morgen 06:00 Uhr alle gespeicherten URLs. Wenn ein Inserat offline ist (404/410), wandert es automatisch ins Archiv. Du siehst nur noch aktive Objekte."
          />
          <FeatureBlock
            icon="🔍"
            title="Auto-Discovery (automatisch)"
            description="Cron crawlt morgens 07:00 die Suchseiten von Stegeberg, Grimberg und Immowelt für Zeven + Umkreis. Neue Inserate werden automatisch analysiert und in die Übersicht aufgenommen."
          />
        </Card>

        {/* Kennzahlen erklärt */}
        <Card title="📚 Kennzahlen erklärt">
          <Metric
            term="Cashflow / Monat"
            value="Mieteinnahmen − Bewirtschaftung − Kreditrate"
            desc="Was bleibt monatlich übrig (oder draufzulegen ist). Bei Vollfinanzierung oft negativ in den ersten Jahren — über Tilgung baust du trotzdem Vermögen auf."
          />
          <Metric
            term="Netto-Rendite"
            value="(Jahresmiete − Bewirtschaftung) / Kaufpreis × 100"
            desc="Wie viel % Rendite bringt das Objekt vor Finanzierungskosten und Steuer. Faustregel: über 5% ist gut, über 6% sehr gut."
          />
          <Metric
            term="Mietfaktor (Bruttomultiplikator)"
            value="Kaufpreis / Jahres-Kaltmiete"
            desc="Wie viele Jahresmieten kostet das Objekt. <15× ist günstig, 15-20× normal, >22× teuer. In München sind 35× üblich, in Zeven solltest du unter 18× bleiben."
          />
          <Metric
            term="Preis/m² vs. Markt"
            value="Kaufpreis pro Quadratmeter Wohnfläche, verglichen mit Ø Zeven (2.184 €/m²)"
            desc="Negativ = unter Markt = gut. Bei deutlich unter 1.800€/m² genau auf Substanz schauen — kann auch Renovierungsstau bedeuten."
          />
          <Metric
            term="Vermögensaufbau / Jahr"
            value="Jährliche Tilgung + AfA-Steuervorteil"
            desc="Was du wirklich an Vermögen aufbaust — auch wenn Cashflow negativ ist. Bei einem 300k Objekt sind das oft +8-12k €/Jahr."
          />
          <Metric
            term="LTV (Loan-to-Value)"
            value="Darlehenshöhe / Gesamtinvestition × 100"
            desc="Beleihungsauslauf. Banken finanzieren oft bis 100-110% LTV bei guter Bonität. Über 110% schwierig."
          />
          <Metric
            term="AfA-Vorteil"
            value="2% Gebäudewert × Steuersatz"
            desc="Absetzung für Abnutzung — du darfst 2% vom Gebäudewert (80% vom Kaufpreis) jährlich von der Steuer absetzen. Bei 42% Spitzensteuersatz spart das ca. 0,7% des Kaufpreises/Jahr."
          />
          <Metric
            term="Mietsteigerungspotenzial"
            value="(Marktmiete − IST-Miete) × Wohnfläche × 12"
            desc="Was du theoretisch mehr verdienen könntest bei Mieten auf Marktniveau. Wichtig: Bestandsmieten sind oft 20-30% unter Markt — der Upside kommt nur bei Mieterwechsel oder Sanierung."
          />
        </Card>

        {/* Paste-Modus Detail */}
        <Card title="📋 Paste-Modus — Schritt für Schritt">
          <ol className="space-y-3 text-sm text-slate-700">
            <li>
              <strong>1.</strong> Öffne das Inserat in einem neuen Browser-Tab. Du wirst als normaler
              Mensch erkannt, der Browser-Schutz greift nicht.
            </li>
            <li>
              <strong>2.</strong> Wenn die Seite geladen ist: irgendwo auf den Inhalt klicken
              (z.B. auf die Beschreibung).
            </li>
            <li>
              <strong>3.</strong> Drücke <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-xs">⌘A</kbd> — markiert alles.
            </li>
            <li>
              <strong>4.</strong> Drücke <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-xs">⌘C</kbd> — kopiert in Zwischenablage.
            </li>
            <li>
              <strong>5.</strong> Zurück zu ImmoAgent → URL trotzdem ins URL-Feld einfügen (für späteren Status-Check).
            </li>
            <li>
              <strong>6.</strong> Klick auf <em>&quot;↓ URL geht nicht? Text einfügen…&quot;</em>
            </li>
            <li>
              <strong>7.</strong> In das Textfeld <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-xs">⌘V</kbd> — der ganze Seiteninhalt erscheint.
            </li>
            <li>
              <strong>8.</strong> <strong>Analysieren</strong> klicken. KI macht den Rest.
            </li>
          </ol>
          <Tip>
            <strong>Funktioniert mit:</strong> Immowelt, ImmoScout24, Kleinanzeigen, eBay, jedem
            Privatverkäufer-Inserat — alles wo es Text auf der Seite gibt.
          </Tip>
        </Card>

        {/* Workflows */}
        <Card title="💼 Workflows für typische Aufgaben">
          <Workflow
            title="Neues Inserat schnell bewerten"
            steps={[
              'URL einfügen + Analysieren klicken',
              'Verdict-Badge checken (KAUFEN/PRÜFEN/VERHANDELN/ÜBERSPRINGEN)',
              'Bei PRÜFEN oder VERHANDELN: Detail-Seite öffnen, Pro/Contra lesen',
              'Im interaktiven Rechner deine Bank-Konditionen einstellen',
              'Sensitivity-Analyse: Geht das auch bei Miete -10%?',
            ]}
          />
          <Workflow
            title="Verhandlungs-Vorbereitung"
            steps={[
              'Auf Detail-Seite das Override-Formular nutzen',
              'Verschiedene Preise durchspielen: ab welchem Preis ist CF positiv?',
              'Ergebnis im Analyse-Verlauf festhalten',
              'Im Termin: konkrete Zahlen + Marktdaten als Argument',
            ]}
          />
          <Workflow
            title="House Hacking Szenario"
            steps={[
              'Detail-Seite öffnen',
              'Im interaktiven Rechner: "House Hacking" anhaken',
              'Du siehst deine effektiven Wohnkosten pro Monat',
              'Vergleich: was würdest du sonst miete zahlen in der Lage?',
            ]}
          />
          <Workflow
            title="Bank-Termin vorbereiten"
            steps={[
              'Im Profil: Zinssatz und Tilgung der Bank eintragen',
              'Top 3 Objekte als Tabs offen halten',
              'Pro Objekt: Cashflow + Mieteinnahmen + Vermögensaufbau printen/screenshoten',
              'Bank zeigt: das ist eine durchgerechnete Investition, nicht Bauchgefühl',
            ]}
          />
        </Card>

        {/* Profil & Settings */}
        <Card title="⚙️ Dein Finanzierungs-Profil">
          <p className="text-sm text-slate-700 leading-relaxed mb-3">
            Klick oben rechts auf <strong>⚙️ Profil</strong> um Standardwerte einzustellen.
            Diese werden für jede Berechnung verwendet — du musst sie nicht bei jedem Objekt neu eintippen.
          </p>
          <div className="text-sm space-y-2">
            <p><strong>Eigenkapital:</strong> Was du an Cash mitbringen kannst (Anzahlung + Nebenkosten)</p>
            <p><strong>Zinssatz:</strong> Frag deine Bank, oder nimm 3,8-4,2% als realistischen Wert</p>
            <p><strong>Tilgung:</strong> 2% ist Standard, mehr = schneller schuldenfrei aber höhere Rate</p>
            <p><strong>Grenzsteuersatz:</strong> Bei ~3000€ Netto/Monat ca. 30-35%, höher mit Spitzenverdiener</p>
            <p><strong>Instandhaltung / Verwaltung / Mietausfall:</strong> Standardwerte (8/5/3%) übernehmen wenn unsicher</p>
          </div>
          <Tip>
            <strong>Gespeichert wird lokal</strong> in deinem Browser (localStorage) — keine
            Cloud, keine Anmeldung. Wenn du Browser/Gerät wechselst musst du neu eintragen.
          </Tip>
        </Card>

        {/* FAQ */}
        <Card title="❓ Häufige Fragen">
          <Faq
            q="Warum erkennt die KI manchmal Werte falsch?"
            a="Bei kreativ gestalteten Inseraten (z.B. 'Mieteinnahmen ca. 27.000 €' statt klarer Tabelle) kann die KI raten. Korrigiere falsche Werte im Override-Formular auf der Detail-Seite — die Berechnung passt sich sofort an."
          />
          <Faq
            q="Was kostet die App?"
            a="Hosting (Vercel) und DB (Supabase) sind gratis. Einzige Kosten: Anthropic API Calls — ca. 1-3€/Monat bei normaler Nutzung. Du kannst in console.anthropic.com ein Spend-Limit setzen."
          />
          <Faq
            q="Bleibt mein Profil erhalten wenn ich den Browser-Cache leere?"
            a="Nein — das Profil ist im localStorage. Browser-Cache leeren löscht es. Solltest du dich später für Login + Cloud-Sync entscheiden, baue ich das nach."
          />
          <Faq
            q="Wie oft läuft der Auto-Crawl?"
            a="Täglich 07:00 UTC (also 08:00 Sommerzeit). Es werden max. 5 neue Inserate pro Tag analysiert um API-Kosten zu begrenzen."
          />
          <Faq
            q="Können andere meine Daten sehen?"
            a="Aktuell ja — die App hat keinen Login. Wer den Link kennt sieht alle Objekte. Wenn du das willst getrennt → ich bau Supabase Auth dazu (1-2h Arbeit)."
          />
          <Faq
            q="Wie lösche ich ein Objekt?"
            a="Detail-Seite öffnen → oben rechts 'Löschen' → bestätigen. Inkl. allem Verlauf weg."
          />
          <Faq
            q="Wie aktualisiere ich ein Objekt manuell?"
            a="Detail-Seite → 'Daten korrigieren' Section → Werte ändern → 'Speichern + neu berechnen'. Wird im Verlauf festgehalten."
          />
        </Card>

        {/* Glossar */}
        <Card title="📖 Glossar — alle Begriffe alphabetisch">
          <p className="text-sm text-slate-600 mb-4">
            Im ganzen Tool findest du <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold mx-1">?</span>-Symbole neben Fachbegriffen.
            Klick drauf — Erklärung erscheint. Hier alle Begriffe komplett:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(glossary)
              .sort(([, a], [, b]) => a.title.localeCompare(b.title))
              .map(([key, e]) => (
                <div key={key} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                  <div className="flex items-baseline gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900 text-sm">{e.title}</h3>
                    {e.short && <span className="text-xs text-slate-500 font-mono">({e.short})</span>}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{e.description}</p>
                  {e.formula && (
                    <div className="mt-2 text-[11px] font-mono text-slate-500">
                      <span className="text-slate-400">Formel:</span> {e.formula}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500 pt-4 pb-8">
          ImmoAgent Pro · Built for Zeven · Powered by Claude Haiku 4.5
        </div>
      </div>
    </main>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-6">
      <h2 className="text-lg font-bold text-slate-900 mb-4">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="shrink-0 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
        {n}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
        <div className="text-sm text-slate-700 leading-relaxed">{children}</div>
      </div>
    </div>
  )
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 bg-amber-50 border-l-4 border-amber-400 px-3 py-2 text-xs text-slate-700 rounded-r">
      💡 {children}
    </div>
  )
}

function FeatureBlock({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex gap-3 py-2">
      <div className="text-2xl">{icon}</div>
      <div className="flex-1">
        <h3 className="font-semibold text-slate-900 text-sm">{title}</h3>
        <p className="text-sm text-slate-600 leading-relaxed mt-1">{description}</p>
      </div>
    </div>
  )
}

function Metric({ term, value, desc }: { term: string; value: string; desc: string }) {
  return (
    <div className="border-b border-slate-100 pb-3 last:border-0">
      <div className="flex justify-between items-baseline mb-1 flex-wrap gap-2">
        <h3 className="font-semibold text-slate-900 text-sm">{term}</h3>
        <code className="text-xs text-slate-600 font-mono bg-slate-50 px-2 py-0.5 rounded">{value}</code>
      </div>
      <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
    </div>
  )
}

function Workflow({ title, steps }: { title: string; steps: string[] }) {
  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
      <h3 className="font-semibold text-slate-900 text-sm mb-2">{title}</h3>
      <ol className="space-y-1 text-sm text-slate-700">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-slate-400 shrink-0">{i + 1}.</span>
            <span>{s}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <details className="border-b border-slate-100 last:border-0 pb-3 group">
      <summary className="font-medium text-slate-900 cursor-pointer hover:text-slate-700 list-none flex items-center justify-between">
        <span>{q}</span>
        <span className="text-slate-400 group-open:rotate-180 transition-transform">▾</span>
      </summary>
      <p className="text-sm text-slate-600 leading-relaxed mt-2">{a}</p>
    </details>
  )
}
