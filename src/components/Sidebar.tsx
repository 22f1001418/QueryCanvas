import { motion, AnimatePresence } from 'framer-motion';
import { icons, ChevronDown } from 'lucide-react';
import { useStore, navItems, type PageId } from '../store';

export function Sidebar() {
  const { page, setPage, sidebarOpen } = useStore();

  const categories = navItems.reduce<Record<string, typeof navItems>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  if (!sidebarOpen) return null;

  const activeItem = navItems.find((n) => n.id === page);

  return (
    <motion.aside
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 250, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="h-full flex-shrink-0 overflow-y-auto flex flex-col"
      style={{ background: 'var(--scaler-sidebar)' }}
    >
      {/* Scaler branding */}
      <div className="px-4 pt-4 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-[#DB2777] to-[#64748B] flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">Q</span>
          </div>
          <span className="text-white/90 text-[13px] font-semibold tracking-tight">
            QueryCanvas
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-2 pt-3 overflow-y-auto">
        {Object.entries(categories).map(([category, items]) => (
          <div key={category} className="mb-3">
            <div className="text-[9px] font-semibold uppercase tracking-[0.1em] text-white/30 px-2.5 mb-1">
              {category}
            </div>
            {items.map((item) => {
              const Icon = icons[item.icon as keyof typeof icons];
              const isActive = page === item.id;
              return (
                <div key={item.id}>
                  <button
                    onClick={() => setPage(item.id as PageId)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-[6px] rounded-md text-[12.5px] font-medium transition-all duration-150
                      ${isActive
                        ? 'text-white shadow-sm'
                        : 'text-white/50 hover:text-white/80'
                      }`}
                    style={isActive ? { background: 'var(--scaler-sidebar-active)' } : undefined}
                  >
                    {Icon && (
                      <Icon
                        size={14}
                        strokeWidth={isActive ? 2.2 : 1.8}
                        style={isActive ? { color: '#64748B' } : undefined}
                      />
                    )}
                    <span className="flex-1 text-left">{item.label}</span>
                    {isActive && <ChevronDown size={12} className="text-white/30" />}
                  </button>

                  {/* Subtopic gallery — appears under active topic */}
                  <AnimatePresence>
                    {isActive && item.subtopics.length > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="flex flex-wrap gap-[4px] px-3 py-2 ml-5 border-l border-white/[0.06]">
                          {item.subtopics.map((t) => (
                            <span key={t} className="topic-chip">{t}</span>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        ))}
      </div>


    </motion.aside>
  );
}
