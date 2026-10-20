import { createFileRoute } from "@tanstack/react-router";
import { Empty, Page, PageHeader } from "@/components/kit";

export const Route = createFileRoute("/studio/library")({
  head: () => ({
    meta: [
      { title: "Library — Outbound" },
      { name: "description", content: "Saved outputs, versions and approvals." },
      { property: "og:title", content: "Library — Outbound" },
      { property: "og:description", content: "Saved outputs, versions and approvals." },
    ],
  }),
  component: () => (
    <Page>
      <PageHeader title="Library" description="Saved outputs, versions and approvals." />
      <Empty title="This screen is being built" description="The full layout for this area is coming in the next step." />
    </Page>
  ),
});
