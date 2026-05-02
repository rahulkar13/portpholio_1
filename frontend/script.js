const header = document.querySelector("[data-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const navMenu = document.querySelector("[data-nav-menu]");
const navLinks = [...document.querySelectorAll(".nav-menu a")];
const sections = [...document.querySelectorAll("main section[id]")];
const toast = document.querySelector("[data-toast]");
const contactForm = document.querySelector("[data-contact-form]");
const formStatus = document.querySelector("[data-form-status]");
const yearTarget = document.querySelector("[data-year]");
const projectSlider = document.querySelector("[data-project-slider]");
const imageLightbox = document.querySelector("[data-image-lightbox]");
const lightboxImage = document.querySelector("[data-lightbox-image]");
const lightboxPrevButton = document.querySelector("[data-lightbox-prev]");
const lightboxNextButton = document.querySelector("[data-lightbox-next]");

const showToast = (message) => {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 3400);
};

const setFormStatus = (message, type = "") => {
  formStatus.textContent = message;
  formStatus.className = "form-status";

  if (type) {
    formStatus.classList.add(`is-${type}`);
  }
};

const closeNav = () => {
  document.body.classList.remove("nav-open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Open navigation");
};

const updateHeader = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 8);
};

const updateActiveLink = () => {
  const offset = window.innerHeight * 0.32;
  const currentSection = sections
    .filter((section) => section.getBoundingClientRect().top <= offset)
    .at(-1);

  navLinks.forEach((link) => {
    link.classList.toggle("is-active", currentSection && link.getAttribute("href") === `#${currentSection.id}`);
  });
};

yearTarget.textContent = new Date().getFullYear();
updateHeader();
updateActiveLink();

window.addEventListener("scroll", () => {
  updateHeader();
  updateActiveLink();
});

navToggle.addEventListener("click", () => {
  const isOpen = navToggle.getAttribute("aria-expanded") === "true";
  document.body.classList.toggle("nav-open", !isOpen);
  navToggle.setAttribute("aria-expanded", String(!isOpen));
  navToggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
});

navLinks.forEach((link) => {
  link.addEventListener("click", closeNav);
});

if (projectSlider) {
  const slides = [...projectSlider.querySelectorAll(".project-slider-track img")];
  const dots = [...projectSlider.querySelectorAll("[data-slider-dot]")];
  const prevButton = projectSlider.querySelector("[data-slider-prev]");
  const nextButton = projectSlider.querySelector("[data-slider-next]");
  const lightboxCloseTargets = [...document.querySelectorAll("[data-lightbox-close]")];
  let activeSlideIndex = 0;

  const renderSlide = (index) => {
    activeSlideIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === activeSlideIndex);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === activeSlideIndex);
    });
  };

  const openLightbox = (slide) => {
    lightboxImage.src = slide.src;
    lightboxImage.alt = slide.alt;
    imageLightbox.hidden = false;
    document.body.style.overflow = "hidden";
  };

  const openLightboxByIndex = (index) => {
    renderSlide(index);
    openLightbox(slides[activeSlideIndex]);
  };

  const closeLightbox = () => {
    imageLightbox.hidden = true;
    lightboxImage.src = "";
    lightboxImage.alt = "";
    document.body.style.overflow = "";
  };

  prevButton.addEventListener("click", () => {
    renderSlide(activeSlideIndex - 1);
  });

  nextButton.addEventListener("click", () => {
    renderSlide(activeSlideIndex + 1);
  });

  dots.forEach((dot, dotIndex) => {
    dot.addEventListener("click", () => {
      renderSlide(dotIndex);
    });
  });

  slides.forEach((slide) => {
    slide.addEventListener("click", () => {
      openLightboxByIndex(Number(slide.dataset.slideIndex));
    });
  });

  lightboxCloseTargets.forEach((target) => {
    target.addEventListener("click", closeLightbox);
  });

  lightboxPrevButton.addEventListener("click", () => {
    renderSlide(activeSlideIndex - 1);
    openLightbox(slides[activeSlideIndex]);
  });

  lightboxNextButton.addEventListener("click", () => {
    renderSlide(activeSlideIndex + 1);
    openLightbox(slides[activeSlideIndex]);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !imageLightbox.hidden) {
      closeLightbox();
    }

    if (event.key === "ArrowLeft" && !imageLightbox.hidden) {
      renderSlide(activeSlideIndex - 1);
      openLightbox(slides[activeSlideIndex]);
    }

    if (event.key === "ArrowRight" && !imageLightbox.hidden) {
      renderSlide(activeSlideIndex + 1);
      openLightbox(slides[activeSlideIndex]);
    }
  });
}

contactForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!contactForm.checkValidity()) {
    contactForm.reportValidity();
    return;
  }

  const submitButton = contactForm.querySelector('button[type="submit"]');
  const originalLabel = submitButton.innerHTML;
  const formData = new FormData(contactForm);
  const payload = Object.fromEntries(formData.entries());

  submitButton.disabled = true;
  submitButton.textContent = "Sending...";
  setFormStatus("Sending your message...", "pending");

  try {
    const response = await fetch("/.netlify/functions/send-contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Submission failed");
    }

    contactForm.reset();
    setFormStatus("Message sent successfully. I will receive it in my inbox.", "success");
    showToast("Message sent successfully. I will receive it in my inbox.");
  } catch (error) {
    setFormStatus("Message could not be sent. Please try again.", "error");
    showToast("Message could not be sent. Please try again.");
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = originalLabel;
  }
});
