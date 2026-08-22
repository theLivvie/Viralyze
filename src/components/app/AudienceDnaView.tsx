'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import PlatformSelector from '@/components/shared/PlatformSelector';
import { useAppStore } from '@/lib/store';
import { getDemoAudienceDna } from '@/lib/audience-simulator/platform-intel';
import type { AudienceDna } from '@/lib/audience-simulator/types';
import AudienceDnaCard from '@/components/app/audience/AudienceDnaCard';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function AudienceDnaView() {
  const { predictPlatform, setPredictPlatform, audienceSource, setAudienceSource, setCurrentView } =
    useAppStore();
  const [dna, setDna] = useState<AudienceDna>(() => getDemoAudienceDna(predictPlatform));
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/audience/connect?platform=${predictPlatform}&source=${audienceSource}`
        );
        const data = await res.json();
        if (cancelled) return;
        if (data.dna) setDna(data.dna);
        setNotice(data.warning || null);
      } catch {
        if (!cancelled) setDna(getDemoAudienceDna(predictPlatform));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [predictPlatform, audienceSource]);

  const enableDemo = async () => {
    try {
      const res = await fetch('/api/audience/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: predictPlatform, action: 'demo' }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Could not enable demo audience.');
        return;
      }
      setAudienceSource('demo');
      if (data.dna) setDna(data.dna);
      setNotice(data.notice || 'Demo Data — Simulated for demonstration');
      toast.success('Demo audience enabled for this platform.');
    } catch {
      toast.error('Network error.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto flex flex-col gap-6"
    >
      <div>
        <p className="text-[11px] tracking-widest uppercase text-wine-accent font-semibold">
          Audience DNA
        </p>
        <h1 className="text-2xl font-bold text-viralyze-white mt-1">
          Who this content is simulated against
        </h1>
        <p className="text-sm text-viralyze-muted mt-2">
          Only fields that exist for the selected source are shown. Missing analytics are labeled,
          never invented as real user data.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-viralyze-muted">Platform</Label>
        <PlatformSelector value={predictPlatform} onChange={setPredictPlatform} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={audienceSource === 'demo' ? 'default' : 'outline'}
          className={audienceSource === 'demo' ? 'bg-gradient-wine text-white' : ''}
          onClick={() => setAudienceSource('demo')}
        >
          Demo audience
        </Button>
        <Button
          type="button"
          variant={audienceSource === 'connected' ? 'default' : 'outline'}
          className={audienceSource === 'connected' ? 'bg-gradient-wine text-white' : ''}
          onClick={() => setAudienceSource('connected')}
        >
          Connected account
        </Button>
        <Button type="button" variant="ghost" onClick={enableDemo}>
          Load demo DNA
        </Button>
        <Button type="button" variant="ghost" onClick={() => setCurrentView('connected-accounts')}>
          Manage connections
        </Button>
      </div>

      {notice && (
        <p className="text-sm text-amber-300 border border-amber-500/30 rounded-lg px-3 py-2">
          {notice}
        </p>
      )}

      <AudienceDnaCard dna={dna} />
    </motion.div>
  );
}
