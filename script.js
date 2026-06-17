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
  const name = String(data.get("name") || "").trim();
  const email = String(data.get("email") || "").trim();
  const phone = String(data.get("phone") || "").trim();
  const subject = String(data.get("subject") || "").trim();
  const message = String(data.get("message") || "").trim();
  const body = [
    `Prénom / Nom : ${name}`,
    `Email : ${email}`,
    phone ? `Téléphone : ${phone}` : null,
    `Prestation souhaitée : ${subject}`,
    "",
    "Message :",
    message,
  ]
    .filter(Boolean)
    .join("\r\n");

  const mailSubject = `Demande de contact - ${subject}`;
  const mailto = `mailto:cvprobatsolution@outlook.fr?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailto;

  if (formNote) {
    formNote.textContent = "Votre messagerie va s'ouvrir avec le message préparé.";
  }
});
