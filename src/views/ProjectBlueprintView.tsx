import React, { useState } from 'react';
import {
  Copy,
  Check,
  Mail,
  Phone,
  Code,
  FolderOpen,
  Database,
  Terminal,
  CheckCircle,
  FileCode,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { RAW_SQL_SCHEMA } from '../data/mockData';

interface ProjectBlueprintViewProps {
  onShowToast: (title: string, message: string, type: 'success' | 'error' | 'info') => void;
}

export const ProjectBlueprintView: React.FC<ProjectBlueprintViewProps> = ({ onShowToast }) => {
  const [showSql, setShowSql] = useState<boolean>(false);
  const [copiedResume, setCopiedResume] = useState<boolean>(false);
  const [expandedEndpoints, setExpandedEndpoints] = useState<Record<string, boolean>>({
    'endpoint-1': true,
    'endpoint-2': true,
  });

  const resumeText =
    'Achieved 74% automated ticket routing with <1.6% misclassification using CLINC150 benchmark, deploying an active confidence threshold tuning interface.';

  const handleCopyResume = () => {
    navigator.clipboard.writeText(`* ${resumeText}`);
    setCopiedResume(true);
    onShowToast('Copied to Clipboard', 'Resume achievement bullet copied in Markdown format.', 'success');
    setTimeout(() => setCopiedResume(false), 2500);
  };

  const toggleEndpoint = (id: string) => {
    setExpandedEndpoints((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-full pb-12 overflow-x-hidden">
      {/* Top Hero Banner */}
      <div className="relative py-6 px-6 sm:px-8 rounded-2xl bg-[#eff4ff] border border-[#dce9ff] shadow-sm overflow-hidden">
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-[#c3c0ff]/30 blur-3xl pointer-events-none"></div>
        <div className="absolute right-1/3 -bottom-20 w-64 h-64 rounded-full bg-[#68dba9]/20 blur-3xl pointer-events-none"></div>

        <div className="relative flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4f46e5] text-white text-xs font-semibold mb-3 shadow-sm">
              <Terminal className="w-3.5 h-3.5" />
              <span className="uppercase tracking-wider">Production Deliverable · Ready for Review</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#0b1c30] font-headline tracking-tight">
              Project Blueprint & Engineering Architecture
            </h1>
            <p className="text-xs sm:text-sm text-[#464555] mt-1.5">
              Production Deliverable, Codebase Structure, API Operations, and Portfolio Evaluation.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2 font-mono text-xs text-[#464555]">
              <span className="inline-flex items-center gap-1.5 bg-[#ffffff] px-2.5 py-1 rounded-lg border border-[#dce9ff]">
                <CheckCircle className="w-3.5 h-3.5 text-[#006e4c]" />
                Stack: React 19 + TypeScript + Express + Python Fast ML Core
              </span>
              <span className="inline-flex items-center gap-1.5 bg-[#ffffff] px-2.5 py-1 rounded-lg border border-[#dce9ff]">
                <Database className="w-3.5 h-3.5 text-[#3525cd]" />
                PostgreSQL 16 Schema (8 Tables)
              </span>
              <span className="inline-flex items-center gap-1.5 bg-[#ffffff] px-2.5 py-1 rounded-lg border border-[#dce9ff]">
                <Terminal className="w-3.5 h-3.5 text-[#006e4c]" />
                Model: CLINC150 Intent Classifier (TF-IDF + LR)
              </span>
            </div>
          </div>

          {/* Contact Direct Line with Clickable Email and Phone */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full xl:w-auto shrink-0">
            <a
              href="mailto:lead.dev@resolvedesk.io"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#ffffff] text-[#0b1c30] hover:bg-[#f8f9ff] border border-[#dce9ff] shadow-sm text-xs font-semibold transition-colors"
            >
              <Mail className="w-4 h-4 text-[#3525cd]" />
              <span>lead.dev@resolvedesk.io</span>
            </a>
            <a
              href="tel:+18005550199"
              aria-label="Call Lead Architect at +1 (800) 555-0199"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#3525cd] text-white hover:bg-[#4f46e5] shadow-sm text-xs font-semibold transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>+1 (800) 555-0199</span>
            </a>
          </div>
        </div>
      </div>

      {/* Accomplishment & Evaluation Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Resume Bullet Card (8 cols) */}
        <div className="lg:col-span-8 p-5 sm:p-6 rounded-xl bg-[#ffffff] shadow-sm border border-[#e5eeff] flex flex-col justify-between gap-4">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#e5eeff] gap-2">
              <div>
                <span className="text-[11px] font-semibold text-[#777587] uppercase tracking-wider">
                  Target Accomplishment
                </span>
                <h2 className="text-base sm:text-lg font-bold text-[#0b1c30] font-headline mt-0.5">
                  Resume & CV Bullet Highlight
                </h2>
              </div>
              <button
                onClick={handleCopyResume}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] text-xs font-semibold transition-colors self-start sm:self-auto border border-[#dce9ff]"
              >
                {copiedResume ? <Check className="w-4 h-4 text-[#006e4c]" /> : <Copy className="w-4 h-4" />}
                <span>{copiedResume ? 'Copied to Clipboard!' : 'Copy Markdown Bullet'}</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#eff4ff] text-[#0b1c30] text-sm sm:text-base leading-relaxed relative my-4 border border-[#dce9ff]">
              <span className="text-[#3525cd] font-bold text-lg mr-1">“</span>
              <span className="font-semibold">{resumeText}</span>
              <span className="text-[#3525cd] font-bold text-lg ml-1">”</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-[#eff4ff] border border-[#dce9ff] flex flex-col">
              <span className="text-[10px] text-[#777587] font-semibold uppercase">Auto Route Rate</span>
              <span className="text-xl sm:text-2xl font-bold text-[#3525cd] font-headline mt-0.5">
                74.2%
              </span>
              <span className="text-[10px] text-[#006e4c] font-semibold mt-1">+12.4% vs baseline</span>
            </div>
            <div className="p-3 rounded-xl bg-[#eff4ff] border border-[#dce9ff] flex flex-col">
              <span className="text-[10px] text-[#777587] font-semibold uppercase">Misclassification</span>
              <span className="text-xl sm:text-2xl font-bold text-[#006e4c] font-headline mt-0.5">
                1.58%
              </span>
              <span className="text-[10px] text-[#464555] mt-1">Target &lt; 2.0%</span>
            </div>
            <div className="p-3 rounded-xl bg-[#eff4ff] border border-[#dce9ff] flex flex-col">
              <span className="text-[10px] text-[#777587] font-semibold uppercase">Dataset Benchmark</span>
              <span className="text-xl sm:text-2xl font-bold text-[#0b1c30] font-headline mt-0.5">
                150
              </span>
              <span className="text-[10px] text-[#464555] mt-1">CLINC150 Domains</span>
            </div>
            <div className="p-3 rounded-xl bg-[#eff4ff] border border-[#dce9ff] flex flex-col">
              <span className="text-[10px] text-[#777587] font-semibold uppercase">Inference Latency</span>
              <span className="text-xl sm:text-2xl font-bold text-[#5b598c] font-headline mt-0.5">
                14ms
              </span>
              <span className="text-[10px] text-[#464555] mt-1">p95 / CPU vector</span>
            </div>
          </div>
        </div>

        {/* Verification Profile (4 cols) */}
        <div className="lg:col-span-4 p-5 sm:p-6 rounded-xl bg-[#ffffff] shadow-sm border border-[#e5eeff] flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#e5eeff]">
              <span className="text-[11px] font-semibold text-[#777587] uppercase tracking-wider">
                Evaluation Profile
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] bg-[#85f8c4] text-[#002114] font-bold">
                Ready to Grade
              </span>
            </div>
            <h3 className="text-base font-bold text-[#0b1c30] font-headline mt-2">
              Verified System Properties
            </h3>
            <p className="text-xs text-[#464555] mt-1">
              Engineered to showcase enterprise software craftsmanship, defensive schemas, and measurable machine learning outcomes.
            </p>

            <ul className="mt-3 flex flex-col gap-2 text-xs text-[#0b1c30]">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#006e4c] shrink-0 mt-0.5" />
                <span>Deterministic routing thresholds with fallback escalation queue</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#006e4c] shrink-0 mt-0.5" />
                <span>Agent feedback loop capturing continuous training ground truth</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#006e4c] shrink-0 mt-0.5" />
                <span>Zero external API dependency: self-contained TF-IDF pipeline</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#006e4c] shrink-0 mt-0.5" />
                <span>Fully normalized 3NF relational layout with referential cascading</span>
              </li>
            </ul>
          </div>

          <div className="p-3 rounded-xl bg-[#eff4ff] border border-[#dce9ff] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#3525cd]" />
              <div>
                <span className="font-semibold text-[#0b1c30] block">Maintainer Credentials</span>
                <span className="text-[10px] text-[#464555]">Applied Machine Learning Engineer</span>
              </div>
            </div>
            <span className="font-mono text-xs bg-[#ffffff] px-2 py-1 rounded text-[#464555] border border-[#dce9ff]">
              2026 Release
            </span>
          </div>
        </div>
      </div>

      {/* Codebase Anatomy & ML Runbook */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Monorepo Directory Tree (5 cols) */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-xl bg-[#ffffff] shadow-sm border border-[#e5eeff] flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#e5eeff]">
            <div>
              <span className="text-[11px] font-semibold text-[#777587] uppercase tracking-wider">
                Repository Anatomy
              </span>
              <h2 className="text-base font-bold text-[#0b1c30] font-headline">Codebase Directory Tree</h2>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#eff4ff] font-mono text-xs text-[#464555] border border-[#dce9ff]">
              git://main
            </span>
          </div>
          <p className="text-xs text-[#464555]">
            Monorepo isolating client-facing React applications from high-throughput Python inference workers.
          </p>

          <div className="flex-1 bg-[#eff4ff] rounded-xl p-4 overflow-x-auto custom-scrollbar font-mono text-xs leading-relaxed text-[#0b1c30] border border-[#dce9ff]">
            <div className="flex items-center gap-2 text-[#3525cd] font-bold">
              <FolderOpen className="w-4 h-4" />
              <span>resolvedesk/</span>
            </div>
            <div className="pl-4">
              <div className="flex items-center gap-1.5 text-[#0b1c30] font-semibold mt-1">
                <span className="text-[#777587]">├──</span>
                <Layers className="w-3.5 h-3.5 text-[#3525cd]" />
                <span>frontend/</span>
              </div>
              <div className="pl-6 flex flex-col gap-0.5 text-[#464555]">
                <div><span className="text-[#777587]">├──</span> src/components/ (Header, Sidebar, Toast, ImageCompressor)</div>
                <div><span className="text-[#777587]">├──</span> src/views/ (AgentInbox, Analytics, Blueprint, Portal)</div>
                <div><span className="text-[#777587]">├──</span> src/data/mockData.ts</div>
                <div><span className="text-[#777587]">├──</span> src/types/index.ts</div>
                <div><span className="text-[#777587]">└──</span> package.json</div>
              </div>

              <div className="flex items-center gap-1.5 text-[#0b1c30] font-semibold mt-2">
                <span className="text-[#777587]">├──</span>
                <Layers className="w-3.5 h-3.5 text-[#006e4c]" />
                <span>backend/</span>
              </div>
              <div className="pl-6 flex flex-col gap-0.5 text-[#464555]">
                <div><span className="text-[#777587]">├──</span> src/api/routes_requests.py</div>
                <div><span className="text-[#777587]">├──</span> src/api/routes_classify.py</div>
                <div><span className="text-[#777587]">├──</span> src/api/routes_assignments.py</div>
                <div><span className="text-[#777587]">├──</span> src/api/routes_corrections.py</div>
                <div className="text-[#006e4c] font-medium"><span className="text-[#777587]">├──</span> src/db/schema.sql (8 Tables)</div>
                <div className="text-[#3525cd] font-medium"><span className="text-[#777587]">└──</span> python/ml_pipeline.py</div>
              </div>

              <div className="text-[#464555] mt-2"><span className="text-[#777587]">└──</span> README.md</div>
            </div>
          </div>
        </div>

        {/* Reproducibility Runbook (7 cols) */}
        <div className="lg:col-span-7 p-5 sm:p-6 rounded-xl bg-[#ffffff] shadow-sm border border-[#e5eeff] flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[#e5eeff] gap-2">
            <div>
              <span className="text-[11px] font-semibold text-[#777587] uppercase tracking-wider">
                Reproducibility Protocol
              </span>
              <h2 className="text-base font-bold text-[#0b1c30] font-headline">
                Machine Learning Pipeline Runbook
              </h2>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#eff4ff] text-xs text-[#0b1c30] font-semibold border border-[#dce9ff]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#006e4c] animate-pulse"></span>
              Python 3.11 · Scikit-Learn 1.4
            </span>
          </div>

          <div className="flex flex-col gap-3">
            <div className="p-3.5 rounded-xl bg-[#eff4ff] border border-[#dce9ff] flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-semibold text-[#0b1c30]">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#3525cd] text-white flex items-center justify-center text-[10px] font-bold">
                    1
                  </span>
                  <span>Environment Setup & Dataset Ingest</span>
                </div>
                <span className="text-[10px] text-[#777587]">Step 1 of 3</span>
              </div>
              <div className="bg-[#ffffff] rounded-lg p-2.5 font-mono text-[11px] text-[#0b1c30] overflow-x-auto custom-scrollbar border border-[#dce9ff]">
                <span className="text-[#777587]"># Clone repository and pull CLINC150 intent benchmark</span><br />
                $ git clone https://github.com/resolvedesk/resolvedesk.git && cd resolvedesk<br />
                $ python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt<br />
                $ python backend/python/clinc150_dataset_loader.py --split train,val,test
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#eff4ff] border border-[#dce9ff] flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-semibold text-[#0b1c30]">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#3525cd] text-white flex items-center justify-center text-[10px] font-bold">
                    2
                  </span>
                  <span>TF-IDF Vectorization & Model Optimization</span>
                </div>
                <span className="text-[10px] text-[#777587]">Step 2 of 3</span>
              </div>
              <div className="bg-[#ffffff] rounded-lg p-2.5 font-mono text-[11px] text-[#0b1c30] overflow-x-auto custom-scrollbar border border-[#dce9ff]">
                <span className="text-[#777587]"># Train Logistic Regression with L2 regularization & calibrated probabilities</span><br />
                $ python backend/python/ml_pipeline.py --max-features 12000 --ngram-range 1,3 --output backend/models/v2.1_model.joblib
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#eff4ff] border border-[#dce9ff] flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-semibold text-[#0b1c30]">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#3525cd] text-white flex items-center justify-center text-[10px] font-bold">
                    3
                  </span>
                  <span>Evaluation & Seed Demo Data</span>
                </div>
                <span className="text-[10px] text-[#777587]">Step 3 of 3</span>
              </div>
              <div className="bg-[#ffffff] rounded-lg p-2.5 font-mono text-[11px] text-[#0b1c30] overflow-x-auto custom-scrollbar border border-[#dce9ff]">
                $ python backend/python/evaluate_models.py --model-path backend/models/v2.1_model.joblib<br />
                <span className="text-[#006e4c] font-semibold">&gt; Accuracy: 0.942 | Macro F1: 0.938 | Brier Score: 0.041</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Relational Schema (8 Core Tables) */}
      <div className="p-5 sm:p-6 rounded-xl bg-[#ffffff] shadow-sm border border-[#e5eeff] flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#e5eeff] gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-[#777587] uppercase tracking-wider">
                Relational Architecture
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] bg-[#e2dfff] text-[#0f0069] font-bold">
                PostgreSQL DDL
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[#0b1c30] font-headline mt-0.5">
              Database Schema: 8 Core Relational Tables
            </h2>
            <p className="text-xs text-[#464555]">
              Strict primary keys, constraints, and audit trails capturing inference drift.
            </p>
          </div>
          <button
            onClick={() => setShowSql(!showSql)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-xs font-semibold text-[#0b1c30] border border-[#dce9ff] transition-colors self-start sm:self-auto"
          >
            <Code className="w-4 h-4 text-[#3525cd]" />
            <span>{showSql ? 'Hide schema.sql' : 'View schema.sql Source'}</span>
          </button>
        </div>

        {showSql && (
          <div className="p-4 rounded-xl bg-[#eff4ff] border border-[#dce9ff] overflow-x-auto custom-scrollbar font-mono text-xs text-[#0b1c30]">
            <pre className="text-xs">{RAW_SQL_SCHEMA}</pre>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              name: 'users',
              tag: 'Core Identity',
              fields: [
                ['id (PK)', 'UUID'],
                ['name', 'VARCHAR(100)'],
                ['email', 'UNIQUE'],
                ['role', 'agent | admin | lead'],
              ],
            },
            {
              name: 'teams',
              tag: 'Routing Units',
              fields: [
                ['id (PK)', 'UUID'],
                ['name', 'VARCHAR(100)'],
                ['slug', 'auth | cards | billing'],
                ['auto_route_enabled', 'BOOLEAN'],
              ],
            },
            {
              name: 'requests',
              tag: 'Tickets',
              fields: [
                ['id (PK)', 'UUID'],
                ['customer_id', 'VARCHAR(100)'],
                ['subject', 'TEXT'],
                ['status', 'new | routed | closed'],
              ],
            },
            {
              name: 'messages',
              tag: 'Thread History',
              fields: [
                ['id (PK)', 'UUID'],
                ['request_id (FK)', 'requests.id'],
                ['sender_type', 'customer | agent | bot'],
                ['content', 'TEXT'],
              ],
            },
            {
              name: 'predictions',
              tag: 'Inference Audit',
              fields: [
                ['id (PK)', 'UUID'],
                ['request_id (FK)', 'requests.id'],
                ['model_version', 'VARCHAR(50)'],
                ['confidence', 'NUMERIC(5,4)'],
              ],
            },
            {
              name: 'assignments',
              tag: 'Routing Log',
              fields: [
                ['id (PK)', 'UUID'],
                ['request_id (FK)', 'requests.id'],
                ['team_id (FK)', 'teams.id'],
                ['assigned_by', 'ml_auto | supervisor'],
              ],
            },
            {
              name: 'corrections',
              tag: 'Ground Truth Loop',
              fields: [
                ['id (PK)', 'UUID'],
                ['prediction_id (FK)', 'predictions.id'],
                ['reviewed_by (FK)', 'users.id'],
                ['corrected_intent', 'VARCHAR(100)'],
              ],
            },
            {
              name: 'model_versions',
              tag: 'ML Registry',
              fields: [
                ['id (PK)', 'UUID'],
                ['version_tag', 'v2.1-lbfgs'],
                ['f1_score', 'NUMERIC(5,4)'],
                ['is_active', 'BOOLEAN'],
              ],
            },
          ].map((t, i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl bg-[#eff4ff] border border-[#dce9ff] flex flex-col gap-2"
            >
              <div className="flex items-center justify-between pb-1 border-b border-[#dce9ff]">
                <span className="font-bold text-xs text-[#0b1c30] font-headline">{t.name}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#ffffff] text-[#464555] border border-[#dce9ff]">
                  {t.tag}
                </span>
              </div>
              <div className="flex flex-col gap-1 text-[11px] font-mono">
                {t.fields.map(([k, v], fi) => (
                  <div key={fi} className="flex justify-between items-center text-[#464555]">
                    <span className={k.includes('PK') ? 'text-[#3525cd] font-semibold' : ''}>
                      {k}
                    </span>
                    <span className="text-[#0b1c30] font-medium">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Core API Endpoints (Swagger Specification) */}
      <div className="p-5 sm:p-6 rounded-xl bg-[#ffffff] shadow-sm border border-[#e5eeff] flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#e5eeff] gap-2">
          <div>
            <span className="text-[11px] font-semibold text-[#777587] uppercase tracking-wider">
              RESTful Interfaces
            </span>
            <h2 className="text-base sm:text-lg font-bold text-[#0b1c30] font-headline">
              Core API Endpoints (Swagger Specification)
            </h2>
            <p className="text-xs text-[#464555]">
              5 production operations facilitating triage automation, classifier inference, and agent remediation.
            </p>
          </div>
          <span className="font-mono text-xs px-2.5 py-1 bg-[#eff4ff] rounded-lg text-[#3525cd] font-semibold border border-[#dce9ff]">
            Base URL: /api/v1
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {/* Endpoint 1 */}
          <div className="rounded-xl bg-[#eff4ff] border border-[#dce9ff] overflow-hidden">
            <button
              onClick={() => toggleEndpoint('endpoint-1')}
              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-[#dce9ff]/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-[#006e4c] text-white">
                  POST
                </span>
                <span className="font-mono text-xs sm:text-sm font-semibold text-[#0b1c30]">
                  /api/v1/requests
                </span>
                <span className="text-xs text-[#464555] hidden sm:inline">
                  · Submit customer service request
                </span>
              </div>
              {expandedEndpoints['endpoint-1'] ? <ChevronUp className="w-4 h-4 text-[#777587]" /> : <ChevronDown className="w-4 h-4 text-[#777587]" />}
            </button>
            {expandedEndpoints['endpoint-1'] && (
              <div className="p-4 bg-[#ffffff] border-t border-[#dce9ff] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <div className="font-semibold text-[#777587] uppercase text-[10px] mb-1.5">
                    Request Payload (JSON)
                  </div>
                  <pre className="bg-[#eff4ff] p-3 rounded-lg text-[#0b1c30] overflow-x-auto border border-[#dce9ff]">
{`{
  "customer_id": "cust_98319a",
  "subject": "Unauthorized charge on card renewal",
  "initial_message": "I was billed $89 without notice.",
  "metadata": { "platform": "web_portal" }
}`}
                  </pre>
                </div>
                <div>
                  <div className="font-semibold text-[#777587] uppercase text-[10px] mb-1.5">
                    Success Response (201 Created)
                  </div>
                  <pre className="bg-[#eff4ff] p-3 rounded-lg text-[#0b1c30] overflow-x-auto border border-[#dce9ff]">
{`{
  "request_id": "c71a36be-2868-450f-aee5-cb2d93e11742",
  "status": "pending_classification",
  "created_at": "2026-09-28T04:10:00Z"
}`}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Endpoint 2 */}
          <div className="rounded-xl bg-[#eff4ff] border border-[#dce9ff] overflow-hidden">
            <button
              onClick={() => toggleEndpoint('endpoint-2')}
              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-[#dce9ff]/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-[#3525cd] text-white">
                  POST
                </span>
                <span className="font-mono text-xs sm:text-sm font-semibold text-[#0b1c30]">
                  /api/v1/classify
                </span>
                <span className="text-xs text-[#464555] hidden sm:inline">
                  · Classify text via ML model
                </span>
              </div>
              {expandedEndpoints['endpoint-2'] ? <ChevronUp className="w-4 h-4 text-[#777587]" /> : <ChevronDown className="w-4 h-4 text-[#777587]" />}
            </button>
            {expandedEndpoints['endpoint-2'] && (
              <div className="p-4 bg-[#ffffff] border-t border-[#dce9ff] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <div className="font-semibold text-[#777587] uppercase text-[10px] mb-1.5">
                    Request Payload (JSON)
                  </div>
                  <pre className="bg-[#eff4ff] p-3 rounded-lg text-[#0b1c30] overflow-x-auto border border-[#dce9ff]">
{`{
  "text": "Need refund for card renewal duplicate charge",
  "model_version": "CLINC150-TFIDF-LR-v2.1"
}`}
                  </pre>
                </div>
                <div>
                  <div className="font-semibold text-[#777587] uppercase text-[10px] mb-1.5">
                    Success Response (200 OK)
                  </div>
                  <pre className="bg-[#eff4ff] p-3 rounded-lg text-[#0b1c30] overflow-x-auto border border-[#dce9ff]">
{`{
  "predicted_intent": "refund_request",
  "confidence": 0.8942,
  "recommended_team": "billing-tier2",
  "confidence_gate_status": "AUTO_APPROVE"
}`}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
