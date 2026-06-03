"use client";

import Link from "next/link";
import type { Campaign, Voucher } from "@/lib/types";
import Card from "./utils/Card";
import Input from "./utils/Input";
import Button from "./utils/Button";
import { Download } from "@deemlol/next-icons";

type Props = {
  open: boolean;
  onClose: () => void;
  campaign: Campaign;
  vouchers: Voucher[];
  voucherTotal: number;
  batchCount: string;
  setBatchCount: (value: string) => void;
  loading: boolean;
  onGenerate: () => void;
  onDeleteCampaign: () => void;
};

export default function VouchersModal({
  open,
  onClose,
  campaign,
  vouchers,
  voucherTotal,
  batchCount,
  setBatchCount,
  loading,
  onGenerate,
  onDeleteCampaign,
}: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Campaign ${campaign.prefix} vouchers`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm" />

      <div className="relative w-full max-w-3xl">
        <div className="mb-3 flex items-center justify-between px-1">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Campaign
            </p>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {campaign.prefix}{" "}
              <span className="text-sm font-medium text-slate-400">
                (#{campaign.id})
              </span>
            </h3>
          </div>
          <Button
            label="✕"
            variant="outline"
            onClick={onClose}
            aria-label="Close modal"
            className="h-10 w-10 shrink-0 p-0"
          />
        </div>

        <Card
          title="Vouchers"
          description={`Codes like ${campaign.prefix}-XXXXXX · ${voucherTotal.toLocaleString()} total`}
        >
          <div className="mb-6 flex flex-wrap items-end gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-950/50">
            <Input
              label="Batch size"
              type="number"
              min={1}
              max={200000}
              value={batchCount}
              onChange={setBatchCount}
              className="w-36"
            />
            <Button
              label={loading ? "Generating…" : "Generate vouchers"}
              onClick={onGenerate}
              disabled={loading}
            />
            <Link
              href={`/api/campaigns/${campaign.id}/vouchers/export`}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-500/50"
            >
              <Download />
              Download CSV
            </Link>
            <Button
              label="Delete campaign"
              variant="danger"
              onClick={onDeleteCampaign}
              disabled={loading}
            />
          </div>

          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Latest {vouchers.length.toLocaleString()} of{" "}
              <span className="font-medium text-slate-700 dark:text-slate-200">
                {voucherTotal.toLocaleString()}
              </span>{" "}
              vouchers
            </p>
          </div>

          {vouchers.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500 dark:border-slate-700">
              No vouchers yet... generate a batch above.
            </div>
          ) : (
            <ul className="max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/30">
              {vouchers.map((v, i) => (
                <li
                  key={v.id}
                  className={`px-4 py-2.5 font-mono text-sm text-slate-700 dark:text-slate-300 ${
                    i !== vouchers.length - 1
                      ? "border-b border-slate-200/80 dark:border-slate-800"
                      : ""
                  }`}
                >
                  <span className="text-indigo-600 dark:text-indigo-400">
                    {campaign.prefix}
                  </span>
                  <span className="text-slate-400">-</span>
                  {v.code.split("-").slice(1).join("-")}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

