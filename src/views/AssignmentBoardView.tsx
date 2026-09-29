import React, { useState } from 'react';
import {
  Kanban,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Search,
  Filter,
  Plus,
} from 'lucide-react';
import { Ticket } from '../types';
import { INITIAL_TICKETS } from '../data/mockData';

interface AssignmentBoardViewProps {
  onSelectTicket: (ticketId: string) => void;
  onShowToast: (title: string, message: string, type: 'success' | 'error' | 'info') => void;
}

interface Column {
  id: string;
  title: string;
  lead: string;
  slaTarget: string;
  color: string;
}

export const AssignmentBoardView: React.FC<AssignmentBoardViewProps> = ({
  onSelectTicket,
  onShowToast,
}) => {
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [searchFilter, setSearchFilter] = useState<string>('');

  const columns: Column[] = [
    {
      id: 'auth_squad',
      title: 'Tier 2 Auth Squad',
      lead: 'Sarah Chen (Lead)',
      slaTarget: '< 20m',
      color: '#3525cd',
    },
    {
      id: 'cards_ops',
      title: 'Cards Operations',
      lead: 'Marcus Vance',
      slaTarget: '< 30m',
      color: '#006e4c',
    },
    {
      id: 'billing_investigation',
      title: 'Billing & Ledger',
      lead: 'Julianne Miller',
      slaTarget: '< 45m',
      color: '#5b598c',
    },
    {
      id: 'general_intake',
      title: 'General & OOD Intake',
      lead: 'Automated Bot Tier',
      slaTarget: 'Instant',
      color: '#777587',
    },
  ];

  const getColumnTickets = (colId: string) => {
    return tickets.filter((t) => {
      if (searchFilter && !t.subject.toLowerCase().includes(searchFilter.toLowerCase())) {
        return false;
      }
      if (colId === 'auth_squad') return t.predictedIntent.includes('account');
      if (colId === 'cards_ops') return t.predictedIntent.includes('card');
      if (colId === 'billing_investigation') return t.predictedIntent.includes('billing') || t.predictedIntent.includes('fee');
      if (colId === 'general_intake') return t.status === 'ood_rejected' || t.predictedIntent.includes('unsupported');
      return true;
    });
  };

  const handleMoveTicket = (ticketId: string, targetColId: string) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, assignedTeam: targetColId } : t))
    );
    onShowToast('Assignment Updated', `Ticket ${ticketId} reassigned to ${targetColId}.`, 'success');
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-full pb-12 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#e2dfff] text-[#3525cd]">
              <Kanban className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0b1c30] font-headline">
              Squad Assignment Board
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#eff4ff] text-[#0b1c30] font-mono text-xs font-semibold border border-[#dce9ff]">
              Live Kanban
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#464555] mt-0.5">
            Monitor real-time case distribution, active squad workloads, and ML auto-routed pipelines
          </p>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-[#777587] absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search assigned cases..."
              className="h-9 pl-9 pr-3 bg-[#eff4ff] border border-transparent focus:border-[#3525cd] rounded-xl text-xs text-[#0b1c30] focus:outline-none"
            />
          </div>
          <button
            onClick={() => onShowToast('All Squads Nominal', 'Average SLA fulfillment currently at 98.4%.', 'info')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-xs font-semibold text-[#0b1c30] border border-[#dce9ff] transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-[#006e4c]" />
            <span className="hidden sm:inline">SLA Health: 98.4%</span>
          </button>
        </div>
      </div>

      {/* Kanban Board Container with horizontal scroll wrapper */}
      <div className="w-full overflow-x-auto custom-scrollbar pb-4">
        <div className="flex gap-4 min-w-[900px] items-start">
          {columns.map((col) => {
            const colTickets = getColumnTickets(col.id);
            return (
              <div
                key={col.id}
                className="flex-1 bg-[#ffffff] rounded-2xl p-4 shadow-sm border border-[#e5eeff] flex flex-col gap-3 min-w-[260px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-[#e5eeff]">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: col.color }}
                    ></span>
                    <h2 className="font-bold text-xs sm:text-sm text-[#0b1c30] font-headline">
                      {col.title}
                    </h2>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#0b1c30] font-mono text-[11px] font-bold border border-[#dce9ff]">
                    {colTickets.length}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#777587]">
                  <span>Lead: {col.lead}</span>
                  <span className="flex items-center gap-1 font-mono text-[#006e4c]">
                    <Clock className="w-3 h-3" />
                    SLA {col.slaTarget}
                  </span>
                </div>

                {/* Tickets in Column */}
                <div className="flex flex-col gap-2.5 min-h-[300px]">
                  {colTickets.length > 0 ? (
                    colTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        onClick={() => onSelectTicket(ticket.id)}
                        className="p-3.5 bg-[#f8f9ff] hover:bg-[#eff4ff] rounded-xl border border-[#e5eeff] cursor-pointer transition-all hover:shadow-sm flex flex-col gap-2 group"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-mono font-bold text-[#3525cd]">{ticket.id}</span>
                          <span className="text-[#777587]">{ticket.timeAgo}</span>
                        </div>
                        <h4 className="text-xs font-semibold text-[#0b1c30] line-clamp-2 leading-snug">
                          {ticket.subject}
                        </h4>
                        <div className="flex items-center justify-between text-[10px] pt-1 border-t border-[#e5eeff]/60">
                          <span className="font-mono text-[#464555] bg-[#eff4ff] px-1.5 py-0.5 rounded">
                            {(ticket.confidence * 100).toFixed(0)}% Match
                          </span>
                          <span className="text-[#3525cd] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 font-semibold">
                            Open Triage <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-32 flex flex-col items-center justify-center text-center p-4 border border-dashed border-[#c7c4d8] rounded-xl text-xs text-[#777587]">
                      <span>No active tickets in queue</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
