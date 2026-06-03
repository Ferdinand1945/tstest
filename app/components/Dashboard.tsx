"use client";

import { useEffect, useState } from "react";
import type { Campaign, Voucher } from "@/lib/types";
import Input from "./utils/Input";
import Button from "./utils/Button";
import Card from "./utils/Card";
import Header from "./Header";
import { CheckCircle, AlertCircle } from "@deemlol/next-icons";
import VouchersModal from "./VouchersModal";

export default function Dashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [vouchersModalOpen, setVouchersModalOpen] = useState(false);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [voucherTotal, setVoucherTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [batchCount, setBatchCount] = useState("100");

  const [form, setForm] = useState({
    prefix: "DISCOUNT",
    amount: "10",
    currency: "EUR",
    valid_from: new Date().toISOString().slice(0, 10),
    valid_to: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/campaigns");
        if (!res.ok) throw new Error("Failed to load campaigns");
        const data = (await res.json()) as Campaign[];
        if (!cancelled) setCampaigns(data);
      } catch (e) {
        showMessage(e instanceof Error ? e.message : "Load failed", "error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (selectedId == null) {
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/campaigns/${selectedId}/vouchers?limit=100&offset=0`,
        );
        if (!res.ok) throw new Error("Failed to load vouchers");
        const data = (await res.json()) as { vouchers: Voucher[]; total: number };
        if (!cancelled) {
          setVouchers(data.vouchers);
          setVoucherTotal(data.total);
        }
      } catch (e) {
        showMessage(e instanceof Error ? e.message : "Load failed", "error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  function showMessage(text: string, type: "success" | "error" = "success") {
    setMessage(text);
    setMessageType(type);
  }

  async function refreshCampaigns() {
    const res = await fetch("/api/campaigns");
    if (!res.ok) throw new Error("Failed to load campaigns");
    const data = (await res.json()) as Campaign[];
    setCampaigns(data);
  }

  async function refreshVouchers(campaignId: number) {
    const res = await fetch(`/api/campaigns/${campaignId}/vouchers?limit=100&offset=0`);
    if (!res.ok) throw new Error("Failed to load vouchers");
    const data = (await res.json()) as { vouchers: Voucher[]; total: number };
    setVouchers(data.vouchers);
    setVoucherTotal(data.total);
  }

  async function handleCreateCampaign(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prefix: form.prefix,
          amount: Number(form.amount),
          currency: form.currency,
          valid_from: form.valid_from,
          valid_to: form.valid_to,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Create failed");
      await refreshCampaigns();
      setSelectedId(data.id);
      showMessage(`Campaign "${data.prefix}" created successfully.`);
    } catch (err) {
      showMessage(err instanceof Error ? err.message : "Create failed", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleBatchVouchers() {
    if (selectedId == null) return;
    setLoading(true);
    setMessage(null);
    try {
      const count = Number(batchCount);
      const res = await fetch(`/api/campaigns/${selectedId}/vouchers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Batch create failed");
      await refreshCampaigns();
      await refreshVouchers(selectedId);
      showMessage(`Generated ${data.created.toLocaleString()} voucher(s).`);
    } catch (err) {
      showMessage(err instanceof Error ? err.message : "Batch create failed", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteCampaign() {
    if (selectedId == null) return;
    if (!confirm("Delete this campaign and all its vouchers?")) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/campaigns/${selectedId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Delete failed");
      }
      setSelectedId(null);
      await refreshCampaigns();
      showMessage("Campaign deleted.");
    } catch (err) {
      showMessage(err instanceof Error ? err.message : "Delete failed", "error");
    } finally {
      setLoading(false);
    }
  }

  const selected = campaigns.find((c) => c.id === selectedId);

  return (
    <div className="app-gradient min-h-full">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Header />
        {message && (
          <div
            role="status"
            className={`mb-6 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
              messageType === "success"
                ? "border-emerald-200/80 bg-emerald-50 text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-200"
                : "border-red-200/80 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
            }`}
          >
            <span className="mt-0.5 shrink-0 text-base">
              {messageType === "success" ? <CheckCircle/> : <AlertCircle/>}
            </span>
            <p>{message}</p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-2">
            <Card
              title="New campaign"
              description="Set validity, amount, and code prefix."
            >
              <form
                onSubmit={handleCreateCampaign}
                className="grid gap-4 sm:grid-cols-2"
              >
                <Input
                  label="Prefix"
                  value={form.prefix}
                  onChange={(value) => setForm({ ...form, prefix: value })}
                  placeholder="DISCOUNT"
                  className="sm:col-span-2"
                />
                <Input
                  label="Amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.amount}
                  onChange={(value) => setForm({ ...form, amount: value })}
                />
                <Input
                  label="Currency"
                  value={form.currency}
                  onChange={(value) => setForm({ ...form, currency: value })}
                  maxLength={3}
                  placeholder="EUR"
                />
                <Input
                  label="Valid from"
                  type="date"
                  value={form.valid_from}
                  onChange={(value) =>
                    setForm({ ...form, valid_from: value })
                  }
                />
                <Input
                  label="Valid to"
                  type="date"
                  value={form.valid_to}
                  onChange={(value) => setForm({ ...form, valid_to: value })}
                />
                <div className="sm:col-span-2 pt-1">
                  <Button
                    label={loading ? "Creating…" : "Create campaign"}
                    type="submit"
                    disabled={loading}
                    className="w-full"
                  />
                </div>
              </form>
            </Card>
          </div>

          <div className="space-y-6 lg:col-span-3">
            <Card
              title="Campaigns"
              description={
                campaigns.length === 0
                  ? "No campaigns yet — create one to get started."
                  : `${campaigns.length} campaign${campaigns.length === 1 ? "" : "s"}`
              }
            >
              {campaigns.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-12 text-center dark:border-slate-700">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl dark:bg-slate-800">
                    🎟️
                  </div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    No campaigns yet
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Your campaigns will appear here
                  </p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {campaigns.map((c) => {
                    const isSelected = selectedId === c.id;
                    return (
                      <li key={c.id}>
                        <Button
                          variant="unstyled"
                          onClick={() => {
                            setSelectedId(c.id);
                            setVouchersModalOpen(true);
                          }}
                          className={`group w-full rounded-xl border p-4 text-left transition-all duration-200 ${
                            isSelected
                              ? "border-indigo-300 bg-indigo-50/80 shadow-sm shadow-indigo-100 dark:border-indigo-500/50 dark:bg-indigo-950/40 dark:shadow-indigo-950/20"
                              : "border-slate-200/80 bg-slate-50/50 hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-900/40 dark:hover:border-slate-700 dark:hover:bg-slate-900"
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {c.prefix}
                            </span>
                            <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                              {c.voucher_count.toLocaleString()} vouchers
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                            <span className="font-medium text-slate-800 dark:text-slate-200">
                              {c.amount} {c.currency}
                            </span>
                            <span className="mx-2 text-slate-300 dark:text-slate-600">
                              ·
                            </span>
                            {c.valid_from} → {c.valid_to}
                          </p>
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          </div>
        </div>

        {selected && (
          <VouchersModal
            open={vouchersModalOpen}
            onClose={() => setVouchersModalOpen(false)}
            campaign={selected}
            vouchers={vouchers}
            voucherTotal={voucherTotal}
            batchCount={batchCount}
            setBatchCount={setBatchCount}
            loading={loading}
            onGenerate={handleBatchVouchers}
            onDeleteCampaign={handleDeleteCampaign}
          />
        )}
      </div>
    </div>
  );
}