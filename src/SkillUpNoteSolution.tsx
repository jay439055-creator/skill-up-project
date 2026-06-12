import {
  branchInterfaceSteps,
  retrievableHistoryCards,
  whatIfCards,
  whatIfMeetingSources,
} from "./skillUpNoteContent";

export function SkillUpNoteSolution() {
  return (
    <section className="note-solution-section" aria-label="Back on Track solution">
      <section className="note-solution-overview" aria-label="ELiF solution overview">
        <p>Solution</p>
        <div className="note-elif-lockup" aria-label="ELiF">
          <span>ELiF</span>
          <small>Higher Fidelity, Further Possibilities</small>
        </div>
        <h2>ELiF helps teams return to the right track.</h2>
        <p className="note-solution-copy">
          회의의 맥락을 기록하고, 갈라진 논의를 보존하며, 다시 궤도에 올릴 수 있는 대안을 제안하는 AI 회의 파트너입니다.
        </p>
        <div className="note-architecture-map" aria-label="Information architecture">
          <strong>Information Architecture</strong>
          <div>
            <span>Library</span>
            <i />
            <span>Branch</span>
            <i />
            <span>What-if</span>
          </div>
          <p>History를 회수하고, Context를 분기하며, Alternative를 제안하는 세 단계 흐름</p>
        </div>
      </section>

      <div className="note-product-shot" aria-label="ELiF product overview">
        <div className="note-product-topbar">
          <span>ELiF</span>
          <i />
        </div>
        <aside className="note-sidebar">
          <strong>Project Flow</strong>
          <span className="is-active">Back on Track</span>
          <span>Library</span>
          <span>Branch</span>
          <span>What-if</span>
        </aside>
        <div className="note-product-canvas">
          <div className="note-product-thread">
            <span />
            <span />
            <span />
          </div>
          <div className="note-product-focus">
            <strong>회의 흐름 복귀 제안</strong>
            <p>이전 논의와 현재 발화를 연결해 다음 대안을 추천합니다.</p>
          </div>
          <div className="note-product-sidepanel">
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>

      <section className="note-library-section" aria-label="Library for retrievable history">
        <p>Library</p>
        <h2>Library for Retrievable History</h2>
        <p className="note-section-copy">
          회의에서 흘러간 말들을 다시 찾을 수 있는 단위로 묶어, 다음 회의의 판단 근거로 되살립니다.
        </p>
        <div className="note-library-panel">
          <div className="note-library-tabs" aria-label="Library filters">
            <span className="is-active">전체 히스토리</span>
            <span>주장</span>
            <span>근거</span>
            <span>결정</span>
          </div>
          <div className="note-library-search">이전 회의에서 비슷한 맥락 찾기</div>
          <div className="note-library-grid">
            {retrievableHistoryCards.map((card) => (
              <article className="note-library-card" key={card.meta}>
                <small>{card.meta}</small>
                <h3>{card.title}</h3>
                <ul>
                  {card.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="note-branch-section" aria-label="Branch interface for contextual clarity">
        <p>Branch Interface</p>
        <h2>Branch Interface for Contextual Clarity</h2>
        <p className="note-section-copy">
          논의가 옆길로 빠지는 순간을 실패로 보지 않고, 다시 연결 가능한 브랜치로 보존합니다.
        </p>
        <div className="note-branch-panel">
          <div className="note-branch-map" aria-hidden="true">
            <span className="node main" />
            <span className="node branch-one" />
            <span className="node branch-two" />
            <span className="node branch-three" />
          </div>
          <div className="note-branch-list">
            {branchInterfaceSteps.map((step) => (
              <article className="note-branch-card" key={step.label}>
                <small>{step.label}</small>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="note-whatif-section" aria-label="Tailored alternative what-if">
        <p>Tailored Alternative</p>
        <h2>Tailored Alternative: What-if</h2>
        <p className="note-section-copy">
          막힌 회의의 다음 장면을 여러 가능성으로 펼치고, 선택한 대안을 브랜치에 반영합니다.
        </p>
        <div className="note-whatif-stage one">
          <div className="note-stage-number">1</div>
          <div>
            <h3>Context Aware Suggestion</h3>
            <p>현재 회의에서 멈춘 지점과 이전 회의 기록을 함께 읽어, 지금 필요한 개입 맥락을 먼저 정리합니다.</p>
          </div>
          <div className="note-context-mockup" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>

        <div className="note-whatif-stage two">
          <div className="note-stage-number">2</div>
          <div>
            <h3>Context Aware Suggestion</h3>
            <p>회의의 본류와 분기된 논의를 나누어 보여주고, 브랜치에서 다시 가져올 수 있는 대안 후보를 좁힙니다.</p>
          </div>
          <div className="note-context-mockup branch-preview" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>

        <div className="note-option-heading">
          <span>3</span>
          <div>
            <p>Option Cards</p>
            <h3>맥락에 맞는 대안을 카드로 비교합니다.</h3>
          </div>
        </div>

        <div className="note-whatif-panel" aria-label="What-if option cards">
          <header className="note-whatif-header">
            <div>
              <small>What if</small>
              <strong>가능한 대안 3개를 생성했어요</strong>
            </div>
            <nav aria-label="What-if actions">
              <button type="button">적용 기준 보기</button>
              <button type="button">다시 생성하기</button>
              <button type="button" className="is-primary">브랜치에 반영하기</button>
            </nav>
          </header>
          <div className="note-whatif-body">
            <div className="note-whatif-cards">
              {whatIfCards.map((card) => (
                <article className={`note-whatif-card ${card.tone}`} key={card.title}>
                  <h3>{card.title}</h3>
                  <p>{card.body}</p>
                </article>
              ))}
            </div>
            <aside className="note-whatif-summary">
              <div className="note-whatif-toggle" aria-label="Summary view mode">
                <span className="is-active">요약 보기</span>
                <span>상세 보기</span>
              </div>
              <h3>참고한 이전 회의</h3>
              <ul>
                {whatIfMeetingSources.map((source) => (
                  <li key={source}>{source}</li>
                ))}
              </ul>
              <p>1 / 4</p>
            </aside>
          </div>
        </div>
      </section>

      <section className="note-final-section" aria-label="Final Back on Track preview">
        <p>Back on Track</p>
        <h2 data-figma-node="4:11001">Back on Track</h2>
        <p className="note-section-copy">
          ELiF는 회의 중 놓친 맥락을 되찾고, 다음 행동으로 이어질 수 있는 선택지를 제안합니다.
        </p>
        <div className="note-final-product" aria-hidden="true">
          <div className="note-final-sidebar" />
          <div className="note-final-glow" />
          <div className="note-final-card one" />
          <div className="note-final-card two" />
          <div className="note-final-card three" />
        </div>
      </section>
    </section>
  );
}
