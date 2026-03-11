import { useState, useRef, useEffect, useCallback } from "react";

// ─── Simulated document corpus ───────────────────────────────────────────────
const DOCUMENTS = [
  {
    id: "doc1",
    title: "AML Policy Framework 2024",
    category: "Compliance",
    tag: "AML",
    date: "Jan 2024",
    content: `Anti-Money Laundering (AML) Policy: All transactions above $10,000 must be reported to FinCEN via CTR filing within 15 days. Suspicious Activity Reports (SARs) must be filed within 30 days of detection. Customer Due Diligence (CDD) requires verification of beneficial ownership for legal entity customers. Enhanced Due Diligence (EDD) is required for high-risk customers, PEPs, and correspondent banking relationships. KYC onboarding must include identity verification, source of funds, and transaction monitoring setup. OFAC screening is mandatory for all new clients and on an ongoing basis. Sanctions violations carry immediate account freeze and escalation to Compliance leadership.`,
  },
  {
    id: "doc2",
    title: "Basel III Capital Requirements",
    category: "Risk",
    tag: "Capital",
    date: "Mar 2024",
    content: `Basel III framework mandates a minimum Common Equity Tier 1 (CET1) ratio of 4.5% of risk-weighted assets. The Tier 1 capital ratio minimum is 6%, and total capital ratio minimum is 8%. JPMorgan must maintain a Capital Conservation Buffer of 2.5% above minimum CET1. The Countercyclical Buffer ranges from 0–2.5% depending on macro conditions. Leverage ratio must be maintained above 3%. Liquidity Coverage Ratio (LCR) requires sufficient HQLA to cover 30-day stressed outflows at 100%. Net Stable Funding Ratio (NSFR) must exceed 100%. Systemically Important Financial Institution (SIFI) surcharge adds additional 1–3.5% CET1 buffer.`,
  },
  {
    id: "doc3",
    title: "GDPR & Data Privacy Guidelines",
    category: "Legal",
    tag: "GDPR",
    date: "Feb 2024",
    content: `GDPR compliance requires lawful basis for all personal data processing. Data subjects have rights to access, rectification, erasure, portability, and objection. Data Protection Impact Assessments (DPIA) are mandatory for high-risk processing activities. Data breach notification to supervisory authority must occur within 72 hours of discovery. Retention periods must be defined and enforced: customer data retained for 7 years post-relationship. Cross-border data transfers outside EEA require Standard Contractual Clauses or adequacy decisions. A Data Protection Officer (DPO) must be appointed and available to regulators. Privacy by design must be embedded in all new system development.`,
  },
  {
    id: "doc4",
    title: "Volcker Rule Trading Restrictions",
    category: "Compliance",
    tag: "Volcker",
    date: "Dec 2023",
    content: `The Volcker Rule prohibits proprietary trading in securities, derivatives, and commodity futures by banking entities. Permitted activities include market-making, underwriting, hedging, and trading in government securities. Compliance programs must include internal controls, independent testing, management reporting, and training. Metrics reporting is required for covered trading desks including risk limits, P&L attribution, and inventory turnover. CEO attestation of compliance program effectiveness is required annually. Extraterritorial application covers US banking entities and their foreign affiliates. Penalties for violation can reach $1M per day plus disgorgement of profits.`,
  },
  {
    id: "doc5",
    title: "Operational Risk Management Policy",
    category: "Risk",
    tag: "OpRisk",
    date: "Apr 2024",
    content: `Operational risk is defined as the risk of loss from inadequate or failed internal processes, people, systems, or external events. The firm uses the Advanced Measurement Approach (AMA) for operational risk capital calculation. Loss event data must be captured for all events above $10,000 threshold and reported monthly. Key Risk Indicators (KRIs) are monitored quarterly with escalation triggers. Business Continuity Plans (BCP) must be tested annually. Cyber incidents must be escalated to CISO within 1 hour of detection. Third-party risk assessments are required before onboarding new vendors. Scenario analysis must be conducted annually for tail-risk events including cyberattacks, natural disasters, and pandemic scenarios.`,
  },
  {
    id: "doc6",
    title: "Dodd-Frank Reporting Requirements",
    category: "Legal",
    tag: "Dodd-Frank",
    date: "Nov 2023",
    content: `Dodd-Frank Title VII mandates central clearing for standardized OTC derivatives through registered DCOs. Swap data must be reported to registered SDRs within T+1. Real-time public reporting of swap transactions is required for price transparency. Margin requirements apply to uncleared swaps: initial margin and variation margin for all covered entities. JPMorgan as a Swap Dealer must register with CFTC and comply with business conduct standards. Resolution planning (Living Wills) must be submitted to FDIC and Federal Reserve annually. Stress testing under DFAST must project capital ratios under severely adverse scenarios. Proprietary trading metrics must be reported to regulators quarterly.`,
  },
  {
    id: "doc7",
    title: "Cloud Security & Infrastructure Policy",
    category: "Technology",
    tag: "Cloud",
    date: "May 2024",
    content: `All cloud deployments must follow the Shared Responsibility Model with documented controls for each layer. Multi-cloud strategy uses AWS as primary, Azure as secondary for regulated workloads. Data classification is mandatory: Public, Internal, Confidential, and Restricted. Restricted data (PII, PCI, trade secrets) cannot be stored in public cloud without encryption at rest using AES-256 and FIPS 140-2 validated modules. Network segmentation requires VPC/VNet isolation with private endpoints. Zero-trust architecture mandates MFA, least-privilege IAM, and continuous access verification. Penetration testing is required quarterly for cloud environments. Cloud spend must be tagged by cost center, environment, and business line for FinOps tracking.`,
  },
  {
    id: "doc8",
    title: "MiFID II Transaction Reporting",
    category: "Compliance",
    tag: "MiFID II",
    date: "Jan 2024",
    content: `MiFID II requires transaction reports to be submitted to the national competent authority (NCA) by end of T+1. Reports must include 65 data fields covering instrument identification (ISIN/LEI), counterparty details, price, quantity, and timestamps. Best execution policies must be reviewed annually and published on the firm website. Pre-trade and post-trade transparency obligations apply to equity and non-equity instruments traded on venues. Research unbundling requires explicit payment for investment research via Research Payment Accounts (RPAs). Product governance rules require manufacturers and distributors to define and review target markets. Record-keeping of all communications related to client orders must be maintained for 5 years. LEI (Legal Entity Identifier) is required for all legal entity counterparties.`,
  },
];

// ─── Simple BM25-style relevance scoring ─────────────────────────────────────
function scoreDocument(doc, query) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const text = (doc.title + " " + doc.content + " " + doc.category + " " + doc.tag).toLowerCase();
  let score = 0;
  words.forEach((w) => {
    const matches = (text.match(new RegExp(w, "g")) || []).length;
    score += matches * (doc.title.toLowerCase().includes(w) ? 3 : 1);
  });
  return score;
}

function retrieveChunks(query, topK = 3) {
  return DOCUMENTS.map((doc) => ({ ...doc, score: scoreDocument(doc, query) }))
    .filter((d) => d.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

// ─── Call Claude API with RAG context ────────────────────────────────────────
async function askWithRAG(query, chunks, history) {
  const context = chunks
    .map((c) => `[${c.title} | ${c.category} | ${c.date}]\n${c.content}`)
    .join("\n\n---\n\n");

  const systemPrompt = `You are an expert JPMorgan internal regulatory and policy knowledge assistant. 
You help employees quickly find answers about compliance, risk, legal, and technology policies.

Use ONLY the provided document context to answer. Be precise, cite the specific document name, 
and highlight key numbers, thresholds, and deadlines. If context is insufficient, say so clearly.
Format answers with clear structure: lead with a direct answer, then supporting details.
Always mention the source document(s) by name.

CONTEXT DOCUMENTS:
${context || "No relevant documents found for this query."}`;

  const messages = [
    ...history.slice(-6).map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: query },
  ];

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
      messages,
    }),
  });

  const data = await response.json();
  return data.content?.[0]?.text || "Unable to generate response.";
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);
const DocIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
  </svg>
);
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const BotIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /><line x1="12" y1="3" x2="12" y2="1" /><line x1="9" y1="11" x2="9" y2="13" /><line x1="15" y1="11" x2="15" y2="13" />
  </svg>
);
const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const ChevronIcon = ({ open }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const SparkleIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" />
  </svg>
);

const CATEGORY_COLORS = {
  Compliance: { bg: "#FEF3C7", text: "#92400E", border: "#FCD34D" },
  Risk: { bg: "#FEE2E2", text: "#991B1B", border: "#FCA5A5" },
  Legal: { bg: "#EDE9FE", text: "#5B21B6", border: "#C4B5FD" },
  Technology: { bg: "#D1FAE5", text: "#065F46", border: "#6EE7B7" },
};

const SUGGESTED = [
  "What are the AML reporting thresholds?",
  "What is the minimum CET1 ratio under Basel III?",
  "When must data breaches be reported under GDPR?",
  "What does the Volcker Rule prohibit?",
  "What are cloud data classification levels?",
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function JPMorganRAG() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState([]);
  const [expandedSources, setExpandedSources] = useState({});
  const [docSearch, setDocSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = useCallback(async (text) => {
    const query = (text || input).trim();
    if (!query || loading) return;
    setInput("");
    const userMsg = { role: "user", content: query, id: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setSources([]);

    const chunks = retrieveChunks(query);
    setSources(chunks);

    const history = messages.slice(-6);
    const answer = await askWithRAG(query, chunks, history);

    setMessages((prev) => [...prev, { role: "assistant", content: answer, id: Date.now() + 1, sources: chunks }]);
    setLoading(false);
  }, [input, loading, messages]);

  const filteredDocs = DOCUMENTS.filter((d) => {
    const matchesFilter = activeFilter === "All" || d.category === activeFilter;
    const matchesSearch = !docSearch || d.title.toLowerCase().includes(docSearch.toLowerCase()) || d.tag.toLowerCase().includes(docSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const categories = ["All", "Compliance", "Risk", "Legal", "Technology"];

  return (
    <div style={{
      fontFamily: "'Georgia', 'Times New Roman', serif",
      background: "#0B0E1A",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      color: "#E8E4D9",
    }}>
      {/* Header */}
      <header style={{
        background: "linear-gradient(135deg, #0D1117 0%, #111827 100%)",
        borderBottom: "1px solid #1E2A3A",
        padding: "0 24px",
        height: "58px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
        boxShadow: "0 2px 20px rgba(0,0,0,0.4)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{
            background: "linear-gradient(135deg, #C8971A, #E8B930)",
            borderRadius: "6px",
            width: "32px", height: "32px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "14px", fontWeight: "900", color: "#0B0E1A",
            letterSpacing: "-0.5px",
          }}>JP</div>
          <div>
            <div style={{ fontSize: "15px", fontWeight: "700", color: "#E8E4D9", letterSpacing: "0.3px" }}>
              PolicyIQ
            </div>
            <div style={{ fontSize: "10px", color: "#6B7A90", letterSpacing: "1.5px", textTransform: "uppercase", fontFamily: "monospace" }}>
              Regulatory Knowledge Assistant
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "6px",
            background: "#0F2A1A", border: "1px solid #1A4A2A",
            borderRadius: "20px", padding: "4px 12px",
          }}>
            <div style={{ width: "6px", height: "6px", background: "#22C55E", borderRadius: "50%", boxShadow: "0 0 6px #22C55E" }} />
            <span style={{ fontSize: "11px", color: "#4ADE80", fontFamily: "monospace" }}>{DOCUMENTS.length} docs indexed</span>
          </div>
          <button onClick={() => setSidebarOpen(s => !s)} style={{
            background: sidebarOpen ? "#1E2A3A" : "transparent",
            border: "1px solid #1E2A3A",
            borderRadius: "6px", padding: "6px 10px",
            color: "#8B9AB0", cursor: "pointer", fontSize: "11px",
            fontFamily: "monospace", letterSpacing: "0.5px",
          }}>
            {sidebarOpen ? "Hide Docs" : "Show Docs"}
          </button>
        </div>
      </header>

      {/* Body */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", height: "calc(100vh - 58px)" }}>

        {/* Sidebar */}
        {sidebarOpen && (
          <aside style={{
            width: "280px", flexShrink: 0,
            background: "#0D1117",
            borderRight: "1px solid #1E2A3A",
            display: "flex", flexDirection: "column",
            overflow: "hidden",
          }}>
            <div style={{ padding: "16px", borderBottom: "1px solid #1E2A3A" }}>
              <div style={{ fontSize: "10px", color: "#6B7A90", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "10px", fontFamily: "monospace" }}>
                Document Corpus
              </div>
              {/* Search */}
              <div style={{ position: "relative", marginBottom: "10px" }}>
                <div style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#4A5A70" }}>
                  <SearchIcon />
                </div>
                <input
                  value={docSearch}
                  onChange={e => setDocSearch(e.target.value)}
                  placeholder="Search documents..."
                  style={{
                    width: "100%", background: "#141B26", border: "1px solid #1E2A3A",
                    borderRadius: "6px", padding: "7px 10px 7px 32px",
                    color: "#C8D0DC", fontSize: "12px", outline: "none",
                    fontFamily: "monospace", boxSizing: "border-box",
                  }}
                />
              </div>
              {/* Filters */}
              <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                {categories.map(cat => (
                  <button key={cat} onClick={() => setActiveFilter(cat)} style={{
                    padding: "3px 9px", borderRadius: "12px", fontSize: "10px",
                    fontFamily: "monospace", cursor: "pointer", letterSpacing: "0.3px",
                    background: activeFilter === cat ? "#C8971A" : "#141B26",
                    color: activeFilter === cat ? "#0B0E1A" : "#6B7A90",
                    border: activeFilter === cat ? "1px solid #C8971A" : "1px solid #1E2A3A",
                    fontWeight: activeFilter === cat ? "700" : "400",
                    transition: "all 0.15s",
                  }}>{cat}</button>
                ))}
              </div>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
              {filteredDocs.map(doc => {
                const colors = CATEGORY_COLORS[doc.category] || CATEGORY_COLORS.Compliance;
                const isExp = expandedSources[doc.id];
                return (
                  <div key={doc.id} style={{
                    background: "#111827", border: "1px solid #1E2A3A",
                    borderRadius: "8px", marginBottom: "8px",
                    overflow: "hidden", transition: "border-color 0.2s",
                  }}>
                    <div
                      onClick={() => setExpandedSources(s => ({ ...s, [doc.id]: !s[doc.id] }))}
                      style={{ padding: "10px 12px", cursor: "pointer", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                          <DocIcon />
                          <span style={{ fontSize: "11px", color: "#C8D0DC", fontWeight: "600", lineHeight: "1.3" }}>{doc.title}</span>
                        </div>
                        <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                          <span style={{
                            fontSize: "9px", padding: "1px 6px", borderRadius: "10px", fontFamily: "monospace",
                            background: colors.bg, color: colors.text, border: `1px solid ${colors.border}`,
                          }}>{doc.tag}</span>
                          <span style={{ fontSize: "9px", color: "#4A5A70", fontFamily: "monospace" }}>{doc.date}</span>
                        </div>
                      </div>
                      <ChevronIcon open={isExp} />
                    </div>
                    {isExp && (
                      <div style={{
                        padding: "0 12px 10px",
                        fontSize: "10px", color: "#6B7A90", lineHeight: "1.6",
                        borderTop: "1px solid #1A2030", paddingTop: "8px",
                        fontFamily: "monospace",
                      }}>
                        {doc.content.slice(0, 200)}...
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>
        )}

        {/* Chat Area */}
        <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#0B0E1A" }}>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Welcome */}
            {messages.length === 0 && (
              <div style={{ textAlign: "center", marginTop: "40px", animation: "fadeUp 0.6s ease" }}>
                <div style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: "60px", height: "60px",
                  background: "linear-gradient(135deg, #1A2A1A, #0F1F0F)",
                  border: "1px solid #2A4A2A", borderRadius: "16px",
                  marginBottom: "16px", color: "#22C55E",
                }}>
                  <BotIcon />
                </div>
                <h2 style={{ fontSize: "22px", color: "#E8E4D9", margin: "0 0 8px", fontWeight: "400", letterSpacing: "0.5px" }}>
                  PolicyIQ — Regulatory Knowledge
                </h2>
                <p style={{ fontSize: "13px", color: "#4A5A70", margin: "0 0 32px", fontFamily: "monospace", maxWidth: "480px", margin: "0 auto 32px" }}>
                  Ask questions about JPMorgan's compliance policies, risk frameworks, legal requirements, and technology standards. Answers are grounded in indexed policy documents.
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", maxWidth: "560px", margin: "0 auto" }}>
                  {SUGGESTED.map((s, i) => (
                    <button key={i} onClick={() => handleSend(s)} style={{
                      background: "#111827", border: "1px solid #1E2A3A",
                      borderRadius: "20px", padding: "8px 14px",
                      color: "#8B9AB0", fontSize: "12px", cursor: "pointer",
                      fontFamily: "monospace", transition: "all 0.15s",
                      display: "flex", alignItems: "center", gap: "6px",
                    }}
                      onMouseEnter={e => { e.target.style.borderColor = "#C8971A"; e.target.style.color = "#C8971A"; }}
                      onMouseLeave={e => { e.target.style.borderColor = "#1E2A3A"; e.target.style.color = "#8B9AB0"; }}
                    >
                      <SparkleIcon />{s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((msg, i) => (
              <div key={msg.id || i} style={{
                display: "flex", gap: "12px",
                flexDirection: msg.role === "user" ? "row-reverse" : "row",
                animation: "fadeUp 0.3s ease",
              }}>
                {/* Avatar */}
                <div style={{
                  width: "32px", height: "32px", borderRadius: "8px", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: msg.role === "user"
                    ? "linear-gradient(135deg, #1A2A3A, #243040)"
                    : "linear-gradient(135deg, #1A2A1A, #0F2A1A)",
                  border: msg.role === "user" ? "1px solid #2A3A4A" : "1px solid #1A4A2A",
                  color: msg.role === "user" ? "#6BA3D0" : "#22C55E",
                }}>
                  {msg.role === "user" ? <UserIcon /> : <BotIcon />}
                </div>

                <div style={{ maxWidth: "75%", display: "flex", flexDirection: "column", gap: "8px" }}>
                  {/* Bubble */}
                  <div style={{
                    background: msg.role === "user"
                      ? "linear-gradient(135deg, #1A2A3A, #141F2E)"
                      : "#111827",
                    border: msg.role === "user" ? "1px solid #1E3A54" : "1px solid #1E2A3A",
                    borderRadius: msg.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                    padding: "14px 18px",
                    fontSize: "13px",
                    lineHeight: "1.75",
                    color: "#C8D0DC",
                    fontFamily: msg.role === "assistant" ? "'Georgia', serif" : "monospace",
                    whiteSpace: "pre-wrap",
                  }}>
                    {msg.content}
                  </div>

                  {/* Source Citations */}
                  {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                      <span style={{ fontSize: "10px", color: "#4A5A70", fontFamily: "monospace", alignSelf: "center" }}>Sources:</span>
                      {msg.sources.map(src => {
                        const colors = CATEGORY_COLORS[src.category] || CATEGORY_COLORS.Compliance;
                        return (
                          <span key={src.id} style={{
                            fontSize: "10px", padding: "2px 8px", borderRadius: "10px",
                            background: colors.bg, color: colors.text,
                            border: `1px solid ${colors.border}`,
                            fontFamily: "monospace",
                          }}>
                            {src.title}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading */}
            {loading && (
              <div style={{ display: "flex", gap: "12px", animation: "fadeUp 0.3s ease" }}>
                <div style={{
                  width: "32px", height: "32px", borderRadius: "8px", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "linear-gradient(135deg, #1A2A1A, #0F2A1A)",
                  border: "1px solid #1A4A2A", color: "#22C55E",
                }}><BotIcon /></div>
                <div style={{
                  background: "#111827", border: "1px solid #1E2A3A",
                  borderRadius: "4px 16px 16px 16px", padding: "14px 20px",
                  display: "flex", gap: "6px", alignItems: "center",
                }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: "6px", height: "6px", borderRadius: "50%",
                      background: "#C8971A",
                      animation: `bounce 1.2s ${i * 0.2}s ease-in-out infinite`,
                    }} />
                  ))}
                  <span style={{ fontSize: "11px", color: "#4A5A70", fontFamily: "monospace", marginLeft: "8px" }}>
                    Searching {sources.length > 0 ? sources.length : "..."} documents...
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input Area */}
          <div style={{
            padding: "16px 24px 20px",
            background: "#0D1117",
            borderTop: "1px solid #1E2A3A",
          }}>
            {/* Active sources bar */}
            {sources.length > 0 && !loading && (
              <div style={{
                display: "flex", alignItems: "center", gap: "8px",
                marginBottom: "12px", padding: "6px 12px",
                background: "#0F1A0F", border: "1px solid #1A3A1A",
                borderRadius: "6px",
              }}>
                <span style={{ fontSize: "10px", color: "#4ADE80", fontFamily: "monospace" }}>↑ Retrieved:</span>
                {sources.map(s => (
                  <span key={s.id} style={{ fontSize: "10px", color: "#2D6A4F", fontFamily: "monospace" }}>{s.title}</span>
                ))}
              </div>
            )}

            <div style={{ display: "flex", gap: "10px" }}>
              <div style={{ flex: 1, position: "relative" }}>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Ask about regulatory policies, compliance requirements, risk frameworks..."
                  disabled={loading}
                  style={{
                    width: "100%", boxSizing: "border-box",
                    background: "#111827", border: "1px solid #1E2A3A",
                    borderRadius: "10px", padding: "13px 18px",
                    color: "#C8D0DC", fontSize: "13px",
                    outline: "none", fontFamily: "monospace",
                    transition: "border-color 0.2s",
                    opacity: loading ? 0.5 : 1,
                  }}
                  onFocus={e => e.target.style.borderColor = "#C8971A"}
                  onBlur={e => e.target.style.borderColor = "#1E2A3A"}
                />
              </div>
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                style={{
                  background: !input.trim() || loading
                    ? "#1A2A1A"
                    : "linear-gradient(135deg, #C8971A, #E8B930)",
                  border: "none", borderRadius: "10px",
                  width: "46px", height: "46px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: !input.trim() || loading ? "not-allowed" : "pointer",
                  color: !input.trim() || loading ? "#2A4A2A" : "#0B0E1A",
                  transition: "all 0.2s", flexShrink: 0,
                  boxShadow: !input.trim() || loading ? "none" : "0 4px 14px rgba(200,151,26,0.3)",
                }}
              >
                <SendIcon />
              </button>
            </div>
            <div style={{ textAlign: "center", marginTop: "10px" }}>
              <span style={{ fontSize: "10px", color: "#2A3A4A", fontFamily: "monospace" }}>
                RAG-powered · {DOCUMENTS.length} policy documents · Answers grounded in source documents
              </span>
            </div>
          </div>
        </main>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1E2A3A; border-radius: 2px; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
