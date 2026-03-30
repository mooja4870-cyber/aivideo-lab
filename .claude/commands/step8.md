# Step 8: 품질 개선

영상 품질을 높이고 수익화를 준비합니다.

## 진행할 작업

### 1단계: 한국인 실사 스타일 적용

모든 영상에 한국인이 등장하고 실사 사진 스타일이 되도록 수정하세요:

1. GPT 프롬프트 (script.py): 이미지 프롬프트에 "Korean people", "photorealistic DSLR photography", "real everyday life scene" 강제
2. DALL-E 프롬프트 (images.py): "Canon EOS R5, 85mm lens, natural lighting, ultra realistic" 추가
3. 애니메이션 프롬프트 (animate.py): "Realistic daily life, natural human movement, documentary style" 설정
4. 썸네일 프롬프트 (thumbnail.py): "Korean person, photorealistic" 추가

### 2단계: 애니메이션 모델 업그레이드

현재 모델의 품질이 부족하면 더 좋은 모델로 전환하세요:

비교 옵션:
- minimax/video-01-live: 품질 6.5/10, $0.10~0.20 (Live2D용, 실사에 부적합)
- minimax/video-01: 품질 7.5/10, $0.15~0.30
- google/veo-3.1-fast: 품질 9.5/10, $0.25~0.50 (추천)
- google/veo-3.1: 품질 10/10, $0.50~1.00 (최고 품질)

Replicate API에서 모델 스키마 확인:
```bash
curl -s -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
  https://api.replicate.com/v1/models/google/veo-3.1-fast | python -m json.tool
```

### 3단계: 가격 책정

영상당 원가를 계산하고 적절한 판매가를 설정하세요:

현재 원가 (Veo 3.1 Fast 기준):
- GPT-4o-mini: ~$0.005
- DALL-E 3 × 6장: ~$0.24
- Veo 3.1 Fast × 6클립: ~$1.20
- Edge-TTS: $0
- 합계: ~$1.45/영상

가격 예시:
- 스타터: 9,900원/10크레딧 (990원/영상)
- 밸류: 29,900원/30크레딧 (997원/영상)
- 프로: 59,900원/80크레딧 (749원/영상)

주의: 원가 $1.45 (약 1,900원)이면 990원/영상은 적자. 가격 조정 필요.

### 4단계: 추후 개발 로드맵

docs/roadmap.md에 다음 내용을 정리하세요:
- 관리자 대시보드 (비용/수익 추적)
- 자막 추가 (FFmpeg full build)
- 배경음악
- 영상 템플릿
- 16:9 가로 영상 옵션
- YouTube/TikTok 직접 업로드

## ✅ FINAL CHECKPOINT
- [ ] 영상에 한국인이 등장함
- [ ] 이미지가 실사 사진 스타일
- [ ] 애니메이션이 자연스러움
- [ ] 전체 파이프라인: 주제 입력 → 영상 다운로드 완료
- [ ] 비용 구조 파악 완료
- [ ] 축하합니다! AI 영상 SaaS 완성! 🎉
