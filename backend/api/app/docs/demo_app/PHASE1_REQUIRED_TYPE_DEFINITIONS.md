# Phase 1 必要型定義（現行実装・自己完結版）

## 1. 目的

この文書だけで、`PHASE1_IMPLEMENTATION_PLAN.md` の最小7API実装に必要な現行型を把握できるようにする。

注意:

- ここに記載する型は「現行実装の定義」をそのまま掲載したもの。
- `tempDraftId` など Phase 1 固有追加型は、最後に「追加が必要な型」として明記する。

## 2. Phase 1 最小7API

1. `GET /api/users/me`
2. `GET /api/users/me/reports`
3. `POST /api/reports/temp-drafts`
4. `POST /api/ai/generate-outline`
5. `POST /api/ai/generate-report`
6. `POST /api/reports/:reportId`
7. `GET /api/reports/:reportId`

## 3. 現行 TypeScript 型定義（フロント側）

### 3.1 `frontend/src/types/user.ts`

```ts
export interface User {
  cognito_user_id: string;
  display_name: string;
  email_address: string;
}

export const SubscriptionPlan = {
  STANDERD: 'standard',
  PULS: 'plus',
  PRO: 'pro',
} as const;

export type SubscriptionPlanType = keyof typeof SubscriptionPlan;

export interface SubscriptionPlanDef {
  plan: SubscriptionPlanType;
  name: string;
  description: string;
}

export const SubscriptionPlans: SubscriptionPlanDef[] = [
  {
    plan: 'STANDERD',
    name: 'Standard',
    description: 'Basic subscription plan with limited features.',
  },
  {
    plan: 'PULS',
    name: 'Plus',
    description: 'Enhanced features with additional credits.',
  },
  {
    plan: 'PRO',
    name: 'Pro',
    description: 'Premium features with maximum credits.',
  },
];

export interface UserSubscription {
  subscription_id: string;
  credits: number;
  credit_expiration_date: string;
  plan: SubscriptionPlanType;
}

export interface UserWithSubscription extends User {
  subscription: UserSubscription;
}
```

### 3.2 `frontend/src/types/ai_api.ts`

```ts
export const AiMode = {
  SPEED: 'speed',
  TURBO: 'turbo',
} as const;

export type AiModeType = (typeof AiMode)[keyof typeof AiMode];

export interface AiModeDef {
  id: AiModeType;
  name: string;
  description: string;
}

export const aiModes: AiModeDef[] = [
  {
    id: AiMode.SPEED,
    name: 'スピード',
    description: '迅速な執筆支援',
  },
  { id: AiMode.TURBO, name: 'ターボ', description: '最高の性能で執筆' },
];

export interface ChatMode {
  id: string;
  name: string;
  description: string;
  disabled?: boolean;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

export const chatModes: ChatMode[] = [
  {
    id: 'general',
    name: '一般的な会話',
    description: 'レポート作成全般について相談できます',
  },
  {
    id: 'reference',
    name: '参考文献について質問(近日登場)',
    description: '参考文献の探し方や引用方法について相談できます',
    disabled: true,
  },
];

export const defaultChatMode: ChatMode = chatModes[0];

export interface EditorAiTask {
  id: string;
  label: string;
  description?: string;
  type: 'rewrite' | 'continue' | 'improve' | 'complete';
}

export interface SearchResult {
  id: number;
  title: string;
  authors: string;
  year: string;
  publisher?: string;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  url?: string;
  referenceType: 'book' | 'journal' | 'website' | 'thesis';
  abstract?: string;
}

export interface ChatRequest {
  aiMode: string;
  chatMode: ChatMode;
  message: string;
  history: ChatMessage[];
}

export interface ChatResponse {
  result: string;
  error?: string;
}

export interface EditorAiRequest {
  aiMode: string;
  aiAction: string;
  content: string;
}

export interface EditorAiResponse {
  result: string;
}

export interface ReferenceSearchRequest {
  query: string;
  aiMode: string;
}

export interface ReferenceSearchResponse {
  results: SearchResult[];
  totalCount: number;
  searchQuery: string;
  error?: string;
}
```

### 3.3 `frontend/src/types/report.ts`

```ts
import { JSONContent } from '@tiptap/core';
import { AiModeType } from './ai_api';

export interface OutlineItem {
  id: string;
  title: string;
  summary: string;
  order: number;
}

export interface Outline {
  outline: OutlineItem[];
}

export interface WordCount {
  max_word_count: number;
  min_word_count: number;
}

export interface WordCountOption {
  label: string;
  id: number;
  wordCount: WordCount;
}

export const wordCountOptions: WordCountOption[] = [
  {
    label: '500文字以下',
    id: 1,
    wordCount: { min_word_count: 0, max_word_count: 500 },
  },
  {
    label: '500~1,000文字',
    id: 2,
    wordCount: { min_word_count: 500, max_word_count: 1000 },
  },
  {
    label: '1,000~2,000文字',
    id: 3,
    wordCount: { min_word_count: 1000, max_word_count: 2000 },
  },
  {
    label: '2,000~3,000文字',
    id: 4,
    wordCount: { min_word_count: 2000, max_word_count: 3000 },
  },
  {
    label: '3,000文字以上',
    id: 5,
    wordCount: { min_word_count: 3000, max_word_count: 4000 },
  },
];

export type QuoteType = 'book' | 'article' | 'website';
export type QuoteFormat = 'APA' | 'MLA' | 'Chicago' | 'Harvard';

export interface Quote {
  id: number;
  text: string;
  source: string;
  page?: string;
  referenceType?: QuoteType;
  authors?: string;
  title?: string;
  year?: string;
  publisher?: string;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  url?: string;
  accessDate?: string;
}

export interface Reference {
  id: number;
  quote: Quote;
  content: string;
  object_url?: string;
}

export interface File {
  name: string;
  size: number;
  type: string;
}

export interface UploadedFile {
  reference?: Reference;
  file?: File;
}

export interface FileUploadOptions {
  maxFiles?: number;
  maxSizeBytes?: number;
  acceptedTypes?: string[];
  endpoint?: string;
}

export interface FileUploadResult {
  success: boolean;
  message?: string;
  files?: UploadedFile[];
}

export interface Report {
  id: string;
  title: string;
  lastModified: string;
}

export interface RawReportData extends Report {
  content: string;
  wordCount: number;
  characterCount: number;
  references: Reference[];
  quotes: Quote[];
}

export interface ReportData extends Report {
  content: JSONContent;
  wordCount: number;
  characterCount: number;
  references: Reference[];
  quotes: Quote[];
}

export const HumanizeChecker = {
  REPHRASE: 'rephrase',
  COPYCONTENTDETECTOR: 'copycontentdetector',
  CROCO: 'coroco',
  DUPLICHECKER: 'duplicatechecker',
  SMODIN: 'smodin',
  GPTZERO: 'gptzero',
  COPYLEAKS: 'copyleaks',
  WRITER: 'writer',
};

export type HumanizeCheckerType =
  (typeof HumanizeChecker)[keyof typeof HumanizeChecker];
export interface HumanizeCheckerDef {
  id: HumanizeCheckerType;
  name: string;
  logo_url?: string;
}

export const humanizeCheckers: HumanizeCheckerDef[] = [
  {
    id: HumanizeChecker.REPHRASE,
    name: 'REPHRASE',
    logo_url: '/humanize_checker/REPHRASE.png',
  },
  {
    id: HumanizeChecker.COPYCONTENTDETECTOR,
    name: 'CopyContentDetector',
    logo_url: '/humanize_checker/CopyContentDetector.png',
  },
  {
    id: HumanizeChecker.CROCO,
    name: 'CROCO',
    logo_url: '/humanize_checker/CROCO.png',
  },
  {
    id: HumanizeChecker.DUPLICHECKER,
    name: 'DupliChecker',
    logo_url: '/humanize_checker/DupliChecker.png',
  },
  {
    id: HumanizeChecker.SMODIN,
    name: 'Smodin',
    logo_url: '/humanize_checker/Smodin.png',
  },
  {
    id: HumanizeChecker.GPTZERO,
    name: 'GPTZero',
    logo_url: '/humanize_checker/GPTZero.png',
  },
  {
    id: HumanizeChecker.COPYLEAKS,
    name: 'Copyleaks',
    logo_url: '/humanize_checker/Copyleaks.png',
  },
  {
    id: HumanizeChecker.WRITER,
    name: 'WRITER',
    logo_url: '/humanize_checker/WRITER.png',
  },
];

export interface CreateReportResponse {
  success: boolean;
  message: string;
  reportId?: number;
}

export interface UploadFileRequest {
  report_id: string;
  file: File;
}

export interface UploadFileResponse {
  success: boolean;
  message: string;
  reference?: Reference;
}

export interface FetchReportRequest {
  reportId: number;
}

export interface FetchReportResponse {
  success: boolean;
  message?: string;
  data?: ReportData;
}

export interface DeleteReportRequest {
  reportId: number;
}

export interface DeleteReportResponse {
  success: boolean;
  message?: string;
}

export interface GenerateOutlineRequest {
  overview: string;
  reference?: Reference[];
  aiMode: AiModeType;
  wordCount: WordCount;
  overviewReferenceId?: number;
}

export interface GenerateOutlineResponse {
  success: boolean;
  message?: string;
  title: string;
  outline: Outline;
}

export interface GenerateReportRequest {
  reportId: string;
  overview: string;
  title: string;
  outline: Outline;
  reference?: Reference[];
  aiMode: AiModeType;
  tone: string;
  wordCount: WordCount;
  humanize: boolean;
}

export interface GenerateReportResponse {
  success: boolean;
  message?: string;
  title: string;
  content: string;
  reference?: Reference[];
  quote?: Quote[];
}

export interface SaveReportResponse {
  success: boolean;
  message?: string;
  data?: Report;
}

export interface SaveQuoteRequest {
  reportId: string;
  quote: Omit<Quote, 'id'>;
}

export interface SaveQuoteResponse {
  success: boolean;
  message?: string;
  quote?: Quote;
}

export interface DeleteReferenceRequest {
  referenceId: number;
}

export interface DeleteReferenceResponse {
  success: boolean;
  message?: string;
}

export interface HumanizeReportRequest {
  reportId: string;
  humanizeChecker: HumanizeCheckerType;
}

export interface HumanizeReportResponse {
  success: boolean;
  message?: string;
  result?: string;
}
```

## 4. 現行 Python 型定義（バックエンド側）

### 4.1 `backend/app/src/schemas/ai_api.py`

```py
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel


class TaskType(str, Enum):
    LONGER = "longer"
    SHORTER = "shorter"
    REWRITE = "rewrite"
    CONTINUE = "continue"
    TONE_DESU_MASU = "tone_desu_masu"
    TONE_DEARU_DA = "tone_dearu_da"
    IMPROVE = "improve"


class ToneType(str, Enum):
    DESU_MASU = "desu-masu"
    DEARU_DA = "dearu-da"
    USER_TONE = "user-tone"

    def __str__(self) -> str:
        if self == ToneType.DESU_MASU:
            return "です・ます調"
        elif self == ToneType.DEARU_DA:
            return "である・だ調"
        elif self == ToneType.USER_TONE:
            return "ユーザートーン"


class SenderType(str, Enum):
    USER = "user"
    AI = "ai"


class EditorAiTask(BaseModel):
    id: str
    label: str
    description: Optional[str] = None
    type: TaskType


class EditorAiRequest(BaseModel):
    aiMode: str
    aiAction: str
    content: str


class EditorAiResponse(BaseModel):
    result: str


class AiMode(str, Enum):
    SPEED = "speed"
    TURBO = "turbo"


class ChatMode(BaseModel):
    id: str
    name: str
    description: str


class ChatMessage(BaseModel):
    id: str
    text: str
    sender: SenderType
    timestamp: str


class ChatRequest(BaseModel):
    aiMode: str
    chatMode: ChatMode
    message: str
    history: List[ChatMessage]


class ChatResponse(BaseModel):
    result: str
    error: Optional[str] = None


class ReferenceType(str, Enum):
    BOOK = "book"
    JOURNAL = "journal"
    WEBSITE = "website"
    THESIS = "thesis"


class SearchResult(BaseModel):
    id: int
    title: str
    authors: str
    year: str
    publisher: Optional[str] = None
    journal: Optional[str] = None
    volume: Optional[str] = None
    issue: Optional[str] = None
    pages: Optional[str] = None
    doi: Optional[str] = None
    url: Optional[str] = None
    referenceType: ReferenceType
    abstract: Optional[str] = None


class ReferenceSearchRequest(BaseModel):
    query: str
    aiMode: AiMode


class ReferenceSearchResponse(BaseModel):
    results: List[SearchResult]
    totalCount: int
    searchQuery: str
    error: Optional[str] = None


class HumanizeRequest(BaseModel):
    content: str
    tone: Optional[ToneType] = None


class HumanizeResponse(BaseModel):
    success: bool
    message: str
    result: str
```

### 4.2 `backend/app/src/schemas/report.py`

```py
from typing import List, Literal, Optional

from pydantic import BaseModel

from src.schemas.ai_api import AiMode


class OutlineItem(BaseModel):
    id: str
    title: str
    summary: str
    order: int

    def __str__(self) -> str:
        return f"{self.order}. {self.title} : {self.summary}"


class Outline(BaseModel):
    outline: List[OutlineItem]

    def __str__(self) -> str:
        outline_str = "\n".join(str(item) for item in self.outline)
        return f"アウトライン:\n{outline_str}"


class WordCount(BaseModel):
    max_word_count: int
    min_word_count: int


class ReferenceFile(BaseModel):
    id: str
    name: str
    size: str
    type: str
    isUrl: Optional[bool] = None
    url: Optional[str] = None
    fileId: Optional[str] = None


QuoteType = Literal["book", "article", "website"]
QuoteFormat = Literal["APA", "MLA", "Chicago", "Harvard"]


class Quote(BaseModel):
    id: int
    text: str
    source: str
    page: Optional[str] = None
    referenceType: Optional[QuoteType] = None
    authors: Optional[str] = None
    title: Optional[str] = None
    year: Optional[str] = None
    publisher: Optional[str] = None
    journal: Optional[str] = None
    volume: Optional[str] = None
    issue: Optional[str] = None
    pages: Optional[str] = None
    url: Optional[str] = None
    accessDate: Optional[str] = None


class Reference(BaseModel):
    id: int
    quote: Quote
    content: str
    object_url: Optional[str] = None


class UploadFileRequest(BaseModel):
    report_id: str


class UploadFileResponse(BaseModel):
    success: bool
    message: str
    reference: Optional[Reference] = None


class Report(BaseModel):
    id: str
    title: str
    lastModified: str


class ReportData(Report):
    content: str
    wordCount: int
    characterCount: int
    references: List[Reference]
    quotes: List[Quote]


class FetchReportRequest(BaseModel):
    reportId: int


class FetchReportResponse(BaseModel):
    success: bool
    message: Optional[str] = None
    data: Optional[ReportData] = None


class GenerateOutlineRequest(BaseModel):
    overview: str
    reference: Optional[List[Reference]] = None
    aiMode: AiMode
    wordCount: WordCount
    overviewReferenceId: Optional[int] = None


class GenerateOutlineResponse(BaseModel):
    success: bool
    message: Optional[str] = None
    title: str
    outline: Outline


class GenerateReportRequest(BaseModel):
    reportId: str
    overview: str
    title: str
    outline: Outline
    reference: Optional[List[Reference]] = None
    aiMode: AiMode
    tone: str
    wordCount: WordCount
    humanize: bool


class GenerateReportResponse(BaseModel):
    success: bool
    message: Optional[str] = None
    title: str
    content: str
    reference: Optional[List[Reference]] = None
    quote: Optional[List[Quote]] = None


class CreateReportResponse(BaseModel):
    success: bool
    message: str
    reportId: Optional[str] = None


class SaveReportResponse(BaseModel):
    success: bool
    message: str
    data: Optional[ReportData] = None
```

### 4.3 `backend/app/src/schemas/user.py`

```py
from typing import Dict, Optional

from pydantic import BaseModel


class CognitoSignupRequest(BaseModel):
    cognitoUserId: str
    userPoolId: str
    clientId: str
    triggerSource: str
    timestamp: str
    userAttributes: Optional[Dict[str, str]] = None


class UserResponse(BaseModel):
    id: int
    cognito_sub: str
    username: str
    email: str
    subscription_id: Optional[str] = None
    credit_count: int = 0
```

## 5. 最小7APIへの適用（現行型ベース）

- `GET /api/users/me`
  - `UserWithSubscription` 相当（実レスポンスは success envelope なし）
- `GET /api/users/me/reports`
  - `Report[]`（実レスポンスは success envelope なし）
- `POST /api/reports/temp-drafts`
  - 現行は `CreateReportResponse`（`reportId`）のみ。`tempDraftId` は未定義
- `POST /api/ai/generate-outline`
  - `GenerateOutlineRequest` / `GenerateOutlineResponse`
- `POST /api/ai/generate-report`
  - `GenerateReportRequest` / `GenerateReportResponse`
- `POST /api/reports/:reportId`
  - 現行は `POST /api/report` + body の `ReportData.id` で対象指定
- `GET /api/reports/:reportId`
  - 現行は `GET /api/report?reportId=...` + `FetchReportResponse`

## 6. Phase 1 で追加が必要な型（現行にない最小分）

```ts
export interface TempDraft {
  tempDraftId: string;
  title: string;
  createdAt: string;
  status: 'draft' | 'outline_generated' | 'report_generated';
}

export interface CreateTempDraftRequest {
  title?: string;
}

export interface CreateTempDraftResponse {
  success: boolean;
  message?: string;
  data: TempDraft;
}
```

上記3型以外は、この文書内の現行型をそのまま再利用できる。
