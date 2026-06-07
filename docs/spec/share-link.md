# Spec: 공유 링크

## 1. 목표

- 신규 앱의 공유 URL을 서명 없는 base64 token 방식에서 의미형 URL로 전환한다.
- `keeper-web`은 Railway의 `keeper-backend` v2 공유 API에서 최신 OG 메타데이터를 조회한다.
- 공유 API는 상세 API와 분리해 조회수 증가, 인증, 차단, 연락처 노출 같은 부작용을 만들지 않는다.

## 2. URL 계약

```text
https://our-keeper.com/share/adopt/{id}
https://our-keeper.com/share/shelter/{id}
https://our-keeper.com/share/community/{id}
```

앱 딥링크:

```text
keeper://adopt/{id}
keeper://shelter/{id}
keeper://community/{id}
```

## 3. Backend Impact

### API

```http
GET /shares/:type/:id
```

- public
- `type`: `adopt | shelter | community`
- 대상이 없거나 숨김 처리된 커뮤니티 글이면 `NOT_FOUND`

응답:

```ts
type ShareMetadata = {
  type: 'adopt' | 'shelter' | 'community';
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  appPath: string;
};
```

### 도메인 매핑

| type      | title                         | description                | imageUrl                |
| --------- | ----------------------------- | -------------------------- | ----------------------- |
| adopt     | `kindNm`, 없으면 `kindFullNm` | 기관명·품종·성별·나이 조합 | `popfiles[0]` 또는 null |
| shelter   | 보호소명                      | 주소                       | null                    |
| community | 카테고리 상세 제목            | 본문 120자 요약            | 첫 이미지 또는 null     |

- 보호소와 이미지 없는 항목의 로고 fallback은 `keeper-web` 책임이다.
- 공공 공고 이미지는 저장하지 않고 원본 URL을 사용한다.
- DB 마이그레이션 없음.

## 4. keeper-web

- `SHARE_API_BASE_URL`: Railway v2 origin. `/api` prefix 없음.
- `/share/[type]/[id]`에서 공유 API 조회 후 `generateMetadata`로 OG 생성.
- API 실패·404·이미지 없음은 Keeper 로고와 기본 설명으로 fallback.
- 기존 `/share?token=`과 `/share/og?src=`는 출시 전 미사용 기능이므로 제거.

## 5. keeper-app

- `useShare` 입력을 `{ type, id }`로 단순화.
- base64 token, title, description, image 전송 제거.
- 앱 자체 공유는 `https://our-keeper.com`을 직접 공유한다.

## 6. 스키마 검증

| 필드        | keeper-app                      | keeper-web       | keeper-backend   | DB                            |
| ----------- | ------------------------------- | ---------------- | ---------------- | ----------------------------- |
| type        | `adopt \| shelter \| community` | 동일             | 동일             | 파생값                        |
| id          | string                          | string           | string           | 도메인 PK                     |
| title       | 전송 안 함                      | API 응답 사용    | string           | 도메인 필드 파생              |
| description | 전송 안 함                      | API 응답 사용    | string           | 도메인 필드 파생              |
| imageUrl    | 전송 안 함                      | `string \| null` | `string \| null` | JSON 이미지 첫 항목 또는 null |
| appPath     | 전송 안 함                      | string           | string           | 파생값                        |

## 7. 테스트 시나리오

- 공고 공유 메타데이터는 첫 공고 이미지와 공고 딥링크를 반환한다.
- 보호소 공유 메타데이터는 `imageUrl: null`을 반환한다.
- 커뮤니티 공유 메타데이터는 연락처 없이 제목·본문 요약·첫 이미지만 반환한다.
- 숨김 커뮤니티 글과 없는 대상은 `NOT_FOUND`다.
- 앱은 `/share/{type}/{id}` URL만 공유하고 token을 생성하지 않는다.
- 웹은 API 실패 또는 이미지 없음 시 Keeper 로고를 사용한다.

## 8. ADR

- **공유 전용 API 채택**: 상세 API 직접 호출은 도메인별 계약 결합과 커뮤니티 조회수 증가 부작용이 있어 제외.
- **이미지 미러링 제외**: R2 용량 절약을 위해 공공 이미지 원본 URL 사용.
- **token 제거**: 신규 출시 기능이라 과거 링크 호환이 필요 없고, 변조 가능한 base64 payload를 유지할 이유가 없음.
