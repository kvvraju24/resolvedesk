import React, { useState } from 'react';
import {
  FileQuestion,
  Search,
  ArrowLeft,
  Inbox,
  LineChart,
  Headphones,
  Code2,
  Mail,
  Phone,
} from 'lucide-react';
import { NavigationModule } from '../types';

interface NotFoundViewProps {
  onNavigate: (module: NavigationModule) => void;
  onSearchTicket?: (query: string) => void;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({
  onNavigate,
  onSearchTicket,
}) => {
  const [lookupId, setLookupId] = useState('');

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (lookupId.trim()) {
      if (onSearchTicket) onSearchTicket(lookupId.trim());
      onNavigate('agent-inbox');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] w-full max-w-2xl mx-auto py-12 px-4 text-center">
      {/* 404 Badge */}
      <div className="w-20 h-20 rounded-3xl bg-[#ffdad6] text-[#93000a] flex items-center justify-center mb-5 shadow-sm border border-[#ba1a1a]/20">
        <FileQuestion className="w-10 h-10" />
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eff4ff] text-[#3525cd] font-mono text-xs font-bold mb-3 border border-[#dce9ff]">
        HTTP 404 · RESOURCE_NOT_FOUND
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-[#0b1c30] font-headline tracking-tight">
        Case Record Not Found or Ingestion Route Expired
      </h1>

      <p className="text-xs sm:text-sm text-[#464555] max-w-md mt-2 leading-relaxed">
        The requested ticket identifier, model telemetry run, or API route does not exist in the active tenant database or may have been purged per data retention schedules.
      </p>

      {/* Ticket Lookup Search Form */}
      <form onSubmit={handleLookup} className="w-full max-w-md my-6 flex items-center gap-2">
        <div className="relative flex-1 flex items-center">
          <Search className="w-4 h-4 text-[#777587] absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={lookupId}
            onChange={(e) => setLookupId(e.target.value)}
            placeholder="Search Ticket ID (e.g. #RD-4891)..."
            className="w-full h-10 pl-9 pr-3 bg-[#eff4ff] border border-[#dce9ff] focus:border-[#3525cd] rounded-xl text-xs text-[#0b1c30] focus:outline-none focus:bg-[#ffffff] transition-all"
          />
        </div>
        <button
          type="submit"
          className="h-10 px-4 rounded-xl bg-[#3525cd] text-white hover:bg-[#4f46e5] text-xs font-semibold transition-all shrink-0 shadow-sm"
        >
          Lookup
        </button>
      </form>

      {/* Quick Recovery Navigation Grid */}
      <div className="w-full max-w-md flex flex-col gap-2 text-left">
        <span className="text-[11px] font-semibold text-[#777587] uppercase tracking-wider text-center">
          Or Return to Operational Module
        </span>
        <div className="grid grid-cols-2 gap-2 mt-1">
          <button
            onClick={() => onNavigate('agent-inbox')}
            className="p-3 rounded-xl bg-[#ffffff] hover:bg-[#eff4ff] border border-[#e5eeff] text-left transition-all flex items-center gap-2.5 group"
          >
            <Inbox className="w-4 h-4 text-[#3525cd] shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-[#0b1c30] group-hover:text-[#3525cd]">
                Agent Inbox
              </span>
              <span className="text-[10px] text-[#777587]">18 pending cases</span>
            </div>
          </button>

          <button
            onClick={() => onNavigate('routing-analytics')}
            className="p-3 rounded-xl bg-[#ffffff] hover:bg-[#eff4ff] border border-[#e5eeff] text-left transition-all flex items-center gap-2.5 group"
          >
            <LineChart className="w-4 h-4 text-[#006e4c] shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-[#0b1c30] group-hover:text-[#3525cd]">
                Analytics
              </span>
              <span className="text-[10px] text-[#777587]">CLINC150 Eval</span>
            </div>
          </button>

          <button
            onClick={() => onNavigate('customer-portal')}
            className="p-3 rounded-xl bg-[#ffffff] hover:bg-[#eff4ff] border border-[#e5eeff] text-left transition-all flex items-center gap-2.5 group"
          >
            <Headphones className="w-4 h-4 text-[#5b598c] shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-[#0b1c30] group-hover:text-[#3525cd]">
                Customer Portal
              </span>
              <span className="text-[10px] text-[#777587]">Submit Inquiries</span>
            </div>
          </button>

          <button
            onClick={() => onNavigate('project-blueprint-and-architecture')}
            className="p-3 rounded-xl bg-[#ffffff] hover:bg-[#eff4ff] border border-[#e5eeff] text-left transition-all flex items-center gap-2.5 group"
          >
            <Code2 className="w-4 h-4 text-[#3525cd] shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-[#0b1c30] group-hover:text-[#3525cd]">
                Blueprint
              </span>
              <span className="text-[10px] text-[#777587]">Schema & APIs</span>
            </div>
          </button>
        </div>
      </div>

      {/* Support Emergency Channels */}
      <div className="mt-8 pt-4 border-t border-[#e5eeff] flex flex-wrap items-center justify-center gap-4 text-xs text-[#464555]">
        <span>Need urgent triage assistance?</span>
        <a
          href="mailto:support@resolvedesk.io"
          className="text-[#3525cd] font-semibold hover:underline flex items-center gap-1"
        >
          <Mail className="w-3.5 h-3.5" />
          <span>support@resolvedesk.io</span>
        </a>
        <span className="text-[#c7c4d8]">·</span>
        <a
          href="tel:+18005550199"
          className="text-[#006e4c] font-semibold hover:underline flex items-center gap-1"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>+1 (800) 555-0199</span>
        </a>
      </div>
    </div>
  );
};
