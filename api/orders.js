const PACKAGES = {
  single_card: { quantity: 1, total: 2500 },
  business_duo: { quantity: 2, total: 4000 },
};

function json(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json").end(JSON.stringify(body));
}

function text(value, max) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function getSupabaseRestUrl(value) {
  const url = new URL(value);
  url.pathname = url.pathname.replace(/\/rest\/v1\/?$/, "");
  return `${url.toString().replace(/\/$/, "")}/rest/v1/orders?select=id,order_number,total_amount`;
}

function validMapsUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function validate(body) {
  if (!body || typeof body !== "object") return "Invalid request body.";
  const packageId = text(body.packageId, 30);
  const paymentMethod = text(body.paymentMethod, 30);
  const phone = text(body.phone, 20).replace(/[\s-]/g, "");
  if (!PACKAGES[packageId]) return "Please select a supported package.";
  if (!["cod", "bank_transfer"].includes(paymentMethod)) return "Please select a supported payment method.";
  if (!/^(?:\+92|0092|92|0)3\d{9}$/.test(phone)) return "Please enter a valid Pakistani mobile number.";
  if (!text(body.name, 120) || !text(body.city, 80) || !text(body.address, 500)) return "Name, city, and complete address are required.";
  const mapsUrl = text(body.googleReviewUrl, 500);
  if (!validMapsUrl(mapsUrl)) return "Please enter a valid Google Maps URL.";
  return {
    customer_name: text(body.name, 120),
    phone,
    city: text(body.city, 80),
    complete_address: text(body.address, 500),
    business_name: text(body.businessName, 120) || null,
    package: packageId,
    quantity: PACKAGES[packageId].quantity,
    google_review_url: mapsUrl,
    payment_method: paymentMethod,
    payment_status: paymentMethod === "cod" ? "pending" : "pending_verification",
    order_status: "pending",
    total_amount: PACKAGES[packageId].total,
    customer_notes: text(body.notes, 500) || null,
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "Method not allowed." });
  }
  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    return json(res, 400, { error: "Request body must be valid JSON." });
  }
  const order = validate(body);
  if (typeof order === "string") return json(res, 400, { error: order });
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return json(res, 503, { error: "Order service is not configured yet. Please contact Tapzy on WhatsApp." });
  try {
    const response = await fetch(getSupabaseRestUrl(supabaseUrl), {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: "Bearer " + serviceRoleKey,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(order),
    });
    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Supabase order insertion failed", response.status, errorBody);
      return json(res, 502, { error: "Supabase rejected the order. Check the Supabase URL and database table configuration." });
    }
    const rows = await response.json();
    const saved = rows[0];
    if (!saved) return json(res, 502, { error: "The order service did not confirm insertion." });
    return json(res, 201, { orderNumber: saved.order_number, totalAmount: saved.total_amount });
  } catch (error) {
    console.error("Order service request failed", error);
    return json(res, 502, { error: "We could not connect to the order service. Please try again." });
  }
};
