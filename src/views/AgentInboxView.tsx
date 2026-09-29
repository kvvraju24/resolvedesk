import React, { useState } from 'react';
import {
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle,
  X,
  Search,
  Mail,
  Phone,
  Star,
  Share2,
  Brain,
  ShieldAlert,
  ArrowRight,
  Check,
  Edit3,
  Ban,
  ArrowUpRight,
  Building,
  User,
  Zap,
} from 'lucide-react';
import { Ticket } from '../types';
import { INITIAL_TICKETS } from '../data/mockData';

interface AgentInboxViewProps {
  onShowToast: (title: string, message: string, type: 'success' | 'error' | 'info') => void;
}

export const AgentInboxView: React.FC<AgentInboxViewProps> = ({ onShowToast }) => {
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [selectedTicketId, setSelectedTicketId] = useState<string>('#RD-4891');
  const [gateThreshold, setGateThreshold] = useState<number>(82);
  const [activeFilter, setActiveFilter] = useState<'all' | 'review' | 'auto' | 'ood'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showSuccessBanner, setShowSuccessBanner] = useState<boolean>(true);
  const [bannerMessage, setBannerMessage] = useState<string>(
    'Ticket #RD-4887 dispatched with 94% ML certainty to Cards Operations Team'
  );
  const [overrideIntent, setOverrideIntent] = useState<string>('account_security');
  const [reassignedTeam, setReassignedTeam] = useState<string>('auth_squad');
  const [agentNote, setAgentNote] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [mobileActiveTab, setMobileActiveTab] = useState<'queue' | 'review'>('queue');

  const selectedTicket =
    tickets.find((t) => t.id === selectedTicketId) || tickets[0];

  // Dynamic simulation numbers based on gate threshold
  const totalVolume = 4650;
  const autoRatio = Math.max(30, Math.min(95, 100 - (gateThreshold - 50) * 1.48));
  const humanRatio = 100 - autoRatio;
  const autoCount = Math.round((autoRatio / 100) * totalVolume);
  const humanCount = totalVolume - autoCount;
  const misclassRisk = Math.max(0.6, autoRatio * 0.0245);

  // Filter tickets
  const filteredTickets = tickets.filter((t) => {
    // Status tab filter
    if (activeFilter === 'review' && t.status !== 'review_needed') return false;
    if (activeFilter === 'auto' && t.status !== 'auto_routed') return false;
    if (activeFilter === 'ood' && t.status !== 'ood_rejected') return false;

    // Category filter
    if (selectedCategory !== 'All' && !t.predictedIntent.includes(selectedCategory.toLowerCase())) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSub = t.subject.toLowerCase().includes(q);
      const matchTrans = t.fullTranscript.toLowerCase().includes(q);
      const matchCust = t.customer.name.toLowerCase().includes(q);
      const matchIntent = t.predictedIntent.toLowerCase().includes(q);
      const matchId = t.id.toLowerCase().includes(q);
      return matchSub || matchTrans || matchCust || matchIntent || matchId;
    }

    return true;
  });

  const handleConfirmRoute = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setTickets((prev) =>
        prev.map((t) =>
          t.id === selectedTicket.id
            ? {
                ...t,
                status: 'auto_routed',
                timeAgo: 'Just now',
              }
            : t
        )
      );
      setBannerMessage(
        `Ticket ${selectedTicket.id} successfully confirmed and routed to ${selectedTicket.assignedTeam}`
      );
      setShowSuccessBanner(true);
      onShowToast(
        'Routing Confirmed',
        `Ticket ${selectedTicket.id} confirmed and dispatched to ${selectedTicket.assignedTeam} with full telemetry audit logged.`,
        'success'
      );
    }, 600);
  };

  const handleApplyOverride = () => {
    onShowToast(
      'Ground Truth Saved',
      `Corrected intent to "${overrideIntent}" and logged supervisor note. Feedback enqueued for next model fine-tuning iteration.`,
      'success'
    );
  };

  const handleMarkOod = () => {
    if (
      window.confirm(
        `Flag ${selectedTicket.id} as completely Out-Of-Domain (CLINC150 OOD benchmark)?`
      )
    ) {
      setTickets((prev) =>
        prev.map((t) =>
          t.id === selectedTicket.id
            ? {
                ...t,
                status: 'ood_rejected',
                predictedIntent: 'unsupported_intent',
              }
            : t
        )
      );
      onShowToast(
        'Flagged Out-Of-Domain',
        `Ticket ${selectedTicket.id} sent to deflection bot for courteous off-topic notification.`,
        'info'
      );
    }
  };

  const handleInsertMacro = () => {
    setAgentNote(
      'Customer carried out SIM swap; device identifier invalid. Enqueued for secondary hardware challenge bypass per Tier 2 Auth Policy.'
    );
    onShowToast('Macro Inserted', 'Inserted "SIM-Swap Security Macro" into note template.', 'info');
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-full pb-12 overflow-x-hidden">
      {/* Top Impact Simulator & Confidence Controller */}
      <section className="w-full bg-[#ffffff] rounded-xl p-5 sm:p-6 shadow-sm border border-[#e5eeff] flex flex-col gap-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center justify-center p-1.5 rounded-lg bg-[#e2dfff] text-[#3525cd]">
                <SlidersHorizontal className="w-4 h-4" />
              </span>
              <h1 className="text-base sm:text-lg font-bold text-[#0b1c30] font-headline">
                Interactive Confidence Gate & Triage Simulator
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#eff4ff] font-mono text-xs text-[#464555] font-semibold border border-[#dce9ff]">
                CLINC150-15cat-v2
              </span>
            </div>
            <p className="text-xs text-[#464555] max-w-3xl">
              Automated intent dispatch triggers human escalation whenever model confidence falls
              beneath the calibrated operational threshold.
            </p>
          </div>

          {/* Metric Counter Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
            <div className="flex flex-col px-3.5 py-2 rounded-xl bg-[#eff4ff] border border-[#dce9ff]">
              <span className="text-[10px] font-semibold text-[#777587] uppercase tracking-wider">
                Auto-Routed
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-sm sm:text-base font-bold text-[#006e4c] font-headline">
                  {autoRatio.toFixed(1)}%
                </span>
                <span className="text-[11px] font-mono text-[#464555]">
                  ({autoCount.toLocaleString()})
                </span>
              </div>
            </div>

            <div className="flex flex-col px-3.5 py-2 rounded-xl bg-[#eff4ff] border border-[#dce9ff]">
              <span className="text-[10px] font-semibold text-[#777587] uppercase tracking-wider">
                Human Review
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-sm sm:text-base font-bold text-[#4f46e5] font-headline">
                  {humanRatio.toFixed(1)}%
                </span>
                <span className="text-[11px] font-mono text-[#464555]">
                  ({humanCount.toLocaleString()})
                </span>
              </div>
            </div>

            <div className="flex flex-col px-3.5 py-2 rounded-xl bg-[#eff4ff] border border-[#dce9ff]">
              <span className="text-[10px] font-semibold text-[#777587] uppercase tracking-wider">
                Misclass Risk
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-sm sm:text-base font-bold text-[#005338] font-headline">
                  {misclassRisk.toFixed(1)}%
                </span>
                <span className="text-[11px] text-[#777587]">&lt;2.0%</span>
              </div>
            </div>

            <div className="flex flex-col px-3.5 py-2 rounded-xl bg-[#eff4ff] border border-[#dce9ff]">
              <span className="text-[10px] font-semibold text-[#777587] uppercase tracking-wider">
                Accuracy (Bench)
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-sm sm:text-base font-bold text-[#0b1c30] font-headline">
                  91.6%
                </span>
                <span className="text-[11px] font-semibold text-[#006e4c]">CLINC150</span>
              </div>
            </div>
          </div>
        </div>

        {/* Threshold Slider Controls */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 pt-1 border-t border-[#e5eeff]">
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-[#0b1c30] text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Active Policy Gate:</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#e2dfff] text-[#0f0069] font-bold">
                  {gateThreshold}% Confidence Floor
                </span>
              </div>
              <span className="text-[#464555] text-[11px]">
                Escalation Threshold range: 50% - 95%
              </span>
            </div>

            <div className="relative w-full flex items-center py-1">
              <input
                type="range"
                min="50"
                max="95"
                value={gateThreshold}
                onChange={(e) => setGateThreshold(Number(e.target.value))}
                className="w-full h-2.5 bg-[#eff4ff] rounded-lg appearance-none cursor-pointer accent-[#3525cd] border border-[#dce9ff]"
              />
            </div>

            <div className="flex justify-between text-[#777587] font-mono text-[10px]">
              <span>50% (Permissive / High Risk)</span>
              <span className="text-[#006e4c] font-semibold">Recommended Zone (80% - 85%)</span>
              <span>95% (Conservative / High Queue Load)</span>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 self-start lg:self-center shrink-0">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeFilter === 'all'
                  ? 'bg-[#3525cd] text-white shadow-sm'
                  : 'bg-[#eff4ff] text-[#464555] hover:bg-[#dce9ff]'
              }`}
            >
              <span>All Queued</span>
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-mono">
                {tickets.length}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('review')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeFilter === 'review'
                  ? 'bg-[#3525cd] text-white shadow-sm'
                  : 'bg-[#eff4ff] text-[#464555] hover:bg-[#dce9ff]'
              }`}
            >
              <span>Needs Review</span>
              <span className="px-1.5 py-0.2 rounded-full bg-[#c7c3fe] text-[#181445] text-[10px] font-mono font-bold">
                {tickets.filter((t) => t.status === 'review_needed').length}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('auto')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeFilter === 'auto'
                  ? 'bg-[#3525cd] text-white shadow-sm'
                  : 'bg-[#eff4ff] text-[#464555] hover:bg-[#dce9ff]'
              }`}
            >
              <span>Auto-Approved</span>
              <span className="px-1.5 py-0.2 rounded-full bg-[#85f8c4] text-[#002114] text-[10px] font-mono font-bold">
                {tickets.filter((t) => t.status === 'auto_routed').length}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('ood')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeFilter === 'ood'
                  ? 'bg-[#3525cd] text-white shadow-sm'
                  : 'bg-[#eff4ff] text-[#464555] hover:bg-[#dce9ff]'
              }`}
            >
              <span>Unsupported (OOD)</span>
              <span className="px-1.5 py-0.2 rounded-full bg-[#ffdad6] text-[#93000a] text-[10px] font-mono font-bold">
                {tickets.filter((t) => t.status === 'ood_rejected').length}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Dispatched Success Notification Banner */}
      {showSuccessBanner && (
        <div className="w-full bg-[#ffffff] rounded-xl p-3.5 sm:p-4 shadow-sm border border-[#85f8c4] flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#85f8c4] text-[#006e4c] shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0">
              <span className="text-xs font-bold text-[#006e4c] shrink-0 font-headline">
                ✓ Automated Dispatch Success:
              </span>
              <span className="text-xs text-[#0b1c30] truncate">{bannerMessage}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-mono text-[10px] text-[#777587] hidden md:inline">
              Logged to table: dispatch_audit_log
            </span>
            <button
              onClick={() => setShowSuccessBanner(false)}
              className="p-1 text-[#777587] hover:text-[#0b1c30] rounded-lg hover:bg-[#eff4ff] transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Mobile Tab Switcher (Visible on mobile/tablet) */}
      <div className="flex lg:hidden bg-[#eff4ff] p-1 rounded-xl border border-[#dce9ff]">
        <button
          onClick={() => setMobileActiveTab('queue')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
            mobileActiveTab === 'queue'
              ? 'bg-[#ffffff] text-[#3525cd] shadow-sm'
              : 'text-[#464555]'
          }`}
        >
          Ticket Queue ({filteredTickets.length})
        </button>
        <button
          onClick={() => setMobileActiveTab('review')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
            mobileActiveTab === 'review'
              ? 'bg-[#ffffff] text-[#3525cd] shadow-sm'
              : 'text-[#464555]'
          }`}
        >
          Review Station ({selectedTicket.id})
        </button>
      </div>

      {/* Main Workspace Split Pane */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT PANE: Request Triage List (5 cols on lg) */}
        <section
          className={`lg:col-span-5 flex-col gap-4 w-full ${
            mobileActiveTab === 'queue' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Search & Intent Filter Header */}
          <div className="bg-[#ffffff] rounded-xl p-3.5 shadow-sm border border-[#e5eeff] flex flex-col gap-2.5">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-[#777587] absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by intent, customer, or keyword..."
                className="w-full h-9 pl-9 pr-3 bg-[#eff4ff] rounded-lg text-xs text-[#0b1c30] placeholder:text-[#777587] focus:outline-none focus:bg-[#ffffff] border border-transparent focus:border-[#3525cd] transition-all"
              />
            </div>

            {/* Horizontal Category Scroller */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar text-xs">
              {[
                'All',
                'Account',
                'Billing',
                'Card',
                'Fees',
                'Unsupported',
              ].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded text-xs whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-[#3525cd] text-white font-medium'
                      : 'bg-[#eff4ff] hover:bg-[#dce9ff] text-[#464555]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Ticket Card Queue */}
          <div className="flex flex-col gap-2">
            {filteredTickets.length > 0 ? (
              filteredTickets.map((ticket) => {
                const isSelected = ticket.id === selectedTicket.id;
                return (
                  <article
                    key={ticket.id}
                    onClick={() => {
                      setSelectedTicketId(ticket.id);
                      setMobileActiveTab('review');
                    }}
                    className={`relative bg-[#ffffff] rounded-xl p-4 shadow-sm cursor-pointer transition-all border ${
                      isSelected
                        ? 'border-l-4 border-l-[#3525cd] border-[#c7c4d8]'
                        : 'border-[#e5eeff] hover:bg-[#eff4ff]/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-[#3525cd]">
                          {ticket.id}
                        </span>

                        {ticket.status === 'review_needed' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#e3dfff] text-[#181445] text-[10px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#5b598c]"></span>
                            Review Needed ({Math.round(ticket.confidence * 100)}%)
                          </span>
                        )}

                        {ticket.status === 'auto_routed' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#85f8c4] text-[#002114] text-[10px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#006e4c] animate-pulse"></span>
                            Auto-Routed ({Math.round(ticket.confidence * 100)}%)
                          </span>
                        )}

                        {ticket.status === 'ood_rejected' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#ffdad6] text-[#93000a] text-[10px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]"></span>
                            OOD / Rejected ({Math.round(ticket.confidence * 100)}%)
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#777587] shrink-0">{ticket.timeAgo}</span>
                    </div>

                    <h3 className="text-xs sm:text-sm text-[#0b1c30] font-semibold line-clamp-2 mb-2 leading-snug">
                      {ticket.subject}
                    </h3>

                    <div className="flex items-center justify-between text-[#777587] text-xs pt-1 border-t border-[#e5eeff]/50">
                      <span className="font-mono text-[11px] text-[#464555] bg-[#eff4ff] px-1.5 py-0.5 rounded">
                        intent: {ticket.predictedIntent}
                      </span>
                      <span className="text-[#0b1c30] font-medium text-[11px] flex items-center gap-1 truncate max-w-[150px]">
                        <Building className="w-3 h-3 text-[#777587] shrink-0" />
                        <span className="truncate">{ticket.customer.company}</span>
                      </span>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="p-8 text-center bg-[#ffffff] rounded-xl border border-dashed border-[#c7c4d8] text-xs text-[#777587]">
                No tickets matching current filters.
              </div>
            )}
          </div>
        </section>

        {/* RIGHT PANE: Detailed Review & ML Correction Station (7 cols on lg) */}
        <section
          className={`lg:col-span-7 flex-col gap-4 w-full ${
            mobileActiveTab === 'review' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Ticket Meta Card & Requester Profile */}
          <div className="bg-[#ffffff] rounded-xl p-5 sm:p-6 shadow-sm border border-[#e5eeff] flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#eff4ff] text-[#3525cd] font-bold">
                    {selectedTicket.id}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] bg-[#e3dfff] text-[#181445] font-semibold">
                    {selectedTicket.confidence < gateThreshold / 100
                      ? `Human Escalation (Threshold: ${gateThreshold}% > Score: ${(
                          selectedTicket.confidence * 100
                        ).toFixed(1)}%)`
                      : `Confidence Pass (Score: ${(selectedTicket.confidence * 100).toFixed(
                          1
                        )}% ≥ ${gateThreshold}%)`}
                  </span>
                  <span className="text-[11px] text-[#777587]">{selectedTicket.timestamp}</span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-[#0b1c30] font-headline mt-1">
                  {selectedTicket.subject}
                </h2>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => onShowToast('Ticket Starred', `${selectedTicket.id} flagged as priority watchlist.`, 'info')}
                  className="p-1.5 rounded-lg text-[#777587] hover:text-[#0b1c30] hover:bg-[#eff4ff] transition-colors"
                  title="Mark star"
                >
                  <Star className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    onShowToast('Link Copied', `Direct link to ${selectedTicket.id} copied to clipboard.`, 'success');
                  }}
                  className="p-1.5 rounded-lg text-[#777587] hover:text-[#0b1c30] hover:bg-[#eff4ff] transition-colors"
                  title="Share case"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Customer Identity Box with Clickable Telephony & Mail */}
            <div className="p-4 bg-[#eff4ff] rounded-xl border border-[#dce9ff] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={selectedTicket.customer.avatarUrl}
                  alt={selectedTicket.customer.name}
                  className="w-12 h-12 rounded-full object-cover shrink-0 ring-2 ring-white"
                  referrerPolicy="no-referrer"
                />
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#0b1c30]">
                      {selectedTicket.customer.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#e2dfff] text-[#0f0069] font-mono text-[10px] font-bold">
                      {selectedTicket.customer.tier}
                    </span>
                  </div>
                  <span className="text-xs text-[#464555]">
                    {selectedTicket.customer.role} · {selectedTicket.customer.company}
                  </span>
                </div>
              </div>

              {/* Clickable Communication Channels (Requirements 6 & 17) */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <a
                  href={`mailto:${selectedTicket.customer.email}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ffffff] hover:bg-[#f8f9ff] text-[#3525cd] text-xs font-semibold border border-[#dce9ff] shadow-sm transition-colors"
                  title="Email customer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[160px]">{selectedTicket.customer.email}</span>
                </a>

                <a
                  href={`tel:${selectedTicket.customer.phone}`}
                  aria-label={`Call customer ${selectedTicket.customer.name} at ${selectedTicket.customer.phone}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ffffff] hover:bg-[#f8f9ff] text-[#006e4c] text-xs font-semibold border border-[#dce9ff] shadow-sm transition-colors"
                  title="Call customer direct line"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{selectedTicket.customer.phone}</span>
                </a>
              </div>
            </div>

            {/* Request Transcript Box */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[11px] font-semibold text-[#777587] uppercase tracking-wider">
                  Original Customer Ingestion Transcript
                </span>
                <span className="font-mono text-[11px] text-[#777587]">
                  Channel: API / Webhook · Lang: en-US
                </span>
              </div>
              <div className="p-4 bg-[#f8f9ff] rounded-xl text-xs sm:text-sm text-[#0b1c30] leading-relaxed border border-[#e5eeff]">
                <p>&ldquo;{selectedTicket.fullTranscript}&rdquo;</p>

                {/* Extracted Entity Metadata Chips */}
                <div className="mt-3 pt-2.5 border-t border-[#e5eeff] flex flex-wrap items-center gap-2">
                  <span className="text-[10px] text-[#777587] uppercase font-semibold">
                    Extracted Entities:
                  </span>
                  {selectedTicket.entities.map((entity, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-[#eff4ff] text-[#0b1c30] font-mono text-[11px] border border-[#dce9ff]"
                    >
                      {entity.label}: <strong className="text-[#3525cd]">{entity.value}</strong>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ML Inference & Diagnostic Breakdown */}
          <div className="bg-[#ffffff] rounded-xl p-5 sm:p-6 shadow-sm border border-[#e5eeff] flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-[#3525cd]" />
                <h3 className="text-sm sm:text-base font-bold text-[#0b1c30] font-headline">
                  Classifier Diagnostic Breakdown
                </h3>
              </div>
              <div className="flex items-center gap-2 text-[#777587] font-mono text-[11px]">
                <span>
                  Inference: <strong>42ms</strong>
                </span>
                <span>·</span>
                <span>
                  Model: <strong>CLINC150-TFIDF-LR-v2.1</strong>
                </span>
              </div>
            </div>

            {/* Top Prediction Probabilities */}
            <div className="flex flex-col gap-3">
              {selectedTicket.predictions.map((pred, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono font-semibold ${
                          pred.isTop ? 'text-[#3525cd]' : 'text-[#464555]'
                        }`}
                      >
                        {idx + 1}. {pred.intent}
                      </span>
                      {pred.isTop && (
                        <span className="px-1.5 py-0.2 rounded bg-[#e2dfff] text-[#0f0069] font-mono text-[10px] font-bold">
                          Top Match
                        </span>
                      )}
                    </div>
                    <span className="font-mono font-bold text-[#0b1c30]">
                      {(pred.score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-[#eff4ff] h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pred.isTop ? 'bg-[#3525cd]' : 'bg-[#777587]'
                      }`}
                      style={{ width: `${pred.score * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Feature Explainability & Gap Diagnostic */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-[#eff4ff] rounded-xl border border-[#dce9ff] flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-[#777587] uppercase tracking-wider">
                  Decisive Feature N-Grams
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedTicket.ngrams.map((ng, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-[#ffffff] text-[#3525cd] font-mono text-[11px] font-semibold border border-[#dce9ff]"
                    >
                      +{ng.weight.toFixed(2)} (&ldquo;{ng.ngram}&rdquo;)
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-[#eff4ff] rounded-xl border border-[#dce9ff] flex flex-col justify-between">
                <span className="text-[11px] font-semibold text-[#777587] uppercase tracking-wider">
                  Gate Evaluation
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-[#464555]">
                    Confidence Floor: <strong>{gateThreshold.toFixed(1)}%</strong>
                  </span>
                  {selectedTicket.confidence < gateThreshold / 100 ? (
                    <span className="font-mono text-xs text-[#ba1a1a] font-bold flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      -{(gateThreshold - selectedTicket.confidence * 100).toFixed(1)}% Deficit
                    </span>
                  ) : (
                    <span className="font-mono text-xs text-[#006e4c] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      +{(selectedTicket.confidence * 100 - gateThreshold).toFixed(1)}% Clearance
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Agent Ground Truth Correction & Dispatch Console */}
          <div className="bg-[#ffffff] rounded-xl p-5 sm:p-6 shadow-sm border border-[#e5eeff] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#006e4c]" />
                <h3 className="text-sm sm:text-base font-bold text-[#0b1c30] font-headline">
                  Agent Ground Truth Action Panel
                </h3>
              </div>
              <span className="font-mono text-xs text-[#777587]">Target Schema: db.corrections</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category Override Selector */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="override-cat-select"
                  className="text-xs font-semibold text-[#0b1c30]"
                >
                  Override / Confirm Intent Category
                </label>
                <select
                  id="override-cat-select"
                  value={overrideIntent}
                  onChange={(e) => setOverrideIntent(e.target.value)}
                  className="w-full h-10 px-3 bg-[#eff4ff] border border-[#dce9ff] focus:border-[#3525cd] rounded-xl text-xs text-[#0b1c30] focus:outline-none"
                >
                  <option value="account_security">account_security (ML Suggested - 74.2%)</option>
                  <option value="login_troubleshoot">login_troubleshoot (Secondary - 18.5%)</option>
                  <option value="phone_verification">phone_verification (Tertiary - 5.1%)</option>
                  <option value="card_replacement">card_replacement</option>
                  <option value="billing_dispute">billing_dispute</option>
                  <option value="transfer_funds">transfer_funds</option>
                  <option value="unsupported_intent">unsupported_intent (Out of Scope)</option>
                </select>
              </div>

              {/* Target Squad Reassignment */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="target-team-select"
                  className="text-xs font-semibold text-[#0b1c30]"
                >
                  Reassign Specialized Team
                </label>
                <select
                  id="target-team-select"
                  value={reassignedTeam}
                  onChange={(e) => setReassignedTeam(e.target.value)}
                  className="w-full h-10 px-3 bg-[#eff4ff] border border-[#dce9ff] focus:border-[#3525cd] rounded-xl text-xs text-[#0b1c30] focus:outline-none"
                >
                  <option value="auth_squad">Tier 2 Auth & Access Squad</option>
                  <option value="cards_ops">Cards Operations Squad</option>
                  <option value="fin_billing">Billing & Ledger Investigation</option>
                  <option value="fraud_risk">Fraud Prevention & Risk Lead</option>
                  <option value="vip_concierge">Enterprise Key Accounts Desk</option>
                </select>
              </div>
            </div>

            {/* Internal Resolution Notes with Macro trigger */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="agent-note-area" className="text-xs font-semibold text-[#0b1c30]">
                  Internal Triage Note & Customer Macro
                </label>
                <button
                  type="button"
                  onClick={handleInsertMacro}
                  className="text-[#3525cd] text-xs hover:underline flex items-center gap-1 font-medium"
                >
                  <span>⚡</span> Insert &ldquo;SIM-Swap Security Macro&rdquo;
                </button>
              </div>
              <textarea
                id="agent-note-area"
                rows={2}
                value={agentNote}
                onChange={(e) => setAgentNote(e.target.value)}
                placeholder="Explain classification override reason or insert internal transfer instructions for Tier 2 Auth squad..."
                className="w-full p-3 bg-[#eff4ff] border border-[#dce9ff] focus:border-[#3525cd] rounded-xl text-xs text-[#0b1c30] placeholder:text-[#777587] focus:outline-none focus:bg-[#ffffff] transition-all resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#e5eeff]">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleConfirmRoute}
                  disabled={isProcessing}
                  className="px-4 py-2.5 rounded-xl bg-[#3525cd] hover:bg-[#4f46e5] text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 active:scale-[0.99]"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm Prediction & Route</span>
                </button>
                <button
                  type="button"
                  onClick={handleApplyOverride}
                  className="px-4 py-2.5 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] text-xs font-semibold border border-[#dce9ff] transition-all flex items-center gap-1.5"
                >
                  <Edit3 className="w-4 h-4 text-[#3525cd]" />
                  <span>Apply Category Override</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleMarkOod}
                  className="px-3.5 py-2.5 rounded-xl bg-[#ffdad6] text-[#93000a] hover:bg-[#ba1a1a] hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5"
                >
                  <Ban className="w-4 h-4" />
                  <span>Mark Unsupported (OOD)</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onShowToast(
                      'Escalated to Supervisory Queue',
                      `Case ${selectedTicket.id} transferred to Shift Lead desk.`,
                      'info'
                    )
                  }
                  className="px-3.5 py-2.5 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-[#464555] text-xs font-semibold border border-[#dce9ff] transition-all flex items-center gap-1.5"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Escalate Lead</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
