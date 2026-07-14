/* =========================================================
   MUHAMMAD WAJEEH — PORTFOLIO
   Navigation behavior + Hero graph-traversal animation
   (Additional section-specific scripts will be appended
   here as later sections are approved.)
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initHeroGraph();
  renderProjects();
  initScrollReveal();
  initActiveLinkOnScroll();
  initGitHubStats();
  initContactForm();
  initFooterYear();
});

/* ---------------------- NAVIGATION ---------------------- */
function initNav() {
  const nav = document.getElementById("nav");
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");

  // Sticky nav background on scroll
  const onScroll = () => {
    nav.classList.toggle("is-scrolled", window.scrollY > 12);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Mobile menu toggle
  toggle.addEventListener("click", () => {
    const isOpen = links.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  // Close mobile menu + set active link on click
  links.querySelectorAll(".nav__link").forEach((link) => {
    link.addEventListener("click", () => {
      links.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      links.querySelectorAll(".nav__link").forEach((l) => l.classList.remove("is-active"));
      link.classList.add("is-active");
    });
  });
}

/* ---------------------- HERO GRAPH ---------------------- */
/**
 * Signature visual: a network of nodes and edges — evoking a graph
 * data structure — with light traveling along edges the way a
 * breadth-first traversal would visit them. Ties the hero directly
 * to the "Data Structures & Algorithms" identity of the portfolio
 * instead of generic decorative particles.
 */
function initHeroGraph() {
  const canvas = document.getElementById("graphCanvas");
  if (!canvas) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ctx = canvas.getContext("2d");

  let width, height, dpr;
  let nodes = [];
  let edges = [];
  let pulses = [];
  let rafId = null;

  const NODE_COLOR = "rgba(148, 163, 184, 0.9)";
  const EDGE_COLOR = "rgba(148, 163, 184, 0.14)";
  const PULSE_COLORS = ["#3B82F6", "#06B6D4"];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth = canvas.offsetWidth;
    height = canvas.clientHeight = canvas.offsetHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildGraph();
  }

  function buildGraph() {
    const isMobile = width < 700;
    const nodeCount = isMobile ? 16 : 28;

    // Bias node placement toward the right/upper area so it reads as a
    // companion to the left-aligned headline rather than competing with it.
    nodes = Array.from({ length: nodeCount }, () => ({
      x: width * (isMobile ? Math.random() : 0.42 + Math.random() * 0.58),
      y: height * Math.random(),
      r: 1.6 + Math.random() * 1.8,
      vx: (Math.random() - 0.5) * 0.06,
      vy: (Math.random() - 0.5) * 0.06,
    }));

    // Connect each node to its nearest few neighbors (graph adjacency)
    edges = [];
    const maxDist = width * (isMobile ? 0.28 : 0.2);
    nodes.forEach((a, i) => {
      const distances = nodes
        .map((b, j) => ({ j, d: i === j ? Infinity : Math.hypot(a.x - b.x, a.y - b.y) }))
        .sort((p, q) => p.d - q.d)
        .slice(0, 3);

      distances.forEach(({ j, d }) => {
        if (d < maxDist) {
          const key = i < j ? `${i}-${j}` : `${j}-${i}`;
          if (!edges.find((e) => e.key === key)) {
            edges.push({ key, a: i, b: j });
          }
        }
      });
    });

    pulses = [];
    if (!prefersReducedMotion) {
      seedPulses();
    }
  }

  function seedPulses() {
    // Keep 2-4 traversal pulses alive at a time
    while (pulses.length < 3 && edges.length) {
      spawnPulse();
    }
  }

  function spawnPulse(fromNode) {
    const startEdges = fromNode == null
      ? edges
      : edges.filter((e) => e.a === fromNode || e.b === fromNode);
    const pool = startEdges.length ? startEdges : edges;
    const edge = pool[Math.floor(Math.random() * pool.length)];
    if (!edge) return;

    const forward = Math.random() > 0.5;
    pulses.push({
      edge,
      t: 0,
      speed: 0.006 + Math.random() * 0.006,
      from: forward ? edge.a : edge.b,
      to: forward ? edge.b : edge.a,
      color: PULSE_COLORS[Math.floor(Math.random() * PULSE_COLORS.length)],
    });
  }

  function step() {
    ctx.clearRect(0, 0, width, height);

    // Drift nodes gently
    nodes.forEach((n) => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > width) n.vx *= -1;
      if (n.y < 0 || n.y > height) n.vy *= -1;
    });

    // Edges
    ctx.lineWidth = 1;
    edges.forEach((e) => {
      const a = nodes[e.a], b = nodes[e.b];
      ctx.strokeStyle = EDGE_COLOR;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    });

    // Nodes
    nodes.forEach((n) => {
      ctx.fillStyle = NODE_COLOR;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Pulses traveling along edges (the traversal)
    if (!prefersReducedMotion) {
      pulses.forEach((p) => (p.t += p.speed));

      pulses.forEach((p) => {
        const a = nodes[p.from], b = nodes[p.to];
        const x = a.x + (b.x - a.x) * p.t;
        const y = a.y + (b.y - a.y) * p.t;

        const glow = ctx.createRadialGradient(x, y, 0, x, y, 8);
        glow.addColorStop(0, p.color);
        glow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(x, y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Replace finished pulses, occasionally branching from their landing node
      pulses = pulses.filter((p) => {
        if (p.t >= 1) {
          if (Math.random() > 0.4) spawnPulse(p.to);
          return false;
        }
        return true;
      });
      if (pulses.length < 2) seedPulses();
    }

    rafId = requestAnimationFrame(step);
  }

  resize();
  window.addEventListener("resize", debounce(resize, 200));

  if (prefersReducedMotion) {
    // Draw a single static frame — no animation loop
    step_static();
  } else {
    rafId = requestAnimationFrame(step);
  }

  function step_static() {
    ctx.clearRect(0, 0, width, height);
    edges.forEach((e) => {
      const a = nodes[e.a], b = nodes[e.b];
      ctx.strokeStyle = EDGE_COLOR;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    });
    nodes.forEach((n) => {
      ctx.fillStyle = NODE_COLOR;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}

/* ---------------------- SCROLL REVEAL ---------------------- */
function initScrollReveal() {
  const targets = document.querySelectorAll(".reveal");
  if (!targets.length) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Slight stagger when multiple items enter together
          setTimeout(() => entry.target.classList.add("is-visible"), index * 80);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
  );

  targets.forEach((el) => observer.observe(el));
}

/* ---------------------- ACTIVE NAV LINK ON SCROLL ---------------------- */
function initActiveLinkOnScroll() {
  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll(".nav__link");
  if (!sections.length || !navLinks.length) return;

  const setActive = (id) => {
    navLinks.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      });
    },
    { threshold: 0.5, rootMargin: `-${getComputedRootNavHeight()}px 0px -40% 0px` }
  );

  sections.forEach((section) => observer.observe(section));
}

function getComputedRootNavHeight() {
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--nav-height");
  return parseInt(raw, 10) || 76;
}

function debounce(fn, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
}

/* =========================================================
   PROJECTS
   Edit this array to add, remove, or update projects — the
   grid below is generated from it, so the markup only needs
   to change in one place.
   ========================================================= */
const PROJECTS = [
  {
    name: "Portfolio Website",
    file: "portfolio.html",
    monogram: "PW",
    desc: "This site — a hand-built, no-framework portfolio focused on clarity and performance.",
    tech: ["HTML", "CSS", "JavaScript"],
    github: "https://github.com/wajeeh786m/portfolio-website",
    demo: "https://wajeeh786m.github.io/portfolio-website/",
  },
  {
    name: "Weather App",
    file: "weather.js",
    monogram: "WX",
    desc: "Looks up current conditions and a short forecast for any city using a public weather API.",
    tech: ["JavaScript", "REST API", "CSS"],
    github: "https://github.com/wajeeh786m/weather-app",
    demo: "https://wajeeh786m.github.io/weather-app/",
  },
  {
    name: "Task Manager",
    file: "tasks.js",
    monogram: "TM",
    desc: "A to-do list with categories, due dates, and persistent storage in the browser.",
    tech: ["JavaScript", "LocalStorage", "CSS"],
    github: "https://github.com/wajeeh786m/task-manager",
    demo: "https://wajeeh786m.github.io/task-manager/",
  },
  {
    name: "Calculator",
    file: "calc.js",
    monogram: "CA",
    desc: "A keyboard-friendly calculator built to practice operator precedence and DOM state.",
    tech: ["JavaScript", "HTML", "CSS"],
    github: "https://github.com/wajeeh786m/calculator",
    demo: "https://wajeeh786m.github.io/calculator/",
  },
  {
    name: "Expense Tracker",
    file: "expenses.py",
    monogram: "EX",
    desc: "A command-line tool for logging expenses by category and summarizing monthly spend.",
    tech: ["Python", "SQLite"],
    github: "https://github.com/wajeeh786m/expense-tracker",
    demo: "https://wajeeh786m.github.io/expense-tracker/",
  },
  {
    name: "Password Generator",
    file: "pwgen.js",
    monogram: "PG",
    desc: "Generates configurable random passwords with adjustable length and character sets.",
    tech: ["JavaScript", "HTML"],
    github: "https://github.com/muhammadwajeeh/password-generator",
    demo: "#",
  },
  {
    name: "QR Code Generator",
    file: "qrgen.js",
    monogram: "QR",
    desc: "Turns any text or URL into a downloadable QR code rendered on a canvas.",
    tech: ["JavaScript", "Canvas API"],
    github: "https://github.com/muhammadwajeeh/qr-code-generator",
    demo: "#",
  },
  {
    name: "Text Analyzer",
    file: "textanalyzer.py",
    monogram: "TA",
    desc: "Counts words, sentences, and reading time, and flags the most frequent terms in a passage.",
    tech: ["Python", "Basic NLP"],
    github: "https://github.com/muhammadwajeeh/text-analyzer",
    demo: "#",
  },
  {
    name: "Sorting Visualizer",
    file: "sortviz.js",
    monogram: "SV",
    desc: "Animates bubble, merge, and quick sort step by step to make the algorithms easier to reason about.",
    tech: ["JavaScript", "Canvas API"],
    github: "https://github.com/muhammadwajeeh/sorting-visualizer",
    demo: "#",
  },
  {
    name: "File Organizer",
    file: "fileorganizer.py",
    monogram: "FO",
    desc: "A script that sorts a messy downloads folder into subfolders by file type.",
    tech: ["Python", "OS module"],
    github: "https://github.com/muhammadwajeeh/file-organizer",
    demo: "#",
  },
  {
    name: "AI Chat App",
    file: "aichat.js",
    monogram: "AI",
    desc: "A simple chat interface wired to a language model API, built to learn how conversational UIs work.",
    tech: ["JavaScript", "LLM API"],
    github: "https://github.com/muhammadwajeeh/ai-chat-app",
    demo: "#",
  },
  {
    name: "Resume Analyzer",
    file: "resumeai.py",
    monogram: "RA",
    desc: "Parses a resume and highlights missing sections or keywords against a target job description.",
    tech: ["Python", "Regex", "NLP"],
    github: "https://github.com/muhammadwajeeh/resume-analyzer",
    demo: "#",
  },
  {
    name: "Password Strength Checker",
    file: "pwstrength.js",
    monogram: "PS",
    desc: "Scores a password in real time and explains what would make it stronger.",
    tech: ["JavaScript", "Regex"],
    github: "https://github.com/muhammadwajeeh/password-strength-checker",
    demo: "#",
  },
  {
    name: "Hash Generator",
    file: "hashgen.js",
    monogram: "HG",
    desc: "Generates MD5/SHA hashes for text or files entirely client-side using the Web Crypto API.",
    tech: ["JavaScript", "Web Crypto API"],
    github: "https://github.com/muhammadwajeeh/hash-generator",
    demo: "#",
  },
  {
    name: "Deadfit Clothing Website",
    file: "deadfit.html",
    monogram: "DF",
    desc: "A concept storefront for a streetwear brand, built to practice layout, product grids, and cart UI.",
    tech: ["HTML", "CSS", "JavaScript"],
    github: "https://github.com/muhammadwajeeh/deadfit",
    demo: "#",
  },
];

function renderProjects() {
  const grid = document.getElementById("projectsGrid");
  if (!grid) return;

  grid.innerHTML = PROJECTS.map(
    (p, i) => `
    <article class="project-card reveal" style="transition-delay:${(i % 3) * 60}ms">
      <div class="project-card__window">
        <span class="project-card__dot"></span>
        <span class="project-card__dot"></span>
        <span class="project-card__dot"></span>
        <span class="project-card__filename">${p.file}</span>
      </div>
      <div class="project-card__preview">
        <span class="project-card__monogram">${p.monogram}</span>
      </div>
      <div class="project-card__body">
        <h3 class="project-card__title">${p.name}</h3>
        <p class="project-card__desc">${p.desc}</p>
        <div class="project-card__tags">
          ${p.tech.map((t) => `<span class="project-card__tag">${t}</span>`).join("")}
        </div>
        <div class="project-card__actions">
          <a class="project-card__action" href="${p.github}" target="_blank" rel="noopener noreferrer">Code</a>
          <a class="project-card__action project-card__action--primary" href="${p.demo}" target="_blank" rel="noopener noreferrer">Live Demo</a>
        </div>
      </div>
    </article>`
  ).join("");
}

/* =========================================================
   GITHUB STATISTICS
   Fetches public, unauthenticated data from the GitHub REST
   API in the visitor's browser. Update GITHUB_USERNAME below
   to match the real account. The contribution graph itself
   needs GitHub's authenticated GraphQL API, so it's rendered
   as a decorative pattern instead of fabricated numbers.
   ========================================================= */
const GITHUB_USERNAME = "wajeeh786m";

async function initGitHubStats() {
  renderHeatmapPattern();

  const repoCountEl = document.getElementById("ghRepoCount");
  const repoNoteEl = document.getElementById("ghRepoNote");
  const languagesEl = document.getElementById("ghLanguages");

  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${GITHUB_USERNAME}`),
      fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100`),
    ]);

    if (!userRes.ok || !reposRes.ok) throw new Error("GitHub API request failed");

    const user = await userRes.json();
    const repos = await reposRes.json();

    // Repository count
    repoCountEl.textContent = user.public_repos ?? "—";
    repoNoteEl.textContent = "Live count from GitHub.";

    // Language breakdown (share of repos per primary language — a simple
    // approximation, not byte-weighted)
    const counts = {};
    repos.forEach((r) => {
      if (r.language) counts[r.language] = (counts[r.language] || 0) + 1;
    });

    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    const top = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    if (!top.length) throw new Error("No language data");

    languagesEl.innerHTML = top
      .map(([lang, count]) => {
        const pct = Math.round((count / total) * 100);
        return `
          <li class="gh-language">
            <div class="gh-language__row">
              <span>${lang}</span>
              <span>${pct}%</span>
            </div>
            <div class="gh-language__track">
              <div class="gh-language__fill" style="width:${pct}%"></div>
            </div>
          </li>`;
      })
      .join("");
  } catch (err) {
    // Graceful fallback — keep the layout intact, be upfront that it's placeholder data
    repoCountEl.textContent = "15+";
    repoNoteEl.textContent = "Update GITHUB_USERNAME in script.js to pull a live count.";
    languagesEl.innerHTML = `
      <li class="gh-language gh-language--skeleton">
        Connect a GitHub username in script.js to show real language stats.
      </li>`;
  }
}

function renderHeatmapPattern() {
  const heatmap = document.getElementById("ghHeatmap");
  if (!heatmap) return;

  const cellCount = 26 * 7; // matches the 26-column grid defined in CSS
  const cells = Array.from({ length: cellCount }, () => {
    // Weighted toward low/no activity with occasional bursts, purely for
    // visual rhythm — not tied to real contribution data.
    const roll = Math.random();
    let level = 0;
    if (roll > 0.94) level = 4;
    else if (roll > 0.85) level = 3;
    else if (roll > 0.7) level = 2;
    else if (roll > 0.5) level = 1;

    const opacity = [0.06, 0.22, 0.42, 0.65, 0.9][level];
    return `<span style="background:rgba(6,182,212,${opacity})"></span>`;
  });

  heatmap.innerHTML = cells.join("");
}

/* =========================================================
   CONTACT FORM
   No backend is wired up, so the form composes a mailto:
   link from the visitor's input and hands off to their email
   client — honest about what it can actually do.
   ========================================================= */
function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const note = document.getElementById("contactFormNote");
  const fields = ["cf-name", "cf-email", "cf-message"];

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    let valid = true;
    fields.forEach((id) => {
      const input = document.getElementById(id);
      const errorEl = form.querySelector(`[data-error-for="${id}"]`);
      const value = input.value.trim();
      let message = "";

      if (!value) {
        message = "This field is required.";
      } else if (id === "cf-email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        message = "Enter a valid email address.";
      }

      errorEl.textContent = message;
      if (message) valid = false;
    });

    if (!valid) {
      note.textContent = "Please fix the highlighted fields.";
      return;
    }

    const name = document.getElementById("cf-name").value.trim();
    const email = document.getElementById("cf-email").value.trim();
    const message = document.getElementById("cf-message").value.trim();

    const subject = encodeURIComponent(`Portfolio contact from ${name}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:muhammad.wajeeh@example.com?subject=${subject}&body=${body}`;

    note.textContent = "Opening your email client with the message ready to send…";
  });
}

/* ---------------------- FOOTER YEAR ---------------------- */
function initFooterYear() {
  const el = document.getElementById("footerYear");
  if (el) el.textContent = new Date().getFullYear();
}
