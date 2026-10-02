import React, { useState } from 'react';
import { StructuredSopDocument, generateStandaloneHtmlForSop } from '../data/sopParser';
import { Copy, Check, Download, X, Code2 } from 'lucide-react';

interface RawHtmlExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  sop: StructuredSopDocument;
}

export const RawHtmlExportModal: React.FC<RawHtmlExportModalProps> = ({ isOpen, onClose, sop }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');

  if (!isOpen) return null;

  const htmlCode = generateStandaloneHtmlForSop(sop);

  const handleCopy = () => {
    navigator.clipboard.writeText(htmlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleDownload = () => {
    const filename = `${sop.documentNumber.replace(/[^a-zA-Z0-9_-]/g, '_')}_${sop.documentTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}.html`;
    const blob = new Blob([htmlCode], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Standalone HTML SOP File ({sop.documentNumber})
              </h3>
              <p className="text-xs text-slate-500">
                Self-contained HTML file with embedded styles, printable layouts, and official formatting for {sop.documentTitle}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-200 p-0.5 rounded-lg text-xs font-medium">
              <button
                onClick={() => setActiveTab('code')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'code' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                HTML Source Code
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'preview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Standalone Preview
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-auto p-4 bg-slate-950 font-mono text-xs text-slate-200">
          {activeTab === 'code' ? (
            <pre className="overflow-x-auto whitespace-pre leading-relaxed select-all">
              {htmlCode}
            </pre>
          ) : (
            <div className="bg-white rounded-lg h-full overflow-hidden border border-slate-700">
              <iframe
                title="SOP HTML Preview"
                srcDoc={htmlCode}
                className="w-full h-full min-h-[500px] border-0"
              />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            Self-contained file &bull; Save as <code className="font-mono text-amber-700 font-bold">.html</code> to open in any web browser, email, or import into MS Word / Google Docs.
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied to Clipboard!' : 'Copy Raw HTML'}
            </button>

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download .html File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
