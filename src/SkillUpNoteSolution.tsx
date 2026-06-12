import { SkillUpNoteBackTrack } from "./SkillUpNoteBackTrack";
import { SkillUpNoteWhatIf } from "./SkillUpNoteWhatIf";

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
        <h2 className="note-library-title">
          <span>Library</span>{" "}
          <span>for Retrievable History</span>
        </h2>
        <p className="note-section-copy">
          모든 회의 건은 홈에 프로젝트별 연대기 형식으로 정리됩니다.
          <br />
          간편히 과거 회의나 필요 정보를 불러오고 열람할 수 있습니다.
        </p>
        <div className="note-library-panel">
          <img
            alt="ELiF Library screen"
            className="note-library-ui-image"
            loading="eager"
            src="/figma/skill-up-note/library-history-source.jpg"
          />
        </div>
      </section>

      <section className="note-branch-section" aria-label="Branch interface for contextual clarity">
        <p>Branch Interface</p>
        <h2>Branch Interface for Contextual Clarity</h2>
        <p className="note-section-copy">
          논의가 옆길로 빠지는 순간을 실패로 보지 않고, 다시 연결 가능한 브랜치로 보존합니다.
        </p>
        <div className="note-branch-panel">
          <img
            alt="ELiF Branch Interface screen"
            className="note-branch-ui-image"
            loading="lazy"
            src="/figma/skill-up-note/branch-interface-source.jpg"
          />
        </div>
      </section>

      <SkillUpNoteWhatIf />

      <SkillUpNoteBackTrack />
    </section>
  );
}
