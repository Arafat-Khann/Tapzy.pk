const PRODUCT_PRICES = {
  "google-review-stand": { title: "Tapzy Google Review Acrylic Card", price: 2500 },
  "google-review-duo": { title: "Tapzy Google Review Card - Business Duo", price: 4000 },
  "digital-menu-stand": { title: "Tapzy Smart NFC & QR Digital Menu Card", price: 2500 },
  "custom-review-stand": { title: "Tapzy Custom Branded Google Review NFC Display Card", price: 3000 },
  "linkedin-card": { title: "Tapzy Smart NFC & QR LinkedIn Networking Card", price: 1500 },
  "instagram-card": { title: "Tapzy Smart NFC & QR Instagram Networking Card", price: 1500 },
};

function sendJson(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function cleanText(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function calculateUnitPrice(productId, quantity) {
  if (productId === "digital-menu-stand" && quantity >= 10) return 1700;
  if (productId === "custom-review-stand" && quantity > 8) return 2200;
  return PRODUCT_PRICES[productId].price;
}

function buildOrder(payload) {
  if (!payload || typeof payload !== "object") {
    return { error: "Invalid request body." };
  }

  const customer = payload.customer;
  const paymentMethod = cleanText(customer?.paymentMethod, 40);
  const allowedPaymentMethods = ["Cash on Delivery", "Advance payment"];
  const name = cleanText(customer?.name, 120);
  const address = cleanText(customer?.address, 500);
  const phone = cleanText(customer?.phone, 40);
  const email = cleanText(customer?.email, 160);

  if (!name || !address || !phone) {
    return { error: "Name, delivery address, and phone number are required." };
  }
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { error: "Please enter a valid email address." };
  }
  if (!allowedPaymentMethods.includes(paymentMethod)) {
    return { error: "Please select a valid payment method." };
  }
  if (!Array.isArray(payload.items) || payload.items.length < 1 || payload.items.length > 20) {
    return { error: "Your order must contain at least one product." };
  }

  const items = [];
  for (const rawItem of payload.items) {
    const productId = cleanText(rawItem?.id, 60);
    const product = PRODUCT_PRICES[productId];
    const quantity = Number(rawItem?.quantity);

    if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 1000) {
      return { error: "One or more products in your order are invalid." };
    }

    const unitPrice = calculateUnitPrice(productId, quantity);
    items.push({
      product_id: productId,
      title: product.title,
      quantity,
      unit_price: unitPrice,
      line_total: unitPrice * quantity,
    });
  }

  return {
    order: {
      customer_name: name,
      delivery_address: address,
      phone,
      email: email || null,
      payment_method: paymentMethod,
      status: "pending",
      total_amount: items.reduce((total, item) => total + item.line_total, 0),
    },
    items,
  };
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.status(204).setHeader("Allow", "POST, OPTIONS").end();
    return;
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    sendJson(res, 405, { error: "Method not allowed." });
    return;
  }

  let payload;
  try {
    payload = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    sendJson(res, 400, { error: "Request body must be valid JSON." });
    return;
  }

  const result = buildOrder(payload);
  if (result.error) {
    sendJson(res, 400, { error: result.error });
    return;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    sendJson(res, 503, { error: "Order service is not configured yet." });
    return;
  }

  try {
    const response = await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/rpc/create_tapzy_order`, {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        p_order: result.order,
        p_items: result.items,
      }),
    });

    if (!response.ok) {
      console.error("Supabase order creation failed", response.status, await response.text());
      sendJson(res, 502, { error: "We could not save your order. Please try again." });
      return;
    }

    const data = await response.json();
    const order = Array.isArray(data) ? data[0] : data;
    sendJson(res, 201, {
      orderId: order.id,
      orderNumber: order.order_number,
      totalAmount: order.total_amount,
    });
  } catch (error) {
    console.error("Order service request failed", error);
    sendJson(res, 502, { error: "We could not connect to the order service. Please try again." });
  }
};
