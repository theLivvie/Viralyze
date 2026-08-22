'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { AudienceDna } from '@/lib/audience-simulator/types';
import { PLATFORM_LABELS } from '@/lib/audience-simulator/platform-intel';
import { cn } from '@/lib/utils';

export default function AudienceDnaCard({ dna }: { dna: AudienceDna }) {
  const isDemo = dna.source === 'demo';

  return (
    <Card className="glass border-white/[0.08]">
      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <p className="text-[11px] tracking-widest uppercase text-wine-accent font-semibold">
              Audience DNA
            </p>
            <p className="text-sm text-viralyze-muted mt-1">
              {PLATFORM_LABELS[dna.platform]} · {dna.connectedHandle || dna.label}
            </p>
          </div>
          <Badge
            variant="outline"
            className={cn(
              'text-[10px]',
              isDemo
                ? 'border-amber-500/40 text-amber-400'
                : 'border-emerald-500/40 text-emerald-400'
            )}
          >
            {isDemo ? 'Demo Data — Simulated for demonstration' : 'Authorized snapshot'}
          </Badge>
        </div>
        <p className="text-sm text-viralyze-muted mb-4">{dna.summary}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {dna.fields.map((field) => (
            <div
              key={field.key}
              className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-3"
            >
              <p className="text-[11px] uppercase tracking-wide text-viralyze-muted/70">
                {field.label}
              </p>
              <p
                className={cn(
                  'text-sm mt-1',
                  field.origin === 'unavailable'
                    ? 'text-viralyze-muted/60 italic'
                    : 'text-viralyze-white'
                )}
              >
                {field.value}
              </p>
              <p className="text-[10px] mt-1 text-viralyze-muted/50">
                {field.origin === 'demo'
                  ? 'Demo data'
                  : field.origin === 'authorized'
                    ? 'Authorized API'
                    : field.origin === 'ai'
                      ? 'AI-derived'
                      : 'Unavailable'}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
