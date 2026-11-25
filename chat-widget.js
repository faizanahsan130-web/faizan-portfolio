/* Faizan Ahsan — portfolio chatbot widget.
   Rule-based assistant: answers common questions about Faizan's services,
   pricing, availability and projects, and hands off to WhatsApp / email.
   No external requests, no API keys. To wire it to a live AI agent later,
   set window.CHATBOT_WEBHOOK to an n8n / Botpress webhook URL. */
(() => {
  "use strict";
  const config = window.PORTFOLIO_CONFIG || {};
  const waNumber = (config.whatsapp || "923102051181").replace(/\D/g, "");
  const waLink = "https://wa.me/" + waNumber;
  const email = config.email || "faizanahsan130@gmail.com";
  const github = config.github || "https://github.com/faizanahsan130-web";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const ANSWERS = [
    { re: /\b(hi|hello|hey|aoa|salam|assalam|good (morning|afternoon|evening))\b/, text: "Hi, I'm Faizan's website assistant. I can answer questions about his services, pricing, availability and projects — or connect you with him directly. What would you like to know?" },
    { re: /who are you|your name|are you (a )?(human|real|ai|bot)/, text: "I'm the assistant chatbot on Faizan's portfolio website. I answer common questions instantly; for anything detailed, I can connect you with Faizan himself on WhatsApp or email." },
    { re: /pric|cost|budget|rate|how much|charge|fee/, text: "Pricing depends on the scope of the project — there's no fixed menu. Share a few details through the contact form or WhatsApp and Faizan will send a quote, or book a free 15-minute call to scope it together." },
    { re: /voice|vapi|call (agent|assistant)|phone (agent|assistant)|retell/, text: "Yes — Faizan builds AI voice assistants with Vapi.ai that answer calls, book appointments and handle common questions, including after-hours calls. Tell him about your call volume and he'll scope it for you." },
    { re: /chatbot|whatsapp bot|whatsapp/, text: "Yes — Faizan builds AI chatbots for websites and WhatsApp that answer customer questions, capture leads and book appointments, with a handover to a human when needed." },
    { re: /website|web (dev|site|development|design)|landing page/, text: "Yes — Faizan builds modern, fast websites, including this portfolio. He can add booking, chatbots and automation on top. Tell him what your site needs to do and he'll quote it." },
    { re: /n8n|make\.com|zapier|automation|automate|workflow/, text: "Faizan builds n8n and Make.com workflows that connect your tools — lead capture, appointment booking, CRM updates, and email / WhatsApp follow-ups — using APIs and webhooks. Share the process you want automated and he'll map it out." },
    { re: /\bai agent|agent(s)?\b/, text: "Faizan builds custom AI agents — chatbots, voice assistants and workflow agents — using n8n, Gemini AI, Vapi.ai and Botpress, connected to your CRM, calendar and messaging tools." },
    { re: /hire|hiring|job|work with|freelance|availability|available|remote/, text: "Faizan is open to freelance projects and remote roles. He works full-time during US business hours (Eastern / Central) as well as Pakistan time. Share your project or role and he'll get back to you." },
    { re: /project|portfolio|example|sample|your work|case stud/, text: "You can see five concept projects on this page — lead enrichment, a Vapi voice assistant, a support chatbot, appointment booking and workflow automation. His code is on GitHub: " + github },
    { re: /\bcv\b|resume|download/, text: "You can download Faizan's CV here: assets/faizan-ahsan-cv.pdf — or view his experience in the Experience section of this page." },
    { re: /book|call|meeting|schedule|talk to|15[- ]?min/, text: "You can book a free 15-minute call — message Faizan on WhatsApp and mention a time that suits you, or send your details through the contact form at the bottom of this page." },
    { re: /contact|talk|human|person|email|reach/, text: "You can reach Faizan on WhatsApp (+92 310 2051181) or email " + email + " — or use the contact form at the bottom of this page." },
    { re: /thank|thanks|shukran/, text: "You're welcome! Anything else you'd like to know?" },
    { re: /service|offer|what (do|can) you do|what does he do/, text: "Faizan builds:\n1) AI automation (n8n / Make workflows)\n2) Custom AI agents & chatbots (incl. WhatsApp)\n3) AI voice assistants (Vapi)\n4) API integrations\n5) Business process automation\n6) Website development\n\nWhich one interests you?" }
  ];
  const FALLBACK = "I can help with services, pricing, availability, projects, or connecting you with Faizan. Try one of the suggestions below — or message him directly on WhatsApp for anything else.";

  const CHIPS = ["Services", "Pricing", "Voice agents", "Book a call"];

  // Build the widget DOM.
  const fab = document.createElement("button");
  fab.className = "chat-fab";
  fab.type = "button";
  fab.setAttribute("aria-label", "Open chat with Faizan's assistant");
  fab.setAttribute("aria-expanded", "false");
  fab.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg><span class="chat-fab-dot" aria-hidden="true"></span>';

  const panel = document.createElement("div");
  panel.className = "chat-panel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "Chat with Faizan's assistant");
  panel.innerHTML =
    '<div class="chat-header">' +
      '<div class="chat-avatar" aria-hidden="true">FA</div>' +
      '<div class="chat-header-text"><strong>Faizan\'s Assistant</strong><span><i class="chat-status-dot"></i>Online — instant answers</span></div>' +
      '<button class="chat-close" type="button" aria-label="Close chat">✕</button>' +
    '</div>' +
    '<div class="chat-messages" aria-live="polite"></div>' +
    '<div class="chat-chips"></div>' +
    '<div class="chat-handoff"><a href="' + waLink + '" target="_blank" rel="noopener">WhatsApp ↗</a><a href="mailto:' + email + '">Email ↗</a></div>' +
    '<div class="chat-input-row"><input class="chat-input" type="text" placeholder="Ask about services, pricing…" aria-label="Type your message" maxlength="500"><button class="chat-send" type="button" aria-label="Send message">➤</button></div>';

  document.body.appendChild(fab);
  document.body.appendChild(panel);

  const messages = panel.querySelector(".chat-messages");
  const chipsRow = panel.querySelector(".chat-chips");
  const input = panel.querySelector(".chat-input");
  const sendBtn = panel.querySelector(".chat-send");
  const closeBtn = panel.querySelector(".chat-close");
  let greeted = false;

  function linkify(text) {
    return text
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>')
      .replace(/assets\/faizan-ahsan-cv\.pdf/g, '<a href="assets/faizan-ahsan-cv.pdf" target="_blank" rel="noopener">Faizan_Ahsan_CV.pdf</a>');
  }

  function addMessage(text, who) {
    const el = document.createElement("div");
    el.className = "chat-msg " + who;
    if (who === "bot") el.innerHTML = linkify(text);
    else el.textContent = text;
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
    return el;
  }

  function answer(raw) {
    const q = " " + raw.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ") + " ";
    for (const rule of ANSWERS) if (rule.re.test(q)) return rule.text;
    return FALLBACK;
  }

  function botReply(userText) {
    const typing = document.createElement("div");
    typing.className = "chat-msg bot chat-typing";
    typing.innerHTML = "<i></i><i></i><i></i>";
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;
    const delay = reducedMotion ? 60 : 550 + Math.random() * 350;
    window.setTimeout(() => {
      typing.remove();
      addMessage(answer(userText), "bot");
    }, delay);
  }

  function send(text) {
    const value = (text !== undefined ? text : input.value).trim();
    if (!value) return;
    addMessage(value, "user");
    input.value = "";
    input.focus();
    botReply(value);
  }

  CHIPS.forEach(label => {
    const chip = document.createElement("button");
    chip.className = "chat-chip";
    chip.type = "button";
    chip.textContent = label;
    chip.addEventListener("click", () => send(label));
    chipsRow.appendChild(chip);
  });

  function openPanel() {
    panel.classList.add("open");
    fab.setAttribute("aria-expanded", "true");
    if (!greeted) {
      greeted = true;
      window.setTimeout(() => addMessage("Hi, I'm Faizan's website assistant. Ask me about his services, pricing, or availability — or tap a suggestion below.", "bot"), reducedMotion ? 0 : 250);
    }
    input.focus();
  }
  function closePanel() {
    panel.classList.remove("open");
    fab.setAttribute("aria-expanded", "false");
    fab.focus();
  }

  fab.addEventListener("click", () => (panel.classList.contains("open") ? closePanel() : openPanel()));
  closeBtn.addEventListener("click", closePanel);
  sendBtn.addEventListener("click", () => send());
  input.addEventListener("keydown", event => { if (event.key === "Enter") send(); });
  document.addEventListener("keydown", event => { if (event.key === "Escape" && panel.classList.contains("open")) closePanel(); });
})();
