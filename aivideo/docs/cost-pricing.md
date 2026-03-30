# Cost And Pricing (Step 8)

## Per-Video Cost Assumption

- Model baseline: `google/veo-3.1-fast` + DALL-E 3 + gpt-4o-mini + Edge-TTS
- Exchange rate assumption: 1 USD = 1,300 KRW

| Item | Unit Cost (USD) | Notes |
| --- | ---: | --- |
| GPT-4o-mini script | 0.005 | 1 short script generation |
| DALL-E 3 images (x6) | 0.24 | 6 scenes |
| Veo 3.1 Fast animation (x6) | 1.20 | 6 short clips |
| Edge-TTS | 0 | free tier assumption |
| **Total** | **1.445** | about **1,880 KRW/video** |

## Pricing Decision

To avoid negative margin at scale, pricing is set above 1,900 KRW per generated video.

| Plan | Credits | Price (KRW) | KRW / Video |
| --- | ---: | ---: | ---: |
| Starter | 10 | 24,900 | 2,490 |
| Pro | 30 | 69,900 | 2,330 |
| Scale | 80 | 179,000 | 2,238 |

## Notes

- Gross margin still depends on retry rates, failed generation ratio, and payment fees.
- If quality is moved from `google/veo-3.1-fast` to `google/veo-3.1`, recompute pricing before release.
