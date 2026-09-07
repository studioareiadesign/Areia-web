(() => {
  "use strict";

  // ---------------------------------------------------------------------
  // CONFIG — reemplaza estos valores antes de publicar el sitio.
  // ---------------------------------------------------------------------
  const MAKE_WEBHOOK_URL = "https://hook.us2.make.com/fz0feqwt8ifaf078eb8d7b493wxc1uw6";
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
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    targets.forEach((el) => observer.observe(el));
  }

  // ---------------------------------------------------------------------
  // Formulario de contacto
  // ---------------------------------------------------------------------
  function initContactForm() {
    const form = document.getElementById("contact-form");
    if (!form) return;

    const successBlock = document.getElementById("contact-success");
    const statusEl = document.getElementById("form-status");
    const submitBtn = document.getElementById("submit-btn");
    const submitLabel = submitBtn.querySelector(".btn-label");
    const originalLabel = submitLabel.textContent;
    const whatsappCta = document.getElementById("whatsapp-cta");

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

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      setStatus("");

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

      const brandAgeField = document.getElementById("field-brand-age");
      const detailField = document.getElementById("field-detail");
      const payload = {
        name: fields.name.value.trim(),
        phone: fields.phone.value.trim(),
        time: brandAgeField ? brandAgeField.value.trim() : "",
        details: detailField ? detailField.value.trim() : "",
      };

      setSubmitting(true);

      try {
        const response = await fetch(MAKE_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error("Respuesta no exitosa del webhook");

        const message = encodeURIComponent(
          `Hola, soy ${payload.name}. Quiero renovar la identidad visual de mi marca.`
        );
        whatsappCta.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

        form.hidden = true;
        successBlock.hidden = false;
      } catch (err) {
        setSubmitting(false);
        setStatus(
          "Hubo un error al enviar tu información. Intenta de nuevo o escríbenos por WhatsApp.",
          true
        );
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initFaq();
    initScrollReveal();
    initContactForm();
  });
})();
