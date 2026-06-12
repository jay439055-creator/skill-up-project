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
