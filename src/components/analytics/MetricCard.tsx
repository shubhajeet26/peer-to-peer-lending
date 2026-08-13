'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  trend?: string;
  badgeText?: string;
  className?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon = '📊',
  trend,
  badgeText,
  className,
}: MetricCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </CardTitle>
        <span className="text-xl">{icon}</span>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {value}
          </div>
          {badgeText && (
            <span className="rounded-full bg-purple-950/80 border border-purple-800 px-2 py-0.5 text-[10px] font-bold text-purple-300">
              {badgeText}
            </span>
          )}
        </div>

        {(subtitle || trend) && (
          <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
            {subtitle && <span>{subtitle}</span>}
            {trend && <span className="font-semibold text-purple-400">{trend}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
