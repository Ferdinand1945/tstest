import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CampaignsSection, { type CampaignFormState } from "./CampaignsSection";
import type { Campaign } from "@/lib/types";

const defaultForm: CampaignFormState = {
  prefix: "DISCOUNT",
  amount: "10",
  currency: "EUR",
  valid_from: "2026-01-01",
  valid_to: "2027-01-01",
};

const sampleCampaigns: Campaign[] = [
  {
    id: 1,
    prefix: "SUMMER",
    amount: "25.00",
    currency: "EUR",
    valid_from: "2026-06-01",
    valid_to: "2026-08-31",
    created_at: "2026-01-01T00:00:00.000Z",
    voucher_count: 42,
  },
];

function renderSection(
  overrides: Partial<{
    campaigns: Campaign[];
    selectedId: number | null;
    loading: boolean;
    onCampaignSelect: (id: number) => void;
    onCreateCampaign: (e: React.FormEvent) => void;
  }> = {},
) {
  const setForm = vi.fn();
  const onCreateCampaign = overrides.onCreateCampaign ?? vi.fn((e) => e.preventDefault());
  const onCampaignSelect = overrides.onCampaignSelect ?? vi.fn();

  render(
    <CampaignsSection
      campaigns={overrides.campaigns ?? []}
      selectedId={overrides.selectedId ?? null}
      loading={overrides.loading ?? false}
      form={defaultForm}
      setForm={setForm}
      onCreateCampaign={onCreateCampaign}
      onCampaignSelect={onCampaignSelect}
    />,
  );

  return { setForm, onCreateCampaign, onCampaignSelect };
}

describe("CampaignsSection", () => {
  it("shows empty state when there are no campaigns", () => {
    renderSection();
    expect(screen.getByText("No campaigns yet")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create campaign/i })).toBeInTheDocument();
  });

  it("lists campaigns with voucher count", () => {
    renderSection({ campaigns: sampleCampaigns });
    expect(screen.getByText("SUMMER")).toBeInTheDocument();
    expect(screen.getByText(/42 vouchers/)).toBeInTheDocument();
    expect(screen.getByText(/25.00 EUR/)).toBeInTheDocument();
  });

  it("calls onCampaignSelect when a campaign is clicked", async () => {
    const user = userEvent.setup();
    const onCampaignSelect = vi.fn();
    renderSection({ campaigns: sampleCampaigns, onCampaignSelect });

    await user.click(screen.getByRole("button", { name: "Campaign SUMMER" }));
    expect(onCampaignSelect).toHaveBeenCalledWith(1);
  });

  it("submits create campaign form", async () => {
    const user = userEvent.setup();
    const onCreateCampaign = vi.fn((e) => e.preventDefault());
    renderSection({ onCreateCampaign });

    await user.click(
      screen.getAllByRole("button", { name: /create campaign/i })[0]!,
    );
    expect(onCreateCampaign).toHaveBeenCalled();
  });
});
