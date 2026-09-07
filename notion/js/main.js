(() => {
  "use strict";

  // ---------------------------------------------------------------------
  // CONFIG — reemplaza estos valores antes de publicar el sitio.
  // ---------------------------------------------------------------------
  const MAKE_WEBHOOK_URL = "https://hook.us2.make.com/3avdqyz3b8obn9bpmaiqakijfsdzex21";
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
      { threshold: 0.08, rootMargin: "0px 0px -12% 0px" }
    );

    targets.forEach((el) => observer.observe(el));
  }

  // ---------------------------------------------------------------------
  // Floating CTA + autoplay guard for the showcase video
  // ---------------------------------------------------------------------
  function initScrollEffects() {
    const cta = document.getElementById("float-cta");

    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      if (cta) cta.classList.toggle("is-visible", y > window.innerHeight * 0.85);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    document.querySelectorAll("video").forEach((v) => {
      v.muted = true;
      const kick = () => {
        const p = v.play();
        if (p && p.catch) p.catch(() => {});
      };
      kick();
      v.addEventListener("pause", kick);
      v.addEventListener("canplay", kick);
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
    const originalLabel = submitBtn.textContent;

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
      submitBtn.textContent = isSubmitting ? "Enviando..." : originalLabel;
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

      const payload = {
        name: fields.name.value.trim(),
        phone: fields.phone.value.trim(),
        details: document.getElementById("field-details").value.trim(),
        platform: document.getElementById("field-platform").value,
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
          `Hola! Soy ${fields.name.value.trim()}, me interesa organizar mi negocio en Notion.`
        )}`;
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initFaq();
    initScrollReveal();
    initScrollEffects();
    initContactForm();
  });
})();
