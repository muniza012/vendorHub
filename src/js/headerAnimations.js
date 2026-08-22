import { gsap } from "https://cdn.jsdelivr.net/npm/gsap@3.13.0/index.js";

export function animateBadge(badge) {
  if (!badge) return;

  gsap.fromTo(
    badge,
    {
      scale: 0.3,
      opacity: 0,
    },
    {
      scale: 1,
      opacity: 1,
      duration: 0.4,
      ease: "back.out(2)",
    },
  );
}

export function setupHeaderAnimations() {
  const headerItems = document.querySelectorAll(".rewards > a, #account-btn");

  headerItems.forEach((item) => {
    const icon = item.querySelector("svg");

    if (!icon) return;

    item.addEventListener("mouseenter", () => {
      gsap.to(icon, {
        y: -2,
        scale: 1.08,
        duration: 0.25,
        ease: "power2.out",
      });
    });

    item.addEventListener("mouseleave", () => {
      gsap.to(icon, {
        y: 0,
        scale: 1,
        duration: 0.25,
        ease: "power2.out",
      });
    });

    item.addEventListener("mousedown", () => {
      gsap.to(icon, {
        scale: 0.9,
        duration: 0.1,
      });
    });

    item.addEventListener("mouseup", () => {
      gsap.to(icon, {
        scale: 1.08,
        duration: 0.2,
        ease: "back.out(2)",
      });
    });
  });
}
