import Link from "next/link";

const ITEMS = [
  { id: "job-sample-1", topic: "카페 봄 시즌 메뉴 홍보", status: "processing" },
  { id: "job-sample-2", topic: "피트니스 센터 신규 회원 모집", status: "complete" }
];

export default function VideosPage() {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-bold">전체 영상</h2>
      <ul className="space-y-3">
        {ITEMS.map((item) => (
          <li key={item.id} className="card p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold">{item.topic}</h3>
                <p className="text-sm text-[var(--muted)]">{item.status}</p>
              </div>
              <Link href={`/dashboard/videos/${item.id}`} className="text-sm font-medium text-[var(--accent)] underline">
                상세
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

