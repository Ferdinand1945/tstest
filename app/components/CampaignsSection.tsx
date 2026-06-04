"use client";

import type { Campaign } from "@/lib/types";
import Input from "./utils/Input";
import Button from "./utils/Button";
import Card from "./utils/Card";

export type CampaignFormState = {
  prefix: string;
  amount: string;
  currency: string;
  valid_from: string;
  valid_to: string;
};

type Props = {
  campaigns: Campaign[];
  selectedId: number | null;
  loading: boolean;
  form: CampaignFormState;
  setForm: (form: CampaignFormState) => void;
  onCreateCampaign: (e: React.FormEvent) => void;
  onCampaignSelect: (id: number) => void;
};

export default function CampaignsSection({
  campaigns,
  selectedId,
  loading,
  form,
  setForm,
  onCreateCampaign,
  onCampaignSelect,
}: Props) {
  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-6 lg:col-span-2">
        <Card
          title="New campaign"
          description="Set validity, amount, and code prefix."
        >
          <form
            onSubmit={onCreateCampaign}
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
              onChange={(value) => setForm({ ...form, valid_from: value })}
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
                      aria-label={`Campaign ${c.prefix}`}
                      onClick={() => onCampaignSelect(c.id)}
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
  );
}
