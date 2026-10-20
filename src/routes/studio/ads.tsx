import { createFileRoute } from "@tanstack/react-router";
import { Empty, Page, PageHeader } from "@/components/kit";

export const Route = createFileRoute("/studio/ads")({
  head: () => ({
    meta: [
      { title: "Ads — Outbound" },
      { name: "description", content: "AI ad copy, images and A/B variations." },
      { property: "og:title", content: "Ads — Outbound" },
      { property: "og:description", content: "AI ad copy, images and A/B variations." },
    ],
  }),
  component: () => (
    <Page>
      <PageHeader title="Ads" description="AI ad copy, images and A/B variations." />
      <Empty title="This screen is being built" description="The full layout for this area is coming in the next step." />
    </Page>
  ),
});
