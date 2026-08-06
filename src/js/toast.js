const toast = document.getElementById("toast");

let toastTimeout;

export function showToast(message) {
  clearTimeout(toastTimeout);

  toast.textContent = message;

  toast.classList.remove("translate-y-20", "opacity-0");

  toast.classList.add("translate-y-0", "opacity-100");

  toastTimeout = setTimeout(() => {
    toast.classList.remove("translate-y-0", "opacity-100");

    toast.classList.add("translate-y-20", "opacity-0");
  }, 2000);
}
