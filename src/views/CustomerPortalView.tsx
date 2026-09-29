import React, { useState } from 'react';
import {
  HelpCircle,
  UploadCloud,
  Send,
  CheckCircle2,
  X,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowRight,
  Mail,
  Phone,
  Paperclip,
  Check,
  Compass,
} from 'lucide-react';
import { ImageCompressorModal } from '../components/ImageCompressorModal';

interface CustomerPortalViewProps {
  onShowToast: (title: string, message: string, type: 'success' | 'error' | 'info') => void;
  onNavigate: (module: any) => void;
}

export const CustomerPortalView: React.FC<CustomerPortalViewProps> = ({
  onShowToast,
  onNavigate,
}) => {
  const [subject, setSubject] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [priority, setPriority] = useState<'Standard' | 'Urgent'>('Standard');
  const [attachedFile, setAttachedFile] = useState<{
    name: string;
    sizeSummary: string;
    url?: string;
  } | null>(null);
  const [isCompressorOpen, setIsCompressorOpen] = useState<boolean>(false);
  const [submittedTicket, setSubmittedTicket] = useState<{
    id: string;
    intent: string;
    confidence: number;
    team: string;
  } | null>({
    id: '#RD-4892',
    intent: 'Billing & Invoicing Reconciliation',
    confidence: 0.94,
    team: 'Payments Tier 2',
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showNetworkError, setShowNetworkError] = useState<boolean>(true);

  // Dynamic real-time intent classification
  const combinedText = (subject + ' ' + description).toLowerCase();
  const charLength = description.trim().length;
  const isInputTooShort = charLength > 0 && charLength < 15;

  let predictedIntent = 'General Operations & Product Inquiries';
  let predictedScore = 84.7;
  let intentBadgeClass = 'bg-[#eff4ff] text-[#0b1c30] border-[#dce9ff]';

  if (charLength >= 15) {
    if (
      combinedText.includes('bill') ||
      combinedText.includes('charge') ||
      combinedText.includes('invoice') ||
      combinedText.includes('refund') ||
      combinedText.includes('payment')
    ) {
      predictedIntent = 'Billing & Payment Dispute';
      predictedScore = 96.4;
      intentBadgeClass = 'bg-[#85f8c4] text-[#002114] border-[#006e4c]/30 font-semibold';
    } else if (
      combinedText.includes('api') ||
      combinedText.includes('timeout') ||
      combinedText.includes('endpoint') ||
      combinedText.includes('token') ||
      combinedText.includes('webhook')
    ) {
      predictedIntent = 'Developer Platform & API Gateway';
      predictedScore = 92.8;
      intentBadgeClass = 'bg-[#e2dfff] text-[#0f0069] border-[#3525cd]/30 font-semibold';
    } else if (
      combinedText.includes('login') ||
      combinedText.includes('password') ||
      combinedText.includes('auth') ||
      combinedText.includes('sim') ||
      combinedText.includes('2fa')
    ) {
      predictedIntent = 'Access Control & IAM Security';
      predictedScore = 89.1;
      intentBadgeClass = 'bg-[#e3dfff] text-[#181445] border-[#5b598c]/30 font-semibold';
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim().length < 15) {
      onShowToast(
        'Input Validation Error',
        'Please provide at least 15 characters in the description for accurate ML classification.',
        'error'
      );
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const generatedId = '#RD-' + Math.floor(4000 + Math.random() * 5000);
      const newTicket = {
        id: generatedId,
        intent: predictedIntent,
        confidence: predictedScore / 100,
        team: predictedIntent.includes('Billing')
          ? 'Billing & Ledger Squad'
          : predictedIntent.includes('API')
          ? 'Platform Engineering'
          : 'Tier 2 Auth Squad',
      };
      setSubmittedTicket(newTicket);
      onShowToast(
        'Request Dispatched',
        `Ticket ${generatedId} submitted with ${predictedScore.toFixed(1)}% confidence to ${newTicket.team}`,
        'success'
      );
      setSubject('');
      setDescription('');
      setAttachedFile(null);
    }, 700);
  };

  const handleInjectSample = () => {
    setSubject('Webhook delivery failure on Stripe invoice.payment_succeeded');
    setDescription(
      'Our production listener started returning 500 responses around 13:45 UTC. Approximately 1,420 subscription renewals were impacted and need programmatic re-dispatch.'
    );
    onShowToast('Test Data Injected', 'Sample FinTech webhook scenario populated in form.', 'info');
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-full pb-12 overflow-x-hidden">
      {/* Compressor Modal */}
      <ImageCompressorModal
        isOpen={isCompressorOpen}
        onClose={() => setIsCompressorOpen(false)}
        onUseCompressedImage={(dataUrl, filename, sizeSummary) => {
          setAttachedFile({ name: filename, sizeSummary, url: dataUrl });
          onShowToast('Image Compressed & Attached', `Attached ${filename} (${sizeSummary})`, 'success');
        }}
      />

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-1">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#3525cd]">
              Triage & Diagnostics Suite
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#85f8c4] text-[#002114] text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#006e4c] animate-pulse"></span>
              Test Lab v2.4
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#0b1c30] font-headline tracking-tight">
            Customer Portal & Empty State Lab
          </h1>
          <p className="text-xs sm:text-sm text-[#464555] max-w-2xl">
            Simulate real-time ticket ingestion, ML intent auto-tagging, deterministic validation boundaries, and queue edge conditions with zero latency.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0">
          <button
            type="button"
            onClick={handleInjectSample}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#3525cd] text-white hover:bg-[#4f46e5] shadow-sm text-xs font-semibold transition-all"
          >
            <span>⚡</span>
            <span>Inject Test Ticket</span>
          </button>
        </div>
      </div>

      {/* Active Success Notification Banner */}
      {submittedTicket && (
        <div className="w-full bg-[#ffffff] rounded-xl p-4 shadow-sm border border-[#85f8c4] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#85f8c4] text-[#006e4c] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs sm:text-sm font-bold text-[#0b1c30] font-headline">
                  Request {submittedTicket.id} submitted successfully
                </span>
                <span className="px-2 py-0.5 rounded bg-[#006e4c] text-white text-[10px] font-bold font-mono">
                  {(submittedTicket.confidence * 100).toFixed(0)}% Confidence
                </span>
              </div>
              <span className="text-xs text-[#464555]">
                Estimated resolution: 24 mins · Assigned squad: {submittedTicket.team}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              onClick={() => onNavigate('agent-inbox')}
              className="px-3 py-1.5 rounded-lg bg-[#eff4ff] text-[#3525cd] hover:bg-[#dce9ff] text-xs font-semibold transition-colors"
            >
              Track in Agent Inbox
            </button>
            <button
              onClick={() => setSubmittedTicket(null)}
              className="p-1.5 text-[#777587] hover:text-[#0b1c30] rounded-lg hover:bg-[#eff4ff] transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
        {/* Left Column: Submission Form & Active Pipeline */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Form */}
          <div className="bg-[#ffffff] rounded-xl p-5 sm:p-6 shadow-sm border border-[#e5eeff] flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e5eeff]">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#3525cd]" />
                <h2 className="text-base sm:text-lg font-bold text-[#0b1c30] font-headline">
                  Self-Service Submission
                </h2>
              </div>
              <span className="font-mono text-xs text-[#777587]">INTENT-AUTO-CLASSIFIER</span>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Subject */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="inquiry-subject"
                  className="text-xs font-semibold text-[#0b1c30] flex items-center justify-between"
                >
                  <span>Inquiry Subject</span>
                  <span className="font-mono text-[11px] text-[#777587]">
                    {subject.length} / 80
                  </span>
                </label>
                <input
                  id="inquiry-subject"
                  type="text"
                  maxLength={80}
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Double billed for monthly enterprise seat allocation"
                  className="w-full h-10 px-3 rounded-lg bg-[#eff4ff] border border-[#dce9ff] text-xs sm:text-sm text-[#0b1c30] placeholder:text-[#777587] focus:outline-none focus:bg-[#ffffff] focus:border-[#3525cd] transition-all"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="inquiry-desc" className="text-xs font-semibold text-[#0b1c30]">
                    Issue Description
                  </label>
                  <div className="flex items-center gap-2">
                    {isInputTooShort && (
                      <span className="text-[11px] text-[#ba1a1a] font-medium">
                        Requires ≥15 chars for ML inference
                      </span>
                    )}
                    <span className="font-mono text-[11px] text-[#777587]">
                      {description.length} / 1000
                    </span>
                  </div>
                </div>
                <textarea
                  id="inquiry-desc"
                  rows={4}
                  maxLength={1000}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail the observed anomaly, transaction hashes, or affected tenant IDs..."
                  className={`w-full p-3 rounded-lg bg-[#eff4ff] border text-xs sm:text-sm text-[#0b1c30] placeholder:text-[#777587] focus:outline-none focus:bg-[#ffffff] transition-all resize-none ${
                    isInputTooShort
                      ? 'border-[#ba1a1a] focus:border-[#ba1a1a]'
                      : 'border-[#dce9ff] focus:border-[#3525cd]'
                  }`}
                />
              </div>

              {/* Real-time Predictive Intent Box */}
              <div className="bg-[#eff4ff] rounded-xl p-3.5 flex flex-col gap-2 border border-[#dce9ff]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#777587] uppercase tracking-wider">
                    Predictive Intent Feedback
                  </span>
                  <span className="inline-flex items-center gap-1 font-mono text-xs text-[#3525cd]">
                    <Sparkles className="w-3.5 h-3.5" />
                    Real-time NLP
                  </span>
                </div>

                <div
                  className={`flex items-center gap-2 py-2 px-3 rounded-lg border text-xs transition-all ${intentBadgeClass}`}
                >
                  <Layers className="w-4 h-4 shrink-0 text-[#777587]" />
                  <span className="truncate">
                    {charLength < 15
                      ? 'ML will predict category automatically as you type...'
                      : `Predicted Intent: ${predictedIntent} (${predictedScore.toFixed(1)}%)`}
                  </span>
                </div>
              </div>

              {/* Evidence Log & Compression Dropzone (Requirement 5) */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-[#0b1c30]">
                  <span>Diagnostics & Evidence Log</span>
                  <button
                    type="button"
                    onClick={() => setIsCompressorOpen(true)}
                    className="text-[#3525cd] text-xs hover:underline flex items-center gap-1"
                  >
                    <span>⚡</span> Open Image Compressor Tool
                  </button>
                </div>

                <div
                  onClick={() => setIsCompressorOpen(true)}
                  className="w-full p-4 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff]/50 border border-dashed border-[#c7c4d8] hover:border-[#3525cd] transition-all flex flex-col sm:flex-row items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#e2dfff] text-[#3525cd] flex items-center justify-center shrink-0">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-[#0b1c30]">
                        Drop HAR archives, screenshots or logs
                      </span>
                      <span className="text-[11px] text-[#464555]">
                        PNG, JPG, PDF up to 10MB auto-compressed to WebP
                      </span>
                    </div>
                  </div>
                  <span className="px-3 py-1.5 rounded-lg bg-[#ffffff] text-[#0b1c30] text-xs font-semibold shadow-sm shrink-0 border border-[#dce9ff]">
                    Browse & Compress
                  </span>
                </div>

                {attachedFile && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-[#85f8c4] text-[#002114] text-xs border border-[#006e4c]/30 mt-1">
                    <div className="flex items-center gap-2 truncate">
                      <Paperclip className="w-4 h-4 shrink-0 text-[#006e4c]" />
                      <span className="font-semibold truncate">{attachedFile.name}</span>
                      <span className="text-[11px] text-[#005137] shrink-0 font-mono">
                        ({attachedFile.sizeSummary})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachedFile(null)}
                      className="p-1 hover:opacity-75"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Priority & Dispatch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#0b1c30]">Priority SLA Level</label>
                  <div className="grid grid-cols-2 gap-2 bg-[#eff4ff] p-1 rounded-xl border border-[#dce9ff]">
                    <button
                      type="button"
                      onClick={() => setPriority('Standard')}
                      className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                        priority === 'Standard'
                          ? 'bg-[#ffffff] text-[#0b1c30] shadow-sm'
                          : 'text-[#464555] hover:text-[#0b1c30]'
                      }`}
                    >
                      Standard
                    </button>
                    <button
                      type="button"
                      onClick={() => setPriority('Urgent')}
                      className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                        priority === 'Urgent'
                          ? 'bg-[#ba1a1a] text-white shadow-sm'
                          : 'text-[#464555] hover:text-[#0b1c30]'
                      }`}
                    >
                      Urgent (P1)
                    </button>
                  </div>
                </div>

                <div className="flex flex-col justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-10 rounded-xl bg-[#3525cd] text-white hover:bg-[#4f46e5] text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99] disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="animate-spin">⚙</span>
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>{isSubmitting ? 'Evaluating ML Intent...' : 'Dispatch Request'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Active Request Pipeline */}
          <div className="bg-[#ffffff] rounded-xl p-5 sm:p-6 shadow-sm border border-[#e5eeff] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#006e4c]" />
                <h3 className="text-sm sm:text-base font-bold text-[#0b1c30] font-headline">
                  Active Request Pipeline · #RD-4892
                </h3>
              </div>
              <span className="font-mono text-xs text-[#777587]">STAGE 3 OF 4 ACTIVE</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div className="flex flex-col gap-1.5">
                <div className="w-7 h-7 rounded-full bg-[#006e4c] text-white flex items-center justify-center text-xs font-bold shadow-sm">
                  <Check className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-[#0b1c30]">1. Submitted</span>
                <span className="text-[11px] text-[#464555]">Client authenticated</span>
                <span className="font-mono text-[10px] text-[#777587]">14:02:11 UTC</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="w-7 h-7 rounded-full bg-[#006e4c] text-white flex items-center justify-center text-xs font-bold shadow-sm">
                  <Check className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-[#0b1c30]">2. ML Classified</span>
                <span className="text-[11px] text-[#006e4c] font-semibold">94% Confidence</span>
                <span className="font-mono text-[10px] text-[#777587]">CLINC150 Match</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="w-7 h-7 rounded-full bg-[#3525cd] text-white flex items-center justify-center text-xs font-bold shadow-sm ring-4 ring-[#e2dfff]">
                  <RotateCcw className="w-4 h-4 animate-spin" />
                </div>
                <span className="text-xs font-bold text-[#3525cd]">3. Auto-Routed</span>
                <span className="text-[11px] text-[#0b1c30] font-medium">Payments Tier 2</span>
                <span className="font-mono text-[10px] text-[#3525cd]">Assigned: Alex M.</span>
              </div>

              <div className="flex flex-col gap-1.5 opacity-60">
                <div className="w-7 h-7 rounded-full bg-[#eff4ff] text-[#777587] flex items-center justify-center text-xs font-bold border border-[#dce9ff]">
                  4
                </div>
                <span className="text-xs font-bold text-[#0b1c30]">4. Resolved</span>
                <span className="text-[11px] text-[#464555]">SLA Target &lt; 45m</span>
                <span className="font-mono text-[10px] text-[#777587]">Awaiting customer</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Telemetry, Empty State Sandbox & Diagnostics */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Telemetry Visual Box */}
          <div className="bg-[#ffffff] rounded-xl p-5 shadow-sm border border-[#e5eeff] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#777587]">
                Sandbox Telemetry
              </span>
              <span className="px-2 py-0.5 rounded bg-[#eff4ff] font-mono text-xs text-[#0b1c30] border border-[#dce9ff]">
                MOCK_RUN_ID #882
              </span>
            </div>

            <div className="relative w-full h-44 rounded-xl overflow-hidden bg-[#213145] flex flex-col justify-end p-4 border border-[#e5eeff]">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBKzT3kRhNBzVoJHWxRvjdn9hB4ppF8ABSIlAnJBuYQeHqTvfhXde3MfKa5zJ9BzQTd0l9zhDf8x7h8RHs6lU2iPzSt_GTBtjFPY4k6Ry-LDqO-FhLyeYjlBkQAO0i41DPRUmhBVHSPFY7c4ENXgBbNZ0n64FdXe27Y2AibPpyIN5WPOJwWa1ci_JYknIFWGYOED2Z-_O1vxuAOYNbuPExORUsQ7FN69jDnYcYVFmPdKi5eNfUhdw6fgQ')",
                }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#213145]/90 via-[#213145]/40 to-transparent"></div>
              <div className="relative z-10 flex flex-col text-[#eaf1ff]">
                <span className="text-[10px] tracking-wider uppercase font-semibold text-[#85f8c4]">
                  Live Command Center
                </span>
                <span className="text-sm font-bold font-headline">
                  High-Throughput ML Ingestion Pipeline
                </span>
              </div>
            </div>

            {/* Empty State Lab Component */}
            <div className="p-5 rounded-xl bg-[#eff4ff] border border-[#dce9ff] flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#ffffff] text-[#3525cd] flex items-center justify-center shadow-sm border border-[#dce9ff]">
                <CheckCircle2 className="w-6 h-6 text-[#006e4c]" />
              </div>
              <div className="flex flex-col gap-1 max-w-sm">
                <h4 className="text-sm font-bold text-[#0b1c30] font-headline">
                  Review Queue Zero Deficit
                </h4>
                <p className="text-xs text-[#464555]">
                  All incoming customer inquiries have been successfully routed or assigned. New requests will appear dynamically.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('empty-state')}
                className="text-xs text-[#3525cd] font-semibold hover:underline flex items-center gap-1"
              >
                <span>View Full Dedicated Empty State Page</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Diagnostic & Error Scenarios (Requirement 14) */}
          <div className="bg-[#ffffff] rounded-xl p-5 shadow-sm border border-[#e5eeff] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#ba1a1a]" />
                <h3 className="text-xs sm:text-sm font-bold text-[#0b1c30] font-headline">
                  Error & Diagnostic Simulator
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#777587]">SIMULATION FEED</span>
            </div>

            {/* Network Timeout Card */}
            {showNetworkError && (
              <div className="p-3 rounded-xl bg-[#ffdad6] border border-[#ba1a1a]/30 text-[#93000a] flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-[#ba1a1a] shrink-0 mt-0.5" />
                <div className="flex flex-col flex-1 min-w-0 text-xs">
                  <span className="font-bold">Simulated Network Timeout</span>
                  <span className="text-[11px] text-[#93000a]/90 break-words">
                    Could not reach inference proxy at <code className="font-mono bg-white/60 px-1 rounded">/api/v1/classify</code>.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onShowToast('Reconnected', 'Successfully reached classification edge endpoint.', 'success');
                    setShowNetworkError(false);
                  }}
                  className="px-2.5 py-1 rounded bg-[#ba1a1a] text-white text-[11px] font-semibold hover:opacity-90 shrink-0"
                >
                  Retry
                </button>
              </div>
            )}

            {/* 404 Route Simulation Card (Requirement 16) */}
            <div className="p-3 rounded-xl bg-[#eff4ff] border border-[#dce9ff] flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#0b1c30]">404 Fallback Route Simulator</span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#dce9ff] text-[#0b1c30]">
                  STATUS 404
                </span>
              </div>
              <p className="text-[11px] text-[#464555]">
                Test the application-wide 404 error handler when a requested ticket ID or API endpoint does not exist.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('not-found')}
                className="w-full py-1.5 rounded-lg bg-[#3525cd] text-white hover:bg-[#4f46e5] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Preview 404 Not Found Page</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer with Clickable Email and Phone (Requirements 6 & 17) */}
      <footer className="w-full bg-[#ffffff] rounded-xl p-5 shadow-sm border border-[#e5eeff] flex flex-col md:flex-row items-center justify-between gap-4 mt-2">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#4f46e5] text-white flex items-center justify-center font-bold text-xs">
              R
            </div>
            <span className="font-bold text-[#0b1c30] text-sm font-headline">ResolveDesk</span>
          </div>
          <span className="text-xs text-[#777587]">
            © 2026 ResolveDesk Technologies Inc. All rights reserved.
          </span>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <a
              href="mailto:support@resolvedesk.io"
              className="flex items-center gap-1.5 text-xs font-medium text-[#3525cd] hover:underline"
            >
              <Mail className="w-4 h-4" />
              <span>support@resolvedesk.io</span>
            </a>
            <span className="text-[#c7c4d8]">·</span>
            <a
              href="tel:+18005550199"
              aria-label="Call ResolveDesk Support at +1 (800) 555-0199"
              className="flex items-center gap-1.5 text-xs font-medium text-[#006e4c] hover:underline"
            >
              <Phone className="w-4 h-4" />
              <span>+1 (800) 555-0199</span>
            </a>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded bg-[#eff4ff] font-mono text-[10px] text-[#464555] border border-[#dce9ff]">
              SOC-2 Type II
            </span>
            <span className="px-2 py-0.5 rounded bg-[#eff4ff] font-mono text-[10px] text-[#464555] border border-[#dce9ff]">
              ISO 27001
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
