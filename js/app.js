function setCartBadge() {
  const badge = document.querySelector("[data-cart-count]");
  if (!badge) return;

  const count = getCartCount();
  badge.textContent = String(count);
  badge.hidden = count === 0;
}

function renderPricingBlock(product, className, options = {}, quantity = 1) {
  const { showNote = true } = options;
  const line = calculateLineItem(product.id, quantity);
  const unitPrice = line ? formatPkr(line.lineTotal) : product.priceLabel;
  const note =
    showNote && (line?.rateNote || product.pricingNote)
      ? `<p class="${className}__note">${line?.rateNote || product.pricingNote}</p>`
      : "";

  return `
    <div class="${className}">
      <p class="${className}__price">${unitPrice}</p>
      ${note}
    </div>
  `;
}

function renderBulkInquiryNote(productTitle = "") {
  const message = productTitle
    ? `Hello Tapzy.pk, I would like to inquire about bulk orders for ${productTitle}.`
    : "Hello Tapzy.pk, I would like to inquire about bulk orders.";
  const url = `https://wa.me/${TAPZY_WHATSAPP}?text=${encodeURIComponent(message)}`;

  return `
    <p class="product-bulk-note">
      <a href="${url}" target="_blank" rel="noopener noreferrer">
        Send inquiry message on WhatsApp for bulk orders
      </a>
    </p>
  `;
}

function renderQuantityStepper(productId, ariaLabel = "Quantity") {
  const qtyAttributes = productId
    ? `data-product-qty="${productId}"`
    : 'id="quantity" data-product-qty';

  return `
    <div class="qty-stepper" data-qty-stepper>
      <div class="qty-stepper__control">
        <input
          type="number"
          min="1"
          value="1"
          inputmode="numeric"
          ${qtyAttributes}
          aria-label="${ariaLabel}"
        >
        <div class="qty-stepper__buttons">
          <button type="button" class="qty-stepper__btn" data-qty-up aria-label="Increase quantity">▲</button>
          <button type="button" class="qty-stepper__btn" data-qty-down aria-label="Decrease quantity">▼</button>
        </div>
      </div>
    </div>
  `;
}

function renderProductCard(product) {
  const article = document.createElement("article");
  article.className = "product-card";
  article.innerHTML = `
    <a class="product-card__media" href="product.html?id=${product.id}">
      <img src="${product.image}" alt="${product.title}" loading="lazy" width="600" height="600">
    </a>
    <div class="product-card__body">
      <h2 class="product-card__title">
        <a href="product.html?id=${product.id}">${product.title}</a>
      </h2>
      ${renderPricingBlock(product, "product-card__pricing", { showNote: false }, 1)}
      <div class="product-card__actions">
        <button type="button" class="btn btn-secondary" data-add-to-cart="${product.id}">
          Add to Cart
        </button>
        ${renderQuantityStepper(product.id, `Quantity for ${product.title}`)}
        <button type="button" class="btn btn-primary" data-buy-now="${product.id}">
          Buy Now
        </button>
      </div>
      ${renderBulkInquiryNote(product.title)}
    </div>
  `;
  return article;
}

function renderProductGrid() {
  const grid = document.querySelector("[data-product-grid]");
  if (!grid) return;

  grid.replaceChildren(...PRODUCTS.map(renderProductCard));
}

function renderProductDetail() {
  const root = document.querySelector("[data-product-detail]");
  if (!root) return;

  const params = new URLSearchParams(window.location.search);
  const product = getProductById(params.get("id"));

  if (!product) {
    root.innerHTML = `
      <div class="empty-state">
        <h1>Product not found</h1>
        <p>The product you are looking for is unavailable.</p>
        <a class="btn btn-primary" href="index.html">Back to Shop</a>
      </div>
    `;
    return;
  }

  document.title = `${product.title} | Tapzy.pk`;

  const featureList = product.features
    .map((feature) => `<li>${feature}</li>`)
    .join("");

  root.innerHTML = `
    <p><a href="index.html#shop">Back to Shop</a></p>
    <div class="product-detail">
      <div class="product-detail__gallery">
        <img src="${product.image}" alt="${product.title}" width="800" height="800">
      </div>
      <div class="product-detail__info">
        <p class="eyebrow">Tapzy.pk Product</p>
        <h1>${product.title}</h1>
        <p class="product-detail__summary">${product.summary}</p>
        ${renderPricingBlock(product, "product-detail__pricing", { showNote: true }, 1)}

        <div class="product-detail__actions">
          <button type="button" class="btn btn-secondary" data-add-to-cart="${product.id}">
            Add to Cart
          </button>
          ${renderQuantityStepper("", `Quantity for ${product.title}`)}
          <button type="button" class="btn btn-primary" data-buy-now="${product.id}">
            Buy Now
          </button>
        </div>
        ${renderBulkInquiryNote(product.title)}

        <div class="product-specs">
          <h2>Product Details</h2>
          <ul>${featureList}</ul>
          <dl>
            <div>
              <dt>Dimensions</dt>
              <dd>${product.dimensions}</dd>
            </div>
            <div>
              <dt>Materials</dt>
              <dd>${product.materials}</dd>
            </div>
            <div>
              <dt>Compatibility</dt>
              <dd>${product.compatibility}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  `;
}

function renderCartPage() {
  const list = document.querySelector("[data-cart-list]");
  const empty = document.querySelector("[data-cart-empty]");
  const panel = document.querySelector("[data-cart-panel]");
  if (!list || !empty || !panel) return;

  const items = getCartItems();

  if (!items.length) {
    list.replaceChildren();
    empty.hidden = false;
    panel.hidden = true;
    return;
  }

  empty.hidden = true;
  panel.hidden = false;

  list.replaceChildren(
    ...items.map((item) => {
      const line = calculateLineItem(item.id, item.quantity);
      const row = document.createElement("article");
      row.className = "cart-item";
      row.innerHTML = `
        <img src="${item.image}" alt="" width="96" height="96">
        <div class="cart-item__main">
          <h2>${item.title}</h2>
          <p>${formatPkr(line.unitPrice)} each${line.rateNote ? ` · ${line.rateNote}` : ""}</p>
          <p class="cart-item__subtotal">Subtotal: ${formatPkr(line.lineTotal)}</p>
          <div class="cart-item__controls">
            <label>
              Qty
              <input type="number" min="1" value="${item.quantity}" data-cart-qty="${item.id}">
            </label>
            <button type="button" class="text-button" data-remove-item="${item.id}">Remove</button>
          </div>
        </div>
      `;
      return row;
    })
  );

  const total = calculateOrderTotal(items);
  const totalEl = document.querySelector("[data-cart-total]");
  if (totalEl) {
    totalEl.textContent = formatPkr(total);
  }
}

function adjustQuantity(input, delta) {
  const current = Number.parseInt(input.value, 10);
  const next = Number.isFinite(current) ? current + delta : 1;
  input.value = String(Math.max(1, next));
}

function getRequestedQuantity(trigger) {
  const container = trigger.closest("[data-product-detail], .product-card");
  if (!container) return 1;

  const quantityInput =
    container.querySelector("[data-product-qty]") || container.querySelector("#quantity");

  if (!quantityInput) return 1;

  const value = Number.parseInt(quantityInput.value, 10);
  return Number.isFinite(value) && value > 0 ? value : 1;
}

function updatePricingForQuantity(input) {
  const productId = input.getAttribute("data-product-qty") || new URLSearchParams(window.location.search).get("id");
  const product = getProductById(productId);

  if (!product || !input) return;

  const quantity = Math.max(1, Number.parseInt(input.value, 10) || 1);
  const container = input.closest("[data-product-detail], .product-card");
  if (!container) return;

  const pricingTarget = container.querySelector(".product-card__pricing, .product-detail__pricing");
  if (!pricingTarget) return;

  const className = pricingTarget.classList.contains("product-detail__pricing")
    ? "product-detail__pricing"
    : "product-card__pricing";

  pricingTarget.innerHTML = renderPricingBlock(
    product,
    className,
    { showNote: className === "product-detail__pricing" },
    quantity
  );
}

function bindCommerceActions() {
  document.addEventListener("click", (event) => {
    const upButton = event.target.closest("[data-qty-up]");
    const downButton = event.target.closest("[data-qty-down]");

    if (upButton || downButton) {
      const stepper = event.target.closest("[data-qty-stepper]");
      const input = stepper?.querySelector("[data-product-qty]");
      if (input) {
        adjustQuantity(input, upButton ? 1 : -1);
      }
      return;
    }

    const addButton = event.target.closest("[data-add-to-cart]");
    if (addButton) {
      const productId = addButton.getAttribute("data-add-to-cart");
      const quantity = getRequestedQuantity(addButton);
      addToCart(productId, quantity);
      setCartBadge();
      renderCartPage();

      const notice = document.querySelector("[data-cart-notice]");
      if (notice) {
        notice.hidden = false;
        window.setTimeout(() => {
          notice.hidden = true;
        }, 2200);
      }
      return;
    }

    const buyButton = event.target.closest("[data-buy-now]");
    if (buyButton) {
      const productId = buyButton.getAttribute("data-buy-now");
      const product = getProductById(productId);
      if (!product) return;

      const quantity = getRequestedQuantity(buyButton);
      startCheckout([
        {
          id: product.id,
          quantity,
        },
      ]);
      return;
    }

    const removeButton = event.target.closest("[data-remove-item]");
    if (removeButton) {
      removeFromCart(removeButton.getAttribute("data-remove-item"));
      setCartBadge();
      renderCartPage();
      return;
    }

    const checkoutButton = event.target.closest("[data-checkout]");
    if (checkoutButton) {
      const items = getCartItems();
      if (!items.length) return;
      startCheckout(items);
    }
  });

  document.addEventListener("input", (event) => {
    const qtyInput = event.target.closest("[data-product-qty]");
    if (!qtyInput) return;

    const value = Number.parseInt(qtyInput.value, 10);
    if (!Number.isFinite(value) || value < 1) {
      qtyInput.value = "1";
    }

    updatePricingForQuantity(qtyInput);
  });

  document.addEventListener("change", (event) => {
    const qtyInput = event.target.closest("[data-cart-qty]");
    if (!qtyInput) return;

    const productId = qtyInput.getAttribute("data-cart-qty");
    const quantity = Number.parseInt(qtyInput.value, 10);
    updateCartQuantity(productId, quantity);
    setCartBadge();
    renderCartPage();
  });
}

function bindNavigation() {
  const toggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-site-nav]");

  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!expanded));
    nav.classList.toggle("is-open", !expanded);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderProductGrid();
  renderProductDetail();
  renderCartPage();
  setCartBadge();
  bindCommerceActions();
  bindNavigation();
});
