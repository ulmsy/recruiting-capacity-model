import { useState, useRef } from 'react';
import { useCapacityModel } from './hooks/useCapacityModel';
import { SummaryCards } from './components/SummaryCards';
import { AssumptionsPanel } from './components/AssumptionsPanel';
import { CapacityChart } from './components/CapacityChart';
import { FunctionTable } from './components/FunctionTable';
import { FormulaReference } from './components/FormulaReference';
import { exportToJSON, exportToCSV } from './utils/export';
import type { ModelState } from './types';

export default function App() {
  const { state, metrics, updateAssumptions, addFunction, updateFunction, deleteFunction, resetToDefault, loadScenario } =
    useCapacityModel();

  const [saved, setSaved] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);

  function handleExportJSON() {
    exportToJSON(state, metrics);
  }

  function handleExportCSV() {
    exportToCSV(metrics);
  }

  function handleSave() {
    // State is already auto-saved via localStorage; this just gives user feedback.
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        // Accept either a full export object or a raw ModelState
        const incoming: ModelState = parsed.state ?? parsed;
        // Minimal validation
        if (incoming.functions && incoming.assumptions) {
          loadScenario(incoming);
        } else {
          alert('Invalid scenario file. Expected a JSON export from this app.');
        }
      } catch {
        alert('Could not parse JSON file.');
      }
      // Reset the input so the same file can be re-imported
      e.target.value = '';
    };
    reader.readAsText(file);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <header className="bg-gray-900 text-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-lg font-bold tracking-tight">Recruiting Capacity Model</h1>
            <p className="text-gray-400 text-xs mt-0.5">
              Edit any assumption below — outputs update in real time
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Import JSON */}
            <label className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white border border-gray-600 hover:border-gray-400 rounded-lg cursor-pointer transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Import
              <input
                ref={importRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImport}
              />
            </label>

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white border border-gray-600 hover:border-gray-400 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              CSV
            </button>

            {/* Export JSON */}
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white border border-gray-600 hover:border-gray-400 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              JSON
            </button>

            {/* Save (localStorage) */}
            <button
              onClick={handleSave}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                saved
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              {saved ? 'Saved!' : 'Save'}
            </button>

            {/* Reset */}
            {showResetConfirm ? (
              <div className="flex gap-1">
                <button
                  onClick={() => { resetToDefault(); setShowResetConfirm(false); }}
                  className="px-3 py-1.5 text-sm font-medium bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors"
                >
                  Confirm Reset
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-3 py-1.5 text-sm font-medium bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Main content ──────────────────────────────────────────────────────── */}
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
        {/* Summary cards */}
        <SummaryCards metrics={metrics} />

        {/* Assumptions + Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AssumptionsPanel
            assumptions={state.assumptions}
            onChange={updateAssumptions}
          />
          <CapacityChart metrics={metrics} />
        </div>

        {/* Detailed table */}
        <FunctionTable
          functions={state.functions}
          metrics={metrics}
          assumptions={state.assumptions}
          onUpdate={updateFunction}
          onDelete={deleteFunction}
          onAdd={addFunction}
        />

        {/* Formula reference */}
        <FormulaReference />

        {/* Footer */}
        <footer className="text-center text-xs text-gray-400 pb-4">
          Data is saved automatically in your browser's local storage.
          &nbsp;Use Export to share or back up your scenario.
        </footer>
      </main>
    </div>
  );
}
