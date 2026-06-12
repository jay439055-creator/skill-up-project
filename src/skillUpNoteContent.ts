export type NoteMember = {
  readonly englishName: string;
  readonly koreanName: string;
};

export type MeetingStage = {
  readonly body: string;
  readonly label: string;
  readonly number: string;
};

export type TeamAxis = {
  readonly agile: string;
  readonly classic: string;
  readonly label: string;
};

export type MeetingBottleneck = {
  readonly body: string;
  readonly title: string;
};

export type MeetingHelper = {
  readonly body: string;
  readonly index: string;
  readonly title: string;
  readonly values: readonly number[];
};

export type GenieNeed = {
  readonly author: string;
  readonly body: string;
};

export type RetrievableHistoryCard = {
  readonly items: readonly string[];
  readonly meta: string;
  readonly title: string;
};

export type BranchInterfaceStep = {
  readonly body: string;
  readonly label: string;
  readonly title: string;
};

export type WhatIfCard = {
  readonly body: string;
  readonly sourceItems: readonly string[];
  readonly tone: "default" | "featured" | "muted";
  readonly title: string;
};

export const meetingStages = [
  {
    body: "문제의 경계 설정, 구성원 간 관계 형성, 초기 긴장 해소",
    label: "지향",
    number: "1",
  },
  {
    body: "다양한 대안과 의견 충돌 표출, 2차 긴장 발생 → 발산",
    label: "갈등",
    number: "2",
  },
  {
    body: "갈등 완화와 입장 조정 → 합의 가능한 방향으로 수렴",
    label: "발생/수렴",
    number: "3",
  },
  {
    body: "결정에 대한 확신과 정서적 동의 형성, 실행 의지 강화",
    label: "강화",
    number: "4",
  },
] as const satisfies readonly MeetingStage[];

export const communicationTracks = [
  {
    body: "구성원 간의 친밀감 형성, 갈등 조정, 유대감 강화와 같은 팀 내 사회적 관계와 정서적 상호작용",
    title: "관계 트랙",
  },
  {
    body: "무엇을 논의할지에 대한 흐름으로, 이번 안건에서 특히 주목해야 할 이슈나 쟁점을 중심으로 논의가 전개",
    title: "주제 트랙",
  },
  {
    body: "어떻게 결정할지를 중심으로, 문제 분석과 대안 탐색, 해결책 설계 등 의사결정의 주요 내용을 다룸",
    title: "과제 트랙",
  },
] as const;

export const meetingBottlenecks = [
  {
    body: "A 주장을 뒷받침하기 위한 근거를 B 주장에 옮겨 붙여 사용하게 되는 실수를 저지름",
    title: "주장과 근거 연결의 오류 발생",
  },
  {
    body: "논의의 중심 궤도에서 이탈하여 사소한 부분에 집중을 하다가 본래 목적 및 방향성을 잃음",
    title: "논의 궤도 이탈로 인해 방향성 잃음",
  },
  {
    body: "유효하다고 판단한 의견이 보류되어 새로운 방향성을 찾기까지 발화 지연이 발생함",
    title: "재설계 과정에서 발화의 정체 발생",
  },
] as const satisfies readonly MeetingBottleneck[];

export const meetingHelpers = [
  {
    body: "논의 방향성 조율을 주도하는 역할 뿐 아니라, 사소한 좌절 상황들에서 회복의 동력을 제시함",
    index: "1",
    title: "맥락 관리자",
    values: [86, 36, 72, 10, 18],
  },
  {
    body: "활발한 발언으로 위축된 회의 템포를 살리고 진행이 다시 궤도에 진입하게 유도함",
    index: "2",
    title: "적극 발화자",
    values: [45, 80, 95, 24, 80],
  },
] as const satisfies readonly MeetingHelper[];

export const genieNeeds = [
  {
    author: "참여자 A",
    body: "누적된 대화들을 해체하고 분석하여, 지금까지 나오지 않았던 새로운 의견을 제시해주면 좋겠어요.",
  },
  {
    author: "참여자 C",
    body: "회의의 진행이 어떤 상황, 어떤 발화자가 있어도 매끄러워야 한다고 생각해요.",
  },
  {
    author: "참여자 E",
    body: "회의를 진행하다가 막혀서 제자리걸음일 때 주제의 전환이 필요해요.",
  },
  {
    author: "참여자 D",
    body: "50% 부족한 아이디어의 근거 자료를 알려주고, 추가 아이데이션을 구성해주면 편할 것 같아요.",
  },
] as const satisfies readonly GenieNeed[];

export const teamAxes = [
  { agile: "대화 중심 회의를 진행하는 조직", classic: "발표 중심 회의를 진행하는 조직", label: "커뮤니케이션 스타일" },
  { agile: "창의적인 프로덕트 제작", classic: "분석적 사고와 평가 중심", label: "회의 주제의 성격" },
  { agile: "변동적인 인원 구성", classic: "고정적인 인원 구성", label: "인원 구성의 유동성" },
  { agile: "일시적 프로젝트 조직", classic: "지속적 팀 기반 조직", label: "조직 지속성" },
  { agile: "다양한 직군이 모인 조직", classic: "동일한 직군이 모인 조직", label: "직군 구성" },
  { agile: "수평적 구조", classic: "수직적 위계 구조", label: "위계 구조" },
  { agile: "유연하고 민첩한 분위기", classic: "보수적이고 규율 중심의 분위기", label: "분위기 성향" },
] as const satisfies readonly TeamAxis[];

export const noteMembers = [
  { englishName: "Heejin Kim", koreanName: "김희진" },
  { englishName: "Juwon Yeom", koreanName: "염주원" },
  { englishName: "Sumin Shin", koreanName: "신수민" },
  { englishName: "Michael Lee", koreanName: "이명건" },
  { englishName: "Ji Shin", koreanName: "신 지" },
] as const satisfies readonly NoteMember[];

export const libraryCards = [
  "Meeting stages",
  "Signal dictionary",
  "Discussion cards",
  "Decision trace",
] as const;

export const retrievableHistoryCards = [
  {
    items: ["회의 목표 재정렬", "논의 궤도 이탈 감지", "다음 액션 후보 3개"],
    meta: "Context 01",
    title: "흩어진 회의 흐름을 다시 묶는 기록",
  },
  {
    items: ["발화자별 주장", "근거 연결 상태", "보류된 안건"],
    meta: "Context 02",
    title: "말 속에 남은 의사결정 단서",
  },
  {
    items: ["재설계 근거", "비슷한 과거 논의", "반복되는 병목"],
    meta: "Context 03",
    title: "이전 회의에서 검색되는 힌트",
  },
  {
    items: ["대안 비교", "반영 여부", "팀 합의 변화"],
    meta: "Context 04",
    title: "결정 이후의 맥락 추적",
  },
] as const satisfies readonly RetrievableHistoryCard[];

export const branchInterfaceSteps = [
  {
    body: "현재 논의의 중심 주제를 메인 트랙으로 고정하고, 옆으로 새는 의견을 별도 브랜치로 분리합니다.",
    label: "Main track",
    title: "회의 흐름의 기준선",
  },
  {
    body: "보류된 아이디어는 사라지지 않고 연결선 위에 남아, 필요할 때 다시 꺼낼 수 있는 대안이 됩니다.",
    label: "Branch point",
    title: "갈라진 맥락의 저장",
  },
  {
    body: "AI가 이전 회의와 현재 발화를 함께 참조해, 지금 회의에서 다시 볼 만한 대안을 제안합니다.",
    label: "Re-track",
    title: "다시 본류로 돌아오기",
  },
] as const satisfies readonly BranchInterfaceStep[];

export const whatIfCards = [
  {
    body: "홈 하단 슬라이드업 카드로 세 가지 보안 만족도 문항을 순서대로 체크하면, 별도 이동 없이 10초 만에 설문이 끝나고 즉시 결과 그래프로 신뢰를 확인할 수 있다. 참여가 가볍고 보상이 즉각적.",
    sourceItems: [],
    title: "한번에 스윽 넘기고, 확인하는 보안 만족도",
    tone: "default",
  },
  {
    body: "알림으로 호출된 DM 챗봇이 재미있는 밈과 스티커를 보여주며 ‘우리 앱 보안 만족?’ 등 세 가지 예·아니오 질문을 던지고, 답변마다 맞춤 스티커·즉시 피드백을 제공.",
    sourceItems: [],
    title: "번거롭다는 인식의 역전, 챗봇 퀴즈로 가벼운 보안 점검",
    tone: "featured",
  },
  {
    body: "메인 피드 상단 ‘내 캠퍼스 보안 지수 78점’ 위젯을 탭하면 네 단계 미만의 막대그래프 설문이 뜬다. 완료 즉시 점수와 캠퍼스 순위가 갱신되며, 경쟁 플랫폼 비교 그래프도 함께 노출해 앱의 차별성을 각인.",
    sourceItems: ["캠퍼스별 보안 지수 위젯 구조", "랭킹 경쟁 심리 활용 인센티브 전략", "교재쿠폰 배지 리워드 배분 로직"],
    title: "AI 기반 리디자인 피드백 시스템 도입 가능성",
    tone: "muted",
  },
] as const satisfies readonly WhatIfCard[];

export const whatIfMeetingSources = [
  "실용 관점에서의 AI 도입",
  "디자인 관리자 관점에서의 AI 도입",
  "기획 관점에서의 AI 도입",
  "캠퍼스별 보안 지수 위젯 구조",
  "랭킹 경쟁 심리 활용 인센티브 전략",
  "교재쿠폰 배지 리워드 배분 로직",
] as const;
