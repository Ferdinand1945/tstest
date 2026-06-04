import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import VouchersModal from "./VouchersModal";
import type { Campaign, Voucher } from "@/lib/types";

vi.mock("@deemlol/next-icons", () => ({
  Download: () => <span data-testid="download-icon" />,
}));

const campaign: Campaign = {
  id: 1,
  prefix: "DISCOUNT",
  amount: "10",
  currency: "EUR",
  valid_from: "2026-01-01",
  valid_to: "2027-01-01",
  created_at: "2026-01-01T00:00:00.000Z",
  voucher_count: 2,
};

const vouchers: Voucher[] = [
  {
    id: 1,
    campaign_id: 1,
    code: "DISCOUNT-ABC123",
    created_at: "2026-01-02T00:00:00.000Z",
  },
];

describe("VouchersModal", () => {
  it("renders nothing when closed", () => {
    const { container } = render(
      <VouchersModal
        open={false}
        onClose={vi.fn()}
        campaign={campaign}
        vouchers={[]}
        voucherTotal={0}
        batchCount="100"
        setBatchCount={vi.fn()}
        loading={false}
        onGenerate={vi.fn()}
        onDeleteCampaign={vi.fn()}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("shows campaign and vouchers when open", () => {
    render(
      <VouchersModal
        open
        onClose={vi.fn()}
        campaign={campaign}
        vouchers={vouchers}
        voucherTotal={2}
        batchCount="100"
        setBatchCount={vi.fn()}
        loading={false}
        onGenerate={vi.fn()}
        onDeleteCampaign={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { name: /DISCOUNT/i })).toBeInTheDocument();
    expect(screen.getByText("ABC123")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /download csv/i })).toHaveAttribute(
      "href",
      "/api/campaigns/1/vouchers/export",
    );
  });

  it("calls onClose when close button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <VouchersModal
        open
        onClose={onClose}
        campaign={campaign}
        vouchers={[]}
        voucherTotal={0}
        batchCount="100"
        setBatchCount={vi.fn()}
        loading={false}
        onGenerate={vi.fn()}
        onDeleteCampaign={vi.fn()}
      />,
    );

    const closeButtons = screen.getAllByRole("button", {
      name: /close modal/i,
    });
    await user.click(closeButtons[closeButtons.length - 1]!);
    expect(onClose).toHaveBeenCalled();
  });
});
