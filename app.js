(() => {
  "use strict";
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const config = window.PORTFOLIO_CONFIG || {};
  const root = document.documentElement;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lowPower = window.matchMedia("(max-width: 700px)").matches || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);

  // Loader
  window.addEventListener("load", () => window.setTimeout(() => $("#loader")?.classList.add("loaded"), 250));
  $("#year").textContent = new Date().getFullYear();

  // Theme: respect a saved choice, otherwise use the system preference.
  let theme = "dark";
  try { theme = localStorage.getItem("faizan-portfolio-theme") || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"); } catch (_) {}
  root.dataset.theme = theme;
  const themeButton = $("#themeToggle");
  const updateThemeButton = () => {
    const light = root.dataset.theme === "light";
    themeButton.textContent = light ? "☾" : "☼";
    themeButton.setAttribute("aria-label", light ? "Switch to dark theme" : "Switch to light theme");
  };
  updateThemeButton();
  themeButton.addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    try { localStorage.setItem("faizan-portfolio-theme", root.dataset.theme); } catch (_) {}
    updateThemeButton();
  });

  // Mobile navigation and keyboard-friendly close behavior.
  const menuButton = $("#menuToggle");
  const nav = $("#primaryNav");
  const closeMenu = () => { nav.classList.remove("open"); menuButton.setAttribute("aria-expanded", "false"); menuButton.setAttribute("aria-label", "Open navigation menu"); };
  menuButton.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
  });
  $$("#primaryNav a").forEach(link => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", event => { if (event.key === "Escape") closeMenu(); });
  document.addEventListener("click", event => { if (!nav.contains(event.target) && !menuButton.contains(event.target)) closeMenu(); });

  // Fill public contact links from config.js.
  const socialValues = {
    email: config.email && !config.email.startsWith("YOUR_") ? `mailto:${config.email}` : "",
    linkedin: config.linkedin && !config.linkedin.includes("YOUR-LINKEDIN") ? config.linkedin : "",
    github: config.github && !config.github.includes("YOUR-GITHUB") ? config.github : "",
    whatsapp: config.whatsapp && !config.whatsapp.startsWith("YOUR_") ? `https://wa.me/${config.whatsapp.replace(/\D/g, "")}` : ""
  };
  $$("[data-social]").forEach(link => {
    const value = socialValues[link.dataset.social];
    if (value) {
      link.href = value;
      if (!value.startsWith("mailto:")) { link.target = "_blank"; link.rel = "noopener noreferrer"; }
      link.removeAttribute("aria-disabled");
    } else {
      link.href = "#contact";
      link.title = "Add your public contact detail in config.js";
      link.addEventListener("click", event => { if (link.dataset.social !== "email") { event.preventDefault(); $("#contact")?.scrollIntoView({behavior: reducedMotion ? "auto" : "smooth"}); } else { event.preventDefault(); } });
    }
  });

  // Project filters.
  const filterButtons = $$(".filter-button");
  const projectCards = $$(".project-card");
  filterButtons.forEach(button => button.addEventListener("click", () => {
    const category = button.dataset.filter;
    filterButtons.forEach(item => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    projectCards.forEach(card => {
      const show = category === "all" || card.dataset.category === category;
      card.classList.toggle("is-hidden", !show);
      if (show) card.classList.add("visible");
    });
  }));

  // Service cards preselect the matching contact form service.
  $$("[data-service]").forEach(link => link.addEventListener("click", () => {
    const select = $("#service");
    if (select) {
      const desired = link.dataset.service;
      const option = [...select.options].find(item => item.text === desired);
      if (option) select.value = option.value;
    }
  }));

  // Scroll reveals and active nav section.
  const revealItems = $$(".reveal");
  if ("IntersectionObserver" in window && !reducedMotion) {
    const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("visible"); revealObserver.unobserve(entry.target); }
    }), {threshold: 0.12});
    revealItems.forEach(item => revealObserver.observe(item));
    const sectionObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        $$("#primaryNav a").forEach(link => link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`));
      }
    }), {rootMargin: "-35% 0px -55% 0px"});
    $$("main section[id]").forEach(section => sectionObserver.observe(section));
  } else revealItems.forEach(item => item.classList.add("visible"));

  // Subtle pointer tilt on larger screens only.
  if (!lowPower && !reducedMotion && matchMedia("(pointer:fine)").matches) {
    $$("[data-tilt]").forEach(card => {
      card.addEventListener("pointermove", event => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        card.style.transform = `perspective(900px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) translateY(-3px)`;
      });
      card.addEventListener("pointerleave", () => { card.style.transform = ""; });
    });
  }

  // Netlify Forms: form submissions are POSTed to the site root.
  const form = $("#contactForm");
  const status = $("#formStatus");
  const submit = $("#submitButton");
  form.addEventListener("submit", async event => {
    event.preventDefault();
    status.textContent = "";
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    if (String(data.get("bot-field") || "").trim()) return;
    data.set("form-name", "contact");
    submit.disabled = true;
    submit.innerHTML = "Sending…";
    try {
      const body = new URLSearchParams();
      for (const [key, value] of data.entries()) body.append(key, value);
      const response = await fetch("/", {method: "POST", headers: {"Content-Type": "application/x-www-form-urlencoded"}, body: body.toString()});
      if (!response.ok) throw new Error("Form submission failed");
      status.textContent = "Thank you — your enquiry has been sent. I'll be in touch.";
      form.reset();
    } catch (error) {
      status.textContent = "The form could not send your message. Please try again after deployment, or contact me using the configured email or WhatsApp link.";
    } finally {
      submit.disabled = false;
      submit.innerHTML = 'Send enquiry <span>↗</span>';
    }
  });

  // Optional CV asset check. The button is hidden until the owner adds the real PDF.
  const cvLink = $("#cvLink");
  fetch("assets/faizan-ahsan-cv.pdf", {method: "HEAD"}).then(response => {
    if (!response.ok) cvLink.classList.add("cv-missing");
  }).catch(() => cvLink.classList.add("cv-missing"));

  // Lightweight Three.js hero scene. If WebGL/CDN is unavailable, CSS visuals remain.
  if (!reducedMotion && !lowPower) {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js";
    script.async = true;
    script.onload = () => {
      try {
        const THREE = window.THREE;
        const canvas = $("#hero-canvas");
        const renderer = new THREE.WebGLRenderer({canvas, alpha: true, antialias: false, powerPreference: "low-power"});
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(48, 1, .1, 100);
        camera.position.z = 8;
        const group = new THREE.Group();
        scene.add(group);
        const coreGeometry = new THREE.IcosahedronGeometry(1.18, 1);
        const coreMaterial = new THREE.MeshBasicMaterial({color: 0x8b7cff, wireframe: true, transparent: true, opacity: .36});
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        group.add(core);
        const inner = new THREE.Mesh(new THREE.IcosahedronGeometry(.68, 1), new THREE.MeshBasicMaterial({color: 0xff8a48, wireframe: true, transparent: true, opacity: .28}));
        group.add(inner);
        const ring = new THREE.Mesh(new THREE.TorusGeometry(1.65, .008, 5, 100), new THREE.MeshBasicMaterial({color: 0x70d9e8, transparent: true, opacity: .55}));
        ring.rotation.x = 1.15; ring.rotation.y = .35; group.add(ring);
        const count = 360, positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
          const radius = 2.2 + Math.random() * 2.7;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          positions[i*3] = radius * Math.sin(phi) * Math.cos(theta);
          positions[i*3+1] = radius * Math.sin(phi) * Math.sin(theta);
          positions[i*3+2] = radius * Math.cos(phi);
        }
        const particleGeometry = new THREE.BufferGeometry();
        particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        const particles = new THREE.Points(particleGeometry, new THREE.PointsMaterial({color: 0xb4c3e8, size: .025, transparent: true, opacity: .65}));
        scene.add(particles);
        const resize = () => {
          const width = canvas.clientWidth || window.innerWidth;
          const height = canvas.clientHeight || 650;
          renderer.setSize(width, height, false);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          group.position.set(width < 800 ? 2.1 : 3.4, .1, -1.2);
          group.scale.setScalar(width < 800 ? .7 : 1);
        };
        resize();
        window.addEventListener("resize", resize, {passive: true});
        let frame = 0, pointerX = 0, pointerY = 0;
        window.addEventListener("pointermove", event => {
          pointerX = (event.clientX / window.innerWidth - .5) * .3;
          pointerY = (event.clientY / window.innerHeight - .5) * .2;
        }, {passive: true});
        const animate = () => {
          frame = requestAnimationFrame(animate);
          core.rotation.y += .0018; core.rotation.x += .0009;
          inner.rotation.y -= .0014; ring.rotation.z += .001;
          particles.rotation.y += .00018;
          group.rotation.y += (pointerX - group.rotation.y) * .012;
          group.rotation.x += (-pointerY - group.rotation.x) * .012;
          renderer.render(scene, camera);
        };
        animate();
        document.addEventListener("visibilitychange", () => { if (document.hidden) cancelAnimationFrame(frame); else animate(); });
      } catch (error) { console.info("3D scene unavailable; CSS hero effects remain active.", error); }
    };
    script.onerror = () => console.info("Three.js could not load; CSS hero effects remain active.");
    document.head.appendChild(script);
  }
})();
