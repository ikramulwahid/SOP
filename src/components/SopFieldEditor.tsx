import React, { useState } from 'react';
import { StructuredSopDocument } from '../data/sopParser';
import { 
  Building2, 
  FileText, 
  Plus, 
  Trash2, 
  Check, 
  RotateCcw,
  Wrench,
  ShieldCheck,
  ListChecks,
  Scale
} from 'lucide-react';

interface SopFieldEditorProps {
  sop: StructuredSopDocument;
  onSaveSop: (updated: StructuredSopDocument) => void;
  onNavigateToView: () => void;
}

export const SopFieldEditor: React.FC<SopFieldEditorProps> = ({
  sop,
  onSaveSop,
  onNavigateToView
}) => {
  const [formData, setFormData] = useState<StructuredSopDocument>(sop);
  const [savedAlert, setSavedAlert] = useState(false);

  const handleFieldChange = (field: keyof StructuredSopDocument, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSaveSop(formData);
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 2500);
  };

  // Apparatus helpers
  const handleApparatusChange = (index: number, field: string, value: string) => {
    const list = [...formData.apparatus];
    list[index] = { ...list[index], [field]: value };
    setFormData(prev => ({ ...prev, apparatus: list }));
  };

  const handleAddApparatus = () => {
    setFormData(prev => ({
      ...prev,
      apparatus: [...prev.apparatus, { name: '', spec: '', tolerance: '' }]
    }));
  };

  const handleRemoveApparatus = (index: number) => {
    setFormData(prev => ({
      ...prev,
      apparatus: prev.apparatus.filter((_, i) => i !== index)
    }));
  };

  // Signatories helpers
  const handleSignatoryChange = (index: number, field: string, value: string) => {
    const list = [...formData.signatories];
    list[index] = { ...list[index], [field]: value };
    setFormData(prev => ({ ...prev, signatories: list }));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Interactive Visual Field Editor
          </h2>
          <p className="text-xs text-slate-500">
            Customize document control IDs, company details, equipment tolerances, and signatories directly.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedAlert && (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <Check className="w-4 h-4" /> Changes Applied!
            </span>
          )}
          <button
            onClick={handleSave}
            className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            Apply & Save
          </button>
          <button
            onClick={onNavigateToView}
            className="px-3.5 py-2 text-xs font-bold text-slate-800 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            View Document &rarr;
          </button>
        </div>
      </div>

      {/* Document Control Metadata Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
          <Building2 className="w-4 h-4 text-amber-700" />
          1. Organization & Document Control Header
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Company / Organization Name</label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => handleFieldChange('companyName', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold focus:ring-1 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Division / Subtitle</label>
            <input
              type="text"
              value={formData.companySubtitle}
              onChange={(e) => handleFieldChange('companySubtitle', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">SOP Document Title</label>
            <input
              type="text"
              value={formData.documentTitle}
              onChange={(e) => handleFieldChange('documentTitle', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-amber-900 focus:ring-1 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Document Number</label>
            <input
              type="text"
              value={formData.documentNumber}
              onChange={(e) => handleFieldChange('documentNumber', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold focus:ring-1 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Revision</label>
              <input
                type="text"
                value={formData.revisionNumber}
                onChange={(e) => handleFieldChange('revisionNumber', e.target.value)}
                className="w-full px-2.5 py-2 border border-slate-300 rounded-lg font-mono text-center focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Effective Date</label>
              <input
                type="text"
                value={formData.effectiveDate}
                onChange={(e) => handleFieldChange('effectiveDate', e.target.value)}
                className="w-full px-2.5 py-2 border border-slate-300 rounded-lg font-mono text-center focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Page Count</label>
              <input
                type="text"
                value={formData.pageCount}
                onChange={(e) => handleFieldChange('pageCount', e.target.value)}
                className="w-full px-2.5 py-2 border border-slate-300 rounded-lg font-mono text-center focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Department</label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => handleFieldChange('department', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Method Standard Reference</label>
            <input
              type="text"
              value={formData.isoStandard}
              onChange={(e) => handleFieldChange('isoStandard', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Purpose & Scope */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-4 h-4 text-amber-700" />
          2. Purpose & Scope
        </h3>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">1.0 Purpose</label>
            <textarea
              rows={3}
              value={formData.purpose}
              onChange={(e) => handleFieldChange('purpose', e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">2.0 Scope</label>
            <textarea
              rows={3}
              value={formData.scope}
              onChange={(e) => handleFieldChange('scope', e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Apparatus List Editor */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Wrench className="w-4 h-4 text-amber-700" />
            3. Apparatus & Equipment List ({formData.apparatus.length})
          </h3>
          <button
            onClick={handleAddApparatus}
            className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-900 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Apparatus Row
          </button>
        </div>

        <div className="space-y-2">
          {formData.apparatus.map((item, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
              <div className="col-span-4">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => handleApparatusChange(idx, 'name', e.target.value)}
                  placeholder="Apparatus Name"
                  className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded font-semibold"
                />
              </div>
              <div className="col-span-5">
                <input
                  type="text"
                  value={item.spec}
                  onChange={(e) => handleApparatusChange(idx, 'spec', e.target.value)}
                  placeholder="Specification / Range"
                  className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-[11px]"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="text"
                  value={item.tolerance || ''}
                  onChange={(e) => handleApparatusChange(idx, 'tolerance', e.target.value)}
                  placeholder="Tolerance"
                  className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded font-mono text-[11px]"
                />
              </div>
              <div className="col-span-1 text-right">
                <button
                  onClick={() => handleRemoveApparatus(idx)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Signatories Editor */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-700" />
          4. Authorization & Signatories
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {formData.signatories.map((sig, idx) => (
            <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <span className="font-bold text-slate-700 block uppercase text-[10px]">{sig.role}</span>
              <input
                type="text"
                value={sig.name}
                onChange={(e) => handleSignatoryChange(idx, 'name', e.target.value)}
                placeholder="Name"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-semibold text-xs"
              />
              <input
                type="text"
                value={sig.designation}
                onChange={(e) => handleSignatoryChange(idx, 'designation', e.target.value)}
                placeholder="Designation"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-slate-600 text-xs"
              />
              <input
                type="text"
                value={sig.date}
                onChange={(e) => handleSignatoryChange(idx, 'date', e.target.value)}
                placeholder="Date"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-mono text-xs text-slate-500"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Save Button bottom */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          onClick={handleSave}
          className="px-6 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          Save All Changes
        </button>
      </div>
    </div>
  );
};
