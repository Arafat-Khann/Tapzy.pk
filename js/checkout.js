let pendingCheckoutItems = [];

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
      <h2 id="checkout-title">Checkout Details</h2>
      <p class="checkout-modal__intro">Fill in your details below. We will open WhatsApp with your invoice ready to send.</p>

      <div class="checkout-summary" data-checkout-summary></div>

      <form class="checkout-form" data-checkout-form novalidate>
        <label>
          Full Name
          <input type="text" name="name" autocomplete="name" required>
        </label>

        <label>
          Delivery Address
          <textarea name="address" rows="3" autocomplete="street-address" required></textarea>
        </label>

        <label>
          Phone Number
          <input type="tel" name="phone" autocomplete="tel" required>
        </label>

        <label>
          Email
          <input type="email" name="email" autocomplete="email" required>
        </label>

        <fieldset class="checkout-payment">
          <legend>Payment Method</legend>
          <label class="checkout-payment__option">
            <input type="radio" name="paymentMethod" value="Bank Transfer" required>
            Bank Transfer
          </label>
          <label class="checkout-payment__option">
            <input type="radio" name="paymentMethod" value="JazzCash">
            JazzCash
          </label>
        </fieldset>

        <p class="checkout-form__error" data-checkout-error hidden></p>

        <button type="submit" class="btn btn-primary checkout-form__submit">
          Send Order on WhatsApp
        </button>
      </form>
    </div>
  `;

  document.body.appendChild(modal);
  bindCheckoutModalEvents(modal);
}

function bindCheckoutModalEvents(modal) {
  modal.addEventListener("click", (event) => {
    if (event.target.closest("[data-close-checkout]")) {
      closeCheckoutModal();
    }
  });

  modal.querySelector("[data-checkout-form]").addEventListener("submit", (event) => {
    event.preventDefault();
    submitCheckoutForm(modal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) {
      closeCheckoutModal();
    }
  });
}

function renderCheckoutSummary(items) {
  const summary = document.querySelector("[data-checkout-summary]");
  if (!summary) return;

  const lines = items.map((item) => calculateLineItem(item.id, item.quantity)).filter(Boolean);
  const total = lines.reduce((sum, line) => sum + line.lineTotal, 0);

  summary.innerHTML = `
    <h3>Order Summary</h3>
    <ul class="checkout-summary__list">
      ${lines
        .map(
          (line) => `
            <li>
              <span>${line.title} &times; ${line.quantity}</span>
              <strong>${formatPkr(line.lineTotal)}</strong>
            </li>
          `
        )
        .join("")}
    </ul>
    <p class="checkout-summary__total">Total: <strong>${formatPkr(total)}</strong></p>
  `;
}

function openCheckoutModal(items) {
  ensureCheckoutModal();
  pendingCheckoutItems = items.map((item) => ({
    id: item.id,
    quantity: item.quantity,
  }));

  const modal = document.querySelector("[data-checkout-modal]");
  const form = modal.querySelector("[data-checkout-form]");
  const error = modal.querySelector("[data-checkout-error]");

  form.reset();
  error.hidden = true;
  error.textContent = "";
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
  const paymentMethod = data.get("paymentMethod");

  return {
    name: String(data.get("name") || "").trim(),
    address: String(data.get("address") || "").trim(),
    phone: String(data.get("phone") || "").trim(),
    email: String(data.get("email") || "").trim(),
    paymentMethod: paymentMethod ? String(paymentMethod) : "",
  };
}

function validateCheckoutCustomer(customer) {
  if (!customer.name) return "Please enter your full name.";
  if (!customer.address) return "Please enter your delivery address.";
  if (!customer.phone) return "Please enter your phone number.";
  if (!customer.email) return "Please enter your email address.";
  if (!customer.paymentMethod) return "Please select a payment method.";
  return "";
}

function submitCheckoutForm(modal) {
  const form = modal.querySelector("[data-checkout-form]");
  const error = modal.querySelector("[data-checkout-error]");
  const customer = getCheckoutCustomer(form);
  const validationMessage = validateCheckoutCustomer(customer);

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

  const message = formatWhatsAppInvoice(pendingCheckoutItems, customer);
  const url = `https://wa.me/${TAPZY_WHATSAPP}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
  closeCheckoutModal();
}

function startCheckout(items) {
  if (!items.length) return;
  openCheckoutModal(items);
}
