"use client";

import { useEffect, useState } from "react";
import type { Campaign, Voucher } from "@/lib/types";
import Header from "./Header";
import { CheckCircle, AlertCircle } from "@deemlol/next-icons";
import VouchersModal from "./VouchersModal";
import CampaignsSection, { type CampaignFormState } from "./CampaignsSection";

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

  const [form, setForm] = useState<CampaignFormState>({
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
      if (data.complete === false || data.created !== data.requested) {
        showMessage(
          `Created ${data.created.toLocaleString()} of ${data.requested.toLocaleString()} requested voucher(s).`,
          "error",
        );
      } else {
        showMessage(
          `Generated ${data.created.toLocaleString()} voucher(s).`,
        );
      }
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

        <CampaignsSection
          campaigns={campaigns}
          selectedId={selectedId}
          loading={loading}
          form={form}
          setForm={setForm}
          onCreateCampaign={handleCreateCampaign}
          onCampaignSelect={(id) => {
            setSelectedId(id);
            setVouchersModalOpen(true);
          }}
        />

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