import React from 'react';
import { 
  Home,
  LayoutDashboard, 
  Briefcase, 
  Users, 
  CalendarDays, 
  History, 
  Settings, 
  UsersRound,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeMenu, 
  setActiveMenu, 
  isSidebarOpen, 
  setIsSidebarOpen,
  isCollapsed,
  setIsCollapsed
}) => {
  const menuItems = [
    { id: 'portal', label: 'Info Portal', icon: Home },
    { id: 'dashboard', label: 'Dashboard Analisis', icon: LayoutDashboard },
    { id: 'jobs', label: 'Portal Lowongan', icon: Briefcase },
    { id: 'candidates', label: 'Database Kandidat', icon: Users },
    { id: 'schedule', label: 'Jadwal Interview', icon: CalendarDays },
    { id: 'history', label: 'History Log', icon: History },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  const handleMenuClick = (id: string) => {
    setActiveMenu(id);
    // Close sidebar on mobile after selection
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay Backdrop */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:relative
          inset-y-0 left-0 z-50
          ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
          w-64
          bg-slate-900 text-slate-100 
          flex flex-col shrink-0 border-r border-slate-800
          transform transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className={`p-4 lg:p-5 border-b border-slate-800 flex items-center ${isCollapsed ? 'lg:justify-center' : 'justify-between'} gap-3`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="bg-indigo-600 p-2 rounded-lg text-white shrink-0">
              <UsersRound className="w-6 h-6" />
            </div>
            <div className={`${isCollapsed ? 'lg:hidden' : 'block'} overflow-hidden`}>
              <h1 className="font-extrabold text-lg tracking-wider text-white whitespace-nowrap">CareerHub</h1>
              <span className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase whitespace-nowrap">Internal Recruiter</span>
            </div>
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1.5 hover:bg-slate-800 rounded text-slate-300"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Desktop Collapse Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`hidden lg:flex p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-all`}
            title={isCollapsed ? "Tampilkan Sidebar" : "Sembunyikan Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Nav Link List */}
        <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto overflow-x-hidden">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                title={isCollapsed ? item.label : ''}
                className={`
                  w-full flex items-center 
                  ${isCollapsed ? 'lg:justify-center lg:px-2' : 'gap-3.5 px-4'} 
                  gap-3.5 px-4
                  py-3 rounded-lg text-sm font-semibold transition-all duration-200 text-left
                  ${isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }
                `}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : ''}`} />
                <span className={`${isCollapsed ? 'lg:hidden' : 'block'} whitespace-nowrap`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className={`p-3 border-t border-slate-800 bg-slate-950 text-center ${isCollapsed ? 'lg:p-2' : ''}`}>
          <p className={`text-[11px] text-slate-500 font-medium ${isCollapsed ? 'lg:hidden' : ''}`}>CareerHub ATS v1.0</p>
          <p className={`text-[9px] text-slate-600 ${isCollapsed ? 'lg:hidden' : ''}`}>© 2026 Recruitment Team</p>
          <p className={`text-[10px] text-slate-500 font-bold hidden ${isCollapsed ? 'lg:block' : ''}`}>v1.0</p>
        </div>
      </aside>
    </>
  );
};
