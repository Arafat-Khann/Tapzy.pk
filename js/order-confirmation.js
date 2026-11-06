function confirmationText(value) {
  return String(value || "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[character]));
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("year").textContent = new Date().getFullYear();
  let order;
  try {
    order = JSON.parse(sessionStorage.getItem("tapzy_order_confirmation") || "null");
  } catch {
    order = null;
  }
  if (!order) {
    document.querySelector("[data-order-confirmation]").hidden = true;
    document.querySelector("[data-order-missing]").hidden = false;
    return;
  }
  document.querySelector("[data-order-number]").textContent = confirmationText(order.orderNumber);
  document.querySelector("[data-order-package]").textContent = order.packageId === "business_duo" ? "Business Duo (2 cards)" : "Single Card";
  document.querySelector("[data-order-total]").textContent = `PKR ${Number(order.totalAmount).toLocaleString("en-PK")}`;
  document.querySelector("[data-order-location]").innerHTML = `${confirmationText(order.city)}<br>${confirmationText(order.address)}`;
  document.querySelector("[data-order-payment]").textContent = order.paymentMethod === "cod" ? "Cash on Delivery · Pending confirmation" : "Advance payment · Pending verification";
  document.querySelector("[data-order-phone]").textContent = confirmationText(order.phone);
});
