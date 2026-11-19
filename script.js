/* Caio Magalhães · Landing page de vendas */
(() => {
  "use strict";

  const WA_NUMBER = "5511966197683";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---------- WhatsApp links ---------- */
  $$("[data-wa]").forEach((a) => {
    const msg = a.getAttribute("data-wa") || "Olá, Caio!";
    a.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
    a.target = "_blank";
    a.rel = "noopener";
  });

  /* ---------- Nav: scroll state + mobile menu ---------- */
  const nav = $(".nav");
  const toggle = $(".nav__toggle");
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  });
  $$(".nav__links a").forEach((a) =>
    a.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    })
  );

  /* ---------- Scroll: progress bar + nav ---------- */
  const bar = $(".progress span");
  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    nav.classList.toggle("is-scrolled", y > 20);
    ticking = false;
  };
  addEventListener("scroll", () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
  onScroll();

  /* ---------- Reveal on scroll (with stagger) ---------- */
  const groups = new Map();
  $$(".reveal").forEach((el) => {
    const parent = el.parentElement;
    const i = groups.get(parent) || 0;
    el.style.setProperty("--d", `${Math.min(i, 6) * 0.08}s`);
    groups.set(parent, i + 1);
  });

  const counted = new WeakSet();
  const runCounters = (root) => {
    $$("[data-count]", root).forEach((el) => {
      if (counted.has(el)) return;
      counted.add(el);
      const target = +el.dataset.count;
      if (reduceMotion) { el.textContent = target; return; }
      const dur = 1600;
      const t0 = performance.now();
      const step = (t) => {
        const p = Math.min((t - t0) / dur, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  };

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-in");
        runCounters(e.target);
        io.unobserve(e.target);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );
  $$(".reveal").forEach((el) => io.observe(el));

  /* ---------- Hero: rotating word ---------- */
  const word = $(".rotator__word");
  const words = ["vende de verdade.", "atrai clientes.", "passa confiança.", "trabalha por você."];
  let wi = 0;
  if (word && !reduceMotion) {
    setInterval(() => {
      word.classList.add("is-out");
      setTimeout(() => {
        wi = (wi + 1) % words.length;
        word.textContent = words[wi];
        word.classList.remove("is-out");
      }, 380);
    }, 2800);
  }

  /* ---------- Hero: phone tilt ---------- */
  const tiltWrap = $("[data-tilt]");
  const phone = $(".phone");
  if (tiltWrap && phone && !reduceMotion && matchMedia("(hover: hover)").matches) {
    tiltWrap.addEventListener("pointermove", (e) => {
      const r = tiltWrap.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      phone.style.setProperty("--ry", `${x * 18}deg`);
      phone.style.setProperty("--rx", `${-y * 14}deg`);
    });
    tiltWrap.addEventListener("pointerleave", () => {
      phone.style.removeProperty("--ry");
      phone.style.removeProperty("--rx");
    });
  }

  /* ---------- Before / After slider ---------- */
  const ba = $("#ba");
  if (ba) {
    const range = $(".ba__range", ba);
    const set = (v) => {
      ba.style.setProperty("--pos", `${v}%`);
      range.value = v;
    };
    let touched = false;
    range.addEventListener("input", () => { touched = true; set(range.value); });
    range.addEventListener("pointerdown", () => { touched = true; ba.classList.add("is-dragging"); });
    addEventListener("pointerup", () => ba.classList.remove("is-dragging"));

    // Animação de "demonstração" quando a seção aparece
    if (!reduceMotion) {
      const demo = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        demo.disconnect();
        const keys = [[0, 50], [900, 82], [1900, 18], [2900, 50]];
        const t0 = performance.now() + 500;
        const ease = (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
        const frame = (t) => {
          if (touched) return;
          const el = t - t0;
          if (el < 0) return requestAnimationFrame(frame);
          for (let k = 1; k < keys.length; k++) {
            const [ta, va] = keys[k - 1];
            const [tb, vb] = keys[k];
            if (el <= tb) {
              set(va + (vb - va) * ease((el - ta) / (tb - ta)));
              return requestAnimationFrame(frame);
            }
          }
          set(50);
        };
        requestAnimationFrame(frame);
      }, { threshold: 0.5 });
      demo.observe(ba);
    }
  }

  /* ---------- Calculator ---------- */
  const ticket = $("#ticket");
  const leads = $("#leads");
  if (ticket && leads) {
    const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
    const fill = (input) => {
      const p = ((input.value - input.min) / (input.max - input.min)) * 100;
      input.style.setProperty("--fill", `${p}%`);
    };
    const animateTo = (el, to) => {
      const from = +(el.dataset.v || 0);
      el.dataset.v = to;
      if (reduceMotion) { el.textContent = brl.format(to); return; }
      const t0 = performance.now();
      const step = (t) => {
        const p = Math.min((t - t0) / 450, 1);
        el.textContent = brl.format(Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3))));
        if (p < 1 && +el.dataset.v === to) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const update = () => {
      const t = +ticket.value;
      const l = +leads.value;
      $("#ticketOut").textContent = brl.format(t);
      $("#leadsOut").textContent = l;
      animateTo($("#perMonth"), t * l);
      animateTo($("#perYear"), t * l * 12);
      fill(ticket);
      fill(leads);
    };
    ticket.addEventListener("input", update);
    leads.addEventListener("input", update);
    update();
  }

  /* ---------- FAQ: animate open/close, one at a time ---------- */
  $$(".faq details").forEach((d) => {
    const summary = $("summary", d);
    const body = $("div", d);
    summary.addEventListener("click", (e) => {
      if (reduceMotion) return;
      e.preventDefault();
      if (d.open) {
        const h = body.scrollHeight;
        body.animate([{ height: `${h}px`, opacity: 1 }, { height: "0px", opacity: 0 }], { duration: 300, easing: "ease" })
          .onfinish = () => { d.open = false; };
      } else {
        $$(".faq details[open]").forEach((o) => { if (o !== d) o.open = false; });
        d.open = true;
        const h = body.scrollHeight;
        body.animate([{ height: "0px", opacity: 0 }, { height: `${h}px`, opacity: 1 }], { duration: 350, easing: "cubic-bezier(.2,.8,.2,1)" });
      }
    });
  });

  /* ---------- Floating WhatsApp: tooltip hint ---------- */
  const waFloat = $(".wa-float");
  if (waFloat) {
    setTimeout(() => {
      waFloat.classList.add("show-tip");
      setTimeout(() => waFloat.classList.remove("show-tip"), 4500);
    }, 6000);
  }

  /* ---------- Footer year ---------- */
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();
})();
