import { createFileRoute } from "@tanstack/react-router";
import { Empty, Page, PageHeader } from "@/components/kit";

export const Route = createFileRoute("/studio/social")({
  head: () => ({
    meta: [
      { title: "Social — Outbound" },
      { name: "description", content: "Captions, carousels and a content calendar." },
      { property: "og:title", content: "Social — Outbound" },
      { property: "og:description", content: "Captions, carousels and a content calendar." },
    ],
  }),
  component: () => (
    <Page>
      <PageHeader title="Social" description="Captions, carousels and a content calendar." />
      <Empty title="This screen is being built" description="The full layout for this area is coming in the next step." />
    </Page>
  ),
});
