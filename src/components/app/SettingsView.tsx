'use client';

import { motion } from 'framer-motion';
import { User, CreditCard, LogOut, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/lib/store';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function SettingsView() {
  const { user, logout } = useAppStore();

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6 max-w-2xl mx-auto"
    >
      {/* Profile */}
      <motion.div variants={item}>
        <Card className="glass">
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
                className="bg-white/[0.03] border-white/[0.06] text-viralyze-white/60 cursor-not-allowed"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-viralyze-muted text-sm">Email</Label>
              <Input
                value={user?.email || ''}
                readOnly
                className="bg-white/[0.03] border-white/[0.06] text-viralyze-white/60 cursor-not-allowed"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Plan */}
      <motion.div variants={item}>
        <Card className="glass">
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
              className="w-full border-white/10 text-viralyze-muted hover:text-viralyze-white hover:bg-white/[0.04]"
              onClick={() => {}}
            >
              Upgrade Plan
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Account Actions */}
      <motion.div variants={item}>
        <Card className="glass">
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
              className="w-full border-white/10 text-viralyze-muted hover:text-viralyze-white hover:bg-white/[0.04]"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
