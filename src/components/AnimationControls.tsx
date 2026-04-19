import { Play, Pause, RotateCcw, SkipForward, SkipBack } from 'lucide-react';

interface AnimationControlsProps {
  step: number;
  maxSteps: number;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onNext: () => void;
  onPrev: () => void;
  stepLabel?: string;
}

export function AnimationControls({
  step,
  maxSteps,
  isPlaying,
  onPlay,
  onPause,
  onReset,
  onNext,
  onPrev,
  stepLabel,
}: AnimationControlsProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-surface-2 rounded-mac-inner border border-border">
      <button
        onClick={onReset}
        className="p-1.5 rounded-md hover:bg-surface-3 text-text-secondary transition-colors"
        title="Reset"
      >
        <RotateCcw size={14} />
      </button>
      <button
        onClick={onPrev}
        disabled={step <= 0}
        className="p-1.5 rounded-md hover:bg-surface-3 text-text-secondary transition-colors disabled:opacity-30"
        title="Previous"
      >
        <SkipBack size={14} />
      </button>
      <button
        onClick={isPlaying ? onPause : onPlay}
        className="p-2 rounded-lg bg-accent text-white hover:bg-accent-hover transition-colors shadow-sm"
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <Pause size={14} /> : <Play size={14} />}
      </button>
      <button
        onClick={onNext}
        disabled={step >= maxSteps}
        className="p-1.5 rounded-md hover:bg-surface-3 text-text-secondary transition-colors disabled:opacity-30"
        title="Next"
      >
        <SkipForward size={14} />
      </button>

      {/* Progress */}
      <div className="flex-1 flex items-center gap-2 ml-2">
        <div className="flex-1 h-1.5 bg-surface-3 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-300"
            style={{ width: `${maxSteps > 0 ? (step / maxSteps) * 100 : 0}%` }}
          />
        </div>
        <span className="text-[11px] text-text-tertiary font-mono whitespace-nowrap">
          {step}/{maxSteps}
        </span>
      </div>

      {stepLabel && (
        <div className="text-[11px] text-text-secondary font-medium ml-2 whitespace-nowrap">
          {stepLabel}
        </div>
      )}
    </div>
  );
}
