(() => {
  "use strict";

  // ---------------------------------------------------------------------
  // CONFIG — reemplaza estos valores antes de publicar el sitio.
  // ---------------------------------------------------------------------
  const MAKE_WEBHOOK_URL = "https://hook.us2.make.com/9dl3bn0qf8ajhbfityjljejm2t8qlcd6";
  const WHATSAPP_NUMBER = "50768475437"; // formato: 507XXXXXXX (sin +, sin espacios)

  // ---------------------------------------------------------------------
  // Hero: crossfade de titular/subtítulo + dots
  // ---------------------------------------------------------------------
  function initHeroSlides() {
    const slides = document.querySelectorAll(".hero-slide");
    const dots = document.querySelectorAll(".hero-dots .dot");
    if (!slides.length || !dots.length) return;

    let current = 0;
    let timer = null;

    const show = (index) => {
      current = index;
      slides.forEach((slide, i) => slide.classList.toggle("is-active", i === index));
      dots.forEach((dot, i) => {
        dot.classList.toggle("is-active", i === index);
        dot.setAttribute("aria-selected", i === index ? "true" : "false");
      });
    };

    const startAutoplay = () => {
      clearInterval(timer);
      timer = setInterval(() => show(current === 0 ? 1 : 0), 4500);
    };

    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => {
        show(i);
        startAutoplay();
      });
    });

    show(0);
    startAutoplay();
  }

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
      product: document.getElementById("field-product"),
    };

    const errors = {
      name: document.getElementById("error-name"),
      phone: document.getElementById("error-phone"),
      product: document.getElementById("error-product"),
    };

    const requiredMessages = {
      name: "Por favor ingresa tu nombre.",
      phone: "Por favor ingresa tu teléfono.",
      product: "Cuéntanos qué quieres lanzar o promocionar.",
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

      const payload = {
        name: fields.name.value.trim(),
        phone: fields.phone.value.trim(),
        product: fields.product.value.trim(),
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
          `Hola, soy ${payload.name}. Quiero mi landing page para: ${payload.product}.`
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
    initHeroSlides();
    initFaq();
    initScrollReveal();
    initContactForm();
  });
})();
