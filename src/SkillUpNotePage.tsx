import { communicationTracks, libraryCards, meetingStages, noteMembers, teamAxes } from "./skillUpNoteContent";

export function SkillUpNotePage() {
  return (
    <main className="skill-up-note-page" data-subpage="skill-up-note" data-testid="skill-up-note-page">
      <div className="skill-up-note-frame" data-testid="skill-up-note-frame" aria-label="Skill Up Note Behance final">
        <section className="note-hero" aria-label="Skill Up Note opening">
          <div className="note-device" aria-hidden="true">
            <div className="note-device-screen">
              <div />
              <div />
              <div />
              <div />
              <div />
              <div />
              <div />
              <div />
            </div>
          </div>
          <div className="note-brand-mark" aria-hidden="true">ELiF</div>
          <p className="note-hero-subtitle" data-figma-node="4:9891">
            Higher Fidelity, Further Possibilties
          </p>
        </section>

        <section className="note-question-band" aria-label="Core question">
          <div className="note-question-image" aria-hidden="true" />
          <h1 data-figma-node="4:9896">
            <span>매일 하는 회의,</span>
            <span>더 똑똑하게 할 수는 없을까요?</span>
          </h1>
        </section>

        <section className="note-desk-section" aria-label="Desk research">
          <p className="note-kicker" data-figma-node="4:9898">Desk Research</p>
          <p className="note-subcopy" data-figma-node="4:9899">회의란 무엇일까요?</p>
          <h2 data-figma-node="4:9897">
            회의는 아이디어가 생성되고, 의견이 충돌하며,
            <br />
            여러 가능성을 두고 대안이 오가는 복잡한 상호작용의 장입니다.
          </h2>
          <div className="note-stage-map" aria-label="Fisher decision process">
            {meetingStages.map((stage) => (
              <article className="note-stage-card" key={stage.number}>
                <strong>{stage.number}</strong>
                <h3>{stage.label}</h3>
                <p>{stage.body}</p>
              </article>
            ))}
          </div>
          <div className="note-track-grid" aria-label="Communication tracks">
            {communicationTracks.map((track) => (
              <article className="note-track-card" key={track.title}>
                <h3>{track.title}</h3>
                <p>{track.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="note-team-section" aria-label="Team analysis">
          <p className="note-kicker align-left" data-figma-node="4:9900">Team Analysis</p>
          <h2 data-figma-node="4:9901">
            팀 분석을 위한 평가 지표를 설정하고,
            <br />
            팀을 유형화했어요.
          </h2>
          <p data-figma-node="4:9902">
            어떤 회의는 원활하게 진행되는 반면, 어떤 회의는 어려움을 겪는 이유는 무엇일까요?
          </p>
          <div className="note-axis-chart" aria-label="Agile team attributes">
            <div className="note-chart-lines" aria-hidden="true" />
            {["인원 약 3~8명", "인원 유동성은 보통 정도", "프로덕트 제작 중심의 회의", "수평적 관계의 조직 문화", "애자일한 팀"].map(
              (label) => (
                <span key={label}>{label}</span>
              ),
            )}
          </div>
          <div className="note-team-table" aria-label="Team type comparison">
            {teamAxes.map((axis) => (
              <div className="note-team-row" key={axis.label}>
                <strong>{axis.label}</strong>
                <span>{axis.classic}</span>
                <em>VS</em>
                <span>{axis.agile}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="note-target-section" aria-label="Target agile team">
          <p className="note-kicker align-left" data-figma-node="4:9906">Target</p>
          <h2 data-figma-node="4:9904">인원 3~8명의 애자일한 팀에 집중하기로 했어요.</h2>
          <p data-figma-node="4:9905">
            빠른 의사결정, 반복적인 아이디어 수정, 유연한 피봇팅이 핵심인 팀에 고민할 지점이 많았습니다.
          </p>
        </section>

        <section className="note-field-section" aria-label="Field research">
          <p className="note-kicker" data-figma-node="4:9880">Field Research</p>
          <h2>타겟 유형의 팀 회의를 참여 관찰하며, 회의에서 발생하는 어려움과 극복 방식을 살펴봤어요.</h2>
          <div className="note-observation-card">
            <h3>참여 관찰 개요</h3>
            <dl>
              <div><dt>참여 관찰 대상</dt><dd>3~8명 규모, 주 1회 이상 정기 회의가 있는 팀</dd></div>
              <div><dt>관찰 팀 수</dt><dd>4팀</dd></div>
              <div><dt>참여 관찰 방법</dt><dd>실제 회의 현장을 직접 관찰하여 회의록 데이터 수집</dd></div>
            </dl>
          </div>
        </section>

        <section className="note-solution-section" aria-label="Back on Track solution">
          <h2 data-figma-node="4:11001">Back on Track</h2>
          <div className="note-product-shot" aria-hidden="true">
            <div className="note-sidebar" />
            <div className="note-product-canvas">
              <span />
              <span />
              <span />
            </div>
          </div>
          <div className="note-library" aria-label="Library cards">
            <p>Library</p>
            <h3>팀의 회의 맥락을 구조화하는 실시간 라이브러리</h3>
            <div>
              {libraryCards.map((card) => (
                <span key={card}>{card}</span>
              ))}
            </div>
          </div>
        </section>

        <footer className="note-footer" aria-label="Project credits">
          <p data-figma-node="4:11005">2025 UXUI Project</p>
          <div>
            {noteMembers.map((member) => (
              <span key={member.englishName}>
                <strong>{member.koreanName}</strong>
                {member.englishName}
              </span>
            ))}
          </div>
        </footer>
      </div>
    </main>
  );
}
