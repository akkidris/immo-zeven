import Link from 'next/link'

export default function About() {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <Link href="/" className="text-sm text-slate-600 hover:text-slate-900">
            ← Zurück
          </Link>
        </div>
      </header>
      <div className="max-w-3xl mx-auto px-6 py-8 prose prose-slate">
        <h1>Methodik</h1>

        <h2>Cashflow-Berechnung</h2>
        <p>Vollfinanzierung-Annahme (0€ Eigenkapital) — realistisches Szenario für Erstkäufer mit Schufa.</p>
        <ul>
          <li>Kaufnebenkosten Niedersachsen: 5% GrESt + 1,5% Notar + 0,5% Grundbuch + 3,57% Makler = <strong>10,57%</strong></li>
          <li>Annuität: 3,8% Zins + 2% Tilgung auf Gesamtinvestition</li>
          <li>Bewirtschaftung: 8% IH + 5% Verwaltung + 3% Mietausfall + Sachversicherung 0,50€/m²</li>
        </ul>

        <h2>Score 0-100</h2>
        <p>Basis 50 Punkte. Bewertet werden:</p>
        <ul>
          <li>Preis vs. regionaler Marktdurchschnitt</li>
          <li>Cashflow nach allen Kosten</li>
          <li>Mietfaktor (Kaufpreis / Jahresmiete)</li>
          <li>Mietsteigerungspotenzial (Ist-Miete vs. Marktmiete)</li>
          <li>Vermietungsstatus, Baujahr</li>
        </ul>
        <p>Rating: A ≥80 · B ≥65 · C ≥50 · D &lt;50</p>

        <h2>24h-Check</h2>
        <p>Jede gespeicherte URL wird täglich angepingt. Tote Inserate (404/410) werden in das Archiv verschoben.</p>

        <h2>Auto-Discovery</h2>
        <p>Täglicher Crawl von Stegeberg, Grimberg, Immowelt-Suchseiten Zeven + Umkreis. Neue Inserate werden automatisch analysiert.</p>

        <h2>Quellen</h2>
        <ul>
          <li>Mietspiegel Region Rotenburg-Wümme</li>
          <li>Engel & Völkers Marktbericht Zeven</li>
          <li>ImmoScout24 PriceMap</li>
        </ul>
      </div>
    </main>
  )
}
