const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const year = document.querySelector("[data-year]");
const form = document.querySelector("[data-contact-form]");
const formNote = document.querySelector("[data-form-note]");

if (year) {
  year.textContent = new Date().getFullYear();
}

const updateHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 20);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

navToggle?.addEventListener("click", () => {
  const isOpen = nav?.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
});

nav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
  });
});

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const name = data.get("name");
  const email = data.get("email");
  const subject = data.get("subject");
  const message = data.get("message");
  const body = [
    `Nom: ${name}`,
    `Email: ${email}`,
    `Prestation: ${subject}`,
    "",
    "Message:",
    message,
  ].join("\n");

  const mailto = new URL("mailto:cvprobatsolution@outlook.fr");
  mailto.searchParams.set("subject", `Demande de contact - ${subject}`);
  mailto.searchParams.set("body", body);
  window.location.href = mailto.toString();

  if (formNote) {
    formNote.textContent = "Votre messagerie va s'ouvrir avec le message préparé.";
  }
});
