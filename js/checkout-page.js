const checkoutPackages = { single_card: { label: "Single Card", quantity: 1, total: 2500 }, business_duo: { label: "Business Duo", quantity: 2, total: 4000 } };
const packageId = new URLSearchParams(window.location.search).get("package") === "business_duo" ? "business_duo" : "single_card";
const packageInfo = checkoutPackages[packageId];
const escapeCheckoutPage = (value) => String(value || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c]));
document.querySelector("[data-page-summary]").innerHTML = `<h2>Order Summary</h2><p><span>${packageInfo.label}</span><strong>PKR ${packageInfo.total.toLocaleString("en-PK")}</strong></p><p>Quantity <strong>${packageInfo.quantity}</strong></p><p class="checkout-summary__total">Total <strong>PKR ${packageInfo.total.toLocaleString("en-PK")}</strong></p>`;
const pageForm = document.querySelector("[data-page-form]");
const addressField = pageForm.querySelector('[name="address"]');
const cityField = pageForm.querySelector('[name="city"]');
const mapButton = document.querySelector("[data-find-location]");
const mapStatus = document.querySelector("[data-map-status]");
let deliveryMap;
let deliveryMarker;

mapButton.addEventListener("click", async () => {
  const query = [addressField.value.trim(), cityField.value.trim(), "Pakistan"].filter(Boolean).join(", ");
  if (!addressField.value.trim() || !cityField.value.trim()) {
    mapStatus.textContent = "Enter the city and address first.";
    return;
  }
  mapButton.disabled = true;
  mapStatus.textContent = "Finding this location...";
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=pk&q=${encodeURIComponent(query)}`, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error("Location search failed.");
    const results = await response.json();
    if (!results.length) throw new Error("We could not find that address. You can still place the order with the typed address.");
    const location = results[0];
    if (!deliveryMap) {
      deliveryMap = L.map(document.querySelector("[data-checkout-map]")).setView([location.lat, location.lon], 15);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(deliveryMap);
    } else {
      deliveryMap.setView([location.lat, location.lon], 15);
    }
    if (deliveryMarker) deliveryMarker.setLatLng([location.lat, location.lon]);
    else deliveryMarker = L.marker([location.lat, location.lon]).addTo(deliveryMap);
    document.querySelector("[data-checkout-map]").hidden = false;
    deliveryMap.invalidateSize();
    mapStatus.textContent = "Location found. Please check the pin; your typed address will be used for delivery.";
  } catch (error) {
    mapStatus.textContent = error.message;
  } finally {
    mapButton.disabled = false;
  }
});

pageForm.querySelectorAll('input[name="paymentMethod"]').forEach((input) => input.addEventListener("change", () => { document.querySelector("[data-bank-note]").hidden = input.value !== "bank_transfer" || !input.checked; }));
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
