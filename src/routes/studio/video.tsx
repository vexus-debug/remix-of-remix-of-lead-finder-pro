import { createFileRoute } from "@tanstack/react-router";
import { Empty, Page, PageHeader } from "@/components/kit";

export const Route = createFileRoute("/studio/video")({
  head: () => ({
    meta: [
      { title: "Video — Outbound" },
      { name: "description", content: "AI video, UGC ads, voiceover and subtitles." },
      { property: "og:title", content: "Video — Outbound" },
      { property: "og:description", content: "AI video, UGC ads, voiceover and subtitles." },
    ],
  }),
  component: () => (
    <Page>
      <PageHeader title="Video" description="AI video, UGC ads, voiceover and subtitles." />
      <Empty title="This screen is being built" description="The full layout for this area is coming in the next step." />
    </Page>
  ),
});
