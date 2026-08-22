'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Instagram, Linkedin, Loader2, Tv, Twitter, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Platform } from '@/lib/types';
import type { ConnectedAccountPublic } from '@/lib/audience-simulator/types';
import { PLATFORM_LABELS } from '@/lib/audience-simulator/platform-intel';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const ICONS: Record<Platform, React.ElementType> = {
  instagram: Instagram,
  youtube: Youtube,
  tiktok: Tv,
  x: Twitter,
  linkedin: Linkedin,
};

const ORDER: Platform[] = ['instagram', 'youtube', 'tiktok', 'x', 'linkedin'];

export default function ConnectedAccountsView() {
  const { setCurrentView, setAudienceSource, setPredictPlatform } = useAppStore();
  const [accounts, setAccounts] = useState<ConnectedAccountPublic[]>([]);
  const [busy, setBusy] = useState<Platform | null>(null);

  const load = async () => {
    const res = await fetch('/api/audience/connect');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load accounts');
    setAccounts(data.accounts || []);
  };

  useEffect(() => {
    load().catch((err) => toast.error(err.message));
  }, []);

  const enableDemo = async (platform: Platform) => {
    setBusy(platform);
    try {
      const res = await fetch('/api/audience/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, action: 'demo' }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Could not enable demo mode.');
        return;
      }
      setAccounts(data.accounts || []);
      setAudienceSource('demo');
      setPredictPlatform(platform);
      toast.success(`${PLATFORM_LABELS[platform]} demo audience enabled.`);
    } catch {
      toast.error('Network error.');
    } finally {
      setBusy(null);
    }
  };

  const connectOAuth = (platform: Platform) => {
    const row = accounts.find((a) => a.platform === platform);
    if (!row?.oauthConfigured) {
      toast.message(
        `Official ${PLATFORM_LABELS[platform]} OAuth is not configured on this server. Use Demo Mode so judges can run the full product without live credentials.`
      );
      return;
    }
    window.location.href = `/api/audience/oauth/${platform}`;
  };

  const disconnect = async (platform: Platform) => {
    setBusy(platform);
    try {
      const res = await fetch('/api/audience/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, action: 'disconnect' }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Disconnect failed.');
        return;
      }
      setAccounts(data.accounts || []);
    } catch {
      toast.error('Network error.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto flex flex-col gap-6"
    >
      <div>
        <p className="text-[11px] tracking-widest uppercase text-wine-accent font-semibold">
          Connect your audience
        </p>
        <h1 className="text-2xl font-bold text-viralyze-white mt-1">Connected accounts</h1>
        <p className="text-sm text-viralyze-muted mt-2">
          Official OAuth is used when platform credentials are configured. Tokens stay on the
          server. Demo Mode is the supported hackathon path and is always labeled as simulated data.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {ORDER.map((platform) => {
          const row = accounts.find((a) => a.platform === platform);
          const Icon = ICONS[platform];
          const connected = row?.status === 'connected';
          const demo = row?.status === 'demo';
          return (
            <Card key={platform} className="glass border-white/[0.08]">
              <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="h-10 w-10 rounded-lg bg-white/[0.06] flex items-center justify-center">
                    <Icon className="h-5 w-5 text-wine-accent" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-viralyze-white">{PLATFORM_LABELS[platform]}</p>
                    <p className="text-xs text-viralyze-muted truncate">
                      {row?.platformUsername || row?.availableDataNotes}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-1.5 text-xs text-viralyze-muted">
                    <span
                      className={cn(
                        'h-2 w-2 rounded-full',
                        connected ? 'bg-emerald-400' : demo ? 'bg-amber-400' : 'bg-white/20'
                      )}
                    />
                    {connected ? 'Connected' : demo ? 'Demo' : 'Not connected'}
                  </span>
                  {demo && (
                    <Badge variant="outline" className="border-amber-500/40 text-amber-400 text-[10px]">
                      Demo Data
                    </Badge>
                  )}
                  <Button
                    size="sm"
                    className="bg-gradient-wine text-white"
                    disabled={busy === platform}
                    onClick={() => connectOAuth(platform)}
                  >
                    {busy === platform ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Connect'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy === platform}
                    onClick={() => enableDemo(platform)}
                  >
                    Demo
                  </Button>
                  {(connected || demo) && (
                    <Button size="sm" variant="ghost" onClick={() => disconnect(platform)}>
                      Disconnect
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Button
        variant="outline"
        className="self-start border-wine-accent/40 text-wine-accent"
        onClick={() => setCurrentView('audience-simulator')}
      >
        Continue to Audience Simulator
      </Button>
    </motion.div>
  );
}
