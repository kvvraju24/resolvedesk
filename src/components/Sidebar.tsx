import React from 'react';
import {
  Inbox,
  Kanban,
  Headphones,
  LineChart,
  Code2,
  FolderOpen,
  FileQuestion,
  ShieldCheck,
} from 'lucide-react';
import { NavigationModule } from '../types';

interface SidebarProps {
  currentModule: NavigationModule;
  onNavigate: (module: NavigationModule) => void;
  pendingInboxCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentModule,
  onNavigate,
  pendingInboxCount = 18,
}) => {
  const navItems: {
    id: NavigationModule;
    label: string;
    icon: React.ReactNode;
    badge?: number | string;
  }[] = [
    {
      id: 'agent-inbox',
      label: 'Agent Inbox',
      icon: <Inbox className="w-4 h-4" />,
      badge: pendingInboxCount,
    },
    {
      id: 'assignment-board',
      label: 'Assignment Board',
      icon: <Kanban className="w-4 h-4" />,
    },
    {
      id: 'customer-portal',
      label: 'Customer Portal',
      icon: <Headphones className="w-4 h-4" />,
    },
    {
      id: 'routing-analytics',
      label: 'Routing Analytics',
      icon: <LineChart className="w-4 h-4" />,
    },
    {
      id: 'project-blueprint-and-architecture',
      label: 'Project Blueprint',
      icon: <Code2 className="w-4 h-4" />,
    },
    {
      id: 'empty-state',
      label: 'Empty State Lab',
      icon: <FolderOpen className="w-4 h-4" />,
    },
    {
      id: 'not-found',
      label: '404 Fallback Preview',
      icon: <FileQuestion className="w-4 h-4" />,
    },
  ];

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-[#eff4ff] z-30 hidden lg:flex flex-col justify-between py-4 border-r border-[#e5eeff]">
      <div className="flex flex-col gap-4">
        <div className="px-5">
          <span className="text-[11px] font-semibold text-[#777587] uppercase tracking-wider">
            Operational Modules
          </span>
        </div>

        <nav className="flex flex-col gap-1 px-3">
          {navItems.map((item) => {
            const isActive = currentModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#4f46e5] text-white font-semibold shadow-sm'
                    : 'text-[#464555] hover:bg-[#e5eeff] hover:text-[#0b1c30]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-white' : 'text-[#777587]'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
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
        </nav>
      </div>

      {/* Confidence Gate Widget & Active Classifier in Sidebar Footer */}
      <div className="px-4 flex flex-col gap-3">
        <div className="p-3 bg-[#ffffff] rounded-xl shadow-sm border border-[#c7c4d8]/40">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-[#464555]">Confidence Gate</span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] bg-[#85f8c4] text-[#002114] font-semibold">
              82% Min
            </span>
          </div>
          <div className="w-full bg-[#dce9ff] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#006e4c] h-full rounded-full" style={{ width: '82%' }}></div>
          </div>
          <div className="mt-2 flex items-center justify-between text-[#777587] text-[10px]">
            <span>Auto-Route: Active</span>
            <span>Escalate &lt; 82%</span>
          </div>
        </div>

        <div className="px-1 flex flex-col gap-0.5">
          <div className="flex items-center gap-1 text-[10px] text-[#777587] uppercase tracking-wider font-semibold">
            <ShieldCheck className="w-3 h-3 text-[#006e4c]" />
            Active Classifier
          </div>
          <div
            className="text-[11px] font-mono text-[#0b1c30] truncate font-medium"
            title="CLINC150-TFIDF-LR-v2.1"
          >
            CLINC150-TFIDF-LR-v2.1
          </div>
        </div>
      </div>
    </aside>
  );
};
