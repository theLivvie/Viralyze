'use client';

import { Instagram, Youtube, Tv, Twitter, Linkedin } from 'lucide-react';
import type { Platform } from '@/lib/types';
import { cn } from '@/lib/utils';

interface PlatformSelectorProps {
  value: Platform;
  onChange: (p: Platform) => void;
  platforms?: Platform[];
}

const platformConfig: Record<Platform, { icon: React.ElementType; label: string }> = {
  instagram: { icon: Instagram, label: 'Instagram' },
  youtube: { icon: Youtube, label: 'YouTube' },
  tiktok: { icon: Tv, label: 'TikTok' },
  x: { icon: Twitter, label: 'X' },
  linkedin: { icon: Linkedin, label: 'LinkedIn' },
};

export default function PlatformSelector({
  value,
  onChange,
  platforms = ['instagram', 'youtube', 'tiktok', 'x', 'linkedin'],
}: PlatformSelectorProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {platforms.map((platform) => {
        const config = platformConfig[platform];
        const isSelected = value === platform;
        const Icon = config.icon;

        return (
          <button
            key={platform}
            type="button"
            onClick={() => onChange(platform)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-wine-accent',
              isSelected
                ? 'border-wine-accent bg-wine-accent/10 text-wine-accent glow-wine-sm'
                : 'border-white/10 bg-white/[0.03] text-viralyze-muted hover:border-white/20 hover:text-viralyze-white'
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{config.label}</span>
          </button>
        );
      })}
    </div>
  );
}
