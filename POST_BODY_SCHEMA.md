# 개인입양 홍보 게시글 작성 API - POST Body 스키마

## 필수 필드

### 1. 분류

- required: true
- field: `animalType`
- type: string
- enum: 'DOG', 'CAT', 'ETC'

### 2. 성별

- required: true
- field: `gender`
- type: string
- enum: 'M', 'F', 'NONE'

### 3. 중성화

- required: true
- field: `neuterYn`
- type: string
- enum: 'Y', 'N', 'NONE'

### 4. 건강검진

- required: true
- field: `healthCheck`
- type: string
- enum: 'Y', 'N', 'NONE'

### 5. 보호 유형

- required: true
- field: `protectionType`
- type: string
- enum: 'TEMPORARY', 'ADOPTION', 'BOTH'
- description: TEMPORARY(임시보호), ADOPTION(입양), BOTH(모두가능)

### 6. 예방접종

- required: true
- field: `vaccinationCheck`
- type: string
- enum: 'NOT', 'FIRST', 'SECOND', 'THIRD', 'NONE'
- description: NOT(미접종), FIRST(1차), SECOND(2차), THIRD(3차), NONE(정보없음)

### 7. 몸무게

- required: true
- field: `weight`
- type: string
- unit: kg
- validation: 최대 2자리

### 8. 지역

- required: true
- field: `location`
- type: string

### 9. 나이

- required: true
- field: `age`
- type: string
- format: 출생년도 (예: "2020")
- unit: 년생

### 10. 품종

- required: true
- field: `specificType`
- type: string

### 11. 제목

- required: true
- field: `title`
- type: string
- maxLength: 30
- placeholder: "예)말랑말랑 댕댕이의 가족이 되어주세요 :)"

### 12. 소개글

- required: true
- field: `introduction`
- type: string
- maxLength: 1000
- placeholder: "예)성격, 특별한 사연 등을 자유롭게 적어주세요."

### 13. 특징

- required: true
- field: `specialMark`
- type: string
- maxLength: 100
- placeholder: "예)겁이 많아요, 치석이 있어요"

### 14. 연락 정보 (중복가능)

- required: true
- field: `contact`
- type: array
- minLength: 1
- item schema:

  ```json
  {
    "type": "TEL" | "EMAIL" | "SNS",
    "value": "string"
  }
  ```

- description: TEL(전화번호), EMAIL(이메일), SNS(SNS)

### 15. 이미지 첨부

- required: true
- field: `images`
- type: array of string (URL)
- minLength: 1
- maxLength: 10

---

## 선택 필드

### 16. 좋아해요

- required: false
- field: `likes`
- type: string
- maxLength: 100
- placeholder: "예) 산책과 드라이브를 좋아해요."

### 17. 싫어해요

- required: false
- field: `dislikes`
- type: string
- maxLength: 100
- placeholder: "예) 모르는 사람은 무서워해요."

### 18. 아파요

- required: false
- field: `health`
- type: string
- maxLength: 100
- placeholder: "예) 피부병이 있어서 하루에 두 번 연고를 발라줘야해요."

### 19. 관련 링크

- required: false
- field: `relatedLink`
- type: string
- format: URL

---

## Request Body 예시

```json
{
  "title": "말랑말랑 댕댕이의 가족이 되어주세요 :)",
  "animalType": "DOG",
  "specificType": "믹스견",
  "images": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ],
  "gender": "M",
  "neuterYn": "Y",
  "healthCheck": "Y",
  "age": "2020",
  "weight": "15",
  "location": "서울특별시 강남구",
  "specialMark": "겁이 많아요, 치석이 있어요",
  "introduction": "성격이 온순하고 사람을 좋아하는 아이입니다.",
  "contact": [
    {
      "type": "TEL",
      "value": "010-1234-5678"
    },
    {
      "type": "EMAIL",
      "value": "example@email.com"
    }
  ],
  "protectionType": "ADOPTION",
  "vaccinationCheck": "THIRD",
  "likes": "산책과 드라이브를 좋아해요.",
  "dislikes": "모르는 사람은 무서워해요.",
  "health": "건강합니다.",
  "relatedLink": "https://example.com/detail"
}
```
