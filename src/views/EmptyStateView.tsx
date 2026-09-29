import React from 'react';
import {
  Inbox,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Plus,
  RefreshCw,
  Sliders,
  ShieldCheck,
  Mail,
  Phone,
} from 'lucide-react';
import { NavigationModule } from '../types';

interface EmptyStateViewProps {
  onNavigate: (module: NavigationModule) => void;
  onShowToast: (title: string, message: string, type: 'success' | 'error' | 'info') => void;
}

export const EmptyStateView: React.FC<EmptyStateViewProps> = ({
  onNavigate,
  onShowToast,
}) => {
  const handleSeedBatch = () => {
    onShowToast(
      'Batch Ingestion Simulated',
      'Injected 12 synthetic customer inquiries into Agent Inbox queue.',
      'success'
    );
    onNavigate('agent-inbox');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] w-full max-w-4xl mx-auto py-8 px-4 text-center">
      {/* Decorative Brand Emblem */}
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-3xl bg-[#eff4ff] border-2 border-[#dce9ff] flex items-center justify-center text-[#3525cd] shadow-md">
          <Inbox className="w-12 h-12 text-[#3525cd]" />
        </div>
        <div className="absolute -bottom-2 -right-2 p-2 rounded-2xl bg-[#006e4c] text-white shadow-lg ring-4 ring-[#ffffff]">
          <CheckCircle2 className="w-6 h-6" />
        </div>
      </div>

      {/* Main Title & Subtitle */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#85f8c4] text-[#002114] text-xs font-semibold mb-3">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Inbox Zero · All Triage Queues Clear</span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-[#0b1c30] font-headline tracking-tight max-w-lg">
        No Pending Cases Require Human Review
      </h1>

      <p className="text-sm text-[#464555] max-w-md mt-2 leading-relaxed">
        The ML classification gate (CLINC150-TFIDF-LR-v2.1) has auto-routed 100% of recent inbound inquiries with confidence exceeding the 82% operational threshold.
      </p>

      {/* Stat Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-lg my-6">
        <div className="p-3.5 rounded-xl bg-[#ffffff] border border-[#e5eeff] shadow-sm flex flex-col items-center">
          <span className="text-[11px] font-semibold text-[#777587] uppercase">Daily Handled</span>
          <span className="text-xl font-bold text-[#0b1c30] font-headline mt-1">12,400</span>
          <span className="text-[10px] text-[#006e4c] font-medium mt-0.5">100% Dispatch</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#ffffff] border border-[#e5eeff] shadow-sm flex flex-col items-center">
          <span className="text-[11px] font-semibold text-[#777587] uppercase">Gate Status</span>
          <span className="text-xl font-bold text-[#006e4c] font-headline mt-1">82.0%</span>
          <span className="text-[10px] text-[#464555] font-medium mt-0.5">Optimal Zone</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#ffffff] border border-[#e5eeff] shadow-sm flex flex-col items-center col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold text-[#777587] uppercase">Pipeline Uptime</span>
          <span className="text-xl font-bold text-[#3525cd] font-headline mt-1">99.98%</span>
          <span className="text-[10px] text-[#006e4c] font-medium mt-0.5">Nominal Health</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
        <button
          onClick={handleSeedBatch}
          className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#3525cd] text-white hover:bg-[#4f46e5] text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
        >
          <Plus className="w-4 h-4" />
          <span>Inject Test Inquiries (12)</span>
        </button>

        <button
          onClick={() => onNavigate('customer-portal')}
          className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#ffffff] text-[#0b1c30] hover:bg-[#eff4ff] border border-[#dce9ff] text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
        >
          <span>Submit Real Ticket</span>
          <ArrowRight className="w-4 h-4 text-[#3525cd]" />
        </button>
      </div>

      {/* Secondary Links */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-[#464555]">
        <button
          onClick={() => onNavigate('routing-analytics')}
          className="hover:text-[#3525cd] flex items-center gap-1 transition-colors"
        >
          <Sliders className="w-3.5 h-3.5 text-[#3525cd]" />
          <span>Adjust Confidence Threshold</span>
        </button>
        <span className="text-[#c7c4d8]">·</span>
        <button
          onClick={() => onNavigate('project-blueprint-and-architecture')}
          className="hover:text-[#3525cd] flex items-center gap-1 transition-colors"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-[#006e4c]" />
          <span>Inspect Architecture & DDL</span>
        </button>
        <span className="text-[#c7c4d8]">·</span>
        <a
          href="tel:+18005550199"
          className="hover:text-[#006e4c] flex items-center gap-1 transition-colors"
        >
          <Phone className="w-3.5 h-3.5 text-[#006e4c]" />
          <span>Ops Hotline</span>
        </a>
      </div>
    </div>
  );
};
