/**
 * Temporary structured SOP parser used during R1 scope reset
 * Parses supplied SOP material without adding laboratory-specific defaults.
 */

import { formatFormulaToHtml } from '../components/MathFormulaRenderer';

export interface SopApparatusItem {
  name: string;
  spec: string;
  tolerance?: string;
  calibDue?: string;
}

export interface SopProcedureStep {
  step: number;
  title: string;
  text: string;
}

export interface SopProcedureStage {
  stageName: string;
  steps: SopProcedureStep[];
}

export interface SopFormulaVariable {
  symbol: string;
  description: string;
  unit?: string;
  defaultValue?: number;
}

export interface SopCalculationItem {
  name: string;
  formula: string;
  explanation?: string;
  variables?: SopFormulaVariable[];
  calculatedValue?: number;
}

export interface SopSignatory {
  role: string;
  name: string;
  designation: string;
  date: string;
}

export interface SopRevisionEntry {
  rev: string;
  date: string;
  description: string;
  preparedBy: string;
  approvedBy: string;
}

export interface StructuredSopDocument {
  companyName: string;
  companySubtitle: string;
  companyAddress: string;
  documentTitle: string;
  documentNumber: string;
  revisionNumber: string;
  effectiveDate: string;
  reviewDate: string;
  pageCount: string;
  department: string;
  isoStandard: string;
  purpose: string;
  scope: string;
  definitions: { term: string; definition: string }[];
  safetyPrecautions: { title: string; desc: string; level: 'Mandatory' | 'Critical Caution' | 'Standard' }[];
  apparatus: SopApparatusItem[];
  reagents: string;
  sampleHandling: string;
  procedureStages: SopProcedureStage[];
  calculations: SopCalculationItem[];
  qualityControl?: string;
  references: string[];
  signatories: SopSignatory[];
  revisionHistory: SopRevisionEntry[];
}


export function parseRawSopText(rawText: string): StructuredSopDocument {
  const lines = rawText.split('\n');

  let companyName = '';
  let documentTitle = '';
  let documentNumber = '';
  let revisionNumber = '';
  let effectiveDate = '';
  let reviewDate = '';
  let pageCount = '';
  let department = '';
  let isoStandard = '';

  let purpose = '';
  let scope = '';
  const definitions: { term: string; definition: string }[] = [];
  const safetyPrecautions: { title: string; desc: string; level: 'Mandatory' | 'Critical Caution' | 'Standard' }[] = [];
  const apparatus: SopApparatusItem[] = [];
  let reagents = '';
  let sampleHandling = '';
  const procedureStages: SopProcedureStage[] = [];
  const calculations: SopCalculationItem[] = [];
  const references: string[] = [];

  let currentSection = '';
  let currentStageName = '';
  let currentStepList: SopProcedureStep[] = [];
  let currentCalcName = '';
  let currentFormula = '';
  let currentCalcVariables: SopFormulaVariable[] = [];

  let h1Count = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Check for H1 (# Company Name or # Document Title)
    if (line.startsWith('# ') && !line.startsWith('## ')) {
      const heading = line.replace(/^#\s+/, '').trim();
      if (h1Count === 0) {
        if (heading.toLowerCase().includes('ltd') || heading.toLowerCase().includes('lab') || heading.toLowerCase().includes('corp') || heading.toLowerCase().includes('institute') || heading.toLowerCase().includes('inc') || heading.toLowerCase().includes('services')) {
          companyName = heading;
        } else {
          documentTitle = heading;
        }
        h1Count++;
      } else {
        documentTitle = heading;
      }
      continue;
    }

    // Document No.
    const docNoMatch = line.match(/(?:document\s*no\.?|doc\s*no\.?)\s*[:：]\s*\*{0,2}([^\*\n]+)/i);
    if (docNoMatch) {
      documentNumber = docNoMatch[1].trim().replace(/\*+/g, '');
    }

    // Revision No.
    const revMatch = line.match(/(?:revision\s*no\.?|rev\s*no\.?)\s*[:：]\s*\*{0,2}([^\*\n]+)/i);
    if (revMatch) {
      revisionNumber = revMatch[1].trim().replace(/\*+/g, '');
    }

    // Effective Date
    const effMatch = line.match(/(?:effective\s*date)\s*[:：]\s*\*{0,2}([^\*\n]+)/i);
    if (effMatch) {
      effectiveDate = effMatch[1].trim().replace(/\*+/g, '');
    }

    // Page
    const pageMatch = line.match(/(?:page)\s*[:：]\s*\*{0,2}([^\*\n]+)/i);
    if (pageMatch) {
      pageCount = pageMatch[1].trim().replace(/\*+/g, '');
    }

    // Section H2 detection
    if (line.startsWith('## ')) {
      const secTitle = line.replace(/^##\s+/, '').trim().toLowerCase();

      // Flush previous procedure stage if any
      if (currentStageName && currentStepList.length > 0) {
        procedureStages.push({
          stageName: currentStageName,
          steps: [...currentStepList]
        });
        currentStageName = '';
        currentStepList = [];
      }

      // Flush previous calculation if any
      if (currentCalcName && currentFormula) {
        calculations.push({
          name: currentCalcName,
          formula: currentFormula.replace(/\$\$/g, '').trim(),
          variables: [...currentCalcVariables]
        });
        currentCalcName = '';
        currentFormula = '';
        currentCalcVariables = [];
      }

      if (secTitle.includes('purpose')) currentSection = 'purpose';
      else if (secTitle.includes('scope')) currentSection = 'scope';
      else if (secTitle.includes('definition')) currentSection = 'definitions';
      else if (secTitle.includes('safety')) currentSection = 'safety';
      else if (secTitle.includes('apparatus') || secTitle.includes('equipment')) currentSection = 'apparatus';
      else if (secTitle.includes('reagent')) currentSection = 'reagents';
      else if (secTitle.includes('sample')) currentSection = 'sampleHandling';
      else if (secTitle.includes('procedure')) currentSection = 'procedure';
      else if (secTitle.includes('calculation')) currentSection = 'calculation';
      else if (secTitle.includes('reference')) currentSection = 'references';
      else currentSection = secTitle;
      continue;
    }

    // Section H3 detection
    if (line.startsWith('### ')) {
      const subTitle = line.replace(/^###\s+/, '').trim();
      if (currentSection === 'procedure') {
        if (currentStageName && currentStepList.length > 0) {
          procedureStages.push({
            stageName: currentStageName,
            steps: [...currentStepList]
          });
        }
        currentStepList = [];
        currentStageName = subTitle;
      } else if (currentSection === 'calculation') {
        if (currentCalcName && currentFormula) {
          calculations.push({
            name: currentCalcName,
            formula: currentFormula.replace(/\$\$/g, '').trim(),
            variables: [...currentCalcVariables]
          });
          currentFormula = '';
          currentCalcVariables = [];
        }
        currentCalcName = subTitle;
      }
      continue;
    }

    // Fill content according to currentSection
    if (currentSection === 'purpose') {
      purpose = purpose ? `${purpose} ${line}` : line;
    } else if (currentSection === 'scope') {
      scope = scope ? `${scope} ${line}` : line;
    } else if (currentSection === 'definitions') {
      const defMatch = line.match(/\*\*([^*]+)\*\*\s*[:：]\s*(.*)/);
      if (defMatch) {
        definitions.push({
          term: defMatch[1].trim(),
          definition: defMatch[2].trim()
        });
      } else if (line.includes(':')) {
        const parts = line.split(':');
        definitions.push({
          term: parts[0].replace(/[-*]/g, '').trim(),
          definition: parts.slice(1).join(':').trim()
        });
      }
    } else if (currentSection === 'safety') {
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const bulletText = line.replace(/^[-*]\s+/, '').trim();
        safetyPrecautions.push({
          title: bulletText.split(/[,:.]/)[0].trim(),
          desc: bulletText,
          level: bulletText.toLowerCase().includes('must') || bulletText.toLowerCase().includes('ppe') || bulletText.toLowerCase().includes('hazard') || bulletText.toLowerCase().includes('goggles') ? 'Mandatory' : 'Standard'
        });
      }
    } else if (currentSection === 'apparatus') {
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const bullet = line.replace(/^[-*]\s+/, '').trim();
        const boldMatch = bullet.match(/\*\*([^*]+)\*\*\s*[:：]?\s*(.*)/);
        if (boldMatch) {
          apparatus.push({
            name: boldMatch[1].trim(),
            spec: boldMatch[2].trim()
          });
        } else if (bullet.includes(':')) {
          const [n, ...rest] = bullet.split(':');
          apparatus.push({
            name: n.trim(),
            spec: rest.join(':').trim(),
            tolerance: 'Standard'
          });
        }
      }
    } else if (currentSection === 'reagents') {
      reagents = reagents === 'Analytical grade reagents and purified water conforming to standard specifications.' ? line : `${reagents} ${line}`;
    } else if (currentSection === 'sampleHandling') {
      sampleHandling = sampleHandling ? `${sampleHandling} ${line}` : line;
    } else if (currentSection === 'procedure') {
      const stepMatch = line.match(/^(\d+)\.\s+(.*)/);
      if (stepMatch) {
        const stepNum = parseInt(stepMatch[1], 10);
        const fullStepText = stepMatch[2].trim();
        const titleMatch = fullStepText.match(/\(([^)]+)\)/);
        const title = titleMatch ? `${titleMatch[1]} Determination` : fullStepText.slice(0, 32) + '...';
        currentStepList.push({
          step: stepNum,
          title: title,
          text: fullStepText
        });
      }
    } else if (currentSection === 'calculation') {
      if (line.includes('$$') || line.includes('\\frac') || line.includes('=')) {
        currentFormula = currentFormula ? `${currentFormula} ${line}` : line;
        if (!currentCalcName) {
          currentCalcName = 'Analytical Result';
        }
      } else if (line.startsWith('- ') && line.includes('=')) {
        const [sym, desc] = line.replace(/^[-*]\s+/, '').split('=');
        // Preserve an explicit numeric default only when it is present in the supplied source.
        const defValMatch = desc ? desc.match(/\[(?:default|val)\s*[:：]?\s*([0-9.]+)\]/i) : null;
        currentCalcVariables.push({
          symbol: sym.trim(),
          description: desc ? desc.replace(/\[[^\]]+\]/g, '').trim() : '',
          defaultValue: defValMatch ? parseFloat(defValMatch[1]) : undefined
        });
      }
    } else if (currentSection === 'references') {
      if (line.startsWith('- ') || line.startsWith('* ')) {
        references.push(line.replace(/^[-*]\s+/, '').trim());
      }
    }
  }

  // Flush remaining stages
  if (currentStageName && currentStepList.length > 0) {
    procedureStages.push({
      stageName: currentStageName,
      steps: [...currentStepList]
    });
  } else if (currentStepList.length > 0) {
    procedureStages.push({
      stageName: 'Analytical Protocol',
      steps: [...currentStepList]
    });
  }

  // Flush remaining calculation
  if (currentCalcName && currentFormula) {
    calculations.push({
      name: currentCalcName,
      formula: currentFormula.replace(/\$\$/g, '').trim(),
      variables: [...currentCalcVariables]
    });
  }

  return {
    companyName,
    companySubtitle: '',
    companyAddress: '',
    documentTitle,
    documentNumber,
    revisionNumber,
    effectiveDate,
    reviewDate,
    pageCount,
    department,
    isoStandard: isoStandard,
    purpose,
    scope,
    definitions,
    safetyPrecautions: safetyPrecautions.length > 0 ? safetyPrecautions : [
      { title: 'Personal Protective Equipment', desc: 'Wear approved safety goggles, lab coat, and protective gloves.', level: 'Mandatory' },
      { title: 'Ventilation', desc: 'Operate all volatile chemical procedures within a functional fume hood.', level: 'Mandatory' }
    ],
    apparatus: apparatus.length > 0 ? apparatus : [
      { name: 'Analytical Balance', spec: 'Readable to 0.1 mg (0.0001 g)', tolerance: '±0.1 mg' },
      { name: 'Calibrated Glassware', spec: 'Class A volumetric flasks and pipettes', tolerance: 'Class A' }
    ],
    reagents,
    sampleHandling,
    procedureStages,
    calculations: calculations.length > 0 ? calculations : [
      {
        name: 'Analyte Content',
        formula: 'Result = (A - B) * Factor / Sample_Weight',
        variables: [
          { symbol: 'A', description: 'Test reading / final value', defaultValue: 10.0 },
          { symbol: 'B', description: 'Blank reading / tare', defaultValue: 1.0 },
          { symbol: 'Sample_Weight', description: 'Weight or volume of test sample', defaultValue: 1.0 }
        ]
      }
    ],
    references,
    signatories: [],
    revisionHistory: []
  };
}

/**
 * Generate complete standalone HTML file with embedded CSS for ANY structured laboratory SOP.
 */

export function generateStandaloneHtmlForSop(sop: StructuredSopDocument): string {
  const escapeHtml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const textBlock = (value: string) => escapeHtml(value).replace(/\n/g, '<br>');
  const section = (title: string, body: string) => body ? `<section><h2>${title}</h2>${body}</section>` : '';
  const definitions = sop.definitions.map(d => `<li><strong>${escapeHtml(d.term)}:</strong> ${textBlock(d.definition)}</li>`).join('');
  const safety = sop.safetyPrecautions.map(s => `<li><strong>${escapeHtml(s.title)}</strong>${s.desc ? ': ' + textBlock(s.desc) : ''}</li>`).join('');
  const apparatus = sop.apparatus.map(a => `<tr><td>${escapeHtml(a.name)}</td><td>${textBlock(a.spec)}</td><td>${escapeHtml(a.tolerance || '')}</td></tr>`).join('');
  const stages = sop.procedureStages.map((stage, index) => `<h3>${index + 1}. ${escapeHtml(stage.stageName)}</h3><ol>${stage.steps.map(step => `<li>${step.title ? '<strong>' + escapeHtml(step.title) + ':</strong> ' : ''}${textBlock(step.text)}</li>`).join('')}</ol>`).join('');
  const calculations = sop.calculations.map(calc => `<div class="formula"><h3>${escapeHtml(calc.name)}</h3>${formatFormulaToHtml(calc.formula)}${calc.explanation ? '<p>' + textBlock(calc.explanation) + '</p>' : ''}${calc.variables?.length ? '<ul>' + calc.variables.map(v => `<li><strong>${escapeHtml(v.symbol)}:</strong> ${textBlock(v.description)}${v.unit ? ' (' + escapeHtml(v.unit) + ')' : ''}</li>`).join('') + '</ul>' : ''}</div>`).join('');
  const references = sop.references.map(ref => `<li>${textBlock(ref)}</li>`).join('');
  const signatories = sop.signatories.map(sig => `<div class="signature"><strong>${escapeHtml(sig.role)}</strong><div>${escapeHtml(sig.name)}</div><div>${escapeHtml(sig.designation)}</div><div>${escapeHtml(sig.date)}</div></div>`).join('');
  const history = sop.revisionHistory.map(item => `<tr><td>${escapeHtml(item.rev)}</td><td>${escapeHtml(item.date)}</td><td>${textBlock(item.description)}</td><td>${escapeHtml(item.preparedBy)}</td><td>${escapeHtml(item.approvedBy)}</td></tr>`).join('');
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${escapeHtml(sop.documentTitle || 'SOP')}</title><style>
body{font-family:Arial,sans-serif;line-height:1.55;color:#0f172a;background:#e2e8f0;margin:0;padding:24px}.document{max-width:900px;margin:auto;background:#fff;padding:40px;border:1px solid #cbd5e1}header{border:2px solid #0f172a;padding:16px;margin-bottom:24px}h1{font-size:22px;margin:8px 0}h2{font-size:15px;border-bottom:2px solid #0f172a;padding-bottom:4px;margin-top:22px}h3{font-size:13px;margin-top:14px}p,li,td,th{font-size:12.5px}table{width:100%;border-collapse:collapse;margin:10px 0}th,td{border:1px solid #cbd5e1;padding:7px;text-align:left}.formula{border:1px solid #cbd5e1;padding:12px;margin:12px 0}.signatures{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.signature{border:1px solid #cbd5e1;padding:12px;text-align:center}@media print{body{background:#fff;padding:0}.document{max-width:none;border:0;padding:0}}
</style></head><body><main class="document"><header>
${sop.companyName ? '<div><strong>' + escapeHtml(sop.companyName) + '</strong></div>' : ''}${sop.companySubtitle ? '<div>' + textBlock(sop.companySubtitle) + '</div>' : ''}${sop.companyAddress ? '<div>' + textBlock(sop.companyAddress) + '</div>' : ''}<h1>${escapeHtml(sop.documentTitle || 'Untitled SOP')}</h1>
${sop.documentNumber ? '<div><strong>Document No.:</strong> ' + escapeHtml(sop.documentNumber) + '</div>' : ''}${sop.revisionNumber ? '<div><strong>Revision:</strong> ' + escapeHtml(sop.revisionNumber) + '</div>' : ''}${sop.effectiveDate ? '<div><strong>Effective:</strong> ' + escapeHtml(sop.effectiveDate) + '</div>' : ''}${sop.reviewDate ? '<div><strong>Review:</strong> ' + escapeHtml(sop.reviewDate) + '</div>' : ''}${sop.department ? '<div>' + escapeHtml(sop.department) + '</div>' : ''}${sop.isoStandard ? '<div>' + escapeHtml(sop.isoStandard) + '</div>' : ''}
</header>${section('Purpose', sop.purpose ? '<p>' + textBlock(sop.purpose) + '</p>' : '')}${section('Scope', sop.scope ? '<p>' + textBlock(sop.scope) + '</p>' : '')}${section('Definitions and Abbreviations', definitions ? '<ul>' + definitions + '</ul>' : '')}${section('Safety', safety ? '<ul>' + safety + '</ul>' : '')}${section('Equipment / Apparatus', apparatus ? '<table><thead><tr><th>Item</th><th>Specification</th><th>Tolerance</th></tr></thead><tbody>' + apparatus + '</tbody></table>' : '')}${section('Reagents / Materials', sop.reagents ? '<p>' + textBlock(sop.reagents) + '</p>' : '')}${section('Sample Handling / Preparation', sop.sampleHandling ? '<p>' + textBlock(sop.sampleHandling) + '</p>' : '')}${section('Procedure', stages)}${section('Calculations / Formulas', calculations)}${section('Quality / Control Notes', sop.qualityControl ? '<p>' + textBlock(sop.qualityControl) + '</p>' : '')}${section('References', references ? '<ul>' + references + '</ul>' : '')}${section('Revision History', history ? '<table><thead><tr><th>Rev</th><th>Date</th><th>Description</th><th>Prepared</th><th>Approved</th></tr></thead><tbody>' + history + '</tbody></table>' : '')}${section('Document Signatories', signatories ? '<div class="signatures">' + signatories + '</div>' : '')}</main></body></html>`;
}
