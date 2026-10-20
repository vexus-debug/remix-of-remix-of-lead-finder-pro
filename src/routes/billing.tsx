import { createFileRoute } from "@tanstack/react-router";
import { Empty, Page, PageHeader } from "@/components/kit";

export const Route = createFileRoute("/billing")({
  head: () => ({
    meta: [
      { title: "Billing & credits — Outbound" },
      { name: "description", content: "Credit wallet, top-up packs, usage history and invoices." },
      { property: "og:title", content: "Billing & credits — Outbound" },
      { property: "og:description", content: "Credit wallet, top-up packs, usage history and invoices." },
    ],
  }),
  component: () => (
    <Page>
      <PageHeader title="Billing & credits" description="Credit wallet, top-up packs, usage history and invoices." />
      <Empty title="This screen is being built" description="The full layout for this area is coming in the next step." />
    </Page>
  ),
});
