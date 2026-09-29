import React, { useState, useEffect } from 'react';
import { NavigationModule, ToastMessage } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MobileDrawer } from './components/MobileDrawer';
import { Toast } from './components/Toast';
import { RoutingAnalyticsView } from './views/RoutingAnalyticsView';
import { AgentInboxView } from './views/AgentInboxView';
import { AssignmentBoardView } from './views/AssignmentBoardView';
import { ProjectBlueprintView } from './views/ProjectBlueprintView';
import { CustomerPortalView } from './views/CustomerPortalView';
import { EmptyStateView } from './views/EmptyStateView';
import { NotFoundView } from './views/NotFoundView';

export default function App() {
  const [currentModule, setCurrentModule] = useState<NavigationModule>('routing-analytics');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isMobilePreview, setIsMobilePreview] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [selectedTicketFromBoard, setSelectedTicketFromBoard] = useState<string | null>(null);

  // Dynamic Page Title & Meta Description updater (Requirements 2 & 3)
  useEffect(() => {
    const titles: Record<NavigationModule, string> = {
      'routing-analytics': 'Routing Analytics & ML Model Evaluation | ResolveDesk',
      'agent-inbox': 'Agent Inbox & Classifier Triage | ResolveDesk',
      'assignment-board': 'Squad Assignment Board | ResolveDesk',
      'customer-portal': 'Customer Portal & Diagnostic Lab | ResolveDesk',
      'project-blueprint-and-architecture': 'Project Blueprint & Architecture | ResolveDesk',
      'empty-state': 'Review Queue Clear · Empty State Lab | ResolveDesk',
      'not-found': '404 Case Record Not Found | ResolveDesk',
    };

    const descriptions: Record<NavigationModule, string> = {
      'routing-analytics':
        'Benchmark evaluation, confidence tradeoff curves, and continuous model comparison using the CLINC150 dataset.',
      'agent-inbox':
        'Deterministic confidence gate triage, prediction probability breakdown, and agent ground-truth feedback recording.',
      'assignment-board':
        'Real-time kanban case distribution across Tier 2 Auth, Cards Operations, and Billing squads.',
      'customer-portal':
        'Interactive self-service ticket submission with real-time NLP classification, image compression, and SLA tracking.',
      'project-blueprint-and-architecture':
        'Monorepo anatomy, PostgreSQL 8-table DDL schema, Swagger REST operations, and reproducibility runbook.',
      'empty-state':
        'Zero pending tickets review queue simulation showing optimal 82% threshold performance.',
      'not-found':
        'Searchable 404 error page with quick recovery routes to all ResolveDesk operational modules.',
    };

    document.title = titles[currentModule] || 'ResolveDesk – ML-Powered Ticket Triage';

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', descriptions[currentModule] || descriptions['routing-analytics']);
    }
  }, [currentModule]);

  // Toast Helper
  const showToast = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleNavigate = (module: NavigationModule) => {
    setCurrentModule(module);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col antialiased overflow-x-hidden">
      {/* Toast Alert System (Requirements 14 & 15) */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Header (Top Bar Contract: 3 zones, search, contact, mobile toggle) */}
      <Header
        currentModule={currentModule}
        onNavigate={handleNavigate}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        isMobilePreview={isMobilePreview}
        onToggleMobilePreview={() => setIsMobilePreview(!isMobilePreview)}
        onSearchQuery={(q) => {
          if (q.trim()) {
            if (currentModule !== 'agent-inbox') {
              setCurrentModule('agent-inbox');
            }
          }
        }}
      />

      {/* Left Navigation Sidebar (Desktop) */}
      <Sidebar
        currentModule={currentModule}
        onNavigate={handleNavigate}
        pendingInboxCount={18}
      />

      {/* Mobile Drawer (Requirements 8, 10, 12, 13) */}
      <MobileDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        currentModule={currentModule}
        onNavigate={handleNavigate}
        pendingInboxCount={18}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex-1 flex flex-col">
        {/* Mobile Device Simulator Container (if toggled) */}
        {isMobilePreview ? (
          <div className="w-full flex-1 pt-20 pb-8 px-4 flex flex-col items-center justify-start bg-[#213145]/10">
            <div className="mb-2 text-xs font-mono text-[#464555] bg-white px-3 py-1 rounded-full shadow-sm border border-[#dce9ff] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#006e4c] animate-pulse"></span>
              <span>Mobile Simulation Mode (iPhone 15 Pro / 390px Viewport)</span>
            </div>
            {/* Phone Bezel */}
            <div className="w-full max-w-[390px] min-h-[780px] bg-[#f8f9ff] rounded-[44px] shadow-2xl border-[10px] border-[#0b1c30] overflow-hidden flex flex-col relative">
              {/* Dynamic Island Pill */}
              <div className="w-28 h-5 bg-[#0b1c30] rounded-full mx-auto my-2 shrink-0 z-30"></div>
              {/* Phone Inner Screen Viewport */}
              <div className="flex-1 overflow-y-auto px-4 pb-12 pt-2 custom-scrollbar">
                {currentModule === 'routing-analytics' && (
                  <RoutingAnalyticsView onShowToast={showToast} />
                )}
                {currentModule === 'agent-inbox' && (
                  <AgentInboxView onShowToast={showToast} />
                )}
                {currentModule === 'assignment-board' && (
                  <AssignmentBoardView
                    onSelectTicket={(ticketId) => {
                      setSelectedTicketFromBoard(ticketId);
                      setCurrentModule('agent-inbox');
                    }}
                    onShowToast={showToast}
                  />
                )}
                {currentModule === 'customer-portal' && (
                  <CustomerPortalView onShowToast={showToast} onNavigate={handleNavigate} />
                )}
                {currentModule === 'project-blueprint-and-architecture' && (
                  <ProjectBlueprintView onShowToast={showToast} />
                )}
                {currentModule === 'empty-state' && (
                  <EmptyStateView onNavigate={handleNavigate} onShowToast={showToast} />
                )}
                {currentModule === 'not-found' && (
                  <NotFoundView onNavigate={handleNavigate} />
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Standard Viewport Container (Desktop / Tablet / Native Mobile) */
          <main className="w-full pt-20 px-4 sm:px-6 md:px-8 max-w-full overflow-x-hidden flex-1">
            {currentModule === 'routing-analytics' && (
              <RoutingAnalyticsView onShowToast={showToast} />
            )}
            {currentModule === 'agent-inbox' && (
              <AgentInboxView onShowToast={showToast} />
            )}
            {currentModule === 'assignment-board' && (
              <AssignmentBoardView
                onSelectTicket={(ticketId) => {
                  setSelectedTicketFromBoard(ticketId);
                  setCurrentModule('agent-inbox');
                }}
                onShowToast={showToast}
              />
            )}
            {currentModule === 'customer-portal' && (
              <CustomerPortalView onShowToast={showToast} onNavigate={handleNavigate} />
            )}
            {currentModule === 'project-blueprint-and-architecture' && (
              <ProjectBlueprintView onShowToast={showToast} />
            )}
            {currentModule === 'empty-state' && (
              <EmptyStateView onNavigate={handleNavigate} onShowToast={showToast} />
            )}
            {currentModule === 'not-found' && (
              <NotFoundView onNavigate={handleNavigate} />
            )}
          </main>
        )}
      </div>
    </div>
  );
}
