(() => {
  const reviews = [
    { name: "Ava Thompson", date: "10 Sep 2026", rating: 5, product: "Linen Cloud Cushion", text: "Beautiful quality and the color is exactly as pictured. It made our reading corner feel complete.", replied: false },
    { name: "Mia Carter", date: "08 Sep 2026", rating: 5, product: "Daily Glow Serum", text: "Arrived quickly and feels lovely on my skin. I have already recommended it to two friends.", replied: true },
    { name: "Ethan Miller", date: "06 Sep 2026", rating: 4, product: "Cedar & Sage Candle", text: "The scent is subtle and warm. Packaging was thoughtful, though delivery took one extra day.", replied: false },
    { name: "Sofia Davis", date: "03 Sep 2026", rating: 3, product: "Weekend Market Tote", text: "The bag looks great and is roomy, but I expected a slightly thicker handle for the price.", replied: false },
    { name: "Noah Williams", date: "30 Aug 2026", rating: 5, product: "Stoneware Breakfast Set", text: "Such a lovely set. Everything was secure and the finish is even better in person.", replied: true }
  ];
  const list = document.querySelector("#review-list");
  const render = () => {
    const query = document.querySelector("#review-search").value.toLowerCase().trim();
    const filter = document.querySelector("#review-filter").value;
    const visible = reviews.filter((review) => { const matchesText = !query || `${review.name} ${review.product} ${review.text}`.toLowerCase().includes(query); const matchesFilter = filter === "all" || (filter === "unanswered" ? !review.replied : review.rating === Number(filter)); return matchesText && matchesFilter; });
    document.querySelector("#review-count").textContent = `${visible.length} review${visible.length === 1 ? "" : "s"}`;
    list.innerHTML = visible.length ? visible.map((review, index) => `<article class="review-row"><div class="review-avatar">${review.name.split(" ").map((part) => part[0]).join("")}</div><div><div class="review-header"><span class="review-name">${review.name}</span><span class="review-date">${review.date}</span></div><div class="review-stars">${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</div><p class="review-text">${review.text}</p><p class="review-product"><i class="fa-solid fa-box"></i>${review.product}</p></div><div class="review-actions">${review.replied ? `<span class="reply-state"><i class="fa-solid fa-check"></i> Replied</span>` : `<button class="review-reply" data-reply="${reviews.indexOf(review)}"><i class="fa-solid fa-reply"></i> Reply</button>`}</div></article>`).join("") : `<div class="review-empty">No reviews match your filters.</div>`;
  };
  [document.querySelector("#review-search"), document.querySelector("#review-filter")].forEach((control) => control.addEventListener("input", render));
  list.addEventListener("click", (event) => { const button = event.target.closest("[data-reply]"); if (!button) return; reviews[button.dataset.reply].replied = true; const unanswered = reviews.filter((review) => !review.replied).length; document.querySelector("#unanswered-count").textContent = unanswered; render(); });
  render();
})();
