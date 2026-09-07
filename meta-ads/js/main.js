(() => {
  "use strict";

  // ---------------------------------------------------------------------
  // CONFIG — reemplaza estos valores antes de publicar el sitio.
  // ---------------------------------------------------------------------
  const MAKE_WEBHOOK_URL = "https://hook.us2.make.com/ii2xnmbkbi7h7a6r6eqqq56fu59qk8a2";
  const WHATSAPP_NUMBER = "50768475437"; // formato: 507XXXXXXX (sin +, sin espacios)

  // ---------------------------------------------------------------------
  // FAQ accordion
  // ---------------------------------------------------------------------
  function initFaq() {
    const questions = document.querySelectorAll(".faq-question");
    questions.forEach((btn) => {
      btn.addEventListener("click", () => {
        const isOpen = btn.getAttribute("aria-expanded") === "true";
        questions.forEach((other) => other.setAttribute("aria-expanded", "false"));
        btn.setAttribute("aria-expanded", isOpen ? "false" : "true");
      });
    });
  }

  // ---------------------------------------------------------------------
  // Scroll reveal
  // ---------------------------------------------------------------------
  function initScrollReveal() {
    const targets = document.querySelectorAll(".reveal");
    if (!targets.length) return;

    if (!("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -12% 0px" }
    );

    targets.forEach((el) => observer.observe(el));
  }

  // ---------------------------------------------------------------------
  // Hero parallax + floating CTA
  // ---------------------------------------------------------------------
  function initScrollEffects() {
    const hero = document.querySelector("[data-hero-img]");
    const cta = document.getElementById("float-cta");

    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      if (hero) hero.style.transform = "translateY(" + (y * 0.05).toFixed(1) + "px)";
      if (cta) cta.classList.toggle("is-visible", y > window.innerHeight * 0.85);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // ---------------------------------------------------------------------
  // Pill selects
  // ---------------------------------------------------------------------
  function initPillGroups() {
    document.querySelectorAll("[data-pillgroup]").forEach((group) => {
      group.addEventListener("click", (ev) => {
        const btn = ev.target.closest("[data-pill]");
        if (!btn) return;
        group.querySelectorAll("[data-pill]").forEach((p) => p.classList.remove("is-selected"));
        btn.classList.add("is-selected");
      });
    });
  }

  // ---------------------------------------------------------------------
  // Formulario de contacto
  // ---------------------------------------------------------------------
  function initContactForm() {
    const form = document.getElementById("contact-form");
    if (!form) return;

    const successBlock = document.getElementById("contact-success");
    const statusEl = document.getElementById("form-status");
    const whatsappFallback = document.getElementById("whatsapp-fallback");
    const submitBtn = document.getElementById("submit-btn");
    const submitLabel = submitBtn.querySelector(".btn-label");
    const originalLabel = submitLabel.textContent;

    const fields = {
      name: document.getElementById("field-name"),
      phone: document.getElementById("field-phone"),
    };

    const errors = {
      name: document.getElementById("error-name"),
      phone: document.getElementById("error-phone"),
    };

    const requiredMessages = {
      name: "Por favor ingresa tu nombre.",
      phone: "Por favor ingresa tu teléfono.",
    };

    const clearError = (key) => {
      fields[key].classList.remove("has-error");
      errors[key].textContent = "";
    };

    const setError = (key) => {
      fields[key].classList.add("has-error");
      errors[key].textContent = requiredMessages[key];
    };

    Object.keys(fields).forEach((key) => {
      fields[key].addEventListener("input", () => {
        if (fields[key].value.trim()) clearError(key);
      });
    });

    const setStatus = (message, isError) => {
      statusEl.textContent = message;
      statusEl.classList.toggle("is-error", Boolean(isError));
    };

    const setSubmitting = (isSubmitting) => {
      submitBtn.disabled = isSubmitting;
      submitLabel.textContent = isSubmitting ? "Enviando..." : originalLabel;
    };

    const showSuccess = () => {
      form.classList.add("is-leaving");
      window.setTimeout(() => {
        form.hidden = true;
        successBlock.hidden = false;
        requestAnimationFrame(() => successBlock.classList.add("is-visible"));
      }, 400);
    };

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      setStatus("");
      whatsappFallback.hidden = true;

      let hasError = false;
      Object.keys(fields).forEach((key) => {
        const value = fields[key].value.trim();
        if (!value) {
          setError(key);
          hasError = true;
        } else {
          clearError(key);
        }
      });

      if (hasError) return;

      const objetivoBtn = form.querySelector('[data-pillgroup="objetivo"] .is-selected');
      const adsField = document.getElementById("field-ads");
      const payload = {
        name: fields.name.value.trim(),
        phone: fields.phone.value.trim(),
        object: objetivoBtn ? objetivoBtn.dataset.pill : "",
        Ads: adsField ? adsField.value.trim() : "",
      };

      setSubmitting(true);

      try {
        const response = await fetch(MAKE_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error("Respuesta no exitosa del webhook");

        showSuccess();
      } catch (err) {
        setSubmitting(false);
        setStatus(
          "Hubo un problema al enviar tu información. Escríbenos directo por WhatsApp y te ayudamos enseguida.",
          true
        );
        whatsappFallback.hidden = false;
        whatsappFallback.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
          `Hola! Soy ${fields.name.value.trim()}, me interesan sus servicios de Meta Ads.`
        )}`;
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initFaq();
    initScrollReveal();
    initScrollEffects();
    initPillGroups();
    initContactForm();
  });
})();
