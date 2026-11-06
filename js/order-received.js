const safeOrderText = (value) => String(value || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c]));
document.addEventListener("DOMContentLoaded", async () => {
  const token = sessionStorage.getItem("tapzy_confirmation_token");
  if (!token) { document.querySelector("[data-order-card]").hidden = true; document.querySelector("[data-order-error]").hidden = false; return; }
  try {
    const response = await fetch(`../api/orders?token=${encodeURIComponent(token)}`);
    const order = await response.json();
    if (!response.ok) throw new Error(order.error);
    document.querySelector("[data-order-number]").textContent = safeOrderText(order.order_number);
    document.querySelector("[data-order-package]").textContent = order.package === "business_duo" ? "Business Duo" : "Single Card";
    document.querySelector("[data-order-quantity]").textContent = order.quantity;
    document.querySelector("[data-order-total]").textContent = `PKR ${Number(order.total_amount).toLocaleString("en-PK")}`;
    document.querySelector("[data-order-payment]").textContent = order.payment_method === "cod" ? "Cash on Delivery" : "Advance Payment";
    document.querySelector("[data-order-customer]").textContent = safeOrderText(order.customer_name);
    document.querySelector("[data-order-phone]").textContent = safeOrderText(order.phone);
    document.querySelector("[data-order-location]").innerHTML = `${safeOrderText(order.city)}<br>${safeOrderText(order.complete_address)}`;
    document.querySelector("[data-order-payment-note]").textContent = order.payment_method === "cod" ? "You will pay when your order is delivered." : "Your payment will remain pending verification until Tapzy confirms it.";
  } catch (error) {
    document.querySelector("[data-order-card]").hidden = true; document.querySelector("[data-order-error]").hidden = false;
  }
});
