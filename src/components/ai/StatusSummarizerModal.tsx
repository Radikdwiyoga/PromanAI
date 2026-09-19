import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { 
  FileText, 
  X, 
  Sparkles, 
  Copy, 
  Check, 
  RefreshCw, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  FolderKanban,
  FileDown,
  Printer,
  ListOrdered
} from 'lucide-react';
import { generateLiveExecutiveSummary } from '../../services/geminiService';
import { ExecutiveSummary } from '../../types';

export const StatusSummarizerModal: React.FC = () => {
  const {
    isSummaryModalOpen,
    setIsSummaryModalOpen,
    executiveSummary: defaultSummary,
    currentProject,
    projects,
    tasks,
    users,
    showToast,
    systemSettings,
  } = useProject();

  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [summaryData, setSummaryData] = useState<ExecutiveSummary>(defaultSummary);

  useEffect(() => {
    if (isSummaryModalOpen) {
      setSelectedProjectId('all');
      generateSummaryForScope('all');
    }
  }, [isSummaryModalOpen]);

  const getScopeTasks = (scopeId: string) => {
    if (scopeId === 'all') return tasks;
    return tasks.filter(t => t.projectId === scopeId);
  };

  const getScopeProjectName = (scopeId: string) => {
    if (scopeId === 'all') return 'Semua Project (Global Enterprise Portfolio)';
    const found = projects.find(p => p.id === scopeId);
    return found ? found.name : currentProject.name;
  };

  const generateSummaryForScope = async (scopeId: string) => {
    setIsGenerating(true);
    const scopeTasks = getScopeTasks(scopeId);
    const scopeProj = scopeId === 'all' 
      ? { ...currentProject, name: 'Semua Project (Global Enterprise Portfolio)' } 
      : projects.find(p => p.id === scopeId) || currentProject;

    try {
      const result = await generateLiveExecutiveSummary(scopeTasks, users, scopeProj);
      setSummaryData(result);
    } catch (e) {
      console.error('Failed generating summary:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleScopeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newScope = e.target.value;
    setSelectedProjectId(newScope);
    generateSummaryForScope(newScope);
  };

  if (!isSummaryModalOpen) return null;

  const currentScopeTitle = getScopeProjectName(selectedProjectId);

  const getPlainText = () => {
    return `=====================================================
${systemSettings.companyName.toUpperCase()} - LAPORAN EKSEKUTIF PROYEK
=====================================================
Cakupan Proyek : ${currentScopeTitle}
Headline       : ${summaryData.headline}
Tanggal Rilis  : ${summaryData.generatedAt || new Date().toLocaleDateString('id-ID')}
Status Global  : ${summaryData.overallHealth} (${summaryData.completionRate}% Selesai)

RINGKASAN EKSEKUTIF UTAMA:
-----------------------------------------------------
${summaryData.stakeholderBriefForBudi}

PENCAPAIAN UTAMA:
${summaryData.keyHighlights.map((h, i) => `${i + 1}. ${h}`).join('\n')}

HAMBATAN & MITIGASI RISIKO:
${summaryData.bottlenecksAndRisks.map((b, i) => `${i + 1}. ${b}`).join('\n')}

REKOMENDASI TINDAK LANJUT:
${summaryData.recommendationsForAlex.map((r, i) => `${i + 1}. ${r}`).join('\n')}
=====================================================`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getPlainText());
    setCopied(true);
    showToast('Laporan eksekutif berhasil disalin ke clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadText = () => {
    const text = getPlainText();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Laporan-Eksekutif-${selectedProjectId}-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('File teks laporan berhasil diunduh!', 'success');
  };

  const handlePrintPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast('Pop-up terblokir. Izinkan pop-up untuk mengunduh PDF.', 'warning');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Laporan Eksekutif ProMan - ${currentScopeTitle}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            line-height: 1.6;
            margin: 40px;
            background: #ffffff;
          }
          .header {
            border-bottom: 2px solid #f97316;
            padding-bottom: 15px;
            margin-bottom: 25px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .brand {
            font-size: 24px;
            font-weight: 800;
            color: #0f172a;
          }
          .brand span { color: #f97316; }
          .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: bold;
            background: ${summaryData.overallHealth === 'On Track' ? '#ecfdf5' : '#fffbeb'};
            color: ${summaryData.overallHealth === 'On Track' ? '#047857' : '#b45309'};
            border: 1px solid ${summaryData.overallHealth === 'On Track' ? '#a7f3d0' : '#fde68a'};
          }
          h1 { font-size: 18px; margin-top: 0; color: #1e293b; }
          h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-top: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
          p { font-size: 13px; color: #334155; }
          ul { font-size: 13px; color: #334155; padding-left: 20px; }
          li { margin-bottom: 5px; }
          .footer {
            margin-top: 40px;
            padding-top: 15px;
            border-top: 1px solid #e2e8f0;
            font-size: 11px;
            color: #94a3b8;
            display: flex;
            justify-content: space-between;
          }
          @media print {
            body { margin: 20mm; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">Pro<span>Man</span> :: Laporan Eksekutif Proyek</div>
            <div style="font-size: 12px; color: #64748b;">${systemSettings.companyName}</div>
          </div>
          <div style="text-align: right;">
            <div class="badge">${summaryData.overallHealth} (${summaryData.completionRate}% Selesai)</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Tanggal: ${summaryData.generatedAt || new Date().toLocaleDateString('id-ID')}</div>
          </div>
        </div>

        <h1>${summaryData.headline}</h1>
        <p style="font-weight: 600; color: #475569;">Cakupan Proyek: ${currentScopeTitle}</p>

        <h2>Ringkasan Eksekutif Utama</h2>
        <p>${summaryData.stakeholderBriefForBudi}</p>

        <h2>Pencapaian Utama (Key Highlights)</h2>
        <ul>
          ${summaryData.keyHighlights.map(h => `<li>${h}</li>`).join('')}
        </ul>

        <h2>Hambatan &amp; Mitigasi Risiko</h2>
        <ul>
          ${summaryData.bottlenecksAndRisks.map(b => `<li>${b}</li>`).join('')}
        </ul>

        <h2>Rekomendasi Tindak Lanjut</h2>
        <ul>
          ${summaryData.recommendationsForAlex.map(r => `<li>${r}</li>`).join('')}
        </ul>

        <div class="footer">
          <span>Digenerate otomatis menggunakan ProMan AI Engine</span>
          <span>Sistem Manajemen Proyek Enterprise</span>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    showToast('Membuka dialog cetak / Simpan PDF...', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in text-slate-800 dark:text-slate-100">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-orange-50 dark:from-slate-950 via-white dark:via-slate-900 to-slate-50 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-navy-900 flex items-center justify-center shadow-lg shadow-orange-500/25">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Auto-Status Summarization</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 dark:bg-emerald-600/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-500/30 font-bold">
                  ProMan AI Engine
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Ringkasan status proyek otomatis terpadu</p>
            </div>
          </div>
          <button
            onClick={() => setIsSummaryModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Scope Selector: Semua Project vs Specific Project */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-emerald-600 shrink-0" />
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Pilih Cakupan Proyek:
              </label>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedProjectId}
                onChange={handleScopeChange}
                disabled={isGenerating}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-orange-500 shadow-xs cursor-pointer"
              >
                <option value="all">Semua Project (Global Enterprise Portfolio)</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.healthScore}% health)
                  </option>
                ))}
              </select>

              <button
                onClick={() => generateSummaryForScope(selectedProjectId)}
                disabled={isGenerating}
                className="p-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition disabled:opacity-50"
                title="Generate Ulang dengan AI"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Top Banner Status */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-500/20 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[10px] text-emerald-700 dark:text-emerald-400 uppercase font-bold tracking-wider">
                Cakupan: {currentScopeTitle}
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{summaryData.headline}</h4>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2.5 py-1 rounded-xl font-bold border ${
                summaryData.overallHealth === 'On Track'
                  ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30'
                  : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-500/30'
              }`}>
                {summaryData.overallHealth} ({summaryData.completionRate}% Selesai)
              </span>
            </div>
          </div>

          {/* Unified Executive Summary Content (Persona Tabs Removed) */}
          <div className="space-y-4 animate-fade-in">
            {/* Main Overview Paragraph */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Ringkasan Eksekutif Utama:
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {summaryData.stakeholderBriefForBudi}
              </p>
            </div>

            {/* Highlights & Risks Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-500/20 space-y-2 shadow-sm">
                <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Pencapaian Utama:</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  {summaryData.keyHighlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-500/20 space-y-2 shadow-sm">
                <div className="text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  <span>Hambatan &amp; Mitigasi:</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  {summaryData.bottlenecksAndRisks.map((b, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-rose-500 font-bold">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Actionable Recommendations */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
              <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Rekomendasi Tindak Lanjut:</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                {summaryData.recommendationsForAlex.map((rec, i) => (
                  <li key={i} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-start gap-2">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">{i + 1}.</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Actions: Download PDF, Download TXT, Copy */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/80">
          <div className="flex items-center gap-2">
            {/* Download TXT Button */}
            <button
              onClick={handleDownloadText}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition shadow-xs"
              title="Unduh laporan sebagai file teks (.txt)"
            >
              <FileDown className="w-3.5 h-3.5 text-emerald-600" />
              <span>Unduh Text (.txt)</span>
            </button>

            {/* Download / Print PDF Button */}
            <button
              onClick={handlePrintPDF}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-xs font-bold text-white dark:text-slate-900 transition shadow-sm"
              title="Unduh / Cetak Dokumen PDF Resmi"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-700" />
              <span>Download PDF</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white transition shadow-md shadow-orange-500/25 active:scale-95"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Tersalin!' : 'Salin Laporan'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
