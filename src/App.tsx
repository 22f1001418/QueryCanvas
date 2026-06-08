import { AnimatePresence } from 'framer-motion';
import { PanelLeftClose, PanelLeftOpen, Database } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { useStore } from './store';

import { SelectPage } from './pages/SelectPage';
import { WherePage } from './pages/WherePage';
import { OrderByPage } from './pages/OrderByPage';
import { AggregationsPage } from './pages/AggregationsPage';
import { GroupByPage } from './pages/GroupByPage';
import { JoinsPage } from './pages/JoinsPage';
import { SubqueriesPage } from './pages/SubqueriesPage';
import { WindowPage } from './pages/WindowPage';
import { CasePage } from './pages/CasePage';
import { CTEPage } from './pages/CTEPage';
import { SetsPage } from './pages/SetsPage';
import { DataCleaningPage } from './pages/DataCleaningPage';
import { StringFnsPage } from './pages/StringFnsPage';
import { NumericFnsPage } from './pages/NumericFnsPage';
import { DateFnsPage } from './pages/DateFnsPage';
import { ExistsPage } from './pages/ExistsPage';

const pageComponents: Record<string, React.ComponentType> = {
  select: SelectPage,
  where: WherePage,
  orderby: OrderByPage,
  aggregations: AggregationsPage,
  groupby: GroupByPage,
  joins: JoinsPage,
  subqueries: SubqueriesPage,
  window: WindowPage,
  case: CasePage,
  cte: CTEPage,
  sets: SetsPage,
  datacleaning: DataCleaningPage,
  stringfns: StringFnsPage,
  numericfns: NumericFnsPage,
  datefns: DateFnsPage,
  exists: ExistsPage,
};

export default function App() {
  const { page, sidebarOpen, toggleSidebar } = useStore();
  const PageComponent = pageComponents[page] || SelectPage;

  return (
    <div className="h-screen flex flex-col bg-surface-0">
      {/* Top bar */}
      <header
        className="flex items-center border-b select-none flex-shrink-0"
        style={{ height: 44, background: 'var(--scaler-dark)', borderColor: 'rgba(255,255,255,0.06)' }}
      >
        {/* Traffic lights */}
        <div className="flex items-center gap-[7px] px-4">
          <div className="w-3 h-3 rounded-full" style={{ background: 'var(--traffic-red)' }} />
          <div className="w-3 h-3 rounded-full" style={{ background: 'var(--traffic-yellow)' }} />
          <div className="w-3 h-3 rounded-full" style={{ background: 'var(--traffic-green)' }} />
        </div>

        {/* Sidebar toggle */}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-md hover:bg-white/10 text-white/50 transition-colors ml-2"
        >
          {sidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
        </button>

        {/* Title */}
        <div className="flex-1 flex items-center justify-center gap-2.5">
          <div className="w-5 h-5 rounded bg-gradient-to-br from-[#DB2777] to-[#64748B] flex items-center justify-center">
            <Database size={11} className="text-white" />
          </div>
          <span className="text-[13px] font-semibold text-white/90 tracking-tight">
            QueryCanvas
          </span>
        </div>

        {/* Right spacer */}
        <div className="w-24" />
      </header>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        <AnimatePresence>
          {sidebarOpen && <Sidebar />}
        </AnimatePresence>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto">
            <PageComponent />
          </div>
        </main>
      </div>
    </div>
  );
}
