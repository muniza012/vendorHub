const faqQuestions = document.querySelectorAll(".faq-question");

faqQuestions.forEach((question) => {
  question.addEventListener("click", () => {
    const currentItem = question.closest(".faq-item");
    const currentAnswer = currentItem.querySelector(".faq-answer");
    const currentIcon = currentItem.querySelector(".faq-icon");

const isOpen = !currentAnswer.classList.contains("hidden");

// Close all FAQ items
document.querySelectorAll(".faq-answer").forEach((answer) => {
  answer.classList.add("hidden");
});

document.querySelectorAll(".faq-icon").forEach((icon) => {
  icon.classList.remove("rotate-180");
});

document.querySelectorAll(".faq-question").forEach((item) => {
  item.classList.remove("text-accent");
  item.classList.add("text-text-primary");
});

// Open clicked item
if (!isOpen) {
  currentAnswer.classList.remove("hidden");
  currentIcon.classList.add("rotate-180");

  currentItem
    .querySelector(".faq-question")
    .classList.remove("text-text-primary");

  currentItem
    .querySelector(".faq-question")
    .classList.add("text-accent");
}

  });
});
