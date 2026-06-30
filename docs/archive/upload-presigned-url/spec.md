# Spec: S3 Presigned PUT + CloudFront CDN 기반 이미지 업로드 인프라

## 1. 메타

- 작성일: 2026-05-28
- 상태: 확정 (BP 재검증 완료 2026-05-28)
- 입력 PRD: 없음 (UI 변경 없는 백엔드 인프라 작업. PRD/design 단계 skip)
- 관련 백로그: 없음

## 2. 배경 / 결정 사항

### BP 확정 (2차 조사 완료)

- S3 private bucket + CloudFront OAC + presigned PUT 업로드 + CloudFront 공개 URL 다운로드
- EC2 Instance Profile 자동 인증 (Access Key 불필요)
- 표준 패턴 (당근·DoorDash·Imgur·Instagram 모두 동일 구조)

### 인프라 현황 (콘솔 확인)

| 리소스                          | 상태                                                            |
| ------------------------------- | --------------------------------------------------------------- |
| EC2 `keeper-server`             | ✅ 실행 중 (3.37.219.188) + IAM Role `keeper-api-ec2-role` 부착 |
| S3 bucket `keeper-045498639766` | ✅ private + CORS localhost 만 (갱신 필요)                      |
| CloudFront distribution         | ❌ 미생성 (백엔드 개발자 또는 사용자 작업)                      |
| RDS `keeper`                    | ✅ 무관                                                         |

## 3. Data Model (변경 없음)

DB 스키마 변경 없음. 기존 `post.images: JSON` 컬럼이 `string[]` URL 배열로 동작 — CloudFront public URL 을 그대로 저장.

→ **마이그레이션 X**.

## 4. Backend Impact — keeper-api 신규 모듈

### 4-1. 신규 디렉터리

```
keeper-api/src/api/upload/
├── upload.module.ts          # providers 만 (TypeORM 불필요)
├── controller/
│   └── upload.controller.ts  # POST /api/uploads/presign
└── service/
    └── upload.service.ts     # S3Client + getSignedUrl
└── type/
    └── upload.ts             # PresignedUrlsRequest / PresignedUrlsResponse / PresignedItem DTO
```

community 모듈 (`src/api/community/`) 패턴 그대로.

### 4-2. 환경변수 신설

`config/env/config-local.yml` + live yml 에 `aws` 섹션 추가:

```yaml
aws:
  s3:
    region: ap-northeast-2
    bucket: keeper-045498639766
  cloudfront:
    domain: <CloudFront 생성 후 도메인 — 예: d1234abc.cloudfront.net>
  presign:
    expiresIn: 600        # 10분 (5~10분 권장 범위)
    maxFileSize: 10485760 # 10 MB
    allowedContentTypes:
      - image/jpeg
      - image/png
      - image/webp
```

`ConfigService` 로 주입.

### 4-3. `app.module.ts` 변경

`UploadModule` import 추가.

### 4-4. IAM Role 권한 요구사항

`keeper-api-ec2-role` Role 에 다음 권한 필요 (이미 포함 추정 — 미확인 시 백엔드 개발자 확인):

```json
{
  "Effect": "Allow",
  "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
  "Resource": "arn:aws:s3:::keeper-045498639766/*"
}
```

→ presigned PUT URL 발급에 `s3:PutObject` 필수. `GetObject` / `DeleteObject` 는 후속 (글 수정·삭제) 대비.

### 4-5. S3 bucket policy 추가 필요 (CloudFront 생성 시)

CloudFront OAC 통한 GetObject 만 허용:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Service": "cloudfront.amazonaws.com" },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::keeper-045498639766/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::045498639766:distribution/<DISTRIBUTION_ID>"
        }
      }
    }
  ]
}
```

### 4-6. S3 CORS 갱신 (운영용)

현재 AllowedOrigins = `http://localhost:3000`, `http://localhost:8080`. React Native 앱이 PUT 시 origin header 없거나 `null` — 추가 필요:

```json
{
  "AllowedOrigins": ["*"],
  "AllowedMethods": ["PUT", "POST", "GET", "HEAD"],
  "AllowedHeaders": ["*"],
  "ExposeHeaders": ["ETag"],
  "MaxAgeSeconds": 3000
}
```

→ presigned URL 자체에 서명이 박혀있어 origin `*` 도 보안상 안전 (presigned URL 모르면 PUT 못 함).

## 5. API Contract

### 5-1. `POST /api/uploads/presign`

**Request Body**:

```ts
{
  count: number; // 1 ~ 10
  // P1 확장: contentType, fileSize per item (이번 사이클은 기본값으로 모두 image/jpeg 가정)
}
```

**Response**:

```ts
{
  data: {
    items: Array<{
      uploadUrl: string; // S3 presigned PUT URL (10분 만료)
      publicUrl: string; // CloudFront URL (영구)
    }>;
  }
}
```

### 5-2. 백엔드 service 로직

```
service.getPresignedUrls(userId, count):
  for i in 1..count:
    key = `users/${userId}/${uuidv4()}.jpg`   // 이번 사이클 jpg 고정
    uploadUrl = getSignedUrl(
      s3,
      new PutObjectCommand({
        Bucket: aws.s3.bucket,
        Key: key,
        ContentType: 'image/jpeg',
        CacheControl: 'max-age=31536000, immutable'
      }),
      {
        signableHeaders: new Set(['content-type']),  // 공식 BP — Content-Type 미스매치 시 403
        expiresIn: 600
      }
    )
    publicUrl = `https://${aws.cloudfront.domain}/${key}`
    items.push({ uploadUrl, publicUrl })
  return { items }
```

> `signableHeaders: new Set(['content-type'])` 박지 않으면 클라이언트가 `Content-Type: image/png` 로 PUT 보내도 S3 가 통과. 공식 SDK README 의 enforcement BP.

### 5-3. 인증

`@UseGuards(JwtAuthGuard)` + `@CurrentUser()` 로 `userId` 획득. 비로그인 사용자 거부.

## 6. 객체 키 (S3 Key) 컨벤션

```
users/{userId}/{uuidv4}.{ext}
```

| 영역       | 값                                                      |
| ---------- | ------------------------------------------------------- |
| `users/`   | 사용자별 prefix (탈퇴 시 일괄 삭제 용이)                |
| `{userId}` | JWT 의 user.id                                          |
| `{uuidv4}` | 충돌 없는 random + 예측 불가                            |
| `{ext}`    | 이번 사이클은 `.jpg` 고정. P1 에 content-type 기반 동적 |

원본 파일명 포함 금지 (경로 탈출 위험).

### P1 — 글 작성 후 정리 옵션

현재 패턴: 사용자가 글 작성하다 취소해도 S3 에 이미지는 남음.
P1 검토: 글 등록 시 사용된 이미지만 `posts/{postId}/` 로 이동 (또는 cron 으로 24h 미사용 객체 정리).

## 7. 보안 정책

| 항목           | 값                                                                                                                   |
| -------------- | -------------------------------------------------------------------------------------------------------------------- |
| 만료 시간      | **600초 (10분)** — Instance Profile 자격증명 갱신 주기 고려                                                          |
| Content-Type   | **`image/jpeg` 고정** (이번 사이클). P1 에 화이트리스트 (jpeg/png/webp)                                              |
| 파일 크기 상한 | 서버 검증 — 이번 사이클 P1 (presigned PUT 자체엔 강제 못 함. 후속 Lambda 트리거 또는 발급 시 fileSize 파라미터 검증) |
| 키 예측 불가   | UUID v4 사용 — 다른 사용자 객체 추측 불가                                                                            |
| Cache-Control  | `max-age=31536000, immutable` (1년) — UUID 키라 영구 캐시 OK                                                         |

## 8. 프론트 영향 (keeper-app)

### 8-1. 영향 받는 파일

| 파일                                            | 변경                                                                                 |
| ----------------------------------------------- | ------------------------------------------------------------------------------------ |
| `src/features/upload/model/use-image-upload.ts` | **HEIC 변환 분기 추가** — uri ext 정규식으로 판단, jpeg 아니면 ImageManipulator 변환 |
| `src/shared/lib/dev/mock-upload.ts`             | **전체 제거** (파일 + 빈 디렉터리 삭제 완료)                                         |
| `src/shared/ui/form/image-selector.tsx`         | `IS_MOCK_UPLOAD` / `MOCK_DOG_IMAGES` 분기·import 제거                                |
| `src/entities/upload/schema.ts`                 | 변경 없음                                                                            |
| `src/entities/upload/api.ts`                    | 변경 없음                                                                            |

→ **프론트 변경 최소** — mock 제거 + HEIC 변환 헬퍼 1개.

### 8-1-1. HEIC 변환 패턴 (Expo SDK 54 + expo-image-manipulator 14)

```ts
import * as ImageManipulator from 'expo-image-manipulator';

const ensureJpeg = async (uri: string): Promise<string> => {
  if (/\.jpe?g($|\?)/i.test(uri)) return uri; // .jpg / .jpeg → 변환 스킵
  const result = await ImageManipulator.manipulateAsync(uri, [], {
    format: ImageManipulator.SaveFormat.JPEG,
    compress: 0.85
  });
  return result.uri;
};
```

- iOS SDK 54+ 의 expo-image-picker 가 원본 HEIC 반환 가능 (URI 가 `file:///....HEIC` 형태).
- ext 가 jpeg 인 경우 변환 비용 0 (대부분 케이스 — Android picker + iOS allowsEditing=false jpeg).
- mimeType 파라미터 안 받음 → ImageSelector signature 변경 X.
- 백엔드 schema 확장 없이 jpeg 강제 유지.

### 8-2. 동작 흐름 (변경 후)

```
ImageSelector → 이미지 선택 (string[] uri — 시그니처 유지)
  ↓
useImageUpload.mutate(uris)
  ↓
  POST /api/uploads/presign { count: N } (authApi)
  ↓
  Promise.all(items.map(async (item, i) => {
    const jpegUri = await ensureJpeg(uris[i])  // ext 가 jpeg 아니면 ImageManipulator 변환
    const blob = await fetch(jpegUri).then(r => r.blob())
    await fetch(item.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'image/jpeg' },
      body: blob
    })
  }))
  ↓
  return items.map(i => i.publicUrl)  // CloudFront URL[]
  ↓
form.images = [CloudFront URL[]]
  ↓
POST /api/community/posts/adoption-personal (or qna) — images 포함
```

## 9. 스키마 3중 검증

### 9-1. `PresignedUrlsBody` (Request)

| 필드    | frontend zod                      | backend DTO                 | DB column           | 일치 |
| ------- | --------------------------------- | --------------------------- | ------------------- | ---- |
| `count` | `z.number().int().min(1).max(10)` | `@IsInt() @Min(1) @Max(10)` | - (query 아닌 body) | ✅   |

### 9-2. `PresignedItem` (Response item)

| 필드        | frontend zod | backend DTO             | DB column | 일치 |
| ----------- | ------------ | ----------------------- | --------- | ---- |
| `uploadUrl` | `z.string()` | `@ApiProperty() string` | -         | ✅   |
| `publicUrl` | `z.string()` | `@ApiProperty() string` | -         | ✅   |

### 9-3. `PresignedUrlsData` (Response wrapping)

| 필드    | frontend zod                   | backend DTO                                                      | DB column | 일치 |
| ------- | ------------------------------ | ---------------------------------------------------------------- | --------- | ---- |
| `items` | `z.array(PresignedItemSchema)` | `@ApiProperty({ type: [PresignedItem] }) items: PresignedItem[]` | -         | ✅   |

→ 전부 일치. 추가 작업 없음.

### 9-4. 응답 envelope (ResponseBase)

keeper-api 의 `ResponseUtil.ok(data)` 가 `{ data: ... }` 로 감싸는지 확인. 프론트 `getPresignedUrls` 가 `res.data.data.items` 로 접근 → backend 응답이 `{ data: { items: [...] } }` 형태여야 함.

## 10. 테스트 시나리오 (P0)

### T-1. presigned URL 발급 — 인증 성공

- Given JWT 토큰 보유한 사용자.
- When `POST /api/uploads/presign { count: 3 }`.
- Then 200. `items.length=3`. 각 `uploadUrl` 은 `https://keeper-045498639766.s3.ap-northeast-2.amazonaws.com/users/{userId}/<UUID>.jpg?X-Amz-Algorithm=...` 형태. 각 `publicUrl` 은 `https://<cloudfront-domain>/users/{userId}/<UUID>.jpg` 형태.

### T-2. 비로그인 거부

- Given 토큰 없음.
- When `POST /api/uploads/presign`.
- Then 401.

### T-3. count 범위 검증

- Given 인증 OK.
- When `POST { count: 0 }` 또는 `{ count: 11 }`.
- Then 400 (validation 에러).

### T-4. presigned PUT 실제 업로드 (수동)

- Given 발급받은 `uploadUrl`.
- When 클라이언트가 `PUT { headers: { 'Content-Type': 'image/jpeg' }, body: <jpg blob> }` 호출.
- Then 200. S3 에 객체 저장됨. `publicUrl` 로 GET 시 이미지 다운로드 가능 (CloudFront 캐시).

### T-5. 만료 후 거부 (수동)

- Given 발급 후 10분+ 경과.
- When `uploadUrl` 로 PUT.
- Then 403 (Signature expired).

### T-6. 다른 사용자 키 추측 불가

- Given user A 의 발급 URL key = `users/123/abc-uuid.jpg`.
- When user B 가 임의로 `users/123/def-uuid.jpg` 추측해서 PUT 시도.
- Then 403 (서명 없음).

### 엣지 케이스

- **EC2 Instance Profile 자격증명 갱신 직전 발급** — `expiresIn: 600` 박았어도 실제 자격증명 5분 후 만료면 URL 도 5분에 만료. 보수적 만료 시간 권장 사유.
- **CloudFront 도메인 미설정** — 환경변수 비어있을 때 service 가 빈 publicUrl 반환 위험. `ConfigService` validation 으로 시작 시 검증.
- **bucket CORS localhost 만** — 운영 PUT 시 403 가능. CORS `AllowedOrigins: ["*"]` 갱신 필수.
- **count 0** — `min(1)` 검증으로 400.
- **이미지 외 파일** — `image/jpeg` Content-Type 강제 — 클라이언트가 PNG 보내면 403.

## 11. ADR + Open Issues

### 결정 기록

| 결정                      | 옵션                                                       | 채택                                             | 사유                                                                                                            |
| ------------------------- | ---------------------------------------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| 인증 방식                 | Access Key 환경변수 / EC2 Instance Profile                 | **Instance Profile**                             | AWS BP. Key hardcoding 위험 회피. keeper-api 가 EC2 호스팅이라 자연스러움                                       |
| 만료 시간                 | 5분 / 10분 / 15분 (SDK 기본) / 1시간                       | **10분 (600초)**                                 | SDK 기본 900초보다 보수적. Instance Profile 자격증명 갱신 주기 + 10장 동시 PUT longest tail 고려                |
| 객체 키 prefix            | `users/<id>/` / `posts/<id>/` / 무계층                     | **`users/<userId>/<uuid>.jpg`**                  | 글 등록 전 업로드라 postId 미정. 사용자별 prefix 가 탈퇴 시 일괄 삭제 용이                                      |
| Content-Type              | jpeg 고정 / 화이트리스트 / 자유                            | **jpeg 고정 (이번 사이클)**                      | 프론트 schema 가 contentType 미전달. P1 에 동적 처리 + 화이트리스트                                             |
| Content-Type enforcement  | `PutObjectCommand.ContentType` 만 / `signableHeaders` 추가 | **`signableHeaders: new Set(['content-type'])`** | AWS 공식 SDK README BP. 박지 않으면 클라가 다른 Content-Type 으로 PUT 해도 통과                                 |
| iOS HEIC 처리             | 백엔드 동적 ext / 프론트 변환 / allowsEditing 강제         | **프론트 ImageManipulator 변환**                 | keeper-app 이미 expo-image-manipulator 14 설치. 백엔드 schema 확장 X. UX 변경 없음 (allowsEditing crop UI 회피) |
| 파일 크기 제한            | presigned PUT 자체 / 서버 검증 / Lambda                    | **P1 보류**                                      | presigned PUT 자체 미지원. 이번 사이클은 검증 없음. P1 에 발급 시 fileSize 파라미터 추가                        |
| CloudFront cache          | TTL 짧게 / 영구 (immutable)                                | **immutable (1년)**                              | UUID 키라 내용 안 바뀜. 영구 캐시 안전 + CDN 비용 ↓                                                             |
| CloudFront signed URL     | 도입 / 미도입                                              | **미도입**                                       | 이미지가 "준-공개" (로그인 사용자가 보는 글). 공개 CDN URL 충분. P1 에 검토                                     |
| 객체 삭제 시 invalidation | 호출 / 무시                                                | **무시**                                         | 새 UUID 발급 BP. 옛 URL 은 자연 미사용                                                                          |
| 응답 envelope             | bare items / ResponseBase                                  | **ResponseBase**                                 | keeper-api 표준 (`ResponseUtil.ok({ items })`)                                                                  |

### 컷한 옵션

- **Access Key 환경변수** — Instance Profile 로 대체. local 개발용은 향후 결정
- **presigned POST + content-length-range** — content-length-range 는 presigned POST 만 지원 (PUT 미지원, AWS 공식). keeper 의 단일 PUT 패턴 + RN form-data 처리 복잡으로 P1 보류
- **백엔드 schema 확장 (`contentType` per item)** — keeper-app 이미 ImageManipulator 로 jpeg 변환 가능. 프론트·백엔드 둘 다 schema 확장 부담 ↑ 대비 화질 이득 미미. P1 에 HEIC 원본 보존 가치 생길 때 검토
- **`allowsEditing: true` 강제 (iOS 자동 jpg 변환)** — crop UI 가 사용자에게 강제됨. UX 변경 큼 → ImageManipulator 가 BP
- **Lambda@Edge 이미지 변환** — 초기 트래픽 오버엔지니어링. 당근 50만 장 규모에서 도입
- **CloudFront signed URL** — 공개 CDN 으로 충분. 비공개 콘텐츠 도입 시 P1

### Open Issues

| Issue                                                                                              | 처리                                                                                                               |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **CloudFront distribution 생성** — 누가?                                                           | 백엔드 개발자에게 한 줄 요청. 또는 사용자가 콘솔에서 생성 (CloudFront 권한 있음). 생성 시 OAC + bucket policy 같이 |
| **CloudFront 도메인 결정** — 자동 (`d1234abc.cloudfront.net`) vs custom (예: `cdn.our-keeper.com`) | 일단 자동. custom 은 P1                                                                                            |
| **IAM Role `keeper-api-ec2-role` 의 S3 권한 포함 여부**                                            | 확인 안 됨. 코드 실행 후 `AccessDenied` 에러 나면 백엔드 개발자에게 요청                                           |
| **S3 CORS `AllowedOrigins`** — `*` vs 특정 도메인                                                  | presigned URL 서명 있어 `*` 안전. 일단 `*`                                                                         |
| **local 개발용 Access Key 필요?**                                                                  | 일단 미발급. local 에서 SDK 호출 영역 안 짜고, 백엔드 deploy 후 검증                                               |

## 12. 참고

- BP 조사 결과: feature-researcher 2차 + WebSearch·context7 공식 docs 검증 (2026-05-28)
- 출처:
  - [aws/aws-sdk-js-v3 s3-request-presigner README](https://github.com/aws/aws-sdk-js-v3/blob/main/packages/s3-request-presigner/README.md) — `signableHeaders` enforcement BP, expiresIn 기본 900초
  - [Expo SDK 54 ImagePicker docs](https://github.com/expo/expo/blob/sdk-54/docs/pages/versions/unversioned/sdk/imagepicker.mdx) — iOS HEIC 원본 반환 동작 + `assets[].mimeType`
  - [Expo ImageManipulator](https://docs.expo.dev/versions/latest/sdk/imagemanipulator/) — `manipulateAsync({ format: SaveFormat.JPEG })` 변환 패턴
  - AWS Docs (presigned URL), CloudFront OAC, S3 CORS 정책
- 영향 슬라이스:
  - keeper-api: `src/api/upload/*` (신규), `src/app.module.ts`, `config/env/*`
  - keeper-app: `src/shared/lib/dev/mock-upload.ts` (제거), `src/shared/ui/form/image-selector.tsx`, `src/features/upload/model/use-image-upload.ts` (IS_MOCK_UPLOAD 참조 제거)
- 관련 코드 컨벤션: `keeper-api/src/api/community/` 패턴 (controller / service / type 분리)
