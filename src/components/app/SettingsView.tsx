'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { User, CreditCard, LogOut, AlertTriangle, Trash2, Check, Sparkles, Bell, Mail, BarChart3, Camera, Upload, Loader2, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const plans = [
  { name: 'Free', price: '$0', predictions: 5, analytics: false, export: false, priority: false },
  { name: 'Creator', price: '$12', predictions: 50, analytics: true, export: true, priority: false, highlighted: true },
  { name: 'Pro', price: '$29', predictions: '\u221e', analytics: true, export: true, priority: true },
] as const;

interface NotificationSettings {
  email: boolean;
  weeklyDigest: boolean;
  predictionAlerts: boolean;
}

export default function SettingsView() {
  const { user, logout, login } = useAppStore();
  const userId = user?.id;
  const [nameValue, setNameValue] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: true,
    weeklyDigest: false,
    predictionAlerts: true,
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Fetch notification settings from DB on mount
  const fetchSettings = useCallback(async () => {
    if (!userId) {
      setSettingsLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/settings?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.notifications && typeof data.notifications === 'object') {
          setNotifications({
            email: data.notifications.email ?? true,
            weeklyDigest: data.notifications.weeklyDigest ?? false,
            predictionAlerts: data.notifications.predictionAlerts ?? true,
          });
        }
      }
    } catch {
      // Silently fail — use defaults
    } finally {
      setSettingsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSaveName = async () => {
    if (!user || !nameValue.trim() || nameValue.trim() === user.name) return;
    setSaving(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, name: nameValue.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        login({ ...user, name: data.name });
        toast.success('Profile updated successfully');
      } else {
        toast.error(data.error || 'Failed to update name');
      }
    } catch {
      toast.error('Failed to update name');
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationChange = async (key: keyof NotificationSettings, value: boolean) => {
    if (!userId) return;
    const updated = { ...notifications, [key]: value };
    setNotifications(updated);
    setSavingSettings(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, notifications: updated }),
      });
      if (!res.ok) {
        // Revert on failure
        setNotifications(notifications);
        const data = await res.json();
        toast.error(data.error || 'Failed to save notification settings');
      } else {
        toast.success('Notification settings saved');
      }
    } catch {
      setNotifications(notifications);
      toast.error('Failed to save notification settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleDeleteAccount = () => {
    toast.error('Account deletion is not available in the demo. Stay with us! \ud83c\udf77');
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6 max-w-2xl mx-auto"
    >
      {/* Profile — with gradient border and avatar upload zone */}
      <motion.div variants={item} className="relative">
        {/* Gradient mesh background (2 blurred circles) */}
        <div className="pointer-events-none absolute -inset-8 overflow-hidden rounded-3xl" aria-hidden="true">
          <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-wine-accent/15 blur-[80px]" />
          <div className="absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-wine-deep/20 blur-[80px]" />
        </div>
        <div className="gradient-border rounded-xl relative z-10">
          <Card className="glass relative z-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4 text-wine-accent" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {/* Avatar upload zone */}
              <div className="flex items-center gap-4">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="relative h-16 w-16 rounded-full border-2 border-dashed border-white/[0.12] bg-white/[0.03] flex items-center justify-center hover:border-wine-accent/40 hover:bg-wine-accent/[0.05] transition-all duration-200 group"
                  onClick={() => toast.info('Avatar upload coming soon!')}
                  aria-label="Upload profile photo"
                >
                  {/* Rotating conic-gradient ring */}
                  <motion.div
                    className="absolute -inset-[3px] rounded-full"
                    style={{
                      background: 'conic-gradient(from 0deg, #B8325A, #7F1D3A, #4A1024, #7F1D3A, #B8325A)',
                      WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                      WebkitMaskComposite: 'xor',
                      maskComposite: 'exclude',
                      padding: '2px',
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                  />
                  {user?.name ? (
                    <span className="text-xl font-bold text-wine-accent relative z-10">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <Camera className="h-5 w-5 text-viralyze-muted/40 relative z-10" />
                  )}
                  <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center z-10">
                    <Upload className="h-4 w-4 text-wine-accent/70" />
                  </div>
                </motion.button>
                <div className="flex-1">
                  <p className="text-sm font-medium text-viralyze-white">Profile Photo</p>
                  <p className="text-xs text-viralyze-muted/50">Click to upload an avatar</p>
                </div>
              </div>
              <Separator className="bg-white/[0.06]" />
              <div className="flex flex-col gap-2">
                <Label htmlFor="settings-name" className="text-viralyze-muted text-sm">Name</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="settings-name"
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                    placeholder="Enter your name"
                    className="flex-1 bg-white/[0.03] border-white/[0.06] text-viralyze-white hover:border-white/[0.12] focus:border-wine-accent/40 transition-colors"
                  />
                  <Button
                    onClick={handleSaveName}
                    disabled={saving || !nameValue.trim() || nameValue.trim() === (user?.name || '')}
                    size="icon"
                    className="h-9 w-9 min-h-[44px] min-w-[44px] shrink-0 bg-wine-accent hover:bg-wine-accent/90 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Save name"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="settings-email" className="text-viralyze-muted text-sm">Email</Label>
                <Input
                  id="settings-email"
                  value={user?.email || ''}
                  readOnly
                  className="bg-white/[0.03] border-white/[0.06] text-viralyze-white/60 cursor-not-allowed hover:border-white/[0.12] transition-colors"
                  aria-describedby="settings-email-hint"
                />
                <p id="settings-email-hint" className="text-xs text-viralyze-muted/40 sr-only">Email address is read-only and cannot be changed</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Plan & Usage */}
      <motion.div variants={item}>
        <Card className="glass hover:bg-white/[0.03] hover:border-white/[0.08] transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-4 w-4 text-wine-accent" />
              Plan & Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-viralyze-muted">Current Plan</span>
              <span className="text-sm font-medium text-viralyze-white capitalize">
                {user?.plan || 'Free'}
              </span>
            </div>
            <Separator className="bg-white/[0.06]" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-viralyze-muted">Predictions Used</span>
              <span className="text-sm font-medium text-viralyze-white tabular-nums">
                {user?.predictionsUsed ?? 0} / {user?.predictionsLimit ?? 5}
              </span>
            </div>
            {/* Usage bar */}
            <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-wine transition-all duration-500"
                style={{
                  width: `${Math.min(100, ((user?.predictionsUsed ?? 0) / (user?.predictionsLimit ?? 5)) * 100)}%`,
                }}
              />
            </div>
            <Button
              variant="outline"
              className="w-full min-h-[44px] border-white/10 text-viralyze-muted hover:text-viralyze-white hover:bg-white/[0.04] hover:border-wine-accent/30 transition-colors"
              onClick={() => {}}
              aria-label="Upgrade to a higher plan"
            >
              Upgrade Plan
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Plan Comparison Table */}
      <motion.div variants={item}>
        <Card className="glass hover:bg-white/[0.03] hover:border-white/[0.08] transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-wine-accent" />
              Compare Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left py-2.5 pr-4 text-viralyze-muted font-medium text-xs">Feature</th>
                    {plans.map((plan) => (
                      <th
                        key={plan.name}
                        className={`text-center py-2.5 px-3 font-medium text-xs ${plan.highlighted ? 'text-wine-accent' : 'text-viralyze-muted'}`}
                      >
                        <span className="block text-sm font-semibold text-viralyze-white">{plan.name}</span>
                        <span className="text-viralyze-muted">{plan.price}/mo</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-viralyze-muted">
                  <tr className="border-b border-white/[0.04] hover:bg-white/[0.03] hover:glow-wine-sm transition-all">
                    <td className="py-2.5 pr-4 text-viralyze-white/70 text-xs">Predictions</td>
                    {plans.map((plan) => (
                      <td key={plan.name} className="text-center py-2.5 px-3 text-xs tabular-nums">
                        {plan.predictions}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-white/[0.04] hover:bg-white/[0.03] hover:glow-wine-sm transition-all">
                    <td className="py-2.5 pr-4 text-viralyze-white/70 text-xs">Analytics</td>
                    {plans.map((plan) => (
                      <td key={plan.name} className="text-center py-2.5 px-3">
                        {plan.analytics ? (
                          <Check className="h-4 w-4 text-emerald-400 mx-auto" />
                        ) : (
                          <span className="text-viralyze-muted/40">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-white/[0.04] hover:bg-white/[0.03] hover:glow-wine-sm transition-all">
                    <td className="py-2.5 pr-4 text-viralyze-white/70 text-xs">Export Data</td>
                    {plans.map((plan) => (
                      <td key={plan.name} className="text-center py-2.5 px-3">
                        {plan.export ? (
                          <Check className="h-4 w-4 text-emerald-400 mx-auto" />
                        ) : (
                          <span className="text-viralyze-muted/40">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-white/[0.03] hover:glow-wine-sm transition-all">
                    <td className="py-2.5 pr-4 text-viralyze-white/70 text-xs">Priority Support</td>
                    {plans.map((plan) => (
                      <td key={plan.name} className="text-center py-2.5 px-3">
                        {plan.priority ? (
                          <Check className="h-4 w-4 text-emerald-400 mx-auto" />
                        ) : (
                          <span className="text-viralyze-muted/40">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notification Preferences */}
      <motion.div variants={item}>
        <Card className="glass hover:bg-white/[0.03] hover:border-white/[0.08] transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-4 w-4 text-wine-accent" />
              Notification Preferences
              <span aria-live="polite" className="sr-only">
                {savingSettings ? 'Saving notification settings' : ''}
              </span>
              {savingSettings && <Loader2 className="h-3.5 w-3.5 text-wine-accent animate-spin" aria-hidden="true" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {settingsLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 text-wine-accent animate-spin" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                      <Mail className="h-4 w-4 text-viralyze-muted" />
                    </div>
                    <div>
                      <p className="text-sm text-viralyze-white font-medium">Email Notifications</p>
                      <p className="text-xs text-viralyze-muted/50">Receive prediction results via email</p>
                    </div>
                  </div>
                  <div className={cn(
                    'rounded-full p-1 transition-all duration-300',
                    notifications.email
                      ? 'bg-wine-accent/10 animate-pulse-glow'
                      : 'bg-white/[0.04]'
                  )} style={notifications.email ? { animationDuration: '4s', boxShadow: '0 0 12px rgba(184, 50, 90, 0.3)' } : undefined}>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(v) => handleNotificationChange('email', v)}
                      className="data-[state=checked]:bg-wine-accent"
                      aria-label="Toggle email notifications"
                    />
                  </div>
                </div>
                <Separator className="bg-white/[0.06]" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                      <BarChart3 className="h-4 w-4 text-viralyze-muted" />
                    </div>
                    <div>
                      <p className="text-sm text-viralyze-white font-medium">Weekly Digest</p>
                      <p className="text-xs text-viralyze-muted/50">Get a weekly summary of trending topics</p>
                    </div>
                  </div>
                  <div className={cn(
                    'rounded-full p-1 transition-all duration-300',
                    notifications.weeklyDigest
                      ? 'bg-wine-accent/10 animate-pulse-glow'
                      : 'bg-white/[0.04]'
                  )} style={notifications.weeklyDigest ? { animationDuration: '4s', boxShadow: '0 0 12px rgba(184, 50, 90, 0.3)' } : undefined}>
                    <Switch
                      checked={notifications.weeklyDigest}
                      onCheckedChange={(v) => handleNotificationChange('weeklyDigest', v)}
                      className="data-[state=checked]:bg-wine-accent"
                      aria-label="Toggle weekly digest"
                    />
                  </div>
                </div>
                <Separator className="bg-white/[0.06]" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-viralyze-muted" />
                    </div>
                    <div>
                      <p className="text-sm text-viralyze-white font-medium">Prediction Alerts</p>
                      <p className="text-xs text-viralyze-muted/50">Get notified when predictions are ready</p>
                    </div>
                  </div>
                  <div className={cn(
                    'rounded-full p-1 transition-all duration-300',
                    notifications.predictionAlerts
                      ? 'bg-wine-accent/10 animate-pulse-glow'
                      : 'bg-white/[0.04]'
                  )} style={notifications.predictionAlerts ? { animationDuration: '4s', boxShadow: '0 0 12px rgba(184, 50, 90, 0.3)' } : undefined}>
                    <Switch
                      checked={notifications.predictionAlerts}
                      onCheckedChange={(v) => handleNotificationChange('predictionAlerts', v)}
                      className="data-[state=checked]:bg-wine-accent"
                      aria-label="Toggle prediction alerts"
                    />
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Account Actions */}
      <motion.div variants={item}>
        <Card className="glass hover:bg-white/[0.03] hover:border-white/[0.08] transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button
              variant="outline"
              onClick={logout}
              className="w-full min-h-[44px] border-white/10 text-viralyze-muted hover:text-viralyze-white hover:bg-white/[0.04] hover:border-white/20 transition-colors"
              aria-label="Log out of your account"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Danger Zone */}
      <motion.div variants={item}>
        <div className="rounded-xl">
          <Card className="glass border-red-500/30 animate-pulse-glow relative z-0" style={{ animationDuration: '3s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-red-400">
              <AlertTriangle className="h-4 w-4" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p id="danger-zone-warning" className="text-sm text-viralyze-muted mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <Button
              variant="outline"
              onClick={handleDeleteAccount}
              className="min-h-[44px] border-red-500/30 text-red-400 hover:text-red-300 hover:bg-red-500/10 hover:border-red-500/50 transition-colors"
              aria-describedby="danger-zone-warning"
              aria-label="Delete account permanently"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Account
            </Button>
          </CardContent>
        </Card>
        </div>
      </motion.div>
    </motion.div>
  );
}
