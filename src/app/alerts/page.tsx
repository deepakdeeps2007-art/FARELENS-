'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Trash2, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  Mail, 
  TrendingDown, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { AlertRule } from '@/core/types/index';
import { formatINR } from '@/core/pricing/index';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewAlertOpen, setIsNewAlertOpen] = useState(false);

  // Form state
  const [email, setEmail] = useState('traveller@example.com');
  const [fromCity, setFromCity] = useState('Bangalore');
  const [toCity, setToCity] = useState('Hyderabad');
  const [targetPrice, setTargetPrice] = useState('1100');
  const [dropThreshold, setDropThreshold] = useState('5');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadAlerts() {
      try {
        const res = await fetch('/api/v1/alerts');
        const data = await res.json();
        if (data.success) {
          setAlerts(data.data);
        }
      } catch (e) {
        // Continue
      } finally {
        setLoading(false);
      }
    }
    loadAlerts();
  }, []);

  const handleDelete = async (alertId: string) => {
    try {
      const res = await fetch(`/api/v1/alerts/${alertId}`, { method: 'DELETE' });
      if (res.ok) {
        setAlerts(alerts.filter((a) => a.id !== alertId));
      }
    } catch (e) {
      // Continue
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user-demo-1',
          userEmail: email,
          routeId: `${fromCity.toLowerCase()}-${toCity.toLowerCase()}`,
          fromCity,
          toCity,
          journeyDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
          targetPrice: parseInt(targetPrice, 10),
          dropPercentThreshold: parseInt(dropThreshold, 10),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAlerts([data.data, ...alerts]);
        setSuccessMsg(`Alert active for ${fromCity} → ${toCity}!`);
        setTimeout(() => {
          setSuccessMsg(null);
          setIsNewAlertOpen(false);
        }, 2000);
      }
    } catch (e) {
      // Continue
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white border-b border-slate-200 pt-10 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-2 border border-emerald-200">
                <Bell className="w-3.5 h-3.5 text-emerald-600" />
                <span>Automated Price Drop Sentinel</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Your Active Price Alerts
              </h1>
              <p className="mt-1 text-slate-600 text-sm">
                FareLens monitors fares every few hours. When an operator lowers prices, we notify you immediately.
              </p>
            </div>

            <button
              onClick={() => setIsNewAlertOpen(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Alert</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">Loading active alerts...</div>
        ) : alerts.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-subtle space-y-3">
            <Bell className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No price alerts currently set</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Track any bus from search results or set up a custom alert to be notified when prices dip.
            </p>
            <button
              onClick={() => setIsNewAlertOpen(true)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
            >
              Set First Price Alert
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-card hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      Active Sentinel
                    </span>
                    <button
                      onClick={() => handleDelete(alert.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors"
                      title="Delete alert"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 mt-3 flex items-center gap-1.5">
                    <span>{alert.fromCity}</span>
                    <span className="text-slate-400">→</span>
                    <span>{alert.toCity}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Journey Date: <strong>{alert.journeyDate}</strong> {alert.operatorName ? `• ${alert.operatorName}` : ''}
                  </p>

                  <div className="my-4 bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                    {alert.targetPrice && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Target Threshold:</span>
                        <span className="font-bold text-slate-800 tabular-nums">Below {formatINR(alert.targetPrice)}</span>
                      </div>
                    )}
                    {alert.dropPercentThreshold && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Drop Trigger:</span>
                        <span className="font-bold text-emerald-700 tabular-nums">≥{alert.dropPercentThreshold}% Reduction</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-1 border-t border-slate-200 text-[11px] text-slate-400">
                      <span>Dispatch Email:</span>
                      <span className="truncate max-w-[150px] font-medium text-slate-600">{alert.userEmail}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">Checked every 3 hours</span>
                  <Link
                    href={`/search?from=${encodeURIComponent(alert.fromCity)}&to=${encodeURIComponent(alert.toCity)}&date=${alert.journeyDate}`}
                    className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1"
                  >
                    <span>View Live Fares</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Alert Modal */}
      {isNewAlertOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Configure Price Drop Alert</h3>
            <p className="text-xs text-slate-500">
              Set your target threshold. As soon as redBus, AbhiBus, or operators lower fares, we send a notification email.
            </p>

            {successMsg ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs text-emerald-800 font-bold">
                {successMsg}
              </div>
            ) : (
              <form onSubmit={handleCreate} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Your Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">From City</label>
                    <input
                      type="text"
                      required
                      value={fromCity}
                      onChange={(e) => setFromCity(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">To Destination</label>
                    <input
                      type="text"
                      required
                      value={toCity}
                      onChange={(e) => setToCity(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Target Price (₹)</label>
                    <input
                      type="number"
                      required
                      value={targetPrice}
                      onChange={(e) => setTargetPrice(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Drop Threshold (%)</label>
                    <input
                      type="number"
                      required
                      value={dropThreshold}
                      onChange={(e) => setDropThreshold(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNewAlertOpen(false)}
                    className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold shadow-sm"
                  >
                    Activate Alert
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
