import { gsap } from "https://cdn.jsdelivr.net/npm/gsap@3.13.0/index.js";
import { ScrollTrigger } from "https://cdn.jsdelivr.net/npm/gsap@3.13.0/ScrollTrigger.js";

gsap.registerPlugin(ScrollTrigger);

const introTimeline = gsap.timeline({
  defaults: {
    ease: "power3.out",
  },
});

introTimeline
  .from(".header-nav", {
    y: -30,
    opacity: 0,
    duration: 0.8,
  })
  .from(
    "#hero-slider",
    {
      y: 30,
      opacity: 0,
      scale: 0.98,
      duration: 0.9,
    },
    "-=0.3",
  );
//////////////////
export function animateCategories() {
  gsap.from("#category-carousel-container > *", {
    y: 20,
    opacity: 0,
    scale: 0.95,
    duration: 0.5,
    stagger: 0.08,
    ease: "power3.out",
  });
}

//////////////////////////

gsap.from(".hero-title", {
  x: -50,
  opacity: 0,
  duration: 0.8,
  ease: "power3.out",
});

gsap.from(".hero-offer", {
  x: -40,
  opacity: 0,
  duration: 0.7,
  delay: 0.15,
  ease: "power3.out",
});

gsap.from(".hero-description", {
  x: -30,
  opacity: 0,
  duration: 0.6,
  delay: 0.25,
  ease: "power3.out",
});

gsap.from(".hero-button", {
  y: 20,
  opacity: 0,
  scale: 0.95,
  duration: 0.6,
  delay: 0.35,
  ease: "back.out(1.5)",
});
/////////////////////

gsap.from(".hero-image", {
  scale: 1.12,
  duration: 1.5,
  ease: "power2.out",
});

////////////////
gsap.from("#products-heading", {
  scrollTrigger: {
    trigger: "#trending-picks",
    start: "top 80%",
    toggleActions: "play none none reverse",
  },

  y: 40,
  opacity: 0,
  duration: 0.8,
  ease: "power3.out",
});
/////////////////////////
export function animateProducts() {
  const cards = document.querySelectorAll("#products-container > *");

  if (!cards.length) return;

  gsap.set(cards, {
    opacity: 0,
    y: 50,
    scale: 0.96,
  });

  ScrollTrigger.create({
    trigger: "#trending-picks",
    start: "top 75%",

    onEnter: () => {
      gsap.to(cards, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
        stagger: 0.08,
        ease: "power3.out",
      });
    },

    onLeaveBack: () => {
      gsap.to(cards, {
        opacity: 0,
        y: 50,
        scale: 0.96,
        duration: 0.5,
        stagger: 0.05,
        ease: "power3.out",
      });
    },
  });
}
////////////////////////
function setupProductHover() {
  const cards = document.querySelectorAll("#products-container > *");

  cards.forEach((card) => {
    const image = card.querySelector("img");

    card.addEventListener("mouseenter", () => {
      gsap.to(card, {
        y: -6,
        scale: 1.02,
        duration: 0.3,
        ease: "power2.out",
      });

      if (image) {
        gsap.to(image, {
          scale: 1.05,
          duration: 0.4,
          ease: "power2.out",
        });
      }
    });

    card.addEventListener("mouseleave", () => {
      gsap.to(card, {
        y: 0,
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
      });

      if (image) {
        gsap.to(image, {
          scale: 1,
          duration: 0.4,
          ease: "power2.out",
        });
      }
    });
  });
}
//////////////////////////

/////////////////////////
function setupStoreHover() {
  const stores = document.querySelectorAll("#stores-container > *");

  stores.forEach((store) => {
    store.addEventListener("mouseenter", () => {
      gsap.to(store, {
        y: -5,
        scale: 1.03,
        duration: 0.3,
        ease: "power2.out",
      });
    });

    store.addEventListener("mouseleave", () => {
      gsap.to(store, {
        y: 0,
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
      });
    });
  });
}

setupStoreHover();
/////////////////////////////////
gsap.from("#discover-more .grid > div", {
  scrollTrigger: {
    trigger: "#discover-more",
    start: "top 80%",
    toggleActions: "play none none reverse",
  },

  y: 40,
  opacity: 0,
  duration: 0.6,
  stagger: 0.1,
  ease: "power3.out",
});
////////////////
gsap.from("#footer", {
  scrollTrigger: {
    trigger: "#footer",
    start: "top 90%",
    toggleActions: "play none none reverse",
  },

  y: 30,
  opacity: 0,
  duration: 0.8,
  ease: "power3.out",
});

///////////////
gsap.fromTo(
  "#stores-container",
  {
    x: 80,
  },
  {
    x: -80,
    ease: "none",

    scrollTrigger: {
      trigger: "#top-stores",
      start: "top 80%",
      end: "bottom 30%",
      scrub: 1,
    },
  },
);
///////////////////
//////////////// HEADER ICON MICRO-INTERACTIONS

export function setupHeaderAnimations() {
  const headerItems = document.querySelectorAll(".rewards > a, #account-btn");

  headerItems.forEach((item) => {
    const icon = item.querySelector("svg");

    if (!icon) return;

    // Hover
    item.addEventListener("mouseenter", () => {
      gsap.to(icon, {
        y: -2,
        scale: 1.08,
        duration: 0.25,
        ease: "power2.out",
      });
    });

    // Mouse leave
    item.addEventListener("mouseleave", () => {
      gsap.to(icon, {
        y: 0,
        scale: 1,
        duration: 0.25,
        ease: "power2.out",
      });
    });

    // Small click/tap feedback
    item.addEventListener("mousedown", () => {
      gsap.to(icon, {
        scale: 0.9,
        duration: 0.1,
        ease: "power2.out",
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

//////////////// PRODUCT DETAILS BUTTON ANIMATIONS

export function setupProductDetailsAnimations() {
  const wishlistBtn = document.getElementById("wishlist-btn");
  const addCartBtn = document.getElementById("add-cart-btn");
  const buyNowBtn = document.getElementById("buy-now-btn");

  const buttons = [wishlistBtn, addCartBtn, buyNowBtn].filter(Boolean);

  buttons.forEach((button) => {
    button.addEventListener("mouseenter", () => {
      gsap.to(button, {
        y: -2,
        scale: 1.02,
        duration: 0.25,
        ease: "power2.out",
      });
    });

    button.addEventListener("mouseleave", () => {
      gsap.to(button, {
        y: 0,
        scale: 1,
        duration: 0.25,
        ease: "power2.out",
      });
    });

    button.addEventListener("mousedown", () => {
      gsap.to(button, {
        scale: 0.95,
        duration: 0.1,
        ease: "power2.out",
      });
    });

    button.addEventListener("mouseup", () => {
      gsap.to(button, {
        scale: 1.02,
        duration: 0.2,
        ease: "back.out(2)",
      });
    });
  });

  // Special animation for wishlist icon
  if (wishlistBtn) {
    const icon = wishlistBtn.querySelector("svg");

    wishlistBtn.addEventListener("click", () => {
      gsap.fromTo(
        icon,
        {
          scale: 0.7,
          rotate: -10,
        },
        {
          scale: 1,
          rotate: 0,
          duration: 0.45,
          ease: "back.out(2)",
        },
      );
    });
  }

  // Special animation for Add to Cart
  if (addCartBtn) {
    const icon = addCartBtn.querySelector("svg");

    addCartBtn.addEventListener("click", () => {
      gsap.fromTo(
        icon,
        {
          x: -5,
          scale: 0.8,
        },
        {
          x: 0,
          scale: 1,
          duration: 0.4,
          ease: "back.out(2)",
        },
      );
    });
  }
}
