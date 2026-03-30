import { JobStatus } from "@/components/job-status";
import { VideoPlayer } from "@/components/video-player";

export default async function VideoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold">영상 상세</h2>
      <JobStatus jobId={id} initialStatus="complete" />
      <VideoPlayer src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" />
    </section>
  );
}

