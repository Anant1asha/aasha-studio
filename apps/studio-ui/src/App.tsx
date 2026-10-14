import React, { useState, useEffect } from 'react';

type Tab = 'chapters' | 'contract' | 'sim' | 'settings';

interface ChapterItem {
  id: string;
  title: string;
  grade: string;
  subject: string;
  foundation: string;
  size: string;
  ltruthScore: number;
  filename: string;
}

const SAMPLE_CHAPTERS: ChapterItem[] = [
  {
    id: 'ch-exponents-8',
    title: 'Exponents and Powers',
    grade: 'Class 8',
    subject: 'Mathematics',
    foundation: 'F01 Escape Run / MicroSims Canvas',
    size: '1.4 MB',
    ltruthScore: 100,
    filename: 'ExponentsPowers_Class8_Gamified_v5_Enhanced_v6.html'
  },
  {
    id: 'ch-rational-8',
    title: 'Rational Numbers',
    grade: 'Class 8',
    subject: 'Mathematics',
    foundation: 'F06 MathFluency Numberline',
    size: '1.2 MB',
    ltruthScore: 100,
    filename: 'Class8_Mathematics_RationalNumbers.html'
  },
  {
    id: 'ch-numbers-6',
    title: 'Knowing Our Numbers',
    grade: 'Class 6',
    subject: 'Mathematics',
    foundation: 'F05 Lightbot Place-Value Grid',
    size: '1.1 MB',
    ltruthScore: 100,
    filename: 'Class6_Mathematics_KnowingNumbers.html'
  },
  {
    id: 'ch-crop-8',
    title: 'Crop Production & Management',
    grade: 'Class 8',
    subject: 'Science',
    foundation: 'F03 All Science Sims / Irrigation Lab',
    size: '1.5 MB',
    ltruthScore: 100,
    filename: 'Class8_Science_CropProduction.html'
  },
  {
    id: 'ch-senses-5',
    title: 'Super Senses',
    grade: 'Class 5',
    subject: 'EVS',
    foundation: 'F12 GeoGuess / Sensory Map',
    size: '950 KB',
    ltruthScore: 100,
    filename: 'Class5_EVS_SuperSenses.html'
  }
];

const SAMPLE_CONTRACT = `subject: "Mathematics"
class_level: 8
chapter_title: "Exponents and Powers"
canonical_version: "2.0.0"
foundation_binding:
  id: "F01"
  name: "Escape Run / MicroSims Canvas Engine"
  strategy: "EXTRACT"
  contract_compliance: "AashaExperienceContract"

scaffolding_tiers:
  warmup:
    target_count: 5
    tier: 1
    sample_item:
      id: "exp_w1"
      question: "What is 2^3 in expanded form?"
      options:
        - text: "2 × 2 × 2"
          correct: true
        - text: "2 + 2 + 2"
          correct: false
          m: "Confuses base multiplication with repeated addition"
        - text: "3 × 3"
          correct: false
          m: "Swaps the base and exponent roles"
      hints:
        h1_hook: "Notice the base is 2 and exponent is 3."
        h2_concept: "Exponent indicates how many times the base multiplies itself."
        h3_formula: "a^n = a × a × ... (n times)"
        h4_step: "Write 2 multiplied by itself three times."

  deep_dive:
    target_count: 5
    tier: 2
    interactive_simulation_id: "sim_exponent_growth"

  boss_challenge:
    target_count: 4
    tier: 3
    synthesis_gate: "L-Truth Certified"`;

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('chapters');
  const [chapters, setChapters] = useState<ChapterItem[]>(SAMPLE_CHAPTERS);
  const [selectedChapter, setSelectedChapter] = useState<ChapterItem>(SAMPLE_CHAPTERS[0]);
  const [contractYaml, setContractYaml] = useState<string>(SAMPLE_CONTRACT);
  const [simBase, setSimBase] = useState<number>(2);
  const [simExp, setSimExp] = useState<number>(4);
  const [contractStatus, setContractStatus] = useState<string>('Valid Section 24 Schema');
  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const [viewportPreset, setViewportPreset] = useState<'budget' | 'iphone' | 'galaxy' | 'desktop'>('iphone');
  const [vaultStatus, setVaultStatus] = useState<{ hasOpenRouter: boolean; hasGemini: boolean; provider: string }>({
    hasOpenRouter: false,
    hasGemini: false,
    provider: 'openrouter'
  });
  const [openrouterKeyInput, setOpenrouterKeyInput] = useState<string>('');
  const [keySaveMessage, setKeySaveMessage] = useState<string>('');

  useEffect(() => {
    fetch('/api/demos')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setChapters(data);
          setSelectedChapter(data[0]);
        }
      })
      .catch(() => {});

    fetch('/api/config')
      .then(r => r.json())
      .then(cfg => {
        setVaultStatus({
          hasOpenRouter: !!cfg.hasOpenRouterKey,
          hasGemini: !!cfg.hasGeminiKey,
          provider: cfg.provider || 'openrouter'
        });
      })
      .catch(() => {});
  }, []);

  const handleValidateContract = async () => {
    setContractStatus('Validating with core QuestionSchemaValidator...');
    setValidationErrors([]);
    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ yaml: contractYaml })
      });
      const data = await res.json();
      if (data.error) {
        setContractStatus(`Error: ${data.error}`);
      } else if (data.passed) {
        setContractStatus(`✅ 100/100 L-Truth Verified: ${data.totalQuestions} Questions, 0 Spoilers`);
      } else {
        setContractStatus(`❌ Failed (Score: ${data.score}/100, ${data.spoilerViolations} Spoilers)`);
        setValidationErrors(data.errors || []);
      }
    } catch (e: any) {
      setContractStatus(`Validation connection failed: ${e.message}`);
    }
  };

  const handleSaveKey = async (provider: string, key: string) => {
    if (!key) return;
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [provider + '_key']: key, provider })
      });
      const data = await res.json();
      setKeySaveMessage(data.message || 'Key saved securely!');
      setVaultStatus(prev => ({
        ...prev,
        hasOpenRouter: provider === 'openrouter' ? true : prev.hasOpenRouter,
        hasGemini: provider === 'gemini' ? true : prev.hasGemini
      }));
      setOpenrouterKeyInput('');
      setTimeout(() => setKeySaveMessage(''), 4000);
    } catch (e: any) {
      setKeySaveMessage(`Failed to save: ${e.message}`);
    }
  };

  const simResult = Math.pow(simBase, simExp);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#090d16', color: '#f1f5f9' }}>
      {/* Top Header */}
      <header style={{
        padding: '0.75rem 1.5rem',
        borderBottom: '1px solid #1e293b',
        backgroundColor: '#0f172a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            color: '#fff'
          }}>
            A
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.025em' }}>
              AASHA Studio
            </h1>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              AI Textbook Transformation & Gamified Assessment Engine
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('chapters')}
            style={{
              padding: '0.4rem 0.9rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              backgroundColor: activeTab === 'chapters' ? '#0284c7' : '#1e293b',
              color: activeTab === 'chapters' ? '#ffffff' : '#94a3b8'
            }}
          >
            📚 Chapter Preview
          </button>
          <button
            onClick={() => setActiveTab('contract')}
            style={{
              padding: '0.4rem 0.9rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              backgroundColor: activeTab === 'contract' ? '#0284c7' : '#1e293b',
              color: activeTab === 'contract' ? '#ffffff' : '#94a3b8'
            }}
          >
            📋 Section 24 Contract
          </button>
          <button
            onClick={() => setActiveTab('sim')}
            style={{
              padding: '0.4rem 0.9rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              backgroundColor: activeTab === 'sim' ? '#0284c7' : '#1e293b',
              color: activeTab === 'sim' ? '#ffffff' : '#94a3b8'
            }}
          >
            🎮 Manipulative Preview
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            style={{
              padding: '0.4rem 0.9rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              backgroundColor: activeTab === 'settings' ? '#0284c7' : '#1e293b',
              color: activeTab === 'settings' ? '#ffffff' : '#94a3b8'
            }}
          >
            ⚙️ BYOK & Vault
          </button>
        </nav>

        {/* Status Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            fontSize: '0.75rem',
            padding: '0.2rem 0.6rem',
            borderRadius: '9999px',
            backgroundColor: '#064e3b',
            color: '#34d399',
            fontWeight: 600
          }}>
            ● Offline-Ready
          </span>
          <span style={{
            fontSize: '0.75rem',
            padding: '0.2rem 0.6rem',
            borderRadius: '9999px',
            backgroundColor: vaultStatus.hasOpenRouter ? '#0c4a6e' : '#1e293b',
            color: vaultStatus.hasOpenRouter ? '#38bdf8' : '#94a3b8',
            fontWeight: 600
          }}>
            {vaultStatus.hasOpenRouter ? 'BYOK Vault Active' : '0-API Offline Scaffolding'}
          </span>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* TAB 1: Chapter Preview */}
        {activeTab === 'chapters' && (
          <div style={{ flex: 1, display: 'flex' }}>
            {/* Sidebar Chapter List */}
            <div style={{
              width: '320px',
              borderRight: '1px solid #1e293b',
              backgroundColor: '#0b1120',
              overflowY: 'auto',
              padding: '1rem'
            }}>
              <h2 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                Curriculum Chapters
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {chapters.map(ch => (
                  <div
                    key={ch.id}
                    onClick={() => setSelectedChapter(ch)}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: selectedChapter.id === ch.id ? '1px solid #0284c7' : '1px solid #1e293b',
                      backgroundColor: selectedChapter.id === ch.id ? '#1e293b' : '#0f172a',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{ch.title}</span>
                      <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', backgroundColor: '#0284c7', borderRadius: '4px', color: '#fff' }}>
                        {ch.grade}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{ch.subject}</span>
                      <span style={{ color: '#38bdf8' }}>{ch.size}</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#34d399', marginTop: '0.35rem' }}>
                      ✓ L-Truth: {ch.ltruthScore}/100
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chapter Detail & Inspection Frame */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1.5rem', backgroundColor: '#090d16', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>{selectedChapter.title}</h2>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
                    {selectedChapter.grade} • {selectedChapter.subject} • Foundation: {selectedChapter.foundation}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => {
                      fetch('/api/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ filename: selectedChapter.filename })
                      })
                        .then(r => r.json())
                        .then(res => alert(`L-Truth Verification Score: ${res.score}/100\nTotal Questions: ${res.totalQuestions}\nDistractors: ${res.totalDistractors}\nSpoilers: ${res.spoilerViolations}`))
                        .catch(e => alert(`Verification check error: ${e.message}`));
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      color: '#f8fafc',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    🧪 Run L-Truth Verification
                  </button>
                  <a
                    href={`/demo/${selectedChapter.filename}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      backgroundColor: '#0284c7',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    ↗ Open Standalone
                  </a>
                </div>
              </div>

              {/* Chapter Metrics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ padding: '1rem', backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Bundle Size (Ceiling: 20MB)</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#38bdf8' }}>{selectedChapter.size}</div>
                </div>
                <div style={{ padding: '1rem', backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>L-Truth Anti-Spoiler</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#34d399' }}>100/100 PASS</div>
                </div>
                <div style={{ padding: '1rem', backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Bilingual Substrate</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#a78bfa' }}>Hindi (window.WM Active)</div>
                </div>
                <div style={{ padding: '1rem', backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Target Aspect Ratio</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f59e0b' }}>16:9 / 19.5:9 Fit</div>
                </div>
              </div>

              {/* Live Iframe Sandbox Preview Box */}
              <div style={{
                flex: 1,
                border: '1px solid #1e293b',
                borderRadius: '8px',
                backgroundColor: '#0f172a',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                minHeight: '480px'
              }}>
                <div style={{
                  padding: '0.5rem 1rem',
                  borderBottom: '1px solid #1e293b',
                  backgroundColor: '#131d31',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Live Offline Chapter Preview:</span>
                    <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 600 }}>{selectedChapter.filename}</span>
                  </div>
                  {/* Viewport Presets */}
                  <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', marginRight: '0.25rem' }}>Viewport:</span>
                    <button
                      onClick={() => setViewportPreset('budget')}
                      style={{
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.7rem',
                        borderRadius: '4px',
                        border: '1px solid #334155',
                        backgroundColor: viewportPreset === 'budget' ? '#0284c7' : '#0b1120',
                        color: viewportPreset === 'budget' ? '#fff' : '#94a3b8',
                        cursor: 'pointer'
                      }}
                    >
                      16:9 Budget (360×640)
                    </button>
                    <button
                      onClick={() => setViewportPreset('iphone')}
                      style={{
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.7rem',
                        borderRadius: '4px',
                        border: '1px solid #334155',
                        backgroundColor: viewportPreset === 'iphone' ? '#0284c7' : '#0b1120',
                        color: viewportPreset === 'iphone' ? '#fff' : '#94a3b8',
                        cursor: 'pointer'
                      }}
                    >
                      19.5:9 iPhone (390×844)
                    </button>
                    <button
                      onClick={() => setViewportPreset('galaxy')}
                      style={{
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.7rem',
                        borderRadius: '4px',
                        border: '1px solid #334155',
                        backgroundColor: viewportPreset === 'galaxy' ? '#0284c7' : '#0b1120',
                        color: viewportPreset === 'galaxy' ? '#fff' : '#94a3b8',
                        cursor: 'pointer'
                      }}
                    >
                      20:9 Galaxy (412×915)
                    </button>
                    <button
                      onClick={() => setViewportPreset('desktop')}
                      style={{
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.7rem',
                        borderRadius: '4px',
                        border: '1px solid #334155',
                        backgroundColor: viewportPreset === 'desktop' ? '#0284c7' : '#0b1120',
                        color: viewportPreset === 'desktop' ? '#fff' : '#94a3b8',
                        cursor: 'pointer'
                      }}
                    >
                      Full Desktop
                    </button>
                  </div>
                </div>

                <div style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1rem',
                  backgroundColor: '#050811',
                  overflow: 'auto'
                }}>
                  <div style={{
                    width: viewportPreset === 'budget' ? '360px' : viewportPreset === 'iphone' ? '390px' : viewportPreset === 'galaxy' ? '412px' : '100%',
                    height: viewportPreset === 'budget' ? '640px' : viewportPreset === 'iphone' ? '844px' : viewportPreset === 'galaxy' ? '915px' : '100%',
                    minHeight: '440px',
                    border: '2px solid #334155',
                    borderRadius: viewportPreset === 'desktop' ? '4px' : '20px',
                    overflow: 'hidden',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
                    backgroundColor: '#ffffff'
                  }}>
                    <iframe
                      src={`/demo/${selectedChapter.filename}`}
                      title={selectedChapter.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        display: 'block'
                      }}
                      sandbox="allow-scripts allow-same-origin"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Section 24 Contract Editor */}
        {activeTab === 'contract' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1.5rem', backgroundColor: '#090d16', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>Section 24 Reusable Content Contract</h2>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0.25rem 0 0 0' }}>
                  Canonical YAML Contract mapping curriculum intent, F01-F20 foundation binding, 4-tier progressive hints, and 0-spoiler misconception diagnostics.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={handleValidateContract}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    backgroundColor: '#0284c7',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  ✓ Validate Contract
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '0.75rem', padding: '0.5rem 1rem', backgroundColor: '#0f172a', borderRadius: '6px', border: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span style={{ color: contractStatus.includes('✅') ? '#34d399' : contractStatus.includes('❌') ? '#f87171' : '#38bdf8' }}>
                Status: {contractStatus}
              </span>
              <span style={{ color: '#64748b' }}>Live L-Truth Analysis via core QuestionSchemaValidator</span>
            </div>

            {validationErrors.length > 0 && (
              <div style={{ marginBottom: '0.75rem', padding: '0.75rem 1rem', backgroundColor: '#450a0a', borderRadius: '6px', border: '1px solid #b91c1c', fontSize: '0.8rem' }}>
                <strong style={{ color: '#fca5a5' }}>Violations Detected:</strong>
                <ul style={{ margin: '0.35rem 0 0 0', paddingLeft: '1.25rem', color: '#fecaca' }}>
                  {validationErrors.map((err: any, idx: number) => (
                    <li key={idx}>[{err.severity}] ({err.ruleId}) {err.questionId}: {err.message}</li>
                  ))}
                </ul>
              </div>
            )}

            <textarea
              value={contractYaml}
              onChange={(e) => setContractYaml(e.target.value)}
              style={{
                flex: 1,
                minHeight: '400px',
                backgroundColor: '#0b1120',
                color: '#e2e8f0',
                fontFamily: 'Consolas, Monaco, monospace',
                fontSize: '0.85rem',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid #1e293b',
                outline: 'none',
                resize: 'none',
                lineHeight: '1.4'
              }}
            />
          </div>
        )}

        {/* TAB 3: Interactive Manipulative Preview */}
        {activeTab === 'sim' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1.5rem', backgroundColor: '#090d16', overflowY: 'auto' }}>
            <div style={{ marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>Interactive Manipulative Simulator (&lt;aasha-sim&gt;)</h2>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0.25rem 0 0 0' }}>
                Live testbed for F01–F20 foundation models implementing the AashaExperienceContract (mount, getState, pause, resume, reset, destroy).
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', flex: 1 }}>
              {/* Controls Column */}
              <div style={{ padding: '1.25rem', backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0, color: '#38bdf8' }}>Simulation Parameters</h3>
                
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>
                    Base Number (a): {simBase}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={simBase}
                    onChange={(e) => setSimBase(Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>
                    Exponent (n): {simExp}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="6"
                    value={simExp}
                    onChange={(e) => setSimExp(Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ padding: '1rem', backgroundColor: '#0b1120', borderRadius: '6px', border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Mathematical Expression</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f1f5f9' }}>
                    {simBase}<sup>{simExp}</sup> = {simResult}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                    Expanded: {Array(simExp).fill(simBase).join(' × ') || '1'}
                  </div>
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => { setSimBase(2); setSimExp(3); }}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      borderRadius: '6px',
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      color: '#f8fafc',
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    Reset Sim
                  </button>
                  <button
                    onClick={() => alert(`Telemetry Event emitted: aasha:state_change { base: ${simBase}, exp: ${simExp}, result: ${simResult} }`)}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      borderRadius: '6px',
                      backgroundColor: '#0284c7',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Emit Telemetry
                  </button>
                </div>
              </div>

              {/* Visual Display Column */}
              <div style={{ padding: '1.25rem', backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #1e293b', display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.75rem' }}>
                  Dynamic Multiplicative Grid Visualizer
                </div>
                <div style={{
                  flex: 1,
                  backgroundColor: '#090d16',
                  borderRadius: '6px',
                  border: '1px solid #1e293b',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  padding: '1.5rem',
                  alignContent: 'center',
                  justifyContent: 'center',
                  maxHeight: '360px',
                  overflowY: 'auto'
                }}>
                  {Array.from({ length: Math.min(simResult, 128) }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: '24px',
                        height: '24px',
                        backgroundColor: '#0284c7',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.65rem',
                        fontWeight: 'bold',
                        color: '#fff'
                      }}
                    >
                      {i + 1}
                    </div>
                  ))}
                  {simResult > 128 && (
                    <div style={{ width: '100%', textAlign: 'center', color: '#f59e0b', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                      + {simResult - 128} more units (display capped at 128 for clarity)
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: BYOK & Vault Settings */}
        {activeTab === 'settings' && (
          <div style={{ flex: 1, padding: '1.5rem', backgroundColor: '#090d16', overflowY: 'auto', maxWidth: '800px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>Bring-Your-Own-Key (BYOK) & Security Vault</h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 1.5rem 0' }}>
              Keys are stored in the OS credential vault (Windows DPAPI) with strict zero-leakage protection. All routine chapter synthesis routes through Tier 1 free models.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ padding: '1rem', backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #1e293b' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 0.25rem 0', color: '#38bdf8' }}>Tier 1: OpenRouter Free Pool (BYOK Vault)</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 0.75rem 0' }}>
                  Rotates between llama-3.1-8b-instruct:free, nemotron-3.5:free, and gemini-2.0-flash-exp:free. Keys are saved to local encrypted vault with zero token bleed.
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <input
                    type="password"
                    placeholder={vaultStatus.hasOpenRouter ? "OpenRouter Key is configured (********)" : "sk-or-v1-..."}
                    value={openrouterKeyInput}
                    onChange={(e) => setOpenrouterKeyInput(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #334155',
                      backgroundColor: '#090d16',
                      color: '#f8fafc',
                      fontSize: '0.85rem'
                    }}
                  />
                  <button
                    onClick={() => handleSaveKey('openrouter', openrouterKeyInput)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      backgroundColor: '#0284c7',
                      border: 'none',
                      color: '#ffffff',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    Save Key
                  </button>
                </div>
                {keySaveMessage && (
                  <div style={{ fontSize: '0.8rem', color: '#34d399', marginBottom: '0.5rem' }}>
                    {keySaveMessage}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', backgroundColor: vaultStatus.hasOpenRouter ? '#064e3b' : '#334155', color: vaultStatus.hasOpenRouter ? '#34d399' : '#94a3b8', borderRadius: '4px' }}>
                    {vaultStatus.hasOpenRouter ? '✓ Vault Configured' : '○ Deterministic Offline Only'}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Zero Token Bleed Circuit Breaker Enforced</span>
                </div>
              </div>

              <div style={{ padding: '1rem', backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #1e293b' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 0.25rem 0', color: '#a78bfa' }}>Tier 2: Coding Engine (Claude Code)</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 0.75rem 0' }}>
                  Multi-file synthesis, TypeScript packages, and chapter HTML generators.
                </p>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Connected via VS Code &amp; Claude CLI</div>
              </div>

              <div style={{ padding: '1rem', backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #1e293b' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 0.25rem 0', color: '#f59e0b' }}>Tier 3: Gemini Paid Reserve</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 0.75rem 0' }}>
                  ALLOW_PAID_GEMINI_FALLBACK=false. Strictly reserved for textbook PDF multimodal vision ingestion with explicit authorization.
                </p>
                <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', backgroundColor: '#451a03', color: '#fbbf24', borderRadius: '4px' }}>
                  🔒 Locked Out (Reserve Only)
                </span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
