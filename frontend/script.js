const header = document.querySelector("[data-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const navMenu = document.querySelector("[data-nav-menu]");
const navLinks = [...document.querySelectorAll(".nav-menu a")];
const sections = [...document.querySelectorAll("main section[id]")];
const toast = document.querySelector("[data-toast]");
const contactForm = document.querySelector("[data-contact-form]");
const formStatus = document.querySelector("[data-form-status]");
const yearTarget = document.querySelector("[data-year]");

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

document.querySelectorAll("a, button").forEach((element) => {
  element.setAttribute("draggable", "false");
  element.addEventListener("dragstart", (event) => {
    event.preventDefault();
  });
});

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
    const endpoints = ["/api/send-contact", "/.netlify/functions/send-contact"];
    let response;
    let result = {};
    let lastMessage = "Submission failed";

    for (const endpoint of endpoints) {
      response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      result = await response.json().catch(() => ({}));

      if (response.ok) {
        break;
      }

      if (response.status !== 404) {
        lastMessage = result.message || "Submission failed";
        break;
      }
    }

    if (!response || !response.ok) {
      throw new Error(lastMessage || result.message || "Submission failed");
    }

    contactForm.reset();
    setFormStatus(result.message || "Message sent successfully. I will receive it in my inbox.", "success");
    showToast(result.message || "Message sent successfully. I will receive it in my inbox.");
  } catch (error) {
    setFormStatus(error.message || "Message could not be sent. Please try again.", "error");
    showToast(error.message || "Message could not be sent. Please try again.");
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = originalLabel;
  }
});
