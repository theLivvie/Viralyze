'use client';

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { PacingPoint } from '@/lib/audience-simulator/types';

export default function PacingChart({ data }: { data: PacingPoint[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="moment" tick={{ fill: '#A1A1AA', fontSize: 11 }} axisLine={false} />
          <YAxis domain={[0, 100]} tick={{ fill: '#A1A1AA', fontSize: 11 }} axisLine={false} />
          <Tooltip
            contentStyle={{
              background: '#121214',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8,
              color: '#FAFAF9',
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: '#A1A1AA' }} />
          <Line type="monotone" dataKey="tension" stroke="#B8325A" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="emotion" stroke="#F59E0B" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="humor" stroke="#22C55E" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="engagement" stroke="#3B82F6" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
