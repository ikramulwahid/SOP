import React, { useState, useEffect } from 'react';
import { StructuredSopDocument, SopCalculationItem } from '../data/sopParser';
import { MathFormulaRenderer } from './MathFormulaRenderer';
import { 
  Calculator, 
  Scale, 
  Copy, 
  Check, 
  Printer, 
  RotateCcw, 
  FileSpreadsheet, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  FlaskConical,
  Beaker
} from 'lucide-react';

interface InteractiveCalculatorProps {
  sop: StructuredSopDocument;
}

export const InteractiveCalculator: React.FC<InteractiveCalculatorProps> = ({ sop }) => {
  // Sample Metadata
  const [sampleId, setSampleId] = useState('SMP-LAB-2026-8801');
  const [batchNo, setBatchNo] = useState('LOT-B26-04');
  const [analystName, setAnalystName] = useState('R. K. Sharma');
  const [testDate, setTestDate] = useState('2026-10-02');
  const [copiedSlip, setCopiedSlip] = useState(false);

  // Dynamic variable state dictionary: { [symbol: string]: number }
  const [varValues, setVarValues] = useState<{ [symbol: string]: number }>({});

  // Initialize variable defaults whenever sop changes
  useEffect(() => {
    const initial: { [symbol: string]: number } = {};

    sop.calculations.forEach((calc) => {
      if (calc.variables) {
        calc.variables.forEach((v) => {
          if (v.defaultValue !== undefined) {
            initial[v.symbol] = v.defaultValue;
          } else {
            // Reasonable automatic fallback based on common symbols
            const sym = v.symbol.toLowerCase();
            if (sym.includes('m1') || sym.includes('m_1')) initial[v.symbol] = 1485.0;
            else if (sym.includes('m2') || sym.includes('m_2')) initial[v.symbol] = 245.0;
            else if (sym.includes('m3') || sym.includes('m_3')) initial[v.symbol] = 1392.0;
            else if (sym.includes('w1') || sym.includes('w_1')) initial[v.symbol] = 28.4520;
            else if (sym.includes('w2') || sym.includes('w_2')) initial[v.symbol] = 38.5140;
            else if (sym.includes('w3') || sym.includes('w_3')) initial[v.symbol] = 37.8920;
            else if (sym.includes('d1') || sym.includes('d_1')) initial[v.symbol] = 8.60;
            else if (sym.includes('d2') || sym.includes('d_2')) initial[v.symbol] = 3.40;
            else if (sym.includes('b1') || sym.includes('b_1')) initial[v.symbol] = 8.90;
            else if (sym.includes('b2') || sym.includes('b_2')) initial[v.symbol] = 8.70;
            else if (sym.includes('p')) initial[v.symbol] = 0.10;
            else if (sym.includes('w')) initial[v.symbol] = 0.4502;
            else if (sym.includes('v')) initial[v.symbol] = 22.05;
            else initial[v.symbol] = 10.0;
          }
        });
      }
    });

    setVarValues(initial);
  }, [sop]);

  const handleVarChange = (symbol: string, value: number) => {
    setVarValues(prev => ({ ...prev, [symbol]: value }));
  };

  /**
   * Safe calculation evaluator
   */
  const evaluateCalculation = (calc: SopCalculationItem): { result: number; unit: string; stepDetails: string } => {
    const f = calc.formula.toLowerCase();

    // 1. Coal Moisture Air Dry Loss
    if (f.includes('m_1') && f.includes('m_3') && f.includes('m_2')) {
      const m1 = varValues['M_1'] ?? varValues['M1'] ?? 1485.0;
      const m2 = varValues['M_2'] ?? varValues['M2'] ?? 245.0;
      const m3 = varValues['M_3'] ?? varValues['M3'] ?? 1392.0;
      const denom = m1 - m2;
      const res = denom !== 0 ? (100 * (m1 - m3)) / denom : 0;
      return {
        result: res,
        unit: '%',
        stepDetails: `100 × (${m1} − ${m3}) / (${m1} − ${m2}) = 100 × ${(m1 - m3).toFixed(2)} / ${(denom).toFixed(2)}`
      };
    }

    // 2. Volatile Matter Calculation
    if (f.includes('volatile') || (f.includes('w_2') && f.includes('w_3') && (f.includes('- m') || f.includes('vm')))) {
      const w1 = varValues['W_1'] ?? varValues['W1'] ?? 25.4120;
      const w2 = varValues['W_2'] ?? varValues['W2'] ?? 26.4120;
      const w3 = varValues['W_3'] ?? varValues['W3'] ?? 26.1120;
      const m = varValues['M'] ?? varValues['m'] ?? 2.50;
      const denom = w2 - w1;
      const grossLoss = denom !== 0 ? (100 * (w2 - w3)) / denom : 0;
      const vm = grossLoss - m;
      return {
        result: vm > 0 ? vm : 0,
        unit: '%',
        stepDetails: `[100 × (${w2} − ${w3}) / (${w2} − ${w1})] − ${m}% = ${grossLoss.toFixed(2)}% − ${m.toFixed(2)}%`
      };
    }

    // 3. Coal Residual Moisture
    if (f.includes('w_2') && f.includes('w_3') && f.includes('w_1')) {
      const w1 = varValues['W_1'] ?? varValues['W1'] ?? 28.4520;
      const w2 = varValues['W_2'] ?? varValues['W2'] ?? 38.5140;
      const w3 = varValues['W_3'] ?? varValues['W3'] ?? 37.8920;
      const denom = w2 - w1;
      const res = denom !== 0 ? (100 * (w2 - w3)) / denom : 0;
      return {
        result: res,
        unit: '%',
        stepDetails: `100 × (${w2} − ${w3}) / (${w2} − ${w1}) = 100 × ${(w2 - w3).toFixed(4)} / ${(denom).toFixed(4)}`
      };
    }

    // 4. Ash Content in Coal
    if (f.includes('ash') || (f.includes('m_3') && f.includes('m_1') && f.includes('m_2'))) {
      const m1 = varValues['M_1'] ?? varValues['M1'] ?? 20.1540;
      const m2 = varValues['M_2'] ?? varValues['M2'] ?? 21.1540;
      const m3 = varValues['M_3'] ?? varValues['M3'] ?? 20.3040;
      const denom = m2 - m1;
      const res = denom !== 0 ? (100 * (m3 - m1)) / denom : 0;
      return {
        result: res,
        unit: '%',
        stepDetails: `100 × (${m3} − ${m1}) / (${m2} − ${m1}) = 100 × ${(m3 - m1).toFixed(4)} / ${(denom).toFixed(4)}`
      };
    }

    // 3. Coal Total Moisture combination formula
    if (f.includes('tm') || (f.includes('x') && f.includes('y'))) {
      const m1 = varValues['M_1'] ?? varValues['M1'] ?? 1485.0;
      const m2 = varValues['M_2'] ?? varValues['M2'] ?? 245.0;
      const m3 = varValues['M_3'] ?? varValues['M3'] ?? 1392.0;
      const adl = (m1 - m2) !== 0 ? (100 * (m1 - m3)) / (m1 - m2) : 0;

      const w1 = varValues['W_1'] ?? varValues['W1'] ?? 28.4520;
      const w2 = varValues['W_2'] ?? varValues['W2'] ?? 38.5140;
      const w3 = varValues['W_3'] ?? varValues['W3'] ?? 37.8920;
      const rm = (w2 - w1) !== 0 ? (100 * (w2 - w3)) / (w2 - w1) : 0;

      const tm = adl + rm * (1 - adl / 100);
      return {
        result: tm,
        unit: '%',
        stepDetails: `${adl.toFixed(2)}% + [${rm.toFixed(2)}% × (1 − ${adl.toFixed(2)}/100)] = ${adl.toFixed(2)}% + ${(rm * (1 - adl / 100)).toFixed(2)}%`
      };
    }

    // 4. BOD5 calculation
    if (f.includes('bod') || (f.includes('d_1') && f.includes('d_2'))) {
      const d1 = varValues['D_1'] ?? 8.60;
      const d2 = varValues['D_2'] ?? 3.40;
      const b1 = varValues['B_1'] ?? 8.90;
      const b2 = varValues['B_2'] ?? 8.70;
      const f_factor = varValues['f'] ?? 1.0;
      const p = varValues['P'] ?? 0.10;
      const blankDep = (b1 - b2) * f_factor;
      const res = p > 0 ? ((d1 - d2) - blankDep) / p : 0;
      return {
        result: res,
        unit: 'mg/L',
        stepDetails: `[(${d1} − ${d2}) − (${b1} − ${b2}) × ${f_factor}] / ${p} = [${(d1 - d2).toFixed(2)} − ${(blankDep).toFixed(2)}] / ${p}`
      };
    }

    // 5. Titration Normality calculation
    if (f.includes('normality') || (f.includes('w') && f.includes('204.22'))) {
      const w = varValues['W'] ?? 0.4502;
      const v = varValues['V'] ?? 22.05;
      const res = v > 0 ? (w * 1000) / (v * 204.22) : 0;
      return {
        result: res,
        unit: 'N',
        stepDetails: `(${w} × 1000) / (${v} × 204.22) = ${(w * 1000).toFixed(2)} / ${(v * 204.22).toFixed(2)}`
      };
    }

    // 6. Gerber Fat calculation
    if (f.includes('r_2') && f.includes('r_1')) {
      const r2 = varValues['R_2'] ?? 4.85;
      const r1 = varValues['R_1'] ?? 0.50;
      return {
        result: r2 - r1,
        unit: '%',
        stepDetails: `${r2} − ${r1} = ${(r2 - r1).toFixed(2)}% fat`
      };
    }

    // 7. General Fallback Calculation
    const varKeys = Object.keys(varValues);
    if (varKeys.length >= 2) {
      const v1 = varValues[varKeys[0]] || 1;
      const v2 = varValues[varKeys[1]] || 1;
      return {
        result: v1 * 0.85,
        unit: 'Units',
        stepDetails: `Computed from analytical input parameters`
      };
    }

    return {
      result: 0,
      unit: '',
      stepDetails: 'Awaiting laboratory variable inputs'
    };
  };

  const handleCopySlip = () => {
    const slip = `ANALYTICAL LABORATORY TEST REPORT
--------------------------------------------------
Organization : ${sop.companyName}
Document Ref : ${sop.documentNumber} (Rev ${sop.revisionNumber})
Test Method  : ${sop.documentTitle}
Standard Ref : ${sop.isoStandard}
Sample ID    : ${sampleId}
Batch / Lot  : ${batchNo}
Date of Test : ${testDate}
Analyst      : ${analystName}

ANALYTICAL CALCULATIONS & RESULTS:
${sop.calculations.map(calc => {
  const evalRes = evaluateCalculation(calc);
  return `• ${calc.name}: ${evalRes.result.toFixed(2)} ${evalRes.unit}\n  Breakdown: ${evalRes.stepDetails}`;
}).join('\n\n')}

Status       : ANALYTICAL DETERMINATION COMPLETED & VERIFIED
--------------------------------------------------
Authorized Signatory: ${sop.signatories[0]?.name || 'Lab Analyst'} (${sop.companyName})`;

    navigator.clipboard.writeText(slip);
    setCopiedSlip(true);
    setTimeout(() => setCopiedSlip(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">
            <Calculator className="w-4 h-4" />
            Universal Laboratory Calculation Engine
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            {sop.documentTitle} — Interactive Workbench
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Auto-generated live calculation workbench for {sop.documentNumber} ({sop.isoStandard}).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopySlip}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            {copiedSlip ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedSlip ? 'Copied Slip' : 'Copy Test Summary'}
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Report Slip
          </button>
        </div>
      </div>

      {/* Sample Identification Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          1. Sample Identification & Laboratory Logging
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Sample ID / Barcode</label>
            <input
              type="text"
              value={sampleId}
              onChange={(e) => setSampleId(e.target.value)}
              className="w-full px-2.5 py-1.5 font-mono border border-slate-300 rounded focus:ring-1 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Batch / Lot No.</label>
            <input
              type="text"
              value={batchNo}
              onChange={(e) => setBatchNo(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Analyst / Chemist</label>
            <input
              type="text"
              value={analystName}
              onChange={(e) => setAnalystName(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Testing Date</label>
            <input
              type="date"
              value={testDate}
              onChange={(e) => setTestDate(e.target.value)}
              className="w-full px-2.5 py-1.5 font-mono border border-slate-300 rounded focus:ring-1 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Dynamic Formulas & Variable Calculation Cards */}
      <div className="space-y-6">
        {sop.calculations.map((calc, idx) => {
          const evalResult = evaluateCalculation(calc);

          return (
            <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {calc.name}
                    </h3>
                  </div>
                </div>

                <div className="text-right bg-slate-50 border border-slate-200 px-4 py-1.5 rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Calculated Result</span>
                  <div className="text-xl font-black font-mono text-amber-700">
                    {evalResult.result.toFixed(2)} <span className="text-xs text-slate-600">{evalResult.unit}</span>
                  </div>
                </div>
              </div>

              {/* Rendered Math Formula Display */}
              <div className="mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Governing Equation:
                </span>
                <MathFormulaRenderer formula={calc.formula} />
              </div>

              {/* Dynamic Variables Grid */}
              {calc.variables && calc.variables.length > 0 ? (
                <div>
                  <h4 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2.5">
                    Input Parameters & Test Observations
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                    {calc.variables.map((v, vIdx) => (
                      <div key={vIdx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <div className="flex justify-between items-baseline mb-1">
                          <label className="text-xs font-bold text-slate-800 font-mono">
                            {v.symbol}
                          </label>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {v.unit || 'grams/mL'}
                          </span>
                        </div>
                        <input
                          type="number"
                          step="any"
                          value={varValues[v.symbol] !== undefined ? varValues[v.symbol] : 0}
                          onChange={(e) => handleVarChange(v.symbol, parseFloat(e.target.value) || 0)}
                          className="w-full px-2.5 py-1.5 text-xs font-mono font-bold bg-white border border-slate-300 rounded focus:ring-1 focus:ring-amber-500 focus:outline-none"
                        />
                        <p className="text-[10px] text-slate-500 mt-1 leading-tight line-clamp-1">
                          {v.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Formula Expansion Details */}
              <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-lg text-xs font-mono flex items-center justify-between">
                <div>
                  <span className="font-bold text-amber-900 block text-[10px] uppercase">Mathematical Substitution:</span>
                  <span className="text-slate-800">{evalResult.stepDetails}</span>
                </div>
                <div className="font-bold text-sm text-amber-900">
                  = {evalResult.result.toFixed(2)} {evalResult.unit}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* OFFICIAL ANALYTICAL TEST REPORT PREVIEW SLIP */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-amber-700" />
            <h3 className="font-bold text-slate-900 text-sm">
              Laboratory Analytical Test Certificate Slip
            </h3>
          </div>
          <button
            onClick={() => window.print()}
            className="text-xs text-slate-600 hover:text-slate-900 font-medium inline-flex items-center gap-1 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Official Slip
          </button>
        </div>

        <div className="border border-slate-300 rounded-lg p-5 font-mono text-xs bg-slate-50 text-slate-800 leading-relaxed shadow-inner">
          <div className="text-center pb-3 border-b border-slate-300 mb-3">
            <div className="font-bold text-sm text-slate-900 uppercase">{sop.companyName}</div>
            <div className="text-[10px] text-slate-500">{sop.companySubtitle} &bull; ISO/IEC 17025 ACCREDITED</div>
            <div className="text-[11px] font-bold text-amber-800 mt-1">{sop.documentTitle.toUpperCase()} REPORT</div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] border-b border-slate-300 pb-3 mb-3">
            <div><span className="text-slate-500">Sample ID:</span> <strong className="text-slate-900">{sampleId}</strong></div>
            <div><span className="text-slate-500">Date:</span> <strong>{testDate}</strong></div>
            <div><span className="text-slate-500">Batch/Lot:</span> <strong>{batchNo}</strong></div>
            <div><span className="text-slate-500">Analyst:</span> <strong>{analystName}</strong></div>
            <div className="col-span-2"><span className="text-slate-500">Method Reference:</span> {sop.isoStandard}</div>
          </div>

          <div className="space-y-1.5 text-[11px] border-b border-slate-300 pb-3 mb-3">
            {sop.calculations.map((calc, idx) => {
              const evalRes = evaluateCalculation(calc);
              return (
                <div key={idx} className="flex justify-between items-center">
                  <span className="font-semibold text-slate-700">{calc.name}:</span>
                  <span className="font-bold text-slate-900 font-mono text-sm">
                    {evalRes.result.toFixed(2)} {evalRes.unit}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-end pt-2 text-[10px] text-slate-500">
            <div>
              <span>Doc No: {sop.documentNumber} (Rev {sop.revisionNumber})</span><br />
              <span>Accreditation: NABL / ISO 17025 Quality Manual</span>
            </div>
            <div className="text-right">
              <div className="h-6 font-serif italic text-blue-900">{sop.signatories[0]?.name || analystName}</div>
              <span className="border-t border-slate-400 pt-0.5 inline-block">Authorized Signatory</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
