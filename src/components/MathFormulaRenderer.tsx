import React from 'react';

/**
 * Universal Mathematical Formula Parser & Renderer
 * Converts LaTeX formulas, fractions, subscripts, and plain math expressions
 * into clean, professional mathematical typography with real fraction bars.
 */

export interface MathSegment {
  type: 'text' | 'fraction';
  content?: string;
  numerator?: string;
  denominator?: string;
}

/**
 * Recursively cleans LaTeX escape sequences, braces, and math symbols
 */
export function cleanMathText(str: string): string {
  if (!str) return '';
  let cleaned = str
    .replace(/\$\$/g, '')
    .replace(/\\%/g, '%')
    .replace(/\\times/g, '×')
    .replace(/\\cdot/g, '·')
    .replace(/\\pm/g, '±')
    .replace(/\\Delta/g, 'Δ')
    .replace(/\\mu/g, 'μ')
    .replace(/\\left\s*\(/g, '(')
    .replace(/\\right\s*\)/g, ')')
    .replace(/\\left\s*\[/g, '[')
    .replace(/\\right\s*\]/g, ']')
    .replace(/\\left\s*\{/g, '{')
    .replace(/\\right\s*\}/g, '}')
    .replace(/\\_/g, '_');

  // Strip \text{...}, \mathrm{...}, \textbf{...} while preserving inner content
  cleaned = cleaned.replace(/\\(?:text|mathrm|textbf|mathbf|mathit)\s*\{([^{}]+)\}/g, '$1');
  // Second pass in case of nested text commands
  cleaned = cleaned.replace(/\\(?:text|mathrm|textbf|mathbf|mathit)\s*\{([^{}]+)\}/g, '$1');

  // Replace remaining stray backslashes before words
  cleaned = cleaned.replace(/\\([a-zA-Z]+)/g, '$1');
  // Replace minus signs with typographical minus
  cleaned = cleaned.replace(/\s*-\s*/g, ' − ');

  return cleaned.trim();
}

/**
 * Extracts braced content respecting nested braces like \text{...}
 */
function extractBracedBlock(str: string, startIndex: number): { content: string; endIndex: number } | null {
  let i = startIndex;
  while (i < str.length && (str[i] === ' ' || str[i] === '\t')) {
    i++;
  }
  if (i >= str.length || str[i] !== '{') return null;

  const contentStart = i + 1;
  let depth = 1;
  i++;

  while (i < str.length && depth > 0) {
    if (str[i] === '{') depth++;
    else if (str[i] === '}') depth--;
    i++;
  }

  if (depth === 0) {
    return { content: str.substring(contentStart, i - 1), endIndex: i };
  }

  return null;
}

/**
 * Robust formula parser that splits LHS = RHS and handles multiple \frac and plain terms
 */
export function parseFormulaSegments(rawFormula: string): { lhs: string; rhsSegments: MathSegment[] } {
  const cleaned = rawFormula.replace(/\$\$/g, '').trim();

  // Split into LHS = RHS if equals sign exists
  let lhs = '';
  let rhs = cleaned;

  if (cleaned.includes('=')) {
    const eqIndex = cleaned.indexOf('=');
    lhs = cleanMathText(cleaned.substring(0, eqIndex).trim());
    rhs = cleaned.substring(eqIndex + 1).trim();
  }

  const segments: MathSegment[] = [];
  let cursor = 0;

  while (cursor < rhs.length) {
    const fracIdx = rhs.indexOf('\\frac', cursor);

    if (fracIdx === -1) {
      // No more fractions, push remaining text
      const remaining = rhs.substring(cursor).trim();
      if (remaining) {
        // Check if remaining has plain division like "(A) / (B)" or "A / B"
        if (remaining.includes('/') && !remaining.includes('(') && segments.length === 0) {
          const slashParts = remaining.split('/');
          segments.push({
            type: 'fraction',
            numerator: cleanMathText(slashParts[0]),
            denominator: cleanMathText(slashParts[1])
          });
        } else {
          segments.push({ type: 'text', content: cleanMathText(remaining) });
        }
      }
      break;
    }

    // Add any text before \frac
    if (fracIdx > cursor) {
      const textBefore = rhs.substring(cursor, fracIdx).trim();
      if (textBefore) {
        segments.push({ type: 'text', content: cleanMathText(textBefore) });
      }
    }

    // Extract Numerator
    const numBlock = extractBracedBlock(rhs, fracIdx + 5);
    if (!numBlock) {
      // Incomplete \frac, advance past
      cursor = fracIdx + 5;
      continue;
    }

    // Extract Denominator
    const denBlock = extractBracedBlock(rhs, numBlock.endIndex);
    if (!denBlock) {
      // If denominator missing, render numerator as standalone
      segments.push({
        type: 'fraction',
        numerator: cleanMathText(numBlock.content),
        denominator: '1'
      });
      cursor = numBlock.endIndex;
      continue;
    }

    // Both numerator and denominator found!
    segments.push({
      type: 'fraction',
      numerator: cleanMathText(numBlock.content),
      denominator: cleanMathText(denBlock.content)
    });

    cursor = denBlock.endIndex;
  }

  // Fallback if nothing was parsed
  if (segments.length === 0) {
    segments.push({ type: 'text', content: cleanMathText(rhs) });
  }

  return { lhs, rhsSegments: segments };
}

/**
 * Format string with sub-script typography
 */
export function renderFormattedVariables(text: string): React.ReactNode {
  // Regex to match subscripts like M_1, W_2, BOD_5, M_{1}, W_{sample}, R_1
  const parts = text.split(/([a-zA-Z]+_[0-9a-zA-Z]+|[a-zA-Z]+_\{[0-9a-zA-Z]+\})/g);

  return parts.map((part, idx) => {
    const subMatch = part.match(/^([a-zA-Z]+)_\{?([0-9a-zA-Z]+)\}?$/);
    if (subMatch) {
      return (
        <span key={idx} className="font-semibold inline-block">
          <span className="italic">{subMatch[1]}</span>
          <sub className="text-[0.7em] font-bold -bottom-0.5 relative">{subMatch[2]}</sub>
        </span>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

/**
 * React Component to render math formulas
 */
export const MathFormulaRenderer: React.FC<{ formula: string; className?: string }> = ({
  formula,
  className = ''
}) => {
  const { lhs, rhsSegments } = parseFormulaSegments(formula);

  return (
    <div className={`my-2 p-3 bg-white border border-slate-300 rounded-lg shadow-2xs text-center flex flex-wrap items-center justify-center gap-2 text-slate-900 ${className}`}>
      {/* LHS (Variable / Name) */}
      {lhs && (
        <div className="flex items-center gap-1.5 font-bold text-sm md:text-base font-serif text-slate-900">
          <span>{renderFormattedVariables(lhs)}</span>
          <span className="font-sans font-extrabold text-amber-700 mx-1">=</span>
        </div>
      )}

      {/* RHS Elements */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-sm md:text-base">
        {rhsSegments.map((seg, idx) => {
          if (seg.type === 'fraction') {
            return (
              <div 
                key={idx} 
                className="inline-flex flex-col items-center justify-center align-middle mx-1 py-1"
              >
                {/* Numerator */}
                <div className="border-b-2 border-slate-900 px-2 pb-0.5 font-bold text-center text-sm md:text-base font-mono tracking-tight text-slate-900">
                  {renderFormattedVariables(seg.numerator || '')}
                </div>
                {/* Denominator */}
                <div className="pt-0.5 px-2 font-bold text-center text-sm md:text-base font-mono tracking-tight text-slate-900">
                  {renderFormattedVariables(seg.denominator || '')}
                </div>
              </div>
            );
          }

          // Plain text / operators (+ - ×)
          return (
            <span key={idx} className="font-bold text-sm md:text-base font-serif px-0.5 text-slate-800">
              {renderFormattedVariables(seg.content || '')}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Generate semantic HTML with inline CSS for standalone exported HTML files
 */
export function formatFormulaToHtml(rawFormula: string): string {
  const { lhs, rhsSegments } = parseFormulaSegments(rawFormula);

  const formatTextHtml = (text: string) => {
    return text.replace(/([a-zA-Z]+)_\{?([0-9a-zA-Z]+)\}?/g, '<em>$1</em><sub>$2</sub>');
  };

  let html = `<div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 8px; font-size: 15px; margin: 10px 0; padding: 12px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px;">`;

  if (lhs) {
    html += `<span style="font-weight: 700; font-family: Georgia, serif; color: #0f172a;">${formatTextHtml(lhs)}</span> <span style="font-weight: 800; color: #b45309; margin: 0 4px;">=</span> `;
  }

  rhsSegments.forEach(seg => {
    if (seg.type === 'fraction') {
      html += `
        <span style="display: inline-flex; flex-direction: column; align-items: center; vertical-align: middle; margin: 0 4px;">
          <span style="border-bottom: 2px solid #0f172a; padding: 0 6px 2px 6px; font-weight: 700; font-family: monospace; text-align: center; color: #0f172a;">${formatTextHtml(seg.numerator || '')}</span>
          <span style="padding: 2px 6px 0 6px; font-weight: 700; font-family: monospace; text-align: center; color: #0f172a;">${formatTextHtml(seg.denominator || '')}</span>
        </span>
      `;
    } else {
      html += `<span style="font-weight: 700; font-family: Georgia, serif; color: #1e293b; margin: 0 3px;">${formatTextHtml(seg.content || '')}</span>`;
    }
  });

  html += `</div>`;
  return html;
}
