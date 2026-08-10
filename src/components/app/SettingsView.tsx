'use client';

import { motion } from 'framer-motion';
import { User, CreditCard, LogOut, AlertTriangle, Trash2, Check, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
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
  { name: 'Pro', price: '$29', predictions: '∞', analytics: true, export: true, priority: true },
] as const;

export default function SettingsView() {
  const { user, logout } = useAppStore();

  const handleDeleteAccount = () => {
    toast.error('Account deletion is not available in the demo. Stay with us! 🍷');
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6 max-w-2xl mx-auto"
    >
      {/* Profile — with gradient border */}
      <motion.div variants={item}>
        <div className="gradient-border rounded-xl">
          <Card className="glass relative z-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4 text-wine-accent" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label className="text-viralyze-muted text-sm">Name</Label>
                <Input
                  value={user?.name || ''}
                  readOnly
                  className="bg-white/[0.03] border-white/[0.06] text-viralyze-white/60 cursor-not-allowed hover:border-white/[0.12] transition-colors"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-viralyze-muted text-sm">Email</Label>
                <Input
                  value={user?.email || ''}
                  readOnly
                  className="bg-white/[0.03] border-white/[0.06] text-viralyze-white/60 cursor-not-allowed hover:border-white/[0.12] transition-colors"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Plan & Usage */}
      <motion.div variants={item}>
        <Card className="glass hover:border-white/[0.1] transition-colors">
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
              className="w-full border-white/10 text-viralyze-muted hover:text-viralyze-white hover:bg-white/[0.04] hover:border-wine-accent/30 transition-colors"
              onClick={() => {}}
            >
              Upgrade Plan
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Plan Comparison Table */}
      <motion.div variants={item}>
        <Card className="glass hover:border-white/[0.1] transition-colors">
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
                  <tr className="border-b border-white/[0.04]">
                    <td className="py-2.5 pr-4 text-viralyze-white/70 text-xs">Predictions</td>
                    {plans.map((plan) => (
                      <td key={plan.name} className="text-center py-2.5 px-3 text-xs tabular-nums">
                        {plan.predictions}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-white/[0.04]">
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
                  <tr className="border-b border-white/[0.04]">
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
                  <tr>
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

      {/* Account Actions */}
      <motion.div variants={item}>
        <Card className="glass hover:border-white/[0.1] transition-colors">
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
              className="w-full border-white/10 text-viralyze-muted hover:text-viralyze-white hover:bg-white/[0.04] hover:border-white/20 transition-colors"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Danger Zone */}
      <motion.div variants={item}>
        <Card className="glass border-red-500/20 hover:border-red-500/30 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-red-400">
              <AlertTriangle className="h-4 w-4" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-viralyze-muted mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <Button
              variant="outline"
              onClick={handleDeleteAccount}
              className="border-red-500/30 text-red-400 hover:text-red-300 hover:bg-red-500/10 hover:border-red-500/50 transition-colors"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
