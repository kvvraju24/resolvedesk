import React, { useState, useEffect } from 'react';
import {
  Search,
  Bell,
  HelpCircle,
  Mail,
  Phone,
  Menu,
  X,
  Smartphone,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { NavigationModule } from '../types';

interface HeaderProps {
  currentModule: NavigationModule;
  onNavigate: (module: NavigationModule) => void;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  isMobilePreview: boolean;
  onToggleMobilePreview: () => void;
  onSearchQuery?: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNavigate,
  mobileMenuOpen,
  onToggleMobileMenu,
  isMobilePreview,
  onToggleMobilePreview,
  onSearchQuery,
}) => {
  const [supportOpen, setSupportOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  // Keyboard shortcut listener for ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('global-search-input');
        searchInput?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchChange = (val: string) => {
    setSearchValue(val);
    if (onSearchQuery) onSearchQuery(val);
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-40 bg-[#f8f9ff]/90 backdrop-blur-md border-b border-[#e5eeff] shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="w-full h-16 px-4 md:px-6 flex items-center justify-between gap-3">
        {/* Left: Mobile hamburger + Logo + Pipeline status */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl text-[#464555] hover:bg-[#eff4ff] hover:text-[#0b1c30] transition-colors"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <button
            onClick={() => onNavigate('routing-analytics')}
            className="flex items-center gap-2 text-left focus:outline-none"
          >
            <img
              src="https://lh3.googleusercontent.com/aida/AEtjO1XMpsAARgrLb5WEMUr4K6Rk6Mlunvf-c8BjGxOqb8VvmOJgBt391OK-3f38Qf43f-Qvf_4TBp44IbPUoHgWp15337qyHgMXsNKEU6SQTZZfh5GWl66mEc2-naHxg8_UC4-LoW-uMCz4_ngVozVGY2bvnpp2nqDRNJOXgMvbVRMRyUbjTpaOwyLCL5UY965GZGpqFq6imO5edEhkZUfIWeSicDyDRXLgb8CGY-vaSB4-CcRjY7RIvfBy-WXP"
              alt="ResolveDesk Logo"
              className="h-8 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
            <span className="font-bold text-[#0b1c30] text-lg tracking-tight font-headline">
              ResolveDesk
            </span>
          </button>

          {/* Pipeline Badge */}
          <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 bg-[#eff4ff] border border-[#dce9ff] rounded-full">
            <span className="w-2 h-2 rounded-full bg-[#006e4c] animate-pulse"></span>
            <span className="text-[11px] text-[#464555] font-medium font-body">
              ML Pipeline v2.4 Active · 94.2% Uptime
            </span>
          </div>
        </div>

        {/* Center: Search Bar with ⌘K */}
        <div className="flex-1 max-w-lg hidden md:block">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-[#777587] absolute left-3 pointer-events-none" />
            <input
              id="global-search-input"
              type="text"
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search cases, customer IDs, or ML intent clusters..."
              className="w-full h-9 pl-9 pr-14 bg-[#eff4ff] border border-transparent focus:border-[#3525cd] rounded-xl text-xs text-[#0b1c30] placeholder:text-[#777587] focus:outline-none focus:bg-[#ffffff] transition-all"
            />
            <kbd className="absolute right-2 px-1.5 py-0.5 rounded bg-[#dce9ff] text-[10px] font-mono text-[#464555] font-semibold border border-[#c7c4d8]/40">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right: Actions, Mobile Device Tester, Support Dropdown, Notifications, Profile */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile Device Simulator Switch */}
          <button
            onClick={onToggleMobilePreview}
            title="Toggle interactive mobile device frame"
            className={`hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              isMobilePreview
                ? 'bg-[#3525cd] text-white border-[#3525cd] shadow-sm'
                : 'bg-[#ffffff] text-[#464555] border-[#c7c4d8] hover:bg-[#eff4ff] hover:text-[#0b1c30]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Mobile Test View</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setSupportOpen(false);
              }}
              className="relative p-2 rounded-xl text-[#464555] hover:bg-[#eff4ff] hover:text-[#0b1c30] transition-colors"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#ba1a1a] text-white text-[10px] font-bold">
                3
              </span>
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 p-3 bg-[#ffffff] rounded-2xl shadow-xl border border-[#c7c4d8]/40 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 border-b border-[#e5eeff] px-1">
                  <span className="font-semibold text-xs text-[#0b1c30] uppercase tracking-wider">
                    Recent System Alerts
                  </span>
                  <span className="text-[11px] text-[#3525cd] cursor-pointer hover:underline">
                    Mark all read
                  </span>
                </div>
                <div className="flex flex-col gap-2 mt-2">
                  <div className="p-2 rounded-xl bg-[#eff4ff] flex items-start gap-2 text-xs">
                    <CheckCircle className="w-4 h-4 text-[#006e4c] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-[#0b1c30]">Batch Auto-Route Completed</span>
                      <p className="text-[11px] text-[#464555]">
                        42 tickets dispatched to Cards Operations squad with 96% confidence.
                      </p>
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#eff4ff] flex items-start gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full bg-[#ba1a1a] shrink-0 mt-1.5"></span>
                    <div>
                      <span className="font-semibold text-[#0b1c30]">Escalation: SIM Swap Spike</span>
                      <p className="text-[11px] text-[#464555]">
                        5 cases queued for human verification in Tier 2 Auth squad.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Support Dropdown with Clickable Email and Phone */}
          <div className="relative">
            <button
              onClick={() => {
                setSupportOpen(!supportOpen);
                setNotificationsOpen(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[#464555] hover:bg-[#eff4ff] hover:text-[#0b1c30] transition-colors"
              aria-label="Support options"
            >
              <HelpCircle className="w-4 h-4 text-[#3525cd]" />
              <span className="text-xs font-semibold hidden lg:inline">Support</span>
            </button>

            {supportOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 p-3 bg-[#ffffff] rounded-2xl shadow-xl border border-[#c7c4d8]/40 z-50">
                <div className="px-2 py-1 text-[11px] font-semibold text-[#777587] uppercase tracking-wider">
                  24/7 Operations Help Desk
                </div>

                <div className="mt-1 flex flex-col gap-1">
                  {/* Clickable Email */}
                  <a
                    href="mailto:support@resolvedesk.io"
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#eff4ff] transition-colors group"
                  >
                    <div className="p-2 rounded-lg bg-[#e2dfff] text-[#3525cd] group-hover:bg-[#3525cd] group-hover:text-white transition-colors">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[11px] text-[#777587]">Email Operations</span>
                      <span className="text-xs font-semibold text-[#0b1c30] truncate">
                        support@resolvedesk.io
                      </span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-[#777587] ml-auto" />
                  </a>

                  {/* Clickable Phone Number */}
                  <a
                    href="tel:+18005550199"
                    aria-label="Call Priority Hotline at +1 (800) 555-0199"
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#eff4ff] transition-colors group"
                  >
                    <div className="p-2 rounded-lg bg-[#85f8c4] text-[#006e4c] group-hover:bg-[#006e4c] group-hover:text-white transition-colors">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[11px] text-[#777587]">Priority Hotline</span>
                      <span className="text-xs font-semibold text-[#0b1c30]">
                        +1 (800) 555-0199
                      </span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-[#777587] ml-auto" />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-2 pl-1 border-l border-[#c7c4d8]/40">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAMwFqlZwQVLV34pPb_EQwO66ptI4ciOQhNzGqcDuiyIuBdqdaaNtIdDI-3JR14-UVSGScI6nQqgh41_7R4s6glVW7dw_cgPQSiQugXMgDdyl89ZGaFz8uesfKNA2ty_fgdksbMQ4ss6XvBLXI2Pb5nq3_ek2JypP_zAQV0lKkqKeCZlyZmLBXQjNqR0zsOpSrfF1zZlG8j_KbUe_S5Mb0bWSLdNrDA8ztZtdjbwHQ_EFTisaBDS1q2pQ"
              alt="Sarah Chen profile"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-[#e2dfff]"
              referrerPolicy="no-referrer"
            />
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs leading-tight text-[#0b1c30] font-semibold">Sarah Chen</span>
              <span className="text-[10px] text-[#777587]">Ops Director</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
