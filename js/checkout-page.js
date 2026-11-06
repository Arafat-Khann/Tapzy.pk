const checkoutPackages = TAPZY_REVIEW_PACKAGES;
const requestedPackage = new URLSearchParams(window.location.search).get("package");
const packageId = checkoutPackages[requestedPackage] ? requestedPackage : "single_card";
const packageInfo = checkoutPackages[packageId];
const escapeCheckoutPage = (value) => String(value || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c]));
document.querySelector("[data-page-summary]").innerHTML = `<h2>Order Summary</h2><p><span>${packageInfo.label}</span><strong>PKR ${packageInfo.total.toLocaleString("en-PK")}</strong></p><p>Quantity <strong>${packageInfo.quantity}</strong></p><p class="checkout-summary__total">Total <strong>PKR ${packageInfo.total.toLocaleString("en-PK")}</strong></p>`;
const pageForm = document.querySelector("[data-page-form]");
pageForm.querySelectorAll('input[name="paymentMethod"]').forEach((input) => input.addEventListener("change", () => { document.querySelector("[data-bank-note]").hidden = input.value !== "bank_transfer" || !input.checked; }));
pageForm.querySelectorAll("[data-copy-payment]").forEach((button) => button.addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(button.dataset.copyPayment); button.textContent = "Copied"; setTimeout(() => { button.textContent = button.dataset.copyPayment; }, 1200); } catch {}
}));
pageForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const error = document.querySelector("[data-page-error]");
  const button = pageForm.querySelector("button");
  const data = new FormData(pageForm);
  const payload = Object.fromEntries(data.entries());
  payload.packageId = packageId;
  const phone = String(payload.phone || "").replace(/[\s-]/g, "");
  if (!payload.name || !payload.phone || !payload.city || !payload.address || !payload.googleReviewUrl || !payload.paymentMethod) { error.textContent = "Please complete all required fields."; error.hidden = false; return; }
  if (!/^(\+92|0092|92|0)3\d{9}$/.test(phone)) { error.textContent = "Please enter a valid Pakistani mobile number."; error.hidden = false; return; }
  error.hidden = true; button.disabled = true; button.textContent = "Placing Order...";
  try {
    const response = await fetch("../api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "We could not save your order. Please try again.");
    sessionStorage.setItem("tapzy_confirmation_token", result.confirmationToken);
    window.location.assign("../order-received/");
  } catch (submissionError) {
    error.textContent = submissionError.message; error.hidden = false; button.disabled = false; button.textContent = "Place Order";
  }
});
