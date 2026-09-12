(() => {
  const campaigns = [
    { name: "Weekend home refresh", type: "10% off selected home goods", reach: "1,420 reached", result: "12.4% CTR", active: true },
    { name: "First order welcome", type: "15% off for new customers", reach: "980 reached", result: "9.1% CTR", active: true },
    { name: "Beauty bundle spotlight", type: "Featured collection promotion", reach: "440 reached", result: "6.8% CTR", active: true }
  ];
  const list = document.querySelector("#campaign-list");
  const render = () => { list.innerHTML = campaigns.map((campaign, index) => `<div class="campaign-row"><span class="campaign-icon"><i class="fa-solid ${index === 0 ? "fa-house" : index === 1 ? "fa-heart" : "fa-wand-magic-sparkles"}"></i></span><div><div class="campaign-name">${campaign.name}</div><div class="campaign-meta">${campaign.type} · ${campaign.reach}</div></div><div><div class="campaign-result">${campaign.result}</div><div class="campaign-status">${campaign.active ? "Active" : "Paused"} · <button class="campaign-toggle ${campaign.active ? "" : "paused"}" data-campaign="${index}">${campaign.active ? "Pause" : "Resume"}</button></div></div></div>`).join(""); };
  list.addEventListener("click", (event) => { const button = event.target.closest("[data-campaign]"); if (!button) return; campaigns[button.dataset.campaign].active = !campaigns[button.dataset.campaign].active; render(); });
  document.querySelector("#coupon-form").addEventListener("submit", (event) => { event.preventDefault(); const data = new FormData(event.currentTarget); const message = document.querySelector("#coupon-message"); message.textContent = `${data.get("code").toUpperCase()} is ready with ${data.get("discount")} until ${data.get("expires")}.`; message.hidden = false; event.currentTarget.reset(); });
  document.querySelector("#new-campaign").addEventListener("click", () => document.querySelector("#coupon-form").elements.code.focus());
  render();
})();
