/**
 * Official SOP Data for SMJ Sustainable Fuel Lab Pvt. Ltd.
 * Document No.: SMJ/SOP/LAB/01
 * Revision No.: 00
 * Effective Date: 01/07/2024
 */

export interface SopMetadata {
  companyName: string;
  companySubtitle: string;
  companyAddress: string;
  companyNabl: string;
  documentTitle: string;
  documentNumber: string;
  revisionNumber: string;
  effectiveDate: string;
  reviewDate: string;
  pageCount: string;
  department: string;
  isoStandard: string;
}

export const SOP_META: SopMetadata = {
  companyName: "SMJ Sustainable Fuel Lab Pvt. Ltd.",
  companySubtitle: "Fuel Characterization & Environmental Testing Division",
  companyAddress: "Industrial Area, Sector-4, Ranchi - 834001, Jharkhand, India",
  companyNabl: "NABL / ISO/IEC 17025:2017 Accredited Laboratory (Cert. No. TC-9482)",
  documentTitle: "DETERMINATION OF MOISTURE IN COAL",
  documentNumber: "SMJ/SOP/LAB/01",
  revisionNumber: "00",
  effectiveDate: "01/07/2024",
  reviewDate: "30/06/2026",
  pageCount: "2 of 2",
  department: "Solid Biofuel & Coal Quality Testing Laboratory",
  isoStandard: "IS 436 (Part 1): 2024 & IS 1350 (Part 1): 2025"
};

export const SIGNATORIES = [
  {
    role: "Prepared By",
    name: "R. K. Sharma",
    designation: "Senior Analytical Chemist",
    date: "25/06/2024",
    signatureUrl: "R.K. Sharma"
  },
  {
    role: "Reviewed By",
    name: "Dr. S. Mukherjee",
    designation: "QA/QC Manager",
    date: "28/06/2024",
    signatureUrl: "S. Mukherjee"
  },
  {
    role: "Approved By",
    name: "Er. V. K. Goel",
    designation: "Technical Director / Lab Head",
    date: "01/07/2024",
    signatureUrl: "V.K. Goel"
  }
];

export const REVISION_HISTORY = [
  {
    rev: "00",
    date: "01/07/2024",
    description: "Initial release aligned with updated IS 436 (Part 1): 2024 and IS 1350 (Part 1): 2025 standard procedures.",
    preparedBy: "R. K. Sharma",
    approvedBy: "Er. V. K. Goel"
  }
];

export const APPARATUS_LIST = [
  {
    name: "Ventilated Air Oven",
    spec: "Thermostatically controlled drying oven with forced air circulation (3-5 air changes/hour), maintaining constant & uniform temperature of 105°C to 110°C throughout the chamber.",
    id: "EQ-OVEN-003",
    tolerance: "±1.0 °C",
    calibDue: "14/11/2026"
  },
  {
    name: "Non-corrodible / S.S. Trays",
    spec: "Stainless Steel (SS-316/304) or non-corrosive alloy trays, surface area ~1000 cm², minimum depth 2.5 cm, capable of holding 1 kg of coal spread uniformly ≤ 1 g/cm².",
    id: "APP-TRY-012",
    tolerance: "N/A (Corrosion Free)",
    calibDue: "Visual inspection monthly"
  },
  {
    name: "Weighing Vessel with Cover",
    spec: "Shallow, cylindrical glass or silica vessel, approximately 40 cm² in surface area (diameter ~70 mm, depth ~20 mm) fitted with ground-glass airtight slip-on lid.",
    id: "APP-VES-045",
    tolerance: "Airtight seal (<0.2 mg loss/hr)",
    calibDue: "Integrity verified weekly"
  },
  {
    name: "Analytical Balance",
    spec: "High-precision micro/analytical electronic balance with draft shield, readable and sensitive to 0.1 mg (0.0001 g).",
    id: "BAL-ANL-002",
    tolerance: "±0.1 mg",
    calibDue: "05/01/2027"
  },
  {
    name: "Laboratory Heavy Balance",
    spec: "Top-loading digital precision balance for gross sample handling, capacity 5 kg, sensitive to 0.5 g.",
    id: "BAL-HVY-007",
    tolerance: "±0.5 g",
    calibDue: "18/02/2027"
  },
  {
    name: "Standard IS Sieves",
    spec: "2.90 mm aperture wire-cloth sieve complying with IS 460 (Part 1), accompanied by receiver pan and tight-fitting dust cover.",
    id: "SIV-290-01",
    tolerance: "IS 460 Standard",
    calibDue: "Annual optical audit"
  },
  {
    name: "Laboratory Desiccator",
    spec: "Heavy-wall borosilicate glass desiccator with porcelain perforated plate, charged with active self-indicating silica gel or anhydrous calcium sulfate.",
    id: "APP-DSC-004",
    tolerance: "Self-indicating blue (<10% RH)",
    calibDue: "Regenerate when turning pink"
  }
];

export const SAFETY_PRECAUTIONS = [
  {
    title: "Thermal Protection (PPE)",
    desc: "Wear certified heat-resistant Kevlar/silicone gloves and lab safety goggles when transferring hot vessels into or out of the 105°C–110°C oven.",
    level: "Mandatory"
  },
  {
    title: "Ventilation & Dust Control",
    desc: "Ensure laboratory fume hood or local exhaust ventilation is operational during crushing and sample transfer to prevent inhalation of respirable coal dust (N95 particulate respirator required).",
    level: "Mandatory"
  },
  {
    title: "Desiccator Vacuum Caution",
    desc: "Slide the desiccator lid gently horizontally when opening or closing; never pull upwards. Allow hot vessels to cool slightly (10-15 s) before seating the lid to avoid vacuum lock or popping.",
    level: "Critical Caution"
  },
  {
    title: "Electrical Safety & Fire Prevention",
    desc: "Never store combustible solvents or materials near the air drying oven. Maintain 30 cm clearance around oven vents and ensure emergency power cut-off switch is accessible.",
    level: "Standard"
  }
];

export const AIR_DRYING_STEPS = [
  {
    step: 1,
    title: "Gross Sample Weighing (M₁)",
    text: "Accurately weigh the received coal sample together with its intact moisture-proof container to the nearest 0.5 g. Record this mass as M₁."
  },
  {
    step: 2,
    title: "Transfer to Air Drying Tray",
    text: "Carefully transfer the entire sample from the container into a pre-cleaned, dry, weighed stainless steel tray (~1000 cm²). Spread the coal evenly so the layer thickness does not exceed 1 cm."
  },
  {
    step: 3,
    title: "Container Air Drying",
    text: "Allow the emptied container to air-dry thoroughly until any adhering coal particles and surface moisture dry completely."
  },
  {
    step: 4,
    title: "Weighing Dry Container (M₂)",
    text: "Brush any detached coal particles from the dry container into the sample tray, then weigh the clean empty dry container to the nearest 0.5 g. Record as M₂."
  },
  {
    step: 5,
    title: "Net Sample Mass Taken",
    text: "Calculate and record the original mass of the sample taken for the test as (M₁ − M₂)."
  },
  {
    step: 6,
    title: "Ambient Air Drying Exposure",
    text: "Allow the material on the tray to air-dry at ambient room temperature in an atmosphere clean and completely free from dust, draughts, and direct sunlight."
  },
  {
    step: 7,
    title: "Periodic Mass Monitoring",
    text: "Periodically weigh the tray and sample at 1-hour intervals after the initial drying phase (typically after 4 to 6 hours)."
  },
  {
    step: 8,
    title: "Constant Mass Verification",
    text: "Air drying is deemed complete when the change in mass during a successive 1-hour drying interval is less than 0.1% of the original sample mass (i.e. < 0.001 × [M₁ − M₂])."
  },
  {
    step: 9,
    title: "Final Air-Dried Mass (M₃)",
    text: "Record the final mass after air-drying to the nearest 0.5 g as M₃. Immediately calculate Air Dry Loss (ADL, X%)."
  }
];

export const OVEN_DRYING_STEPS = [
  {
    step: 1,
    title: "Conditioning Empty Vessel",
    text: "Heat an empty weighing vessel with its lid in the ventilated oven at 105°C to 110°C for 30 minutes to eliminate any absorbed ambient humidity."
  },
  {
    step: 2,
    title: "Cooling & Empty Vessel Mass (W₁)",
    text: "Transfer the heated empty vessel and cover into the desiccator using tongs. Allow to cool for 20 minutes to ambient room temperature. Weigh to the nearest 0.1 mg (0.0001 g) and record as W₁."
  },
  {
    step: 3,
    title: "Crushing Air-Dried Sample to 2.90 mm",
    text: "Rapidly crush the air-dried coal sample through a laboratory jaw/roll crusher so that all particles pass through a 2.90 mm IS sieve. Mix thoroughly and minimize exposure to air."
  },
  {
    step: 4,
    title: "Sample Weighing in Vessel (W₂)",
    text: "Immediately spread approximately 10 g (±0.5 g) of the prepared sample evenly across the bottom of the weighing vessel. Replace cover and weigh immediately to 0.1 mg. Record as W₂."
  },
  {
    step: 5,
    title: "Oven Drying at 105°C–110°C",
    text: "Remove the vessel cover and place both the uncovered vessel and its lid in the ventilated oven maintained strictly at 105°C to 110°C."
  },
  {
    step: 6,
    title: "Duration & Constant Mass Heating",
    text: "Continue heating for 1.5 to 3.0 hours. (Ensure drying conditions do not promote oxidation; for highly reactive coals, nitrogen-purged ovens are specified)."
  },
  {
    step: 7,
    title: "Vessel Cover Replacement",
    text: "After drying is completed, replace the cover on the weighing vessel quickly inside the oven or immediately upon withdrawal."
  },
  {
    step: 8,
    title: "Desiccator Cooling (20 Minutes)",
    text: "Transfer the covered vessel to the desiccator and allow it to cool for exactly 20 minutes to achieve thermal equilibrium with the balance room."
  },
  {
    step: 9,
    title: "Final Dried Sample Weighing (W₃)",
    text: "Weigh the covered vessel containing the dried coal to the nearest 0.1 mg. Record as W₃. Compute Residual Moisture (RM, Y%) and Total Moisture (TM%)."
  }
];

export const SAMPLE_PRESETS = [
  {
    id: "thermal_g10",
    name: "Thermal Coal (Grade G10 - Talcher)",
    description: "Typical high-moisture sub-bituminous Indian non-coking power coal.",
    m1: 1485.0,
    m2: 245.0,
    m3: 1392.0,
    w1: 28.4520,
    w2: 38.5140,
    w3: 37.8920
  },
  {
    id: "coking_washed",
    name: "Prime Coking Coal (Washed - Jharia)",
    description: "Low-moisture metallurgical coking coal with low air-dry loss.",
    m1: 1320.0,
    m2: 260.0,
    m3: 1294.0,
    w1: 31.1205,
    w2: 41.1550,
    w3: 40.9410
  },
  {
    id: "imported_subbit",
    name: "Imported Indonesian Coal (GAR 4200)",
    description: "High bed moisture eco-coal requiring significant air-drying.",
    m1: 1540.0,
    m2: 250.0,
    m3: 1346.5,
    w1: 29.8400,
    w2: 39.8650,
    w3: 38.6850
  }
];

/**
 * Generates pure standalone HTML markup with embedded CSS.
 * This can be saved as an independent .html file or opened in any browser.
 */
export function generateStandaloneSopHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SMJ/SOP/LAB/01 - Determination of Moisture in Coal</title>
  <style>
    :root {
      --primary: #0f172a;
      --secondary: #334155;
      --accent: #b45309;
      --border: #cbd5e1;
      --light-bg: #f8fafc;
      --text: #0f172a;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.55;
      color: var(--text);
      background: #e2e8f0;
      padding: 24px;
    }
    .document-container {
      max-width: 900px;
      margin: 0 auto;
      background: #ffffff;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      border: 1px solid var(--border);
    }
    .page-sheet {
      padding: 40px;
      border-bottom: 2px dashed #94a3b8;
      position: relative;
    }
    .page-sheet:last-child {
      border-bottom: none;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .document-container { box-shadow: none; border: none; max-width: 100%; }
      .page-sheet { padding: 15mm 20mm; page-break-after: always; border-bottom: none; }
      .no-print { display: none !important; }
    }
    .doc-header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
      border: 2px solid var(--primary);
    }
    .doc-header-table td, .doc-header-table th {
      border: 1px solid var(--border);
      padding: 8px 12px;
      font-size: 13px;
      vertical-align: middle;
    }
    .org-title {
      font-size: 18px;
      font-weight: 800;
      color: var(--primary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .org-sub {
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
    }
    .doc-title-cell {
      background: var(--light-bg);
      text-align: center;
      font-size: 16px;
      font-weight: 700;
      letter-spacing: 0.8px;
      color: var(--primary);
      padding: 12px !important;
      border-top: 2px solid var(--primary) !important;
      border-bottom: 2px solid var(--primary) !important;
    }
    h2.section-header {
      font-size: 14px;
      font-weight: 700;
      color: var(--primary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 4px;
      margin-top: 20px;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
    }
    h3.sub-section-header {
      font-size: 13px;
      font-weight: 700;
      color: #1e293b;
      margin-top: 14px;
      margin-bottom: 6px;
      text-decoration: underline;
    }
    p, li {
      font-size: 13px;
      color: #334155;
      text-align: justify;
    }
    ul, ol {
      margin-left: 20px;
      margin-bottom: 12px;
    }
    li {
      margin-bottom: 5px;
    }
    .callout-box {
      background: #fef3c7;
      border-left: 4px solid #d97706;
      padding: 10px 14px;
      margin: 12px 0;
      font-size: 12.5px;
      color: #92400e;
    }
    .formula-card {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      padding: 14px 18px;
      margin: 12px 0;
    }
    .formula-expression {
      font-family: "Courier New", Courier, monospace;
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 8px;
      text-align: center;
    }
    .table-data {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
      font-size: 12.5px;
    }
    .table-data th, .table-data td {
      border: 1px solid var(--border);
      padding: 6px 10px;
    }
    .table-data th {
      background: #f1f5f9;
      font-weight: 600;
      text-align: left;
    }
    .signatory-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid var(--border);
    }
    .signatory-box {
      border: 1px solid var(--border);
      padding: 10px;
      font-size: 12px;
      background: var(--light-bg);
    }
    .signatory-box .role {
      font-weight: 700;
      color: #0f172a;
      text-transform: uppercase;
      font-size: 11px;
      margin-bottom: 8px;
    }
    .signatory-box .sig {
      font-family: "Brush Script MT", cursive, sans-serif;
      font-size: 20px;
      color: #1e3a8a;
      min-height: 32px;
      line-height: 32px;
    }
    .footer-note {
      font-size: 10.5px;
      color: #64748b;
      margin-top: 20px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
      padding-top: 8px;
    }
  </style>
</head>
<body>

<div class="document-container">

  <!-- PAGE 1 OF 2 -->
  <div class="page-sheet">
    <table class="doc-header-table">
      <tr>
        <td rowspan="2" style="width: 25%; text-align: center; font-weight: 800; border-right: 2px solid var(--primary);">
          <div style="font-size: 22px; color: #b45309; letter-spacing: 1px;">SMJ</div>
          <div style="font-size: 9px; color: #475569; font-weight: 600; text-transform: uppercase;">Sustainable Fuel Lab</div>
        </td>
        <td colspan="2">
          <div class="org-title">SMJ Sustainable Fuel Lab Pvt. Ltd.</div>
          <div class="org-sub">Testing & Analysis Division | ISO/IEC 17025:2017 & NABL Standard System</div>
        </td>
      </tr>
      <tr>
        <td style="width: 35%;"><strong>Doc No:</strong> SMJ/SOP/LAB/01</td>
        <td style="width: 40%;"><strong>Effective Date:</strong> 01/07/2024</td>
      </tr>
      <tr>
        <td colspan="3" class="doc-title-cell">
          STANDARD OPERATING PROCEDURE<br>
          <span style="font-size: 18px; color: #b45309;">DETERMINATION OF MOISTURE IN COAL</span>
        </td>
      </tr>
      <tr>
        <td><strong>Revision No:</strong> 00</td>
        <td><strong>Review Frequency:</strong> Biennial (2 Yrs)</td>
        <td><strong>Page:</strong> 1 of 2</td>
      </tr>
    </table>

    <h2 class="section-header">1. Purpose</h2>
    <p>To describe the standard laboratory test methods for the determination of total moisture present in coal samples by two-stage gravimetric loss method in accordance with Indian Standards.</p>

    <h2 class="section-header">2. Scope</h2>
    <p>This procedure applies to the determination of total moisture in all raw, washed, thermal, non-coking, and coking coal samples received and analyzed at SMJ Sustainable Fuel Lab Pvt. Ltd.</p>

    <h2 class="section-header">3. Definitions and Abbreviations</h2>
    <p><strong>Total Moisture:</strong> The coal which has been exposed to contact with water in the seam or in a washery or during transit contains free moisture (surface moisture) in addition to inherent bed moisture. Total moisture is the sum of both the free moisture and the inherent moisture present in the coal.</p>
    <ul>
      <li><strong>ADL:</strong> Air Dry Loss</li>
      <li><strong>RM:</strong> Residual Moisture</li>
      <li><strong>TM:</strong> Total Moisture</li>
      <li><strong>IS:</strong> Indian Standard (Bureau of Indian Standards)</li>
      <li><strong>PPE:</strong> Personal Protective Equipment</li>
    </ul>

    <h2 class="section-header">4. Safety Precautions</h2>
    <ul>
      <li>Use appropriate personal protective equipment (PPE), such as heat-resistant gloves, laboratory apron, safety goggles, and particulate dust respirators (N95).</li>
      <li>Ensure proper ventilation when operating the drying oven and sample crushers; maintain exhaust air extraction.</li>
      <li>Use crucible tongs and heat-resistant pads when handling hot weighing vessels or metal trays from the oven.</li>
      <li>Ensure the desiccator lid is securely greased with vacuum grease and opened by sliding horizontally, not lifting directly.</li>
      <li>Follow all laboratory safety protocols and guidelines, including emergency power shut-off procedures.</li>
    </ul>

    <h2 class="section-header">5. Apparatus</h2>
    <table class="table-data">
      <tr>
        <th>Apparatus Name</th>
        <th>Specification / Requirement</th>
      </tr>
      <tr>
        <td><strong>Ventilated Air Oven</strong></td>
        <td>Constant & uniform temperature of 105°C to 110°C with 3 to 5 air changes per hour.</td>
      </tr>
      <tr>
        <td><strong>Non-corrodible / S.S. Tray</strong></td>
        <td>Area approximately 1000 sq. cm with minimum depth of 2.5 cm for 1 kg coal sample.</td>
      </tr>
      <tr>
        <td><strong>Weighing Vessel</strong></td>
        <td>Shallow glass/silica dish (~40 cm² area, ~70 mm dia, ~20 mm depth) with ground-glass lid.</td>
      </tr>
      <tr>
        <td><strong>Analytical Balance</strong></td>
        <td>Sensitive and readable to 0.1 mg (0.0001 g) for Residual Moisture determinations.</td>
      </tr>
      <tr>
        <td><strong>Heavy Lab Balance</strong></td>
        <td>Capacity 5 kg, sensitive to 0.5 g for Air Drying determinations.</td>
      </tr>
      <tr>
        <td><strong>Standard IS Sieves</strong></td>
        <td>2.90 mm aperture wire-cloth sieve conforming to IS 460.</td>
      </tr>
      <tr>
        <td><strong>Desiccator</strong></td>
        <td>Borosilicate glass charged with fresh self-indicating blue silica gel.</td>
      </tr>
    </table>

    <h2 class="section-header">6. Reagents</h2>
    <p>None required for this test method. (Dry inert nitrogen gas if drying is performed under inert atmosphere for coals prone to oxidation).</p>

    <h2 class="section-header">7. Sample Handling and Preparation</h2>
    <p>Obtain a representative moisture sample of 1 kg of coal crushed to pass through 12.5 mm / 2.90 mm sieve as per IS 436 (Part 1): 2024. The sample must be delivered in an airtight, non-permeable moisture-proof container immediately after sampling to prevent any loss of moisture during transit.</p>

    <h2 class="section-header">8. Procedure (Stage 1: Air Drying)</h2>
    <ol>
      <li>Accurately weigh the sample and the container to the nearest 0.5 g (<strong>M₁</strong>).</li>
      <li>Transfer the sample from the container to a pre-weighed metal tray and spread uniformly.</li>
      <li>Dry the empty container in air until all adhering coal particles dry.</li>
      <li>Weigh the dry empty container (<strong>M₂</strong>).</li>
      <li>Calculate and record the mass of the sample taken for the test (<strong>M₁ − M₂</strong>).</li>
      <li>Allow the material on the tray to air-dry at ambient room temperature in dust-free air.</li>
      <li>Periodically weigh the tray and sample at 1-hour intervals.</li>
      <li>Consider air-drying complete when the change in mass during an hour is less than 0.1% of original mass.</li>
      <li>Record the final mass after air-drying (<strong>M₃</strong>).</li>
    </ol>

    <div class="footer-note">
      SMJ Sustainable Fuel Lab Pvt. Ltd. | Confidential & Controlled Quality Document | Page 1 of 2
    </div>
  </div>

  <!-- PAGE 2 OF 2 -->
  <div class="page-sheet">
    <table class="doc-header-table">
      <tr>
        <td style="width: 25%; font-weight: 800; color: #b45309;">SMJ Fuel Lab</td>
        <td style="width: 45%;"><strong>Doc No:</strong> SMJ/SOP/LAB/01 | Rev: 00</td>
        <td style="width: 30%;"><strong>Page:</strong> 2 of 2</td>
      </tr>
    </table>

    <h3 class="sub-section-header">8. Procedure (Stage 2: Oven Drying)</h3>
    <ol>
      <li>Heat an empty weighing vessel and cover in the oven at 105°C–110°C for 30 minutes.</li>
      <li>After heating, allow the empty vessel to cool for 20 minutes in a desiccator and weigh to 0.1 mg (<strong>W₁</strong>).</li>
      <li>Crush the air-dried coal sample to pass through a 2.90 mm IS sieve.</li>
      <li>Spread approximately 10 g of prepared sample into vessel, replace cover, and weigh to 0.1 mg (<strong>W₂</strong>).</li>
      <li>Place the uncovered vessel and lid into ventilated oven at 105°C to 110°C.</li>
      <li>Continue heating for 1.5 to 3.0 hours until there is no further loss in mass (constant weight).</li>
      <li>After drying, replace the cover immediately.</li>
      <li>Allow the covered vessel to cool in the desiccator for 20 minutes.</li>
      <li>Weigh the covered vessel containing the dried sample (<strong>W₃</strong>).</li>
    </ol>

    <h2 class="section-header">9. Calculation</h2>
    <div class="formula-card">
      <div style="font-weight: 700; color: #b45309; margin-bottom: 6px;">Air Dry Loss (ADL):</div>
      <div class="formula-expression">X = [ 100 × (M₁ − M₃) ] / (M₁ − M₂)</div>
      <p style="font-size: 12px; color: #475569;">
        Where: <strong>X</strong> = Air Dry Loss (%), <strong>M₁</strong> = Mass of sample + container (g), <strong>M₂</strong> = Mass of dry empty container (g), <strong>M₃</strong> = Mass after air-drying (g).
      </p>
    </div>

    <div class="formula-card">
      <div style="font-weight: 700; color: #b45309; margin-bottom: 6px;">Residual Moisture (RM):</div>
      <div class="formula-expression">Y = [ 100 × (W₂ − W₃) ] / (W₂ − W₁)</div>
      <p style="font-size: 12px; color: #475569;">
        Where: <strong>Y</strong> = Residual Moisture (%), <strong>W₁</strong> = Mass of empty vessel + cover (g), <strong>W₂</strong> = Mass of vessel + cover + sample before drying (g), <strong>W₃</strong> = Mass of vessel + cover + sample after drying (g).
      </p>
    </div>

    <div class="formula-card" style="border-left: 4px solid #b45309; background: #fffbeb;">
      <div style="font-weight: 700; color: #92400e; margin-bottom: 6px;">Total Moisture (TM %):</div>
      <div class="formula-expression" style="color: #78350f;">Total Moisture (%) = X + Y × [ 1 − (X / 100) ]</div>
      <p style="font-size: 12px; color: #92400e;">
        Alternatively expressed as: <strong>TM % = X + [ Y × (100 − X) / 100 ]</strong><br>
        Report results to two decimal places (0.01%).
      </p>
    </div>

    <h2 class="section-header">10. Repeatability & Quality Tolerance Limits</h2>
    <p>As per Indian Standard IS 1350 (Part 1) and ISO 589:</p>
    <table class="table-data">
      <tr>
        <th>Total Moisture Level</th>
        <th>Repeatability Limit (Same Lab / Analyst, r)</th>
        <th>Reproducibility Limit (Different Labs, R)</th>
      </tr>
      <tr>
        <td>Total Moisture &lt; 5.0%</td>
        <td>0.30% absolute</td>
        <td>0.50% absolute</td>
      </tr>
      <tr>
        <td>Total Moisture &ge; 5.0%</td>
        <td>0.50% absolute</td>
        <td>0.80% absolute</td>
      </tr>
    </table>

    <h2 class="section-header">11. References</h2>
    <ul>
      <li>Indian Standard <strong>IS 436 (Part 1): 2024</strong>, <em>Methods for Sampling of Coal and Coke</em>.</li>
      <li>Indian Standard <strong>IS 1350 (Part 1): 2025</strong>, <em>Methods of Test for Coal and Coke - Proximate Analysis</em>.</li>
      <li>ISO 589:2008, <em>Hard coal — Determination of total moisture</em>.</li>
      <li>ASTM D3302 / D3302M, <em>Standard Test Method for Total Moisture in Coal</em>.</li>
    </ul>

    <h2 class="section-header">12. Signatures & Approvals</h2>
    <div class="signatory-grid">
      <div class="signatory-box">
        <div class="role">Prepared By</div>
        <div class="sig">R. K. Sharma</div>
        <div><strong>R. K. Sharma</strong></div>
        <div style="color: #64748b;">Sr. Analytical Chemist</div>
        <div style="margin-top: 4px; color: #64748b;">Date: 25/06/2024</div>
      </div>
      <div class="signatory-box">
        <div class="role">Reviewed By</div>
        <div class="sig">S. Mukherjee</div>
        <div><strong>Dr. S. Mukherjee</strong></div>
        <div style="color: #64748b;">QA/QC Manager</div>
        <div style="margin-top: 4px; color: #64748b;">Date: 28/06/2024</div>
      </div>
      <div class="signatory-box">
        <div class="role">Approved By</div>
        <div class="sig">V. K. Goel</div>
        <div><strong>Er. V. K. Goel</strong></div>
        <div style="color: #64748b;">Technical Director / Lab Head</div>
        <div style="margin-top: 4px; color: #64748b;">Date: 01/07/2024</div>
      </div>
    </div>

    <div class="footer-note">
      SMJ Sustainable Fuel Lab Pvt. Ltd. | Document No: SMJ/SOP/LAB/01 | Revision: 00 | Page 2 of 2
    </div>
  </div>

</div>

</body>
</html>`;
}
