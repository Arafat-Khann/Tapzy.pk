let pendingCheckoutItems = [];

const REVIEW_PACKAGES = {
  single_card: { id: "google-review-stand", label: "Single Card", total: 2500 },
  business_duo: { id: "google-review-duo", label: "Business Duo (2 cards)", total: 4000 },
};

function isReviewOrder(items) {
  return items.length === 1 && Object.values(REVIEW_PACKAGES).some((item) => item.id === items[0].id);
}

function ensureCheckoutModal() {
  if (document.querySelector("[data-checkout-modal]")) return;

  const modal = document.createElement("div");
  modal.className = "checkout-modal";
  modal.dataset.checkoutModal = "";
  modal.hidden = true;
  modal.innerHTML = `
    <div class="checkout-modal__backdrop" data-close-checkout></div>
    <div class="checkout-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
      <button type="button" class="checkout-modal__close" data-close-checkout aria-label="Close checkout form">&times;</button>
      <h2 id="checkout-title" data-checkout-title>Complete your order</h2>
      <p class="checkout-modal__intro" data-checkout-intro>Enter your details. Your order is saved securely after you submit it.</p>
      <div class="checkout-summary" data-checkout-summary></div>
      <form class="checkout-form" data-checkout-form novalidate>
        <label>Full name<input type="text" name="name" autocomplete="name" maxlength="120" required></label>
        <label>Pakistani phone number<input type="tel" name="phone" autocomplete="tel" placeholder="03XX XXXXXXX" maxlength="20" required></label>
        <label>City<input type="text" name="city" autocomplete="address-level2" maxlength="80" required></label>
        <label>Complete delivery address<textarea name="address" rows="3" autocomplete="street-address" maxlength="500" required></textarea></label>
        <label>Business name <span>(optional)</span><input type="text" name="businessName" maxlength="120"></label>
        <fieldset class="checkout-payment" data-review-only>
          <legend>Package</legend>
          <label class="checkout-payment__option"><input type="radio" name="package" value="single_card" checked> Single Card — PKR 2,500</label>
          <label class="checkout-payment__option"><input type="radio" name="package" value="business_duo"> Business Duo — PKR 4,000 <span>(save PKR 1,000)</span></label>
        </fieldset>
        <label data-review-only>Google Maps URL<input type="url" name="googleReviewUrl" placeholder="https://maps.google.com/..." maxlength="500" required></label>
        <fieldset class="checkout-payment">
          <legend>Payment method</legend>
          <label class="checkout-payment__option"><input type="radio" name="paymentMethod" value="cod" required> Cash on Delivery</label>
          <label class="checkout-payment__option"><input type="radio" name="paymentMethod" value="bank_transfer"> Advance payment / bank transfer</label>
        </fieldset>
        <p class="checkout-bank-note" data-bank-note hidden>Bank transfer instructions are not configured on this website yet. Tapzy will share verified payment details after receiving your order. Never send payment to an unverified number.</p>
        <label>Notes <span>(optional)</span><textarea name="notes" rows="2" maxlength="500"></textarea></label>
        <p class="checkout-form__error" data-checkout-error hidden></p>
        <button type="submit" class="btn btn-primary checkout-form__submit">Place order</button>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
  bindCheckoutModalEvents(modal);
}

function bindCheckoutModalEvents(modal) {
  modal.addEventListener("click", (event) => {
    if (event.target.closest("[data-close-checkout]")) closeCheckoutModal();
  });
  modal.querySelector("[data-checkout-form]").addEventListener("submit", (event) => {
    event.preventDefault();
    submitCheckoutForm(modal);
  });
  modal.querySelectorAll('input[name="package"]').forEach((input) => {
    input.addEventListener("change", () => renderCheckoutSummary(pendingCheckoutItems, input.value));
  });
  modal.querySelectorAll('input[name="paymentMethod"]').forEach((input) => {
    input.addEventListener("change", () => {
      modal.querySelector("[data-bank-note]").hidden = input.value !== "bank_transfer" || !input.checked;
    });
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) closeCheckoutModal();
  });
}

function selectedPackage(form) {
  return form.querySelector('input[name="package"]:checked')?.value || "single_card";
}

function renderCheckoutSummary(items, packageId = "single_card") {
  const summary = document.querySelector("[data-checkout-summary]");
  if (!summary) return;
  const review = isReviewOrder(items);
  const lines = review
    ? [{ title: REVIEW_PACKAGES[packageId].label, lineTotal: REVIEW_PACKAGES[packageId].total }]
    : items.map((item) => calculateLineItem(item.id, item.quantity)).filter(Boolean);
  const total = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  summary.innerHTML = `<h3>Order summary</h3><ul class="checkout-summary__list">${lines
    .map((line) => `<li><span>${line.title}</span><strong>${formatPkr(line.lineTotal)}</strong></li>`)
    .join("")}</ul><p class="checkout-summary__total">Total: <strong>${formatPkr(total)}</strong></p>`;
}

function openCheckoutModal(items) {
  ensureCheckoutModal();
  pendingCheckoutItems = items.map((item) => ({ id: item.id, quantity: item.quantity }));
  const modal = document.querySelector("[data-checkout-modal]");
  const form = modal.querySelector("[data-checkout-form]");
  form.reset();
  modal.querySelector("[data-checkout-summary]").hidden = false;
  modal.querySelector("[data-checkout-intro]").hidden = false;
  form.hidden = false;
  modal.querySelector("[data-checkout-error]").hidden = true;
  modal.querySelectorAll("[data-review-only]").forEach((field) => {
    field.hidden = !isReviewOrder(items);
  });
  renderCheckoutSummary(pendingCheckoutItems);
  modal.hidden = false;
  document.body.classList.add("checkout-open");
  form.querySelector('[name="name"]').focus();
}

function closeCheckoutModal() {
  const modal = document.querySelector("[data-checkout-modal]");
  if (!modal) return;
  modal.hidden = true;
  document.body.classList.remove("checkout-open");
  pendingCheckoutItems = [];
}

function getCheckoutCustomer(form) {
  const data = new FormData(form);
  return {
    name: String(data.get("name") || "").trim(),
    address: String(data.get("address") || "").trim(),
    city: String(data.get("city") || "").trim(),
    phone: String(data.get("phone") || "").trim(),
    businessName: String(data.get("businessName") || "").trim(),
    googleReviewUrl: String(data.get("googleReviewUrl") || "").trim(),
    paymentMethod: String(data.get("paymentMethod") || ""),
    notes: String(data.get("notes") || "").trim(),
    packageId: String(data.get("package") || "single_card"),
  };
}

function validateCheckoutCustomer(customer, review) {
  if (!customer.name || !customer.city || !customer.address || !customer.phone) return "Please complete your name, phone, city, and address.";
  if (!/^(\+92|0092|92|0)3\d{9}$/.test(customer.phone.replace(/[\s-]/g, ""))) return "Please enter a valid Pakistani mobile number.";
  if (review && !customer.googleReviewUrl) return "Please enter your Google Maps URL.";
  if (!customer.paymentMethod) return "Please select a payment method.";
  return "";
}

async function submitReviewOrder(modal, customer) {
  const response = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(customer),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "We could not save your order. Please try again.");
  return result;
}

async function submitCheckoutForm(modal) {
  const form = modal.querySelector("[data-checkout-form]");
  const error = modal.querySelector("[data-checkout-error]");
  const customer = getCheckoutCustomer(form);
  const review = isReviewOrder(pendingCheckoutItems);
  const validationMessage = validateCheckoutCustomer(customer, review);
  if (validationMessage) {
    error.textContent = validationMessage;
    error.hidden = false;
    return;
  }
  if (!pendingCheckoutItems.length) {
    error.textContent = "Your cart is empty.";
    error.hidden = false;
    return;
  }
  error.hidden = true;
  form.querySelector("button[type=submit]").disabled = true;
  try {
    if (review) {
      const result = await submitReviewOrder(modal, customer);
      sessionStorage.setItem("tapzy_confirmation_token", result.confirmationToken);
      window.location.assign("/order-received/");
    } else {
      openWhatsAppCheckout(pendingCheckoutItems, customer);
      closeCheckoutModal();
    }
  } catch (submissionError) {
    error.textContent = submissionError.message;
    error.hidden = false;
  } finally {
    form.querySelector("button[type=submit]").disabled = false;
  }
}

function startCheckout(items) {
  if (items.length) openCheckoutModal(items);
}
