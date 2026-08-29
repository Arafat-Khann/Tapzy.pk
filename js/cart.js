const CART_STORAGE_KEY = "tapzy_cart_v1";

function readCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeCart(items) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

function getCartCount() {
  return readCart().reduce((sum, item) => sum + item.quantity, 0);
}

function addToCart(productId, quantity = 1) {
  const product = getProductById(productId);
  if (!product) return readCart();

  const cart = readCart();
  const existing = cart.find((item) => item.id === productId);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      priceLabel: product.priceLabel,
      image: product.image,
      quantity,
    });
  }

  writeCart(cart);
  return cart;
}

function updateCartQuantity(productId, quantity) {
  const cart = readCart();
  const item = cart.find((entry) => entry.id === productId);
  if (!item) return cart;

  if (quantity <= 0) {
    return removeFromCart(productId);
  }

  item.quantity = quantity;
  writeCart(cart);
  return cart;
}

function removeFromCart(productId) {
  const cart = readCart().filter((item) => item.id !== productId);
  writeCart(cart);
  return cart;
}

function clearCart() {
  writeCart([]);
  return [];
}

function getCartItems() {
  return readCart();
}
