import { createFileRoute } from "@tanstack/react-router";
import { Empty, Page, PageHeader } from "@/components/kit";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Team — Outbound" },
      { name: "description", content: "Seats, roles, two-factor status and audit log." },
      { property: "og:title", content: "Team — Outbound" },
      { property: "og:description", content: "Seats, roles, two-factor status and audit log." },
    ],
  }),
  component: () => (
    <Page>
      <PageHeader title="Team" description="Seats, roles, two-factor status and audit log." />
      <Empty title="This screen is being built" description="The full layout for this area is coming in the next step." />
    </Page>
  ),
});
