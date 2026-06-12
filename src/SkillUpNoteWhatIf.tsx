const conditionColumns = [
  {
    rows: ["현존 커뮤니티 보안에 대한 의견을 묻는 것은 필요", "실용 관점에서의 AI 도입", "대체할 플랫폼과 대비되는 차별점이 묻어나오는 흐름"],
    title: "반영할 것 (Positive Constraint)",
    tone: "positive",
  },
  {
    rows: ["사용자 입장에서 강제되는 전환은 피해야 함", "인터랙션 흐름이 4단계 이상으로 복잡해지면 안됨", "사용자의 관심사와 문제의식에서 멀어지면 안됨"],
    title: "지양할 것 (Negative Constraint)",
    tone: "negative",
  },
] as const;

const branchNodes = [
  "IRB 문구 인용",
  "안전한 소통 및 거래 방식",
  "시각 요소 삽입",
  "진행률바 켜기",
  "채팅 버튼 위치별 클릭률 비교",
  "리스트 카드 CTA 효과",
  "말풍선 색상 A/B 시뮬레이션",
] as const;

export function SkillUpNoteWhatIf() {
  return (
    <section className="note-whatif-section" aria-label="Tailored alternative what-if">
      <h2 className="note-whatif-title">
        <span>Tailored Alternative:</span>
        <span>What-if</span>
      </h2>
      <p className="note-section-copy note-whatif-copy">
        아이디어가 막혀 발생하는 논의 정체를 맥락 및 조건 기반 What-if로 해소했어요
      </p>

      <article className="note-whatif-stage condition">
        <div className="note-stage-heading">
          <div className="note-stage-number">1</div>
          <div>
            <h3>Context Aware Suggestion</h3>
            <p>프롬프트를 입력하고 여태까지 나온 논의에 대한 제한조건과 긍정조건을 확인합니다.</p>
          </div>
        </div>
        <div className="note-suggestion-preview condition-board" aria-hidden="true">
          <div className="note-condition-prompt">
            제가 이해한 논의에서 괜찮았던 부분과, 고민되는 부분을 나눠봤어요.
            <br />
            필요하다면 수정하거나, 자유롭게 추가해 주세요.
          </div>
          <div className="note-condition-grid">
            {conditionColumns.map((column) => (
              <div className={`note-condition-column ${column.tone}`} key={column.title}>
                <h4>{column.title}</h4>
                {column.rows.map((row) => (
                  <span className="note-condition-row" key={row}>{row}</span>
                ))}
              </div>
            ))}
          </div>
          <div className="note-condition-input">What if를 통해 무엇이든 물어보고, 새로운 가능성을 찾아보세요.</div>
        </div>
      </article>

      <article className="note-whatif-stage branch">
        <div className="note-stage-heading">
          <div className="note-stage-number">2</div>
          <div>
            <h3>Context Aware Suggestion</h3>
            <p>논의되어 온 전체 컨텍스트를 빠르게 스캔해, 설정된 조건에 부합하는 대안을 즉시 제안합니다.</p>
          </div>
        </div>
        <div className="note-suggestion-preview branch-board" aria-hidden="true">
          <aside className="note-branch-filter">
            <strong>차단신고 플로우 UX 리뷰</strong>
            {conditionColumns.flatMap((column) =>
              column.rows.map((row) => (
                <span className={`note-condition-row ${column.tone}`} key={`${column.tone}-${row}`}>{row}</span>
              )),
            )}
          </aside>
          <div className="note-branch-tree">
            {branchNodes.map((node) => (
              <span className="note-branch-node" key={node}>{node}</span>
            ))}
          </div>
        </div>
      </article>

      <div className="note-option-heading">
        <span>3</span>
        <div>
          <p>Option Cards</p>
          <h3>
            조건을 만족한 시안은 카드로 생성되고,
            <br />
            선정된 시안에서 곧바로 논의를 이어갈 수 있습니다.
          </h3>
        </div>
      </div>

      <div className="note-whatif-panel" aria-label="What-if option cards">
        <img
          alt="ELiF What-if option cards screen"
          className="note-whatif-ui-image"
          loading="eager"
          src="/figma/skill-up-note/whatif-option-cards-source.jpg"
        />
      </div>
    </section>
  );
}
