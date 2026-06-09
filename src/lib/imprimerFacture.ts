import { Remboursement, FeuilleMaladie } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'

/** Assainit un texte pour un nom de fichier (accents retirés, espaces → tirets). */
function slug(texte: string): string {
  return texte
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')       // retire les accents
    .replace(/[^a-zA-Z0-9]+/g, '-')        // tout le reste → tiret
    .replace(/^-+|-+$/g, '')               // pas de tiret en début/fin
}

/**
 * Nom de fichier professionnel pour la facture, ex. « Facture-OSS-Thomas-Essomba-2026-06-09 ».
 * Sert de titre du document → c'est le nom proposé par « Enregistrer en PDF ».
 */
export function nomFichierFacture(feuille: FeuilleMaladie, remboursement: Remboursement): string {
  const dateISO = (remboursement.dateRemboursement || new Date().toISOString().split('T')[0]).slice(0, 10)
  return `Facture-OSS-${slug(feuille.nomAssure)}-${dateISO}`
}

/**
 * Génère le document HTML complet de la facture.
 * Le <title> porte un nom de fichier pro (utilisé par « Enregistrer en PDF ») ;
 * grâce à `@page { margin: 0 }`, il n'apparaît PAS dans les marges imprimées.
 * Le rendu se fait dans un <iframe> (cf. FacturePreview).
 */
export function genererFactureHTML(feuille: FeuilleMaladie, remboursement: Remboursement): string {
  const date = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  const numeroFacture = `FACT-${feuille.numFeuille}-${remboursement.numRemboursement}`

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${nomFichierFacture(feuille, remboursement)}</title>
  <style>
    /* margin: 0 supprime les en-têtes/pieds automatiques du navigateur
       (date, n° de page, URL) qui se logent dans la marge de page.
       Les marges visuelles sont recréées via le padding de .invoice. */
    @page { margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; }
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 11px;
      color: #1E1B2A;
      line-height: 1.6;
      background: #fff;
    }
    .invoice {
      max-width: 210mm;
      margin: 0 auto;
      padding: 18mm 15mm;
      position: relative;
    }
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-30deg);
      font-size: 100px;
      font-weight: 700;
      color: rgba(74, 27, 46, 0.03);
      letter-spacing: 12px;
      pointer-events: none;
      z-index: 0;
      white-space: nowrap;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 20px;
      border-bottom: 2px solid #4A1B2E;
      margin-bottom: 22px;
      position: relative;
    }
    .header::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 0;
      right: 0;
      height: 1px;
      background: rgba(180, 145, 85, 0.4);
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .logo-block {
      width: 42px;
      height: 42px;
      border: 2px solid rgba(180, 145, 85, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .logo-block span {
      font-size: 16px;
      font-weight: 700;
      color: #4A1B2E;
      letter-spacing: 1px;
    }
    .header-left h1 {
      font-size: 18px;
      color: #4A1B2E;
      font-weight: 700;
      letter-spacing: 0.3px;
    }
    .header-left p {
      font-size: 10px;
      color: #6B6580;
      margin-top: 1px;
    }
    .header-right h2 {
      font-size: 20px;
      color: #4A1B2E;
      font-weight: 700;
      letter-spacing: 4px;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .header-right p {
      font-size: 10px;
      color: #6B6580;
      text-align: right;
    }
    .badge {
      display: inline-block;
      padding: 3px 12px;
      font-size: 9px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      border: 1.5px solid #2D7A4F;
      color: #2D7A4F;
      background: #F2F9F5;
      margin-top: 6px;
      border-radius: 2px;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    .section {
      margin-bottom: 18px;
    }
    .section-title {
      font-size: 9px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      color: rgba(180, 145, 85, 0.7);
      margin-bottom: 8px;
      padding-bottom: 4px;
      border-bottom: 1px solid rgba(180, 145, 85, 0.2);
    }
    .info-block { margin-bottom: 8px; }
    .info-label {
      font-size: 9px;
      color: #6B6580;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 1px;
    }
    .info-value {
      font-size: 12px;
      color: #1E1B2A;
      font-weight: 500;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 6px;
    }
    th {
      font-size: 9px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #6B6580;
      text-align: left;
      padding: 7px 10px;
      border-bottom: 1.5px solid rgba(74, 27, 46, 0.15);
      background: #F8F6FA;
    }
    td {
      padding: 7px 10px;
      border-bottom: 1px solid rgba(74, 27, 46, 0.06);
      font-size: 11px;
      color: #1E1B2A;
    }
    td:last-child, th:last-child { text-align: right; }
    td:nth-child(2), th:nth-child(2) { text-align: right; }
    td:nth-child(3), th:nth-child(3) { text-align: center; }
    .total-row td {
      font-weight: 700;
      font-size: 13px;
      color: #4A1B2E;
      border-top: 2px solid #4A1B2E;
      border-bottom: none;
      padding-top: 10px;
    }
    .total-row td:first-child {
      text-align: right;
    }
    .gold-accent {
      border-left: 3px solid rgba(180, 145, 85, 0.4);
      padding-left: 12px;
    }
    .separator {
      height: 1px;
      background: linear-gradient(to right, transparent, rgba(180, 145, 85, 0.3), transparent);
      margin: 16px 0;
    }
    .footer {
      margin-top: 28px;
      padding-top: 14px;
      border-top: 1px solid rgba(74, 27, 46, 0.1);
      text-align: center;
      font-size: 9px;
      color: #6B6580;
    }
    .footer p { margin-bottom: 2px; }
    .footer strong { color: #4A1B2E; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="watermark">OSS</div>

    <div class="header">
      <div class="header-left">
        <div class="logo-block"><span>OSS</span></div>
        <div>
          <h1>OSS</h1>
          <p>Service des remboursements · Direction Générale</p>
        </div>
      </div>
      <div class="header-right">
        <h2>Facture</h2>
        <p>N° ${numeroFacture}</p>
        <p>Émise le ${date}</p>
        <div class="badge">Payée</div>
      </div>
    </div>

    <div class="grid-2 section">
      <div class="gold-accent">
        <div class="section-title">Bénéficiaire</div>
        <div class="info-block">
          <div class="info-label">Nom complet</div>
          <div class="info-value">${feuille.nomAssure}</div>
        </div>
        <div class="info-block">
          <div class="info-label">N° d'assuré</div>
          <div class="info-value">${feuille.numAssure}</div>
        </div>
        <div class="info-block">
          <div class="info-label">N° de feuille</div>
          <div class="info-value">${feuille.numFeuille}</div>
        </div>
      </div>
      <div class="gold-accent">
        <div class="section-title">Praticien</div>
        <div class="info-block">
          <div class="info-label">Médecin traitant</div>
          <div class="info-value">${feuille.nomMedecin}</div>
        </div>
        <div class="info-block">
          <div class="info-label">Date de consultation</div>
          <div class="info-value">${feuille.dateConsultation}</div>
        </div>
        <div class="info-block">
          <div class="info-label">Motif</div>
          <div class="info-value">${feuille.motif}</div>
        </div>
      </div>
    </div>

    <div class="separator"></div>

    <div class="section">
      <div class="section-title">Détail du remboursement</div>
      <table>
        <thead>
          <tr>
            <th>Nature</th>
            <th>Base</th>
            <th>Taux</th>
            <th>Montant remboursé</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${remboursement.nature}</td>
            <td>${formatCurrency(remboursement.montant / remboursement.taux)}</td>
            <td>${Math.round(remboursement.taux * 100)}%</td>
            <td>${formatCurrency(remboursement.montant)}</td>
          </tr>
          <tr class="total-row">
            <td colspan="3">Total remboursé</td>
            <td>${formatCurrency(remboursement.montant)}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="separator"></div>

    <div class="section">
      <div class="section-title">Informations de paiement</div>
      <table>
        <thead>
          <tr>
            <th>Mode de règlement</th>
            <th>Date de remboursement</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${remboursement.modeReglement === 'VIREMENT' ? 'Virement bancaire' : 'Espèces (Cash)'}</td>
            <td>${remboursement.dateRemboursement || date}</td>
            <td>Effectué</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="footer">
      <p><strong>OSS</strong> — Document officiel généré le ${date}</p>
      <p>Ce document fait office de justificatif de remboursement valable pour toute démarche administrative.</p>
      <p>Office de Sécurité Sociale</p>
    </div>
  </div>
</body>
</html>
  `
}
