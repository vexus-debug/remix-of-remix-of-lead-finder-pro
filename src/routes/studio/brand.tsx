import { createFileRoute } from "@tanstack/react-router";
import { Empty, Page, PageHeader } from "@/components/kit";

export const Route = createFileRoute("/studio/brand")({
  head: () => ({
    meta: [
      { title: "Brand kit — Outbound" },
      { name: "description", content: "Logo, colors, fonts and tone applied to every output." },
      { property: "og:title", content: "Brand kit — Outbound" },
      { property: "og:description", content: "Logo, colors, fonts and tone applied to every output." },
    ],
  }),
  component: () => (
    <Page>
      <PageHeader title="Brand kit" description="Logo, colors, fonts and tone applied to every output." />
      <Empty title="This screen is being built" description="The full layout for this area is coming in the next step." />
    </Page>
  ),
});
