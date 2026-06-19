/* KSC/NIS2 Compliance Quiz v2 — quiz.js */

(function () {
  "use strict";

  const REPORT_ENDPOINT    = "/generate-report";
  const SUBSCRIBE_ENDPOINT = "/subscribe";

  // ── Affiliate + tool links ──────────────────────────────────────────────────
  const LINKS = {
    reglyze:      { name: "Reglyze",      url: "https://reglyze.com",         review: "narzedzia/reglyze.html" },
    secfix:       { name: "Secfix",       url: "https://secfix.com",          review: "narzedzia/secfix.html" },
    isms_online:  { name: "ISMS.online",  url: "https://isms.online",         review: "narzedzia/isms-online.html" },
    knowbe4:      { name: "KnowBe4",      url: "https://knowbe4.com",         review: "skoleni-nis2.html" },
    hiscox:       { name: "Hiscox Cyber", url: "https://hiscox.com",          review: "kyberneticke-pojisteni.html" },
    onepassword:  { name: "1Password",    url: "https://1password.com",       review: "narzedzia/1password.html" },
    nordlayer:    { name: "NordLayer",    url: "https://nordlayer.com",       review: "narzedzia/nordlayer.html" },
    cobalt:       { name: "Cobalt.io",    url: "https://cobalt.io",           review: "penetracni-testovani.html" },
    bsi:          { name: "BSI ISO 27001",url: "https://bsigroup.com/pl-PL/", review: "certifikace-iso-27001.html" },
  };

  // ── Tool recommendation by sector + budget ─────────────────────────────────
  const ISMS_RECS = {
    "annex1:free":  "reglyze",   "annex1:low":   "isms_online",
    "annex1:mid":   "secfix",    "annex1:high":  "secfix",
    "annex2:free":  "reglyze",   "annex2:low":   "reglyze",
    "annex2:mid":   "isms_online","annex2:high":  "secfix",
    "other:free":   "reglyze",   "other:low":    "reglyze",
    "other:mid":    "reglyze",   "other:high":   "isms_online",
  };

  // ── State ──────────────────────────────────────────────────────────────────
  const state = {
    step: 0,
    answers: {},
    score: 0,
    missing: [],
    email: null,
  };

  // ── Questions ──────────────────────────────────────────────────────────────
  const questions = [
    {
      id: "sector",
      title: "V jakém sektoru působí vaše firma?",
      hint: "Vyberte sektor, který nejlépe popisuje hlavní činnost.",
      options: [
        { value: "annex1", icon: "⚡", label: "Klíčový sektor (Annexe I)",
          sub: "Energetika, doprava, bankovnictví, finance, zdravotnictví, vodní hospodářství, digitální infrastruktura, veřejná správa" },
        { value: "annex2", icon: "📦", label: "Důležitý sektor (Annexe II)",
          sub: "Poštovní služby, odpadové hospodářství, chemický průmysl, potravinářství, průmyslová výroba, poskytovatelé digitálních služeb, MSP/IT" },
        { value: "other", icon: "🏗️", label: "Jiný sektor",
          sub: "Stavebnictví, maloobchod, gastronomie, soukromé vzdělávání, ostatní" },
      ]
    },
    {
      id: "size",
      title: "Kolik zaměstnanců má vaše firma?",
      hint: "Včetně všech zaměstnanců a spolupracovníků.",
      options: [
        { value: "micro",  icon: "👤", label: "Méně než 50 zaměstnanců",  sub: "Mikro / malá firma" },
        { value: "medium", icon: "👥", label: "50–249 zaměstnanců",        sub: "Střední podnik" },
        { value: "large",  icon: "🏢", label: "250 nebo více zaměstnanců", sub: "Velký podnik" },
      ]
    },
    {
      id: "revenue",
      title: "Jaký je roční obrat vaší firmy?",
      hint: "Roční příjmy nebo bilanční suma.",
      options: [
        { value: "small",  icon: "💶", label: "Pod 10 mil. EUR ročně",  sub: "Mikro / malá firma" },
        { value: "medium", icon: "💰", label: "10–50 mil. EUR ročně",   sub: "Střední podnik" },
        { value: "large",  icon: "💎", label: "Nad 50 mil. EUR ročně",  sub: "Velký podnik" },
      ]
    },
    {
      id: "budget",
      title: "Jaký roční rozpočet máte na soulad s NIS2 / zákonem o kybernetické bezpečnosti?",
      hint: "Přizpůsobíme nástroje vašim finančním možnostem.",
      options: [
        { value: "free", icon: "🆓", label: "Hledám bezplatné řešení", sub: "Bezplatný plán nebo jednorázové náklady na zavedení" },
        { value: "low",  icon: "💵", label: "Do 1 000 CZK ročně (~€40)",  sub: "Základní SaaS nástroj" },
        { value: "mid",  icon: "💳", label: "1 000–6 000 CZK ročně",      sub: "Plná compliance platforma" },
        { value: "high", icon: "🏦", label: "Nad 6 000 CZK ročně",        sub: "Podnikové řešení" },
      ]
    },
    {
      id: "registered",
      title: "Je vaše firma již registrována v registru podle zákona o kybernetické bezpečnosti?",
      hint: "Termín registrace: podle české transpozice NIS2. To je první povinnost.",
      options: [
        { value: "yes",  icon: "✅", label: "Ano, již jsme se zaregistrovali", sub: "Samoidentifikace provedena" },
        { value: "no",   icon: "❌", label: "Ne, ještě jsme to neudělali", sub: "Priorita č. 1 — termín: podle české transpozice NIS2" },
        { value: "unknown", icon: "❓", label: "Nevím / nejsem si jistý", sub: "Prověříme to společně" },
      ]
    },
    {
      id: "has_isms",
      title: "Máte zavedený systém řízení bezpečnosti informací (ISMS)?",
      hint: "ISMS je soubor politik, postupů a bezpečnostních kontrol — vyžadovaný Art. 21 NIS2.",
      options: [
        { value: "yes",     icon: "✅", label: "Ano, máme funkční ISMS",           sub: "Zdokumentované bezpečnostní politiky a postupy" },
        { value: "partial", icon: "🔄", label: "Pracujeme na zavedení",            sub: "Probíhá — ale ještě není dokončeno" },
        { value: "no",      icon: "❌", label: "Ne, v této oblasti nemáme nic",    sub: "Žádný systém řízení bezpečnosti informací" },
      ]
    },
    {
      id: "has_training",
      title: "Prošli zaměstnanci a vedení školeními v oblasti kybernetické bezpečnosti?",
      hint: "Školení vedení je zákonnou povinností podle Art. 20 NIS2.",
      options: [
        { value: "yes", icon: "✅", label: "Ano, máme pravidelná školení",          sub: "Zaměstnanci i vedení jsou proškoleni" },
        { value: "no",  icon: "❌", label: "Ne, školení v této oblasti nemáme", sub: "Školení vedení je zákonnou povinností dle zákona o kybernetické bezpečnosti" },
      ]
    },
    {
      id: "has_insurance",
      title: "Má vaše firma pojištění proti kybernetickým hrozbám?",
      hint: "Kybernetické pojištění přenáší zbytkové riziko a je součástí řízení rizik NIS2.",
      options: [
        { value: "yes",     icon: "✅", label: "Ano, máme kybernetické pojištění",      sub: "Riziko je zajištěno" },
        { value: "no",      icon: "❌", label: "Ne, pojištění nemáme",                  sub: "Online nacenění trvá 20 minut" },
        { value: "unknown", icon: "❓", label: "Nevím / neslyšel jsem o tom",           sub: "Vysvětlíme, co to je a kolik to stojí" },
      ]
    },
    {
      id: "role",
      title: "Jakou roli zastáváte ve firmě?",
      hint: "Přizpůsobíme plán vašim povinnostem a rozhodovacím pravomocem.",
      options: [
        { value: "ceo",        icon: "👔", label: "Majitel / CEO / Vedení",       sub: "Zodpovídáte za rozhodnutí a rozpočet" },
        { value: "it",         icon: "💻", label: "IT manažer / CTO / CISO",      sub: "Zodpovídáte za technické zavedení" },
        { value: "compliance", icon: "📋", label: "Compliance / Právník",         sub: "Zodpovídáte za právní soulad" },
        { value: "cfo",        icon: "💰", label: "CFO / Finanční ředitel",       sub: "Zodpovídáte za rozpočet a finanční rizika" },
      ]
    },
  ];

  const TOTAL = questions.length;

  // ── Score calculation ──────────────────────────────────────────────────────
  function computeScore() {
    const a = state.answers;
    let score = 2; // base: everyone has some basics
    const missing = [];

    if (a.registered === "yes")        { score += 2; }
    else                               { missing.push("registration"); }

    if (a.has_isms === "yes")          { score += 3; }
    else if (a.has_isms === "partial") { score += 1; missing.push("isms"); }
    else                               { missing.push("isms"); }

    if (a.has_training === "yes")      { score += 2; }
    else                               { missing.push("training"); }

    if (a.has_insurance === "yes")     { score += 1; }
    else                               { missing.push("insurance"); }

    score = Math.min(10, Math.max(1, score));
    state.score   = score;
    state.missing = missing;
    return { score, missing };
  }

  function computeScope() {
    const { sector, size, revenue } = state.answers;
    if (sector === "other") return "out";
    const isLarge  = size === "large"  || revenue === "large";
    const isMedium = !isLarge && (size === "medium" || revenue === "medium");
    if (sector === "annex1" && isLarge)           return "essential";
    if (sector === "annex1" && isMedium)          return "important";
    if (sector === "annex2" && (isLarge||isMedium)) return "important";
    return "check"; // small companies in scope sectors
  }

  // ── Today actions (client-side, shown on result screen immediately) ────────
  function buildTodayActions() {
    const missing   = state.missing;
    const sector    = state.answers.sector  || "annex2";
    const budget    = state.answers.budget  || "low";
    const ismsTool  = LINKS[ISMS_RECS[sector+":"+budget] || "reglyze"];
    const actions   = [];

    if (missing.includes("registration")) {
      actions.push({
        step: actions.length + 1,
        time: "30 min · zdarma",
        title: "Zaregistrujte firmu v registru dle zákona o kybernetické bezpečnosti",
        desc:  "Termín: podle české transpozice NIS2. Online formulář pro samoidentifikaci. To je vaše priorita č. 1.",
        cta:   "Návod krok za krokem →",
        url:   "registrace-nis2.html",
        affiliate: false,
      });
    }

    if (missing.includes("isms")) {
      actions.push({
        step: actions.length + 1,
        time: "20 min · bezplatný plán",
        title: "Spusťte systém ISMS — " + ismsTool.name,
        desc:  "Bezplatný plán pokrývá kompletní analýzu mezer NIS2. Po registraci: vyplňte vestavěný dotazník — AI generuje politiky automaticky.",
        cta:   "Začněte za €0 → " + ismsTool.name,
        url:   ismsTool.url,
        affiliate: true,
        badge: "Doporučení č. 1",
      });
    }

    if (missing.includes("insurance")) {
      actions.push({
        step: actions.length + 1,
        time: "20 min · online nacenění",
        title: "Získejte nabídku kybernetického pojištění",
        desc:  "Přenos rizika je součástí řízení rizik NIS2. Nacenění Hiscox: 20 minut online, bez jednání s agentem.",
        cta:   "Prozkoumat nabídku Hiscox →",
        url:   LINKS.hiscox.url,
        affiliate: true,
      });
    }

    if (missing.includes("training")) {
      actions.push({
        step: actions.length + 1,
        time: "30 min · 14denní bezplatná zkušební verze",
        title: "Spusťte školení kybernetické bezpečnosti — KnowBe4",
        desc:  "Školení vedení je zákonnou povinností (Art. 20 zákona o kybernetické bezpečnosti). KnowBe4: online platforma, první modul odeslán týmu do 24 hodin.",
        cta:   "Začít bezplatnou zkušební verzi →",
        url:   LINKS.knowbe4.url,
        affiliate: true,
      });
    }

    // Always suggest 1Password if no training (implies basics missing)
    if (missing.includes("isms") && actions.length < 5) {
      actions.push({
        step: actions.length + 1,
        time: "30 min · 14denní bezplatná zkušební verze",
        title: "Zaveďte správce hesel + MFA — 1Password",
        desc:  "Vícefaktorové ověřování (MFA) je vyžadováno Art. 21(j) zákona o kybernetické bezpečnosti. 1Password Business: nastavení 30 minut, nasazení do týmu tentýž den.",
        cta:   "Začít bezplatnou zkušební verzi →",
        url:   LINKS.onepassword.url,
        affiliate: true,
      });
    }

    return actions.slice(0, 4); // max 4 today actions
  }

  // ── GA4 helper ─────────────────────────────────────────────────────────────
  function track(event, params) {
    if (typeof gtag === "function") gtag("event", event, params || {});
  }

  // ── Render: question step ──────────────────────────────────────────────────
  function renderStep() {
    const q   = questions[state.step];
    const el  = document.getElementById("quiz-container");
    if (!el) return;

    const pct    = Math.round((state.step / TOTAL) * 100);
    const isLast = state.step === TOTAL - 1;

    el.innerHTML = `
      <div class="quiz-card">
        <div class="quiz-progress">
          <div class="quiz-progress__bar" style="width:${pct}%"></div>
        </div>
        <p class="text-sm text-gray" style="margin-bottom:.25rem;">Otázka ${state.step + 1} z ${TOTAL}</p>
        <h3>${q.title}</h3>
        <p style="color:var(--gray-500);font-size:.9rem;margin-bottom:1rem;">${q.hint}</p>
        <div class="quiz-options">
          ${q.options.map(opt => `
            <button class="quiz-option${state.answers[q.id] === opt.value ? " selected" : ""}"
                    data-value="${opt.value}" type="button">
              <span class="quiz-option__icon">${opt.icon}</span>
              <span>
                <span class="quiz-option__text">${opt.label}</span>
                <span class="quiz-option__sub">${opt.sub}</span>
              </span>
            </button>
          `).join("")}
        </div>
        <div class="quiz-nav">
          ${state.step > 0
            ? `<button class="btn btn--outline btn--sm" id="quiz-back">← Zpět</button>`
            : `<span></span>`}
          <button class="btn btn--primary btn--sm" id="quiz-next"
                  ${state.answers[q.id] ? "" : "disabled"}>
            ${isLast ? "Vypočítat můj výsledek →" : "Další →"}
          </button>
        </div>
      </div>`;

    el.querySelectorAll(".quiz-option").forEach(btn => {
      btn.addEventListener("click", () => {
        state.answers[q.id] = btn.dataset.value;
        el.querySelectorAll(".quiz-option").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        el.querySelector("#quiz-next").removeAttribute("disabled");
        track("quiz_answer", { question: q.id, answer: btn.dataset.value });
        // Auto-advance on click for faster UX
        setTimeout(() => {
          if (isLast) { computeScore(); renderScoreGate(); }
          else { state.step++; renderStep(); }
        }, 280);
      });
    });

    el.querySelector("#quiz-back")?.addEventListener("click", () => {
      state.step--;
      renderStep();
    });

    el.querySelector("#quiz-next")?.addEventListener("click", () => {
      if (!state.answers[q.id]) return;
      if (isLast) { computeScore(); renderScoreGate(); }
      else { state.step++; renderStep(); }
    });
  }

  // ── Render: score + email gate ─────────────────────────────────────────────
  function renderScoreGate() {
    const el = document.getElementById("quiz-container");
    if (!el) return;

    const { score, missing } = state;
    const pct    = Math.round((score / 10) * 100);
    const scope  = computeScope();

    const scoreColor = score <= 3 ? "#dc2626"
                     : score <= 6 ? "#d97706"
                     : "#16a34a";

    const scopeMsg = {
      essential: "Vaše firma je <strong>klíčovým subjektem dle zákona o kybernetické bezpečnosti</strong> — nejvyšší úroveň požadavků.",
      important:  "Vaše firma je <strong>důležitým subjektem dle zákona o kybernetické bezpečnosti</strong> — musíte splnit požadavky NIS2.",
      check:      "Vaše firma může podléhat zákonu o kybernetické bezpečnosti — ověřte výjimky pro malé firmy.",
      out:        "Vaše firma pravděpodobně nepodléhá zákonu o kybernetické bezpečnosti — přesto doporučujeme zavést základní opatření.",
    }[scope] || "";

    const gapText = missing.length === 0
      ? "Gratulujeme — máte zavedena všechna klíčová bezpečnostní opatření!"
      : `Chybí vám <strong>${missing.length}</strong> klíčových bezpečnostních opatření. Většinu z nich můžete zavést během 3 dnů.`;

    el.innerHTML = `
      <div class="quiz-card">
        <div class="quiz-progress">
          <div class="quiz-progress__bar" style="width:100%"></div>
        </div>

        <div style="text-align:center;padding:1rem 0 .5rem;">
          <div style="font-size:.8rem;font-weight:700;color:var(--gray-500);text-transform:uppercase;letter-spacing:.06em;margin-bottom:.5rem;">
            Váš výsledek souladu s NIS2
          </div>
          <div style="font-size:3.5rem;font-weight:800;color:${scoreColor};line-height:1;">
            ${score}<span style="font-size:1.5rem;color:var(--gray-400);font-weight:500;">/10</span>
          </div>
          <div style="margin:.75rem auto;max-width:280px;height:10px;background:#e5e7eb;border-radius:99px;overflow:hidden;">
            <div style="height:100%;width:${pct}%;background:${scoreColor};border-radius:99px;transition:width 1s;"></div>
          </div>
          <p style="font-size:.9rem;color:var(--gray-600);">${scopeMsg}</p>
          <p style="font-size:.92rem;">${gapText}</p>
        </div>

        <div style="background:#f0f7ff;border-radius:12px;padding:1.25rem;margin:1rem 0;">
          <p style="font-size:.95rem;font-weight:700;color:#1a1a2e;margin:0 0 .35rem;">
            📬 Získejte svůj 3denní akční plán
          </p>
          <p style="font-size:.82rem;color:#555;margin:0 0 .75rem;">
            Váš personalizovaný plán: co udělat dnes, zítra a tento týden.
            Připravené odkazy na nástroje + AI prompt pro Claude / ChatGPT / Gemini.
          </p>
          <form id="score-email-form" style="display:flex;gap:.5rem;flex-wrap:wrap;">
            <input type="email" name="email" placeholder="vas@email.cz" required
                   style="flex:1;min-width:180px;padding:.6rem .9rem;border:1px solid #d1d5db;border-radius:8px;font-size:.95rem;">
            <button type="submit" class="btn btn--primary">Pošlete mi plán →</button>
          </form>
          <p style="font-size:.75rem;color:#9ca3af;margin:.5rem 0 0;">Bez spamu. Jeden e-mail s plánem + volitelné připomínky.</p>
        </div>

        <button id="quiz-skip-email" type="button"
                style="background:none;border:none;color:var(--gray-400);font-size:.8rem;cursor:pointer;width:100%;text-align:center;padding:.25rem 0;">
          Zobrazit jen výsledek, bez plánu →
        </button>
      </div>`;

    track("quiz_score_shown", { score, missing: missing.join(","), scope });

    document.getElementById("score-email-form")?.addEventListener("submit", e => {
      e.preventDefault();
      const email = e.target.querySelector("input[type=email]").value.trim();
      if (!email) return;
      const btn = e.target.querySelector("button");
      btn.disabled = true;
      btn.textContent = "Odesílání...";
      state.email = email;
      _submitEmailAndReport(email, () => renderResult(true));
    });

    document.getElementById("quiz-skip-email")?.addEventListener("click", () => {
      track("quiz_email_skipped");
      renderResult(false);
    });
  }

  // ── Submit email to Beehiiv + trigger report ───────────────────────────────
  function _submitEmailAndReport(email, onDone) {
    const { score, missing, answers } = state;

    // Score tier tag
    const scoreTier = score <= 3 ? "score_low" : score <= 6 ? "score_mid" : "score_high";
    const tags = [scoreTier,
      "sector_" + (answers.sector || "unknown"),
      "role_"   + (answers.role   || "unknown"),
      ...(missing.includes("registration") ? ["missing_registration"] : []),
      ...(missing.includes("isms")         ? ["missing_isms"]         : []),
      ...(missing.includes("training")     ? ["missing_training"]     : []),
      ...(missing.includes("insurance")    ? ["missing_insurance"]    : []),
    ];

    // Call both endpoints in parallel
    const subscribeCall = fetch(SUBSCRIBE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        source: "quiz_score_gate",
        tags,
        quiz_answers: {
          sector: answers.sector, size: answers.size, revenue: answers.revenue,
          budget: answers.budget, registered: answers.registered,
          has_isms: answers.has_isms, has_training: answers.has_training,
          has_insurance: answers.has_insurance, role: answers.role,
          score,
        },
      }),
    }).catch(() => {});

    const reportCall = fetch(REPORT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sector:        answers.sector,
        size:          answers.size,
        revenue:       answers.revenue,
        budget:        answers.budget,
        registered:    answers.registered,
        has_isms:      answers.has_isms,
        has_training:  answers.has_training,
        has_insurance: answers.has_insurance,
        role:          answers.role,
        score,
        missing,
        email,
        lang:   document.documentElement.lang || "cs",
        domain: window.location.hostname,
      }),
    }).catch(() => {});

    Promise.allSettled([subscribeCall, reportCall]).then(() => {
      track("quiz_completed", { score, sector: answers.sector, email_captured: true });
      if (onDone) onDone();
    });
  }

  // ── Render: result with today-actions ──────────────────────────────────────
  function renderResult(emailCaptured) {
    const el = document.getElementById("quiz-container");
    if (!el) return;

    const { score, missing, answers } = state;
    const scope    = computeScope();
    const actions  = buildTodayActions();
    const pct      = Math.round((score / 10) * 100);
    const scoreColor = score <= 3 ? "#dc2626" : score <= 6 ? "#d97706" : "#16a34a";

    const scopeBadge = {
      essential: { text: "🚨 Klíčový subjekt",          color: "#fee2e2", tc: "#991b1b" },
      important:  { text: "⚠️ Důležitý subjekt",        color: "#fefce8", tc: "#854d0e" },
      check:      { text: "🔍 Ověřte výjimky",          color: "#fefce8", tc: "#854d0e" },
      out:        { text: "✅ Pravděpodobně mimo zákon o kybernetické bezpečnosti", color: "#dcfce7", tc: "#166534" },
    }[scope] || { text: "zákon o kybernetické bezpečnosti", color: "#e5e7eb", tc: "#374151" };

    function actionCard(a) {
      const isAffiliate = a.affiliate;
      return `
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:1rem 1.1rem;margin-bottom:.75rem;${isAffiliate ? "border-left:3px solid var(--navy);" : ""}">
          <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.35rem;">
            <span style="background:var(--navy);color:#fff;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:.72rem;font-weight:700;flex-shrink:0;">${a.step}</span>
            <span style="font-size:.75rem;color:var(--gray-500);">${a.time}</span>
            ${isAffiliate && a.badge ? `<span style="background:#dcfce7;color:#166534;font-size:.68rem;font-weight:700;padding:.1rem .45rem;border-radius:4px;">${a.badge}</span>` : ""}
          </div>
          <div style="font-weight:700;font-size:.95rem;margin-bottom:.3rem;">${a.title}</div>
          <div style="font-size:.82rem;color:#555;margin-bottom:.6rem;">${a.desc}</div>
          <a href="${a.url}" ${isAffiliate ? 'target="_blank" rel="nofollow noopener"' : ''}
             style="display:inline-block;padding:.45rem .9rem;background:var(--navy);color:#fff;border-radius:6px;font-size:.82rem;font-weight:600;text-decoration:none;">
            ${a.cta}
          </a>
        </div>`;
    }

    const reskipBlock = missing.length === 0
      ? `<div style="background:#dcfce7;border-radius:10px;padding:1rem;text-align:center;margin-bottom:1rem;">
           <strong>🎉 Vaše firma je v dobré kondici!</strong><br>
           <span style="font-size:.85rem;">Máte zavedena všechna klíčová opatření NIS2. Zvažte certifikaci ISO 27001 jako doklad souladu.</span>
           <br><a href="certifikace-iso-27001.html" style="font-size:.82rem;color:var(--navy);font-weight:700;">Zjistěte více o ISO 27001 →</a>
         </div>`
      : actions.map(actionCard).join("");

    el.innerHTML = `
      <div class="quiz-card">

        ${emailCaptured
          ? `<div style="background:#dcfce7;border-radius:8px;padding:.6rem 1rem;font-size:.82rem;color:#166534;font-weight:600;margin-bottom:1rem;text-align:center;">
               ✅ Plán odeslán na ${state.email || "váš e-mail"} — zkontrolujte doručenou poštu
             </div>`
          : ""}

        <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1rem;flex-wrap:wrap;">
          <div style="text-align:center;flex-shrink:0;">
            <div style="font-size:2.5rem;font-weight:800;color:${scoreColor};line-height:1;">
              ${score}<span style="font-size:1rem;color:var(--gray-400);font-weight:500;">/10</span>
            </div>
            <div style="font-size:.7rem;color:var(--gray-500);">Výsledek NIS2</div>
          </div>
          <div style="flex:1;min-width:140px;">
            <div style="height:8px;background:#e5e7eb;border-radius:99px;overflow:hidden;margin-bottom:.35rem;">
              <div style="height:100%;width:${pct}%;background:${scoreColor};border-radius:99px;"></div>
            </div>
            <span style="display:inline-block;padding:.2rem .6rem;border-radius:12px;font-size:.75rem;font-weight:700;background:${scopeBadge.color};color:${scopeBadge.tc};">
              ${scopeBadge.text}
            </span>
          </div>
        </div>

        <h3 style="font-size:1.05rem;margin-bottom:.35rem;">
          ${missing.length > 0
            ? `🏃 Udělejte DNES — celkem ~${Math.min(120, missing.length * 30)} minut`
            : "Váš stav NIS2"}
        </h3>
        <p style="font-size:.82rem;color:var(--gray-500);margin-bottom:1rem;">
          ${missing.length > 0
            ? `${missing.length} chybějících kroků. Níže uvedené můžete dokončit ještě dnes.`
            : "Všechna klíčová opatření jsou na místě."}
        </p>

        ${reskipBlock}

        ${missing.length > 0 ? `
          <div style="border-top:1px solid #e5e7eb;padding-top:1rem;margin-top:.5rem;">
            <p style="font-size:.78rem;color:var(--gray-500);margin-bottom:.75rem;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">
              Další kroky (naplánujte termíny)
            </p>
            <div style="display:flex;gap:.5rem;flex-wrap:wrap;">
              <a href="penetracni-testovani.html" style="font-size:.78rem;padding:.3rem .7rem;border:1px solid #e5e7eb;border-radius:6px;color:var(--gray-600);text-decoration:none;">
                🔍 Penetrační testování
              </a>
              <a href="certifikace-iso-27001.html" style="font-size:.78rem;padding:.3rem .7rem;border:1px solid #e5e7eb;border-radius:6px;color:var(--gray-600);text-decoration:none;">
                🏅 Certifikace ISO 27001
              </a>
              <a href="bezpecnost-dodavatelskych-retezcu.html" style="font-size:.78rem;padding:.3rem .7rem;border:1px solid #e5e7eb;border-radius:6px;color:var(--gray-600);text-decoration:none;">
                🔗 Bezpečnost dodavatelského řetězce
              </a>
            </div>
          </div>` : ""}

        <div style="margin-top:1.25rem;display:flex;gap:.75rem;justify-content:center;flex-wrap:wrap;">
          <button class="btn btn--outline btn--sm" id="quiz-restart">← Začít znovu</button>
          <a href="porownanie.html" class="btn btn--primary btn--sm">Porovnat nástroje NIS2 →</a>
        </div>

        ${!emailCaptured ? `
          <div style="margin-top:1rem;background:#f0f7ff;border-radius:8px;padding:.85rem;text-align:center;">
            <p style="font-size:.82rem;margin:0 0 .5rem;"><strong>Získejte kompletní plán na e-mail</strong> s AI promptem a odkazy na nástroje</p>
            <form id="late-email-form" style="display:flex;gap:.5rem;flex-wrap:wrap;justify-content:center;">
              <input type="email" placeholder="vas@email.cz" required
                     style="flex:1;min-width:160px;padding:.45rem .75rem;border:1px solid #d1d5db;border-radius:6px;font-size:.85rem;">
              <button type="submit" class="btn btn--primary btn--sm">Odeslat →</button>
            </form>
          </div>` : ""}
      </div>`;

    document.getElementById("quiz-restart")?.addEventListener("click", () => {
      state.step = 0; state.answers = {}; state.score = 0;
      state.missing = []; state.email = null;
      try { history.replaceState(null, "", window.location.pathname); } catch (e) {}
      renderStep();
    });

    document.getElementById("late-email-form")?.addEventListener("submit", e => {
      e.preventDefault();
      const email = e.target.querySelector("input[type=email]").value.trim();
      if (!email) return;
      const btn = e.target.querySelector("button");
      btn.disabled = true; btn.textContent = "Odesílání...";
      state.email = email;
      _submitEmailAndReport(email, () => {
        e.target.parentElement.innerHTML =
          `<p style="font-size:.82rem;color:#166534;font-weight:700;">✅ Odesláno na ${email}</p>`;
      });
    });

    track("quiz_result_shown", { score, scope, email_captured: emailCaptured });
  }

  // ── FAQ accordion ──────────────────────────────────────────────────────────
  function initFaq() {
    document.querySelectorAll(".faq-question").forEach(btn => {
      btn.addEventListener("click", () => {
        const item   = btn.closest(".faq-item");
        const isOpen = item.classList.contains("open");
        document.querySelectorAll(".faq-item.open").forEach(i => i.classList.remove("open"));
        if (!isOpen) item.classList.add("open");
      });
    });
  }

  // ── Init ───────────────────────────────────────────────────────────────────
  document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("quiz-container");
    if (container) renderStep();
    initFaq();
  });

})();