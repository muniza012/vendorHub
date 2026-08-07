import { showToast } from "./toast.js";

const contactForm = document.getElementById("contact-form");
const submitBtn = document.getElementById("contact-submit");

contactForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("contact-name").value.trim();
  const email = document.getElementById("contact-email").value.trim();
  const subject = document.getElementById("contact-subject").value.trim();
  const message = document.getElementById("contact-message").value.trim();

  // Required fields
  if (!name || !email || !subject || !message) {
    showToast("Please fill in all fields.");
    return;
  }

  // Name validation
  const nameRegex = /^[A-Za-z\s]{2,50}$/;

  if (!nameRegex.test(name)) {
    showToast("Please enter a valid name.");
    return;
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    showToast("Please enter a valid email address.");
    return;
  }

  // Message validation
  if (message.length < 10) {
    showToast("Message must be at least 10 characters.");
    return;
  }

  // Prevent multiple submissions
  submitBtn.disabled = true;
  submitBtn.textContent = "Sending...";

  // Store message locally for now
  const messages = JSON.parse(localStorage.getItem("vendorHubMessages")) || [];

  const contactMessage = {
    id: Date.now(),
    date: new Date().toLocaleString(),
    name,
    email,
    subject,
    message,
  };

  messages.push(contactMessage);

  localStorage.setItem("vendorHubMessages", JSON.stringify(messages));

  showToast("Your message has been sent successfully.");

  contactForm.reset();

  submitBtn.disabled = false;
  submitBtn.textContent = "Send Message";
});
