import { ReactNode } from 'react';

interface MacWindowProps {
  title: string;
  children: ReactNode;
  className?: string;
  compact?: boolean;
}

export function MacWindow({ title, children, className = '', compact = false }: MacWindowProps) {
  return (
    <div className={`bg-surface-1 rounded-mac shadow-mac overflow-hidden border border-border ${className}`}>
      {/* Title bar */}
      <div
        className="flex items-center gap-2 px-4 border-b border-border select-none"
        style={{
          height: compact ? 32 : 38,
          background: 'var(--chrome-bg)',
        }}
      >
        {/* Traffic lights */}
        <div className="flex items-center gap-[7px]">
          <div className="w-[11px] h-[11px] rounded-full" style={{ background: 'var(--traffic-red)' }} />
          <div className="w-[11px] h-[11px] rounded-full" style={{ background: 'var(--traffic-yellow)' }} />
          <div className="w-[11px] h-[11px] rounded-full" style={{ background: 'var(--traffic-green)' }} />
        </div>
        {/* Title */}
        <div className="flex-1 text-center">
          <span className="text-text-secondary text-[12px] font-medium">{title}</span>
        </div>
        {/* Spacer to balance traffic lights */}
        <div className="w-[52px]" />
      </div>
      {/* Content */}
      <div className="overflow-auto">{children}</div>
    </div>
  );
}
