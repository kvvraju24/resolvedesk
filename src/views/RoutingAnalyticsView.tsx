import React, { useState } from 'react';
import {
  Download,
  Mail,
  Phone,
  Database,
  CheckCircle,
  Sliders,
  Check,
  History,
  FlaskConical,
  Shield,
  ArrowRight,
  Upload,
  BarChart3,
  Timer,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { BENCHMARK_MODELS, CATEGORY_METRICS, CORRECTION_STREAM } from '../data/mockData';

interface RoutingAnalyticsViewProps {
  onShowToast: (title: string, message: string, type: 'success' | 'error' | 'info') => void;
}

export const RoutingAnalyticsView: React.FC<RoutingAnalyticsViewProps> = ({ onShowToast }) => {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | 'qtd' | 'clinc150'>('clinc150');
  const [threshold, setThreshold] = useState<number>(82);
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [isCommitting, setIsCommitting] = useState<boolean>(false);
  const [corrections, setCorrections] = useState(CORRECTION_STREAM);

  // Dynamic calculations based on threshold
  const totalDailyTickets = 12400;
  const factor = (threshold - 50) / 45; // 0 to 1
  const autoRate = Math.max(38, Math.min(96, 96 - factor * 54));
  const manualRate = 100 - autoRate;
  const errorRate = Math.max(0.6, Math.min(6.8, 6.8 - factor * 6.1));

  const autoCases = Math.round((autoRate / 100) * totalDailyTickets);
  const manualCases = totalDailyTickets - autoCases;
  const errorCases = Math.round((errorRate / 100) * totalDailyTickets);

  // SVG coordinate calculations for threshold line on Pareto curve (range 40px to 760px on X)
  const lineX = 40 + ((threshold - 50) / 45) * (760 - 40);

  const handleExport = () => {
    onShowToast(
      'Export In Progress',
      'Generating CLINC150 Benchmark Evaluation Report (PDF / CSV format)...',
      'info'
    );
    setTimeout(() => {
      onShowToast(
        'Export Successful',
        'Downloaded: resolvedesk-clinc150-eval-q3.pdf (3.4 MB)',
        'success'
      );
    }, 1200);
  };

  const handleDeployCalibration = () => {
    setIsDeploying(true);
    setTimeout(() => {
      setIsDeploying(false);
      onShowToast(
        'Calibration Deployed',
        `Edge gate updated to ${threshold.toFixed(1)}% threshold across all regional ingestion proxies.`,
        'success'
      );
    }, 900);
  };

  const handleCommitCorrections = () => {
    setIsCommitting(true);
    setTimeout(() => {
      setIsCommitting(false);
      onShowToast(
        'Retraining Cohort Enqueued',
        `Successfully committed ${corrections.length * 47} tokens to active fine-tuning set. Next scheduled training run at 02:00 UTC.`,
        'success'
      );
      setCorrections([]);
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-full pb-12 overflow-x-hidden">
      {/* Top Header Section */}
      <div className="w-full flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pt-1">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-[#0b1c30] tracking-tight font-headline">
              Routing Analytics & ML Model Evaluation
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#dce9ff] text-[#0b1c30] font-mono text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#006e4c] animate-pulse"></span>
              CLINC150 Evaluator
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#464555] truncate max-w-2xl">
            CLINC150 Benchmark Evaluation, Tradeoff Analysis, and Continuous Model Comparison
          </p>
        </div>

        {/* Action & Contact Channels */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#ffffff] shadow-sm border border-[#e5eeff]">
            <a
              href="mailto:analytics@resolvedesk.io"
              className="flex items-center gap-1.5 text-xs text-[#464555] hover:text-[#3525cd] transition-colors"
              title="Contact ML Ops via Email"
            >
              <Mail className="w-3.5 h-3.5 text-[#3525cd]" />
              <span className="font-medium">analytics@resolvedesk.io</span>
            </a>
            <span className="text-[#c7c4d8] font-light">·</span>
            <a
              href="tel:+18005550199"
              aria-label="Call Priority Triage Line at +1 (800) 555-0199"
              className="flex items-center gap-1.5 text-xs text-[#464555] hover:text-[#006e4c] transition-colors"
              title="Call Priority Triage Line"
            >
              <Phone className="w-3.5 h-3.5 text-[#006e4c]" />
              <span className="font-medium">+1 (800) 555-0199</span>
            </a>
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3525cd] text-white text-xs font-semibold shadow-sm hover:bg-[#4f46e5] active:scale-[0.99] transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export Evaluation Report</span>
          </button>
        </div>
      </div>

      {/* Timeframe Filter Tabs & Metadata Band */}
      <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-[#eff4ff] p-1.5 rounded-xl border border-[#e5eeff]">
        <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pb-1 md:pb-0">
          {(
            [
              { id: '7d', label: 'Last 7 Days' },
              { id: '30d', label: 'Last 30 Days' },
              { id: 'qtd', label: 'Quarter-to-Date (Q3)' },
              { id: 'clinc150', label: 'CLINC150 Test Benchmark' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTimeframe(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                timeframe === tab.id
                  ? 'bg-[#ffffff] text-[#3525cd] shadow-sm'
                  : 'text-[#464555] hover:text-[#0b1c30] hover:bg-[#f8f9ff]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 px-2 py-0.5 text-xs font-mono text-[#464555]">
          <span className="flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-[#777587]" />
            Test N = 4,500 sentences
          </span>
          <span className="hidden lg:inline text-[#c7c4d8]">|</span>
          <span className="hidden lg:flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-[#006e4c]" />
            Zero Data Leakage Check: Passed
          </span>
        </div>
      </div>

      {/* 5 Analytical KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 w-full">
        {/* Card 1 */}
        <div className="p-4 bg-[#ffffff] rounded-xl shadow-sm border border-[#e5eeff] flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between text-[#777587]">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#464555]">
              Auto-Routing Rate
            </span>
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-[#0b1c30] font-headline tracking-tight">
              {autoRate.toFixed(1)}%
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs">
              <span className="px-1.5 py-0.5 rounded bg-[#dce9ff] text-[#3525cd] font-semibold text-[10px]">
                +3.1% vs v1.0
              </span>
              <span className="text-[#464555]">Target: 75%</span>
            </div>
          </div>
          <div className="w-full bg-[#eff4ff] h-1.5 rounded-full overflow-hidden mt-1">
            <div
              className="bg-[#3525cd] h-full rounded-full transition-all duration-300"
              style={{ width: `${autoRate}%` }}
            ></div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-4 bg-[#ffffff] rounded-xl shadow-sm border border-[#e5eeff] flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between text-[#777587]">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#464555]">
              Misclassification Rate
            </span>
            <AlertTriangle className="w-4 h-4 text-[#ba1a1a]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-[#0b1c30] font-headline tracking-tight">
              {errorRate.toFixed(1)}%
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs">
              <span className="px-1.5 py-0.5 rounded bg-[#85f8c4] text-[#002114] font-semibold text-[10px]">
                -0.8% drop
              </span>
              <span className="text-[#464555]">Guardrail &lt; 2.0%</span>
            </div>
          </div>
          <div className="w-full bg-[#eff4ff] h-1.5 rounded-full overflow-hidden mt-1">
            <div
              className="bg-[#006e4c] h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, errorRate * 15)}%` }}
            ></div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-4 bg-[#ffffff] rounded-xl shadow-sm border border-[#e5eeff] flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between text-[#777587]">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#464555]">
              Unsupported / OOD
            </span>
            <Shield className="w-4 h-4 text-[#3525cd]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-[#0b1c30] font-headline tracking-tight">
              94.8%
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs">
              <span className="px-1.5 py-0.5 rounded bg-[#dce9ff] text-[#3525cd] font-semibold text-[10px]">
                Precision
              </span>
              <span className="text-[#464555]">CLINC150 OOS</span>
            </div>
          </div>
          <div className="w-full bg-[#eff4ff] h-1.5 rounded-full overflow-hidden mt-1">
            <div className="bg-[#4f46e5] h-full rounded-full" style={{ width: '94.8%' }}></div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="p-4 bg-[#ffffff] rounded-xl shadow-sm border border-[#e5eeff] flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between text-[#777587]">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#464555]">
              Median Review Time
            </span>
            <Timer className="w-4 h-4 text-[#006e4c]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-[#0b1c30] font-headline tracking-tight">
              48s
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs">
              <span className="px-1.5 py-0.5 rounded bg-[#85f8c4] text-[#002114] font-semibold text-[10px]">
                -12s faster
              </span>
              <span className="text-[#464555]">ML pre-fill</span>
            </div>
          </div>
          <div className="w-full bg-[#eff4ff] h-1.5 rounded-full overflow-hidden mt-1">
            <div className="bg-[#006e4c] h-full rounded-full" style={{ width: '60%' }}></div>
          </div>
        </div>

        {/* Card 5 */}
        <div className="p-4 bg-[#ffffff] rounded-xl shadow-sm border border-[#e5eeff] flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between text-[#777587]">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#464555]">
              Agent Correction Vol
            </span>
            <RotateCcw className="w-4 h-4 text-[#5b598c]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-[#0b1c30] font-headline tracking-tight">
              {corrections.length * 47}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs">
              <span className="px-1.5 py-0.5 rounded bg-[#dce9ff] text-[#464555] font-semibold text-[10px]">
                Weekly Cohort
              </span>
              <span className="text-[#464555]">Ready to retrain</span>
            </div>
          </div>
          <div className="w-full bg-[#eff4ff] h-1.5 rounded-full overflow-hidden mt-1">
            <div className="bg-[#5b598c] h-full rounded-full" style={{ width: '44%' }}></div>
          </div>
        </div>
      </div>

      {/* Tradeoff Curve & Threshold Calibration Simulator */}
      <div className="w-full grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        {/* Interactive Chart Panel (8 Columns) */}
        <div className="xl:col-span-8 p-5 sm:p-6 bg-[#ffffff] rounded-xl shadow-sm border border-[#e5eeff] flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#0b1c30] font-headline">
                Tradeoff Curve: Confidence vs Accuracy & Coverage
              </h2>
              <p className="text-xs text-[#464555]">
                Empirical Pareto frontier balancing automated throughput and misclassification risk
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 rounded-full bg-[#3525cd]"></span>
                <span className="text-[#0b1c30]">% Auto-Routed Volume</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 rounded-full bg-[#ba1a1a]"></span>
                <span className="text-[#0b1c30]">Misclassification Rate</span>
              </div>
            </div>
          </div>

          {/* SVG Tradeoff Visualizer */}
          <div className="w-full relative h-72 bg-[#eff4ff] rounded-xl p-3 flex flex-col justify-end overflow-hidden border border-[#dce9ff]">
            {/* Subtle Grid Lines */}
            <div className="absolute inset-0 grid grid-cols-6 pointer-events-none opacity-40">
              <div className="border-r border-dashed border-[#c7c4d8] h-full"></div>
              <div className="border-r border-dashed border-[#c7c4d8] h-full"></div>
              <div className="border-r border-dashed border-[#c7c4d8] h-full"></div>
              <div className="border-r border-dashed border-[#c7c4d8] h-full"></div>
              <div className="border-r border-dashed border-[#c7c4d8] h-full"></div>
              <div className="h-full"></div>
            </div>

            <div className="absolute top-3 left-4 text-[10px] font-mono text-[#777587]">
              Y: Coverage / Error Rate (%)
            </div>
            <div className="absolute bottom-2 right-4 text-[10px] font-mono text-[#777587]">
              X: Confidence Threshold (%)
            </div>

            <svg
              className="w-full h-full relative z-10 overflow-visible"
              viewBox="0 0 800 240"
              preserveAspectRatio="none"
            >
              {/* Shaded Area for Auto-routed Volume */}
              <path
                d="M 40,20 Q 250,55 420,78 T 760,180 L 760,220 L 40,220 Z"
                fill="#4f46e5"
                fillOpacity="0.08"
              />
              {/* Curve A: Auto-Routed Volume */}
              <path
                d="M 40,20 C 220,50 380,75 530,95 C 640,135 700,165 760,180"
                fill="none"
                stroke="#3525cd"
                strokeLinecap="round"
                strokeWidth="3"
              />
              {/* Curve B: Misclassification Rate */}
              <path
                d="M 40,110 C 200,150 380,180 530,195 C 650,205 710,212 760,216"
                fill="none"
                stroke="#ba1a1a"
                strokeDasharray="4 3"
                strokeLinecap="round"
                strokeWidth="2.5"
              />

              {/* Dynamic Threshold Line reacting to slider */}
              <line
                x1={lineX}
                x2={lineX}
                y1={10}
                y2={220}
                stroke="#006e4c"
                strokeDasharray="3 3"
                strokeWidth="2"
              />

              {/* Equilibrium Dots on curves */}
              <circle
                cx={lineX}
                cy={20 + factor * 160}
                r="5"
                fill="#3525cd"
                stroke="#ffffff"
                strokeWidth="2"
              />
              <circle
                cx={lineX}
                cy={110 + factor * 106}
                r="5"
                fill="#ba1a1a"
                stroke="#ffffff"
                strokeWidth="2"
              />

              {/* Sweet Spot Box */}
              <g transform={`translate(${Math.max(40, Math.min(620, lineX - 80))}, 15)`}>
                <rect width="160" height="42" rx="6" fill="#006e4c" fillOpacity="0.95" />
                <text
                  x="80"
                  y="16"
                  fill="#ffffff"
                  fontFamily="Plus Jakarta Sans"
                  fontSize="10"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  ACTIVE GATE: {threshold.toFixed(1)}%
                </text>
                <text
                  x="80"
                  y="32"
                  fill="#85f8c4"
                  fontFamily="JetBrains Mono"
                  fontSize="10"
                  textAnchor="middle"
                >
                  Auto: {autoRate.toFixed(1)}% | Err: {errorRate.toFixed(1)}%
                </text>
              </g>

              {/* Axis Ticks */}
              <text x="40" y="235" fill="#777587" fontFamily="JetBrains Mono" fontSize="10">
                50%
              </text>
              <text x="210" y="235" fill="#777587" fontFamily="JetBrains Mono" fontSize="10">
                60%
              </text>
              <text x="370" y="235" fill="#777587" fontFamily="JetBrains Mono" fontSize="10">
                70%
              </text>
              <text
                x="530"
                y="235"
                fill="#006e4c"
                fontFamily="JetBrains Mono"
                fontSize="10"
                fontWeight="bold"
              >
                82% [Optimal]
              </text>
              <text x="660" y="235" fill="#777587" fontFamily="JetBrains Mono" fontSize="10">
                90%
              </text>
              <text x="760" y="235" fill="#777587" fontFamily="JetBrains Mono" fontSize="10">
                95%
              </text>
            </svg>
          </div>

          {/* Legend and Explanatory Insights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs text-[#464555]">
            <div className="p-3 rounded-lg bg-[#eff4ff] border border-[#e5eeff] flex flex-col gap-1">
              <span className="font-semibold text-[#0b1c30]">Under-Gating (&lt; 70%)</span>
              <span className="text-[11px]">
                Excessive automation yields 4.2% - 6.8% misdirected cases, flooding Tier-2 with reassignment overhead.
              </span>
            </div>
            <div className="p-3 rounded-lg bg-[#eff4ff] border border-[#85f8c4] flex flex-col gap-1">
              <span className="font-semibold text-[#006e4c]">Equilibrium Zone (80% - 84%)</span>
              <span className="text-[11px]">
                Current threshold at 82.0% captures optimal operational cost ratio while keeping misroutes at 1.6%.
              </span>
            </div>
            <div className="p-3 rounded-lg bg-[#eff4ff] border border-[#e5eeff] flex flex-col gap-1">
              <span className="font-semibold text-[#0b1c30]">Over-Gating (&gt; 90%)</span>
              <span className="text-[11px]">
                Misclassification drops to 0.9%, but auto-routed volume drops down to 48%, increasing backlog queue latency.
              </span>
            </div>
          </div>
        </div>

        {/* Live Threshold Calibration Simulator (4 Columns) */}
        <div className="xl:col-span-4 p-5 sm:p-6 bg-[#ffffff] rounded-xl shadow-sm border border-[#e5eeff] flex flex-col justify-between gap-5">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-base sm:text-lg font-bold text-[#0b1c30] font-headline">
                Threshold Simulator
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#eff4ff] font-mono text-xs text-[#464555] font-semibold border border-[#dce9ff]">
                Live Mode
              </span>
            </div>
            <p className="text-xs text-[#464555]">
              Simulate operational impact on triage workforce by adjusting confidence threshold cutoffs.
            </p>
          </div>

          {/* Interactive Slider Control */}
          <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-[#eff4ff] border border-[#dce9ff]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#0b1c30]">Gate Confidence Cutoff</span>
              <span className="font-mono text-xs px-2 py-0.5 bg-[#4f46e5] text-white rounded font-bold">
                {threshold.toFixed(1)}%
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              step="1"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full h-2 bg-[#dce9ff] rounded-lg appearance-none cursor-pointer accent-[#3525cd]"
            />
            <div className="flex justify-between font-mono text-[10px] text-[#777587]">
              <span>50% (High Auto)</span>
              <span className="text-[#006e4c] font-semibold">82% (Nominal)</span>
              <span>95% (Safe)</span>
            </div>
          </div>

          {/* Projected Workload Distribution */}
          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-semibold text-[#777587] uppercase tracking-wider">
              Projected Daily Ticket Split ({totalDailyTickets.toLocaleString()} tickets)
            </span>

            {/* Metric 1 */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-[#0b1c30] font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3525cd]"></span>
                  Instant Auto-Routing
                </span>
                <span className="font-mono text-xs font-bold text-[#0b1c30]">
                  {autoCases.toLocaleString()} cases ({autoRate.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-[#eff4ff] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#3525cd] h-full rounded-full transition-all duration-300"
                  style={{ width: `${autoRate}%` }}
                ></div>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-[#0b1c30] font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#5b598c]"></span>
                  Human Supervisory Queue
                </span>
                <span className="font-mono text-xs font-bold text-[#0b1c30]">
                  {manualCases.toLocaleString()} cases ({manualRate.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-[#eff4ff] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#5b598c] h-full rounded-full transition-all duration-300"
                  style={{ width: `${manualRate}%` }}
                ></div>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-[#0b1c30] font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a]"></span>
                  Projected Misroutes
                </span>
                <span className="font-mono text-xs font-bold text-[#ba1a1a]">
                  {errorCases.toLocaleString()} cases ({errorRate.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-[#eff4ff] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#ba1a1a] h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, errorRate * 12)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Production Gate Confirmation */}
          <button
            onClick={handleDeployCalibration}
            disabled={isDeploying}
            className="w-full py-2.5 px-4 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] text-xs font-semibold transition-colors flex items-center justify-center gap-2 border border-[#dce9ff]"
          >
            {isDeploying ? (
              <span className="animate-spin text-[#3525cd]">⚙</span>
            ) : (
              <Sliders className="w-4 h-4 text-[#006e4c]" />
            )}
            <span>{isDeploying ? 'Deploying Gate...' : 'Deploy Calibration to Edge Ingestion'}</span>
          </button>
        </div>
      </div>

      {/* Model Architecture Comparison Table */}
      <div className="w-full bg-[#ffffff] rounded-xl shadow-sm border border-[#e5eeff] p-5 sm:p-6 flex flex-col gap-4 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#0b1c30] font-headline">
              Model Architecture Comparison & Benchmarks
            </h2>
            <p className="text-xs text-[#464555]">
              Standardized CLINC150 dataset evaluation across latency, footprint, and generalized inference
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#777587]">Dataset Version:</span>
            <span className="px-2 py-0.5 rounded bg-[#eff4ff] font-mono text-xs text-[#0b1c30] font-medium border border-[#dce9ff]">
              CLINC150-v2-eval
            </span>
          </div>
        </div>

        <div className="w-full overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#eff4ff] text-[#464555] text-[11px] font-semibold uppercase tracking-wider border-b border-[#e5eeff]">
                <th className="py-3 px-4 rounded-l-lg">Model Architecture</th>
                <th className="py-3 px-4">CLINC150 Accuracy</th>
                <th className="py-3 px-4">Unsupported Recall</th>
                <th className="py-3 px-4">Inference Latency (p95)</th>
                <th className="py-3 px-4">Memory Footprint</th>
                <th className="py-3 px-4 rounded-r-lg">Production Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5eeff] text-xs">
              {BENCHMARK_MODELS.map((model, idx) => (
                <tr
                  key={idx}
                  className={`hover:bg-[#f8f9ff] transition-colors ${
                    model.statusBadgeType === 'live' ? 'bg-[#eff4ff]/60' : ''
                  }`}
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      {model.statusBadgeType === 'archived' && (
                        <History className="w-4 h-4 text-[#777587]" />
                      )}
                      {model.statusBadgeType === 'live' && (
                        <CheckCircle className="w-4 h-4 text-[#006e4c]" />
                      )}
                      {model.statusBadgeType === 'shadow' && (
                        <FlaskConical className="w-4 h-4 text-[#5b598c]" />
                      )}
                      <div>
                        <span className="font-semibold text-[#0b1c30] block">
                          {model.architecture}
                        </span>
                        <span className="font-mono text-[11px] text-[#464555]">
                          {model.versionTag}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#0b1c30]">
                    {model.accuracy}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#006e4c] font-semibold">
                    {model.unsupportedRecall}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#0b1c30]">
                    <span className="inline-flex items-center gap-1 font-semibold text-[#006e4c]">
                      ⚡ {model.latencyP95}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#464555]">{model.memoryFootprint}</td>
                  <td className="py-3.5 px-4">
                    {model.statusBadgeType === 'live' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#85f8c4] text-[#002114] text-[11px] font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#006e4c] animate-pulse"></span>
                        Live Production
                      </span>
                    )}
                    {model.statusBadgeType === 'shadow' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#dce9ff] text-[#3525cd] text-[11px] font-semibold">
                        Shadow Pipeline (Evaluating)
                      </span>
                    )}
                    {model.statusBadgeType === 'archived' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#777587] text-[11px] font-semibold">
                        Archived
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Per-Category Performance Heatmap & Agent Retraining Stream */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Heatmap Grid (8 Columns) */}
        <div className="lg:col-span-8 p-5 sm:p-6 bg-[#ffffff] rounded-xl shadow-sm border border-[#e5eeff] flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#0b1c30] font-headline">
                Per-Category Triage Accuracy
              </h2>
              <p className="text-xs text-[#464555]">
                Validation split breakdown across top critical intents
              </p>
            </div>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#eff4ff] text-[#464555] border border-[#dce9ff]">
              F1 Micro: 0.924
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {CATEGORY_METRICS.map((cat, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl bg-[#eff4ff] border border-[#dce9ff] flex flex-col gap-2 ${
                  cat.isOod ? 'sm:col-span-2 lg:col-span-2' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-[#0b1c30] truncate">
                    {cat.category}
                  </span>
                  <span className="text-[11px] px-1.5 py-0.5 rounded bg-[#85f8c4] text-[#002114] font-bold">
                    {cat.accuracy}%
                  </span>
                </div>
                <div className="w-full bg-[#dce9ff] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#006e4c] h-full rounded-full"
                    style={{ width: `${cat.accuracy}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[11px] text-[#777587]">
                  <span>False Positives: {cat.falsePositives}</span>
                  <span>Recall: {cat.recall}%</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-[#eff4ff] border border-[#c7c4d8]/40 flex items-start gap-3 mt-1">
            <Shield className="w-5 h-5 text-[#3525cd] shrink-0 mt-0.5" />
            <div className="flex flex-col text-xs">
              <span className="font-semibold text-[#0b1c30]">
                Strict Governance & Test Set Isolation
              </span>
              <span className="text-[#464555] text-[11px]">
                Final test set held-out strictly isolated from agent retraining feedback loop. Data
                integrity hashing prevents synthetic overfitting or circular evaluation contamination.
              </span>
            </div>
          </div>
        </div>

        {/* Agent Retraining & Correction Stream (4 Columns) */}
        <div className="lg:col-span-4 p-5 sm:p-6 bg-[#ffffff] rounded-xl shadow-sm border border-[#e5eeff] flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-[#0b1c30] font-headline">
                Correction Stream
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#ffdad6] text-[#93000a] font-mono text-xs font-semibold">
                {corrections.length} pending
              </span>
            </div>
            <p className="text-xs text-[#464555]">
              Recently corrected predictions pending supervisor verification
            </p>
          </div>

          <div className="flex flex-col gap-2.5 overflow-hidden">
            {corrections.length > 0 ? (
              corrections.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-[#eff4ff] border border-[#dce9ff] flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between font-mono text-[11px] text-[#464555]">
                    <span className="font-bold text-[#3525cd]">{item.ticketId}</span>
                    <span>Agent: {item.agent}</span>
                  </div>
                  <p className="text-xs text-[#0b1c30] line-clamp-2">
                    &ldquo;{item.transcriptExcerpt}&rdquo;
                  </p>
                  <div className="flex items-center gap-1.5 text-xs mt-1">
                    <span className="line-through text-[#777587] font-mono text-[11px]">
                      {item.originalIntent}
                    </span>
                    <ArrowRight className="w-3 h-3 text-[#777587]" />
                    <span className="text-[#006e4c] font-semibold font-mono text-[11px]">
                      {item.correctedIntent}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-[#777587] bg-[#eff4ff] rounded-xl border border-dashed border-[#c7c4d8]">
                All pending agent correction tokens committed!
              </div>
            )}
          </div>

          <button
            onClick={handleCommitCorrections}
            disabled={isCommitting || corrections.length === 0}
            className="w-full py-2.5 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border border-[#dce9ff] disabled:opacity-50"
          >
            {isCommitting ? (
              <span className="animate-spin">⚙</span>
            ) : (
              <Upload className="w-4 h-4 text-[#3525cd]" />
            )}
            <span>
              {isCommitting
                ? 'Committing Tokens...'
                : `Commit ${corrections.length * 47} Tokens to Retrain Set`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
