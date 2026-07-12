/* ============================================================
   Rafi Al Imran — Portfolio engine
   Every page is rendered from JSON files in /data and /content.
   You should never need to edit this file to update content.
   ============================================================ */

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

async function getJSON(path) {
  const r = await fetch(path, { cache: "no-cache" });
  if (!r.ok) throw new Error(path + " → " + r.status);
  return r.json();
}

/* ---------- Theme ---------- */
function initTheme() {
  let saved = null;
  try { saved = localStorage.getItem("theme"); } catch (e) {}
  const prefers = typeof window.matchMedia === "function" && window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.dataset.theme = saved || (prefers ? "dark" : "light");
}
function toggleTheme() {
  const t = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = t;
  try { localStorage.setItem("theme", t); } catch (e) {}
}

/* ---------- Layout ---------- */
const NAV = [
  ["index.html", "Home"], ["about.html", "About"], ["experience.html", "Experience"],
  ["projects.html", "Projects"], ["dashboard.html", "MEAL Dashboard"], ["portfolio.html", "Documentation"],
  ["publications.html", "Publications"], ["photography.html", "Photography"], ["skills.html", "Skills"],
  ["blog.html", "Blog"], ["cv.html", "CV"], ["contact.html", "Contact"]
];

function renderLayout(profile) {
  const page = location.pathname.split("/").pop() || "index.html";
  $("#site-header").innerHTML = `
    <div class="container nav">
      <a class="brand" href="index.html">Rafi <span>Al Imran</span></a>
      <ul class="nav-links" id="navLinks">
        ${NAV.map(([href, label]) => `<li><a href="${href}" ${href === page ? 'aria-current="page"' : ""}>${label}</a></li>`).join("")}
      </ul>
      <div class="nav-actions">
        <button class="theme-toggle" id="themeBtn" aria-label="Toggle dark mode" title="Toggle dark mode">◐</button>
        <button class="nav-burger" id="burger" aria-label="Open menu">☰</button>
      </div>
    </div>`;
  $("#themeBtn").addEventListener("click", toggleTheme);
  $("#burger").addEventListener("click", () => $("#navLinks").classList.toggle("open"));

  $("#site-footer").innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <div>
          <div class="brand">Rafi <span style="color:var(--green)">Al Imran</span></div>
          <p class="muted" style="max-width:38ch;font-size:.9rem">${esc(profile.brandStatement)}</p>
        </div>
        <ul class="footer-links">
          <li><a href="${esc(profile.linkedin)}" rel="noopener">LinkedIn</a></li>
          <li><a href="${esc(profile.github)}" rel="noopener">GitHub</a></li>
          <li><a href="mailto:${esc(profile.email)}">Email</a></li>
          <li><a href="feed.xml">RSS</a></li>
        </ul>
      </div>
      <div class="footer-bottom">
        <span>© ${new Date().getFullYear()} Rafi Al Imran · MEAL &amp; Documentation Professional</span>
        <span class="mono">${esc(profile.location)}</span>
      </div>
    </div>`;
}

/* ---------- Reveal on scroll ---------- */
function initReveal() {
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { threshold: 0.12 });
  $$(".reveal").forEach(el => io.observe(el));
}

/* ---------- Count-up ---------- */
function countUp(el, target, suffix) {
  const dur = 1400, start = performance.now();
  const fmt = n => n >= 1000 ? n.toLocaleString("en-US") : n;
  function tick(now) {
    const p = Math.min((now - start) / dur, 1);
    el.textContent = fmt(Math.round(target * (1 - Math.pow(1 - p, 3)))) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ---------- Typing animation ---------- */
function typeRoles(el, roles) {
  let ri = 0, ci = 0, deleting = false;
  function step() {
    const word = roles[ri];
    ci += deleting ? -1 : 1;
    el.textContent = word.slice(0, ci);
    let delay = deleting ? 32 : 62;
    if (!deleting && ci === word.length) { delay = 1700; deleting = true; }
    else if (deleting && ci === 0) { deleting = false; ri = (ri + 1) % roles.length; delay = 350; }
    setTimeout(step, delay);
  }
  step();
}

/* ================= PAGE RENDERERS ================= */
const pages = {

  /* ---------- HOME ---------- */
  async home(profile) {
    $("#heroTag").textContent = profile.tagline;
    typeRoles($("#typeTarget"), profile.roles);
    $("#pipeline").innerHTML = profile.pipeline.map((p, i) =>
      `<li><span class="node">${esc(p)}</span>${i < profile.pipeline.length - 1 ? '<span class="arrow"></span>' : ""}</li>`).join("");
    $("#statsGrid").innerHTML = profile.stats.map(s =>
      `<div class="stat reveal"><b data-v="${s.value}" data-s="${esc(s.suffix)}">0</b><span>${esc(s.label)}</span></div>`).join("");
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { const b = $("b", e.target); countUp(b, +b.dataset.v, b.dataset.s); io.unobserve(e.target); }
    }), { threshold: 0.4 });
    $$("#statsGrid .stat").forEach(el => io.observe(el));

    const projects = await getJSON("data/projects.json");
    $("#featured").innerHTML = projects.slice(0, 3).map(p => projectCard(p)).join("");
    initReveal();
  },

  /* ---------- ABOUT ---------- */
  async about(profile) {
    $("#aboutSummary").textContent = profile.summary;
    const milestones = [
      ["2018", "Begins Criminology at the University of Dhaka — research methods, statistics, justice systems."],
      ["2020", "First field research: Asia Foundation-funded study on community policing; leads a 15-day participant observation study."],
      ["2022", "Completes BSS; MSS coursework in Criminology. Secondary data analysis of archival crime records."],
      ["2024", "Data Analyst on a national free & fair election survey; 20-day Research Methodology training (Ministry of Planning)."],
      ["2025", "Moves home to Cox's Bazar: Project Officer for Documentation, Communication & Publication on the DFAT AHP IV Inclusive Project (Mukti–Oxfam). Publishes community storytelling books."],
      ["2026", "MEAL & Documentation Officer on an Oxfam-funded livelihood programme, then MEAL Officer at FIVDB on the IRC-funded ECW education programme — 7,000+ learners, 70+ Learning Centres."]
    ];
    $("#aboutTimeline").innerHTML = milestones.map(([y, t]) =>
      `<li class="reveal"><span class="tl-date">${y}</span><p style="margin:.3rem 0 0">${esc(t)}</p></li>`).join("");
    initReveal();
  },

  /* ---------- EXPERIENCE ---------- */
  async experience() {
    const xp = await getJSON("data/experience.json");
    const block = (title, items) => items && items.length ?
      `<div class="xp-block"><h4>${title}</h4><ul>${items.map(i => `<li>${esc(i)}</li>`).join("")}</ul></div>` : "";
    const chips = (title, items) => items && items.length ?
      `<div class="xp-block"><h4>${title}</h4><div class="chips">${items.map(i => `<span class="chip">${esc(i)}</span>`).join("")}</div></div>` : "";
    $("#xpTimeline").innerHTML = xp.map(e => `
      <li class="reveal">
        <span class="tl-date">${esc(e.start)} — ${esc(e.end)}</span>
        <h3 style="margin:.25rem 0 .1rem">${esc(e.role)}</h3>
        <div class="tl-org">${esc(e.org)} · ${esc(e.project)} · ${esc(e.location)}</div>
        <p style="margin:.4rem 0 0">${esc(e.overview)}</p>
        <details class="xp">
          <summary>Responsibilities, achievements &amp; impact</summary>
          <div class="xp-body">
            ${block("Responsibilities", e.responsibilities)}
            ${block("Achievements", e.achievements)}
            ${chips("Tools & technologies", e.tools)}
            ${chips("Skills", e.skills)}
            ${e.impact ? `<div class="xp-block"><h4>Impact</h4><p style="margin:0">${esc(e.impact)}</p></div>` : ""}
            ${e.relatedProjects?.length ? `<div class="xp-block"><h4>Related projects</h4><div class="chips">${e.relatedProjects.map(id => `<a class="chip" href="project.html?id=${id}">View case study →</a>`).join("")}</div></div>` : ""}
          </div>
        </details>
      </li>`).join("");
    initReveal();
  },

  /* ---------- PROJECTS LIST ---------- */
  async projects() {
    const projects = await getJSON("data/projects.json");
    $("#projectGrid").innerHTML = projects.map(p => projectCard(p)).join("");
    initReveal();
  },

  /* ---------- PROJECT CASE STUDY ---------- */
  async project() {
    const id = new URLSearchParams(location.search).get("id");
    const projects = await getJSON("data/projects.json");
    const p = projects.find(x => x.id === id) || projects[0];
    document.title = p.title + " — Rafi Al Imran";
    const list = a => a && a.length ? `<ul>${a.map(i => `<li>${esc(i)}</li>`).join("")}</ul>` : `<p class="muted">Details to be added.</p>`;
    const sec = (label, html) => `<div class="case-section"><div class="case-grid"><div class="label">${label}</div><div>${html}</div></div></div>`;
    let pubs = "";
    if (p.publications?.length) {
      const allPubs = await getJSON("data/publications.json");
      pubs = sec("Related publications", `<div class="chips">${p.publications.map(id => {
        const pub = allPubs.find(x => x.id === id);
        return pub ? `<a class="chip" href="publications.html">${esc(pub.title)}</a>` : "";
      }).join("")}</div>`);
    }
    $("#caseRoot").innerHTML = `
      <div class="case-hero reveal in">
        <div class="eyebrow">Case study · ${esc(p.tags.join(" · "))}</div>
        <h1>${esc(p.title)}</h1>
        <p class="lead" style="color:#E4EFE8">${esc(p.subtitle)}</p>
        <div class="case-meta">
          <div><b>Donor</b><span>${esc(p.donor)}</span></div>
          <div><b>Partners</b><span>${esc(p.partners.join(", "))}</span></div>
          <div><b>Timeline</b><span>${esc(p.period)}</span></div>
          <div><b>Location</b><span>${esc(p.location)}</span></div>
        </div>
      </div>
      ${sec("Overview", `<p>${esc(p.overview)}</p>`)}
      ${sec("Background", `<p>${esc(p.background)}</p>`)}
      ${sec("Objectives", list(p.objectives))}
      ${sec("Activities", list(p.activities))}
      ${sec("Methodology", `<p>${esc(p.methodology)}</p>`)}
      ${sec("Monitoring framework", `<p>${esc(p.framework)}</p>`)}
      ${sec("Indicators", list(p.indicators))}
      ${sec("Outputs", list(p.outputs))}
      ${sec("Outcomes", list(p.outcomes))}
      ${sec("Challenges", list(p.challenges))}
      ${sec("Lessons learned", list(p.lessons))}
      ${p.gallery?.length ? sec("Photo gallery", `<div class="grid grid-2">${p.gallery.map(g =>
        `<img loading="lazy" src="${esc(g)}" alt="Project photo" style="border-radius:12px;aspect-ratio:4/3;object-fit:cover;background:var(--surface2)" onerror="this.style.display='none'">`).join("")}</div>`) : ""}
      ${p.downloads?.length ? sec("Downloads", `<div class="chips">${p.downloads.map(d => `<a class="chip" href="${esc(d.href)}">${esc(d.label)}</a>`).join("")}</div>`) : ""}
      ${pubs}
      <div class="section-tight"><a class="btn btn-ghost" href="projects.html">← All projects</a></div>`;
  },

  /* ---------- DASHBOARD ---------- */
  async dashboard() {
    const d = await getJSON("data/dashboard.json");
    $("#kpis").innerHTML = d.kpis.map(k => `
      <div class="kpi reveal"><span class="mono muted" style="font-size:.72rem;text-transform:uppercase;letter-spacing:.1em">${esc(k.label)}</span>
      <b>${esc(k.value)}</b><span class="muted" style="font-size:.8rem">${esc(k.target)}</span> <span class="up">▲ ${esc(k.trend)}</span></div>`).join("");
    $("#charts").innerHTML = d.charts.map(c => `
      <div class="chart-card reveal"><h3>${esc(c.title)}</h3><div class="chart-wrap"><canvas id="c-${c.id}"></canvas></div></div>`).join("");

    const css = getComputedStyle(document.documentElement);
    const palette = [css.getPropertyValue("--green").trim(), css.getPropertyValue("--navy").trim(), "#D9A441", "#7FB0D6", "#B96D6D"];
    const ink = css.getPropertyValue("--muted").trim();
    Chart.defaults.color = ink;
    Chart.defaults.font.family = "Inter, sans-serif";
    Chart.defaults.borderColor = css.getPropertyValue("--line").trim();

    d.charts.forEach(c => {
      const ctx = $("#c-" + c.id);
      new Chart(ctx, {
        type: c.type,
        data: {
          labels: c.labels,
          datasets: c.datasets.map((ds, i) => ({
            label: ds.label, data: ds.data,
            backgroundColor: c.type === "doughnut" || c.type === "pie"
              ? ds.data.map((_, j) => palette[j % palette.length] + (c.type === "doughnut" ? "" : ""))
              : palette[i % palette.length] + (c.type === "line" || c.type === "radar" ? "33" : "CC"),
            borderColor: palette[i % palette.length],
            borderWidth: 2, tension: .35, fill: c.type === "line" || c.type === "radar",
            borderRadius: c.type === "bar" ? 6 : 0, pointRadius: 3
          }))
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { position: "bottom", labels: { boxWidth: 12, boxHeight: 12 } } },
          scales: (c.type === "doughnut" || c.type === "pie" || c.type === "radar") ? {} :
            { y: { beginAtZero: true, grid: { drawBorder: false } }, x: { grid: { display: false } } }
        }
      });
    });
    initReveal();
  },

  /* ---------- DOCUMENTATION PORTFOLIO ---------- */
  async portfolio() {
    const items = await getJSON("data/portfolio.json");
    const cats = ["All", ...new Set(items.map(i => i.category))];
    $("#docFilters").innerHTML = cats.map((c, i) => `<button class="${i === 0 ? "active" : ""}" data-c="${esc(c)}">${esc(c)}</button>`).join("");
    const render = cat => {
      $("#docGrid").innerHTML = items.filter(i => cat === "All" || i.category === cat).map(i => `
        <article class="card reveal" tabindex="0" role="button" data-id="${i.id}" aria-label="Open ${esc(i.title)}">
          <span class="tag">${esc(i.category)}</span>
          <h3>${esc(i.title)}</h3><p class="muted" style="font-size:.92rem">${esc(i.summary)}</p>
          <span class="mono" style="font-size:.78rem;color:var(--green)">Read more →</span>
        </article>`).join("");
      initReveal();
      $$("#docGrid .card").forEach(el => {
        const open = () => {
          const it = items.find(x => x.id === el.dataset.id);
          $("#modalBody").innerHTML = `<span class="tag">${esc(it.category)}</span><h2>${esc(it.title)}</h2>
            <p>${esc(it.body)}</p>${it.link ? `<a class="btn btn-primary" href="${esc(it.link)}">Open document</a>` : `<p class="muted mono" style="font-size:.8rem">Full document available on request.</p>`}`;
          $("#docModal").classList.add("open");
        };
        el.addEventListener("click", open);
        el.addEventListener("keydown", e => { if (e.key === "Enter") open(); });
      });
    };
    render("All");
    $("#docFilters").addEventListener("click", e => {
      if (e.target.tagName !== "BUTTON") return;
      $$("#docFilters button").forEach(b => b.classList.remove("active"));
      e.target.classList.add("active"); render(e.target.dataset.c);
    });
    $("#docModal").addEventListener("click", e => { if (e.target.id === "docModal" || e.target.classList.contains("close")) $("#docModal").classList.remove("open"); });
    document.addEventListener("keydown", e => { if (e.key === "Escape") $("#docModal").classList.remove("open"); });
  },

  /* ---------- PUBLICATIONS ---------- */
  async publications() {
    const pubs = await getJSON("data/publications.json");
    $("#pubGrid").innerHTML = pubs.map(p => `
      <article class="card reveal">
        <div class="card-cover"><img loading="lazy" src="${esc(p.cover)}" alt="${esc(p.title)} cover" onerror="this.parentElement.innerHTML='<div style=\\'display:grid;place-items:center;height:100%;font-family:var(--font-display);font-size:1.1rem;color:var(--green);padding:1rem;text-align:center\\'>${esc(p.title)}</div>'"></div>
        <span class="tag">${esc(p.year)}</span><span class="tag">${esc(p.partner)}</span>
        <h3>${esc(p.title)}</h3>
        <p class="muted" style="font-size:.92rem">${esc(p.description)}</p>
        ${p.pdf ? `<a class="btn btn-primary" href="${esc(p.pdf)}" download>Download PDF</a>` : `<span class="mono muted" style="font-size:.78rem">PDF available on request</span>`}
      </article>`).join("");
    initReveal();
  },

  /* ---------- PHOTOGRAPHY ---------- */
  async photography() {
    const data = await getJSON("data/photos.json");
    $("#photoFilters").innerHTML = data.categories.map((c, i) => `<button class="${i === 0 ? "active" : ""}" data-c="${esc(c)}">${esc(c)}</button>`).join("");
    const render = cat => {
      const list = data.photos.filter(p => cat === "All" || p.category === cat);
      $("#gallery").innerHTML = list.map((p, i) => `
        <figure data-i="${i}"><img loading="lazy" src="${esc(p.src)}" alt="${esc(p.caption)}"><figcaption>${esc(p.caption)} · <b>${esc(p.category)}</b></figcaption></figure>`).join("");
      $$("#gallery figure").forEach(f => f.addEventListener("click", () => {
        const p = list[+f.dataset.i];
        $("#lbImg").src = p.src; $("#lbCap").textContent = p.caption;
        $("#lightbox").classList.add("open");
      }));
    };
    render("All");
    $("#photoFilters").addEventListener("click", e => {
      if (e.target.tagName !== "BUTTON") return;
      $$("#photoFilters button").forEach(b => b.classList.remove("active"));
      e.target.classList.add("active"); render(e.target.dataset.c);
    });
    $("#lightbox").addEventListener("click", () => $("#lightbox").classList.remove("open"));
    document.addEventListener("keydown", e => { if (e.key === "Escape") $("#lightbox").classList.remove("open"); });
  },

  /* ---------- SKILLS ---------- */
  async skills() {
    const groups = await getJSON("data/skills.json");
    $("#skillsGrid").innerHTML = groups.map(g => `
      <div class="skill-group reveal">
        <div class="eyebrow" style="margin-bottom:.6rem">${esc(g.group)}</div>
        ${g.items.map(s => `
          <div class="skill"><div class="row"><span>${esc(s.name)}</span><span class="mono muted">${s.level}%</span></div>
          <div class="bar"><div class="fill" data-w="${s.level}"></div></div></div>`).join("")}
      </div>`).join("");
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { $$(".fill", e.target).forEach(f => f.style.width = f.dataset.w + "%"); io.unobserve(e.target); }
    }), { threshold: .25 });
    $$(".skill-group").forEach(el => io.observe(el));
    initReveal();
  },

  /* ---------- BLOG LIST ---------- */
  async blog() {
    const idx = await getJSON("content/blog/index.json");
    const cats = ["All", ...new Set(idx.posts.map(p => p.category))];
    $("#blogFilters").innerHTML = cats.map((c, i) => `<button class="${i === 0 ? "active" : ""}" data-c="${esc(c)}">${esc(c)}</button>`).join("");
    const render = cat => {
      $("#blogGrid").innerHTML = idx.posts.filter(p => cat === "All" || p.category === cat).map(p => `
        <article class="card post-card reveal">
          <span class="tag">${esc(p.category)}</span>
          <h3><a href="post.html?p=${encodeURIComponent(p.file)}">${esc(p.title)}</a></h3>
          <time datetime="${esc(p.date)}">${new Date(p.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</time>
          <p class="muted" style="font-size:.92rem">${esc(p.excerpt)}</p>
        </article>`).join("");
      initReveal();
    };
    render("All");
    $("#blogFilters").addEventListener("click", e => {
      if (e.target.tagName !== "BUTTON") return;
      $$("#blogFilters button").forEach(b => b.classList.remove("active"));
      e.target.classList.add("active"); render(e.target.dataset.c);
    });
  },

  /* ---------- BLOG POST ---------- */
  async post() {
    const file = new URLSearchParams(location.search).get("p");
    const idx = await getJSON("content/blog/index.json");
    const meta = idx.posts.find(p => p.file === file) || idx.posts[0];
    const md = await (await fetch("content/blog/" + meta.file)).text();
    document.title = meta.title + " — Rafi Al Imran";
    $("#postMeta").innerHTML = `<span class="tag">${esc(meta.category)}</span> <time class="mono muted" style="font-size:.8rem">${new Date(meta.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</time>`;
    $("#postBody").innerHTML = marked.parse(md);
  },

  /* ---------- CV ---------- */
  async cvpage(profile) {
    const cv = await getJSON("data/cv.json");
    const xp = await getJSON("data/experience.json");
    $("#cvTimeline").innerHTML = xp.map(e => `
      <li class="reveal"><span class="tl-date">${esc(e.start)} — ${esc(e.end)}</span>
      <h3 style="margin:.25rem 0 .1rem;font-size:1.05rem">${esc(e.role)}</h3>
      <div class="tl-org">${esc(e.org)}</div></li>`).join("");
    $("#eduList").innerHTML = cv.education.map(e => `
      <div class="card reveal"><span class="tag">${esc(e.period)}</span><h3 style="font-size:1.05rem">${esc(e.degree)}</h3>
      <p class="muted" style="margin:.2rem 0;font-size:.92rem">${esc(e.school)}</p><p style="font-size:.9rem">${esc(e.detail)}</p></div>`).join("");
    $("#certList").innerHTML = cv.certifications.map(c => `
      <li class="reveal" style="padding:.7rem 0;border-bottom:1px dashed var(--line);display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap">
      <span><b>${esc(c.name)}</b><br><span class="muted" style="font-size:.85rem">${esc(c.issuer)}</span></span>
      <span class="mono muted" style="font-size:.8rem">${esc(c.year)}</span></li>`).join("");
    $("#langList").innerHTML = cv.languages.map(l => `
      <div class="skill"><div class="row"><span>${esc(l.name)}</span><span class="mono muted">${esc(l.level)}</span></div>
      <div class="bar"><div class="fill" style="width:${l.pct}%"></div></div></div>`).join("");
    $("#refList").innerHTML = cv.references.map(r => `
      <div class="card"><h3 style="font-size:1rem">${esc(r.name)}</h3><p class="muted" style="font-size:.88rem;margin:.2rem 0">${esc(r.title)}</p>
      ${r.email ? `<p class="mono" style="font-size:.82rem;margin:0"><a href="mailto:${esc(r.email)}">${esc(r.email)}</a> · ${esc(r.phone)}</p>` : ""}</div>`).join("");
    $$("[data-cv-pdf]").forEach(a => a.href = profile.cvPdf);
    initReveal();
  },

  /* ---------- CONTACT ---------- */
  async contact(profile) {
    $("#contactList").innerHTML = `
      <li><span class="ic">✉</span><span><b>Email</b><br><a href="mailto:${esc(profile.email)}">${esc(profile.email)}</a></span></li>
      <li><span class="ic">in</span><span><b>LinkedIn</b><br><a href="${esc(profile.linkedin)}" rel="noopener">${esc(profile.linkedin.replace("https://www.", ""))}</a></span></li>
      <li><span class="ic">gh</span><span><b>GitHub</b><br><a href="${esc(profile.github)}" rel="noopener">${esc(profile.github.replace("https://", ""))}</a></span></li>
      <li><span class="ic">◎</span><span><b>Location</b><br>${esc(profile.location)}</span></li>`;
    $("#contactForm").addEventListener("submit", e => {
      e.preventDefault();
      const f = e.target;
      const subject = encodeURIComponent("Portfolio contact from " + f.name.value);
      const body = encodeURIComponent(f.message.value + "\n\n— " + f.name.value + " (" + f.email.value + ")");
      location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
    });
  }
};

function projectCard(p) {
  return `<article class="card reveal">
    <div class="card-cover"><img loading="lazy" src="${esc(p.cover)}" alt="${esc(p.title)}" onerror="this.parentElement.innerHTML='<div style=\\'display:grid;place-items:center;height:100%;background:linear-gradient(140deg,var(--navy),var(--green-deep));color:#fff;font-family:var(--font-display);padding:1rem;text-align:center\\'>${esc(p.title)}</div>'"></div>
    ${p.tags.map(t => `<span class="tag">${esc(t)}</span>`).join("")}
    <h3><a href="project.html?id=${p.id}">${esc(p.title)}</a></h3>
    <p class="muted" style="font-size:.92rem">${esc(p.subtitle)}</p>
    <span class="mono" style="font-size:.78rem;color:var(--green)">${esc(p.donor)} · ${esc(p.period)}</span><br>
    <a href="project.html?id=${p.id}" style="font-weight:600;font-size:.9rem">Read case study →</a>
  </article>`;
}

/* ---------- Boot ---------- */
initTheme();
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const profile = await getJSON("data/profile.json");
    renderLayout(profile);
    const page = document.body.dataset.page;
    if (pages[page]) await pages[page](profile);
    initReveal();
  } catch (err) {
    console.error(err);
    const m = $("main");
    if (m && location.protocol === "file:") {
      m.insertAdjacentHTML("afterbegin",
        `<div class="container section-tight"><div class="card"><h3>Local preview needs a tiny server</h3>
        <p>Browsers block reading local JSON files. On GitHub Pages this works automatically. To preview locally, open a terminal in this folder and run:<br>
        <code class="mono">python -m http.server</code> &nbsp;then visit <code class="mono">http://localhost:8000</code></p></div></div>`);
    }
  }
});
