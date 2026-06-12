import {
  communicationTracks,
  genieNeeds,
  meetingBottlenecks,
  meetingHelpers,
  meetingStages,
  noteMembers,
  teamAxes,
} from "./skillUpNoteContent";
import { SkillUpNoteSolution } from "./SkillUpNoteSolution";

export function SkillUpNotePage() {
  return (
    <main className="skill-up-note-page" data-subpage="skill-up-note" data-testid="skill-up-note-page">
      <div className="skill-up-note-frame" data-testid="skill-up-note-frame" aria-label="Skill Up Note Behance final">
        <section className="note-hero" aria-label="Skill Up Note opening">
          <img
            className="note-hero-mockup"
            data-testid="figma-hero-mockup"
            src="/figma/skill-up-note/hero-macbook-source.png"
            alt=""
            aria-hidden="true"
          />
          <img
            className="note-hero-logo"
            data-testid="figma-elif-logo"
            src="/figma/skill-up-note/elif-logo-source.svg"
            alt="ELiF"
          />
          <p className="note-hero-subtitle" data-figma-node="4:9891">
            Higher Fidelity, Further Possibilties
          </p>
        </section>

        <section className="note-question-band" aria-label="Core question">
          <div className="note-question-image" aria-hidden="true">
            <img
              className="note-question-photo"
              data-testid="figma-question-photo"
              src="/figma/skill-up-note/question-photo-source.png"
              alt=""
            />
          </div>
          <div className="note-question-overlay" aria-hidden="true" />
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

        <section className="note-participant-section" aria-label="Participant observation">
          <p className="note-kicker">Participant Observation</p>
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

        <section className="note-bottleneck-section" aria-label="Meeting bottlenecks and helpers">
          <h2>여러 팀에서 공통적으로 발생한 어려움</h2>
          <div className="note-bottleneck-list">
            {meetingBottlenecks.map((item) => (
              <article className="note-bottleneck-card" key={item.title}>
                <span aria-hidden="true">↯</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
          <div className="note-bottleneck-connector" aria-hidden="true" />
          <p className="note-bottleneck-question">어려움을 해소해 준 요인은?</p>
          <h2 className="note-helper-title">회의 병목의 극복을 도운 참여자들</h2>
          <p className="note-helper-subtitle">참여 관찰 결과, 진행이 잘 이루어진 팀들에서 공통적으로 포착된 비공식적 역할</p>
          <div className="note-helper-grid">
            {meetingHelpers.map((helper) => (
              <article className="note-helper-card" key={helper.title}>
                <h3><span>{helper.index}</span>{helper.title}</h3>
                <div className="note-helper-bars" aria-label={`${helper.title} role profile`}>
                  {["어젠다 제시", "구체화", "피드백", "피드백 반영", "환기성 발언"].map((label, index) => (
                    <div key={label}>
                      <span>{label}</span>
                      <i style={{ width: `${helper.values[index]}%` }} />
                    </div>
                  ))}
                </div>
                <p>{helper.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="note-genie-section" aria-label="Helper genie needs">
          <div className="note-genie-question">
            <h2>회의에 만능 헬퍼 ‘지니’가 있다면, 어떤 역할을 해주길 바라나요?</h2>
            <p>참가자들이 구상한 만능 회의 헬퍼 ‘지니’</p>
          </div>
          <div className="note-genie-grid">
            {genieNeeds.map((need) => (
              <article className="note-genie-card" key={need.body}>
                <span aria-hidden="true">↱</span>
                <p>{need.body}</p>
                <small>{need.author}</small>
              </article>
            ))}
          </div>
          <div className="note-sticky-note one" aria-hidden="true" />
          <div className="note-sticky-note two" aria-hidden="true" />
          <div className="note-paper-note" aria-hidden="true" />
        </section>

        <section className="note-field-section" aria-label="Field research">
          <img
            className="note-field-photo"
            data-testid="figma-field-photo"
            src="/figma/skill-up-note/field-research-photo.png"
            alt=""
            aria-hidden="true"
          />
          <div className="note-field-colorwash" aria-hidden="true" />
          <div className="note-field-blur" aria-hidden="true" />
          <div className="note-field-copy">
            <p className="note-field-eyebrow" data-figma-node="4:9880">Field Research</p>
            <h2>
              회의 중 AI 개입의 필요성<sup>1</sup>과
              <br />
              사용자의 니즈<sup>2</sup>를 파악하기 위해,
              <br />
              종합 워크숍을 진행했어요
            </h2>
            <p>제3의 조력자가 회의 흐름과 의사결정 과정에 미치는 영향을 탐색하고, 보조 AI 사용성 개선을 위한 인사이트를 도출했습니다.</p>
            <ol>
              <li>AI 개입의 필요성을 확인하기 위해 오즈의 마법사 기법 기반 세션 구성 및 FGI 수행</li>
              <li>회의 중 필요를 파악하기 위한 참여 디자인 세션</li>
            </ol>
          </div>
          <dl className="note-field-meta" aria-label="Field research workshop summary">
            <div><dt>워크숍 대상자</dt><dd>6명</dd></div>
            <div><dt>인터뷰 대상자</dt><dd>6명</dd></div>
            <div><dt>세션 1</dt><dd><strong>Experimentation</strong> / methodology: Wizard-of-Oz based</dd></div>
            <div><dt>세션 2</dt><dd><strong>Focus Group Interview (FGI)</strong></dd></div>
            <div><dt>세션 3</dt><dd><strong>Participatory Design</strong></dd></div>
          </dl>
        </section>

        <SkillUpNoteSolution />

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
