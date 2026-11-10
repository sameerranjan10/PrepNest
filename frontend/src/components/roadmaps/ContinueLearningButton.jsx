import React from 'react';
import { ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function ContinueLearningButton({
  onClick,
  label = 'Continue Learning',
  sublabel = null,
  disabled = false,
  className = '',
}) {
  return (
    <Button
      variant="primary"
      size="md"
      onClick={onClick}
      disabled={disabled}
      icon={<Play className="w-4 h-4 fill-current" />}
      iconRight={<ArrowRight className="w-4 h-4" />}
      className={`px-4 py-2.5 shadow-sm whitespace-nowrap ${className}`}
      title={sublabel || label}
    >
      <span className="flex items-center gap-1.5">
        <span>{label}</span>
        {sublabel && (
          <span className="hidden sm:inline font-normal text-white/90 text-xs truncate max-w-[180px]">
            · {sublabel}
          </span>
        )}
      </span>
    </Button>
  );
}

