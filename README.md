# google-search-console-playground

`Google Search Console API`를 사용하여 여러 웹사이트의 검색 성능 데이터를 자동으로 수집하고, 주간 리포트를 Slack 채널로 전송하는 자동화 도구입니다.

관련 작성글: [Search Console 지표 자동화 - 개발자의 의존성 줄이기](https://jgjgill-blog.netlify.app/post/search-console-automation/)

## 주요 기능

- 🔍 Google Search Console API를 통한 웹사이트 검색 성능 데이터 수집
- 📊 지난주 대비 주요 지표(클릭, 노출, CTR, 검색순위) 변화 분석
- 📈 주간 리포트 자동 생성 및 Slack 채널 전송
- 🔄 GitHub Actions를 통한 주간 자동 실행

## 프로젝트 구조

```
google-search-console-playground/
├── .github/
│   └── workflows/
│       └── search-console-report.yml  # GitHub Actions 워크플로우 설정
├── src/
│   ├── test.ts                        # Google Search Console API 요청 및 데이터 처리 로직
│   └── webhook-test.ts                # Slack API를 통한 메시지 전송 로직
├── .env                               # 환경 변수 설정 (로컬 개발용)
├── package.json                       # 프로젝트 의존성 관리
├── README.md                          # 프로젝트 설명 (현재 파일)
└── tsconfig.json                      # TypeScript 설정
```

## 설치 방법

1. 저장소 클론

   ```bash
   git clone https://github.com/yourusername/google-search-console-playground.git
   cd google-search-console-playground
   ```

2. 의존성 설치 (pnpm 사용)

   ```bash
   pnpm install
   ```

3. 환경 변수 설정

   ```bash
   cp .env.example .env
   ```

   `.env` 파일을 열고 다음 정보를 입력합니다:

   ```
   SLACK_USER_OAUTH_TOKEN=xoxp-your-slack-token
   GOOGLE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

## 설정 방법

### Google Search Console API 설정

1. [Google Cloud Console](https://console.cloud.google.com/)에서 프로젝트 생성
2. Search Console API 활성화
3. 서비스 계정 생성 및 키(JSON) 다운로드
4. Search Console에서 서비스 계정 이메일을 속성 사용자로 추가

### Slack API 설정

1. [Slack API](https://api.slack.com/apps)에서 앱 생성
2. 필요한 OAuth 권한 스코프 추가:
   - `chat:write`
   - `chat:write.public`
3. 앱을 워크스페이스에 설치하고 OAuth 토큰 복사

### 모니터링할 사이트 설정

`src/test.ts` 파일의 `schema` 배열에서 모니터링할 사이트 정보를 설정합니다:

```typescript
export const schema = [
  {
    serviecName: "블로그 이름",
    clientEmail: process.env.GOOGLE_CLIENT_EMAIL!,
    privateKey: process.env.GOOGLE_PRIVATE_KEY!,
    projects: [
      {
        siteUrl: "https://your-site-url.com",
        searchConsoleUrl:
          "https://search.google.com/search-console?resource_id=...",
        projectName: "프로젝트 이름",
      },
      // 추가 프로젝트...
    ],
  },
  // 추가 서비스...
];
```

### Slack 채널 ID 설정

`src/webhook-test.ts` 파일에서 리포트를 전송할 Slack 채널 ID를 설정합니다:

```typescript
const SEO_ISSUE_CHANNEL_ID = "C073VSQQNF8"; // 원하는 채널 ID로 변경
```

## 사용 방법

### 로컬에서 실행

```bash
pnpm start
```

### GitHub Actions 자동화

이 프로젝트는 GitHub Actions를 통해 매주 목요일 한국 시간 오전 8시에 자동으로 실행되도록 설정되어 있습니다. 설정은 `.github/workflows/search-console-report.yml` 파일에서 확인할 수 있습니다.

GitHub 저장소에 다음 Secrets를 추가해야 합니다:

- `SLACK_USER_OAUTH_TOKEN`
- `GOOGLE_CLIENT_EMAIL`
- `GOOGLE_PRIVATE_KEY`

## 주간 리포트 데이터 설명

리포트에는 다음 데이터가 포함됩니다:

- **측정 기간**: 이번 주(3일 전부터 9일 전까지)와 지난 주(10일 전부터 16일 전까지) 비교
- **총 클릭수**: 사용자가 검색 결과에서 웹사이트 링크를 클릭한 횟수
- **총 노출수**: 검색 결과에 웹사이트가 표시된 횟수
- **평균 CTR**: 클릭률(클릭수/노출수)
- **평균 검색순위**: 검색 결과에서의 평균 순위
- **변화량**: 각 지표별 전주 대비 증감률(%)
