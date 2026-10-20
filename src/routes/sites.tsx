import { createFileRoute } from "@tanstack/react-router";
import { Empty, Page, PageHeader } from "@/components/kit";

export const Route = createFileRoute("/sites")({
  head: () => ({
    meta: [
      { title: "Sites — Outbound" },
      { name: "description", content: "Landing pages and websites for your business." },
      { property: "og:title", content: "Sites — Outbound" },
      { property: "og:description", content: "Landing pages and websites for your business." },
    ],
  }),
  component: () => (
    <Page>
      <PageHeader title="Sites" description="Landing pages and websites for your business." />
      <Empty title="This screen is being built" description="The full layout for this area is coming in the next step." />
    </Page>
  ),
});
