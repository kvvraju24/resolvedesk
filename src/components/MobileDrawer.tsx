import React from 'react';
import {
  Inbox,
  Kanban,
  Headphones,
  LineChart,
  Code2,
  FolderOpen,
  FileQuestion,
  X,
  Mail,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import { NavigationModule } from '../types';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentModule: NavigationModule;
  onNavigate: (module: NavigationModule) => void;
  pendingInboxCount?: number;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  currentModule,
  onNavigate,
  pendingInboxCount = 18,
}) => {
  if (!isOpen) return null;

  const navItems: {
    id: NavigationModule;
    label: string;
    icon: React.ReactNode;
    badge?: number | string;
  }[] = [
    {
      id: 'agent-inbox',
      label: 'Agent Inbox',
      icon: <Inbox className="w-5 h-5" />,
      badge: pendingInboxCount,
    },
    {
      id: 'assignment-board',
      label: 'Assignment Board',
      icon: <Kanban className="w-5 h-5" />,
    },
    {
      id: 'customer-portal',
      label: 'Customer Portal',
      icon: <Headphones className="w-5 h-5" />,
    },
    {
      id: 'routing-analytics',
      label: 'Routing Analytics',
      icon: <LineChart className="w-5 h-5" />,
    },
    {
      id: 'project-blueprint-and-architecture',
      label: 'Project Blueprint',
      icon: <Code2 className="w-5 h-5" />,
    },
    {
      id: 'empty-state',
      label: 'Empty State Lab',
      icon: <FolderOpen className="w-5 h-5" />,
    },
    {
      id: 'not-found',
      label: '404 Fallback Preview',
      icon: <FileQuestion className="w-5 h-5" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0b1c30]/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in drawer container */}
      <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-[#f8f9ff] shadow-2xl flex flex-col justify-between p-5 z-50 overflow-y-auto">
        <div className="flex flex-col gap-5">
          {/* Top header inside drawer */}
          <div className="flex items-center justify-between pb-3 border-b border-[#e5eeff]">
            <div className="flex items-center gap-2">
              <img
                src="https://lh3.googleusercontent.com/aida/AEtjO1XMpsAARgrLb5WEMUr4K6Rk6Mlunvf-c8BjGxOqb8VvmOJgBt391OK-3f38Qf43f-Qvf_4TBp44IbPUoHgWp15337qyHgMXsNKEU6SQTZZfh5GWl66mEc2-naHxg8_UC4-LoW-uMCz4_ngVozVGY2bvnpp2nqDRNJOXgMvbVRMRyUbjTpaOwyLCL5UY965GZGpqFq6imO5edEhkZUfIWeSicDyDRXLgb8CGY-vaSB4-CcRjY7RIvfBy-WXP"
                alt="ResolveDesk Logo"
                className="h-7 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
              <span className="font-bold text-[#0b1c30] text-base tracking-tight font-headline">
                ResolveDesk
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#777587] hover:text-[#0b1c30] hover:bg-[#eff4ff] transition-colors"
              aria-label="Close navigation drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-[#777587] uppercase tracking-wider px-2 mb-1">
              Operational Modules
            </span>
            {navItems.map((item) => {
              const isActive = currentModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    onClose();
                  }}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#4f46e5] text-white font-semibold shadow-sm'
                      : 'text-[#464555] hover:bg-[#eff4ff] hover:text-[#0b1c30]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-white' : 'text-[#777587]'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-[#ffdad6] text-[#93000a]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Contact & Telephony Channels */}
        <div className="pt-4 border-t border-[#e5eeff] flex flex-col gap-3">
          <div className="p-3 bg-[#ffffff] rounded-xl border border-[#c7c4d8]/40">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-[#464555]">Confidence Gate</span>
              <span className="px-1.5 py-0.5 bg-[#85f8c4] text-[#002114] rounded text-[10px] font-bold">
                82% Min
              </span>
            </div>
            <div className="w-full bg-[#dce9ff] h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#006e4c] h-full" style={{ width: '82%' }}></div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-[10px] text-[#777587]">
              <ShieldCheck className="w-3 h-3 text-[#006e4c]" />
              <span className="truncate">CLINC150-TFIDF-LR-v2.1</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <a
              href="mailto:support@resolvedesk.io"
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#eff4ff] text-[#3525cd] text-xs font-medium hover:bg-[#dce9ff] transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span className="truncate">support@resolvedesk.io</span>
            </a>
            <a
              href="tel:+18005550199"
              aria-label="Call Priority Hotline at +1 (800) 555-0199"
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#eff4ff] text-[#006e4c] text-xs font-medium hover:bg-[#dce9ff] transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>+1 (800) 555-0199</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
