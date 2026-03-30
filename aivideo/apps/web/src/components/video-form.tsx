"use client";

import { startTransition, useDeferredValue, useState } from "react";
import { SUPPORTED_LANGUAGES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/toast";

const EXAMPLES = [
  "동네 미용실 고객 재방문 높이는 3가지 방법",
  "카페 신규 메뉴를 15초 영상으로 소개하는 방법",
  "헬스장 PT 상담 전환율 높이는 첫 멘트"
];

export function VideoForm() {
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState("ko");
  const [loading, setLoading] = useState(false);
  const deferredTopic = useDeferredValue(topic);
  const { push } = useToast();
  const count = deferredTopic.length;

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim()) {
      push("주제를 먼저 입력해주세요.");
      return;
    }

    setLoading(true);
    const response = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, language })
    });
    setLoading(false);
    if (!response.ok) {
      const errorPayload = (await response.json().catch(() => null)) as { error?: string } | null;
      push(errorPayload?.error ?? "작업 생성에 실패했습니다.");
      return;
    }
    const payload = (await response.json()) as { job_id: string };
    push(`작업이 생성되었습니다: ${payload.job_id}`);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>영상 생성</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={submitForm}>
          <section>
            <label htmlFor="topic" className="mb-2 block text-sm font-medium">
              주제
            </label>
            <Textarea
              id="topic"
              maxLength={140}
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="예: 피부과 리프팅 상담 전환율 높이는 방법"
            />
            <p className="mt-1 text-xs text-[var(--muted)]">{count}/140</p>
          </section>

          <section>
            <label htmlFor="language" className="mb-2 block text-sm font-medium">
              언어
            </label>
            <Select id="language" value={language} onChange={(event) => setLanguage(event.target.value)}>
              {SUPPORTED_LANGUAGES.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.label}
                </option>
              ))}
            </Select>
          </section>

          <section aria-label="주제 예시">
            <p className="mb-2 text-sm font-medium">주제 예시</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((example) => (
                <button
                  key={example}
                  type="button"
                  className="rounded-full border border-[var(--border)] bg-white px-3 py-1 text-xs hover:bg-[var(--surface-alt)]"
                  onClick={() => startTransition(() => setTopic(example))}
                >
                  {example}
                </button>
              ))}
            </div>
          </section>

          <Button type="submit" disabled={loading}>
            {loading ? "생성 요청 중..." : "생성 시작"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

