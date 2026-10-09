const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const productsSource = fs.readFileSync(path.join(root, "js", "products.js"), "utf8");
const context = {};
vm.runInNewContext(`${productsSource}\nthis.PRODUCTS = PRODUCTS;`, context);
const products = context.PRODUCTS;
const byId = Object.fromEntries(products.map((product) => [product.id, product]));

const siteUrl = "https://www.tapzypk.me";
const whatsapp = "923375392447";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function prefixFor(slug) {
  return slug.split("/").filter(Boolean).length ? "../".repeat(slug.split("/").filter(Boolean).length) : "";
}

function header(prefix) {
  return `
    <header class="site-header">
      <div class="container site-header__inner">
        <a class="brand" href="${prefix}">
          <span class="logo-circle logo-circle--sm"><img src="${prefix}assets/logo.webp" alt="Tapzy logo" width="44" height="44"></span>
          <span class="brand__text"><span class="brand__name">Tapzy</span><span class="brand__tag">NFC Review Cards</span></span>
        </a>
        <button class="nav-toggle" type="button" data-nav-toggle aria-expanded="false" aria-controls="site-nav">Menu</button>
        <nav class="site-nav" id="site-nav" data-site-nav>
          <a href="${prefix}">Home</a>
          <a href="${prefix}google-review-nfc-card/">Google Review Cards</a>
          <a href="${prefix}digital-menu-nfc-card/">Digital Menus</a>
          <a href="${prefix}nfc-business-cards/">Business Cards</a>
          <a href="${prefix}bulk-orders-and-reseller/">Bulk &amp; Reseller</a>
          <a href="${prefix}cart.html" class="cart-link">Cart <span class="cart-link__count" data-cart-count hidden>0</span></a>
        </nav>
      </div>
    </header>`;
}

function footer(prefix) {
  return `
    <footer class="site-footer"><div class="container site-footer__grid">
      <div><strong>Tapzy</strong><p>NFC review cards and smart business products.</p></div>
      <div class="site-footer__links"><a href="${prefix}terms.html">Terms of Service</a><a href="${prefix}privacy.html">Privacy Policy</a><a href="https://wa.me/${whatsapp}" target="_blank" rel="noopener noreferrer">WhatsApp</a></div>
      <small>&copy; <span id="year"></span> Tapzy. All rights reserved.</small>
    </div></footer>
    <a class="whatsapp-float" href="https://wa.me/${whatsapp}?text=Hi%20Tapzy%2C%20I%27m%20interested%20in%20your%20NFC%20products." target="_blank" rel="noopener noreferrer">WhatsApp</a>
    <div class="cart-notice" data-cart-notice hidden>Added to cart</div>
    <script>document.getElementById("year").textContent = new Date().getFullYear();</script>
    <script src="${prefix}js/products.js"></script><script src="${prefix}js/pricing.js"></script><script src="${prefix}js/cart.js"></script><script src="${prefix}js/checkout.js"></script><script src="${prefix}js/app.js"></script>`;
}

function shell({ slug, title, description, body, schema, noindex = false }) {
  const prefix = prefixFor(slug);
  const canonical = `${siteUrl}/${slug}`;
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}">
${noindex ? '<meta name="robots" content="noindex,follow">' : `<link rel="canonical" href="${canonical}">`}
<meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:type" content="website"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${siteUrl}/assets/social-share.jpg"><meta property="og:site_name" content="Tapzy"><meta property="og:locale" content="en_PK"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escapeHtml(title)}"><meta name="twitter:description" content="${escapeHtml(description)}"><meta name="twitter:image" content="${siteUrl}/assets/social-share.jpg"><meta name="theme-color" content="#0c1a2e">
<link rel="icon" href="${prefix}assets/favicon-32.png" type="image/png"><link rel="apple-touch-icon" href="${prefix}assets/logo-180.png"><link rel="stylesheet" href="${prefix}css/styles.css"></head>
<body>${header(prefix)}<main class="container page-content">${body}</main>${footer(prefix)}${schema ? `<script type="application/ld+json">${JSON.stringify(schema)}</script>` : ""}</body></html>`;
}

function productBody(product, slug) {
  const prefix = prefixFor(slug);
  const features = product.features.map((feature) => `<li>${escapeHtml(feature)}</li>`).join("");
  const image = `${prefix}${product.image}`;
  const message = encodeURIComponent(`Hi Tapzy, I'm interested in ${product.title}.`);
  return `<p class="breadcrumbs"><a href="${prefix}">Home</a> / ${escapeHtml(product.title)}</p>
    <div data-product-detail data-static-product="${product.id}">
      <div class="product-detail"><div class="product-detail__gallery"><picture><source srcset="${image.replace(".jpg", "-500.webp")} 500w, ${image.replace(".jpg", ".webp")} 1000w" sizes="(max-width: 720px) 100vw, 50vw" type="image/webp"><img src="${image}" alt="${escapeHtml(product.title)}" width="1000" height="1000" fetchpriority="high"></picture></div>
      <div class="product-detail__info"><p class="eyebrow">Tapzy product</p><h1>${escapeHtml(product.title)}</h1><p class="product-detail__summary">${escapeHtml(product.summary)}</p><div class="product-detail__pricing"><p class="product-detail__price">${escapeHtml(product.priceLabel)}</p>${product.pricingNote ? `<p class="product-detail__note">${escapeHtml(product.pricingNote)}</p>` : ""}</div>
      <div class="product-detail__actions"><button type="button" class="btn btn-secondary" data-add-to-cart="${product.id}">Add to Cart</button><div class="qty-stepper" data-qty-stepper><div class="qty-stepper__control"><input type="number" min="1" value="1" data-product-qty aria-label="Quantity for ${escapeHtml(product.title)}"><div class="qty-stepper__buttons"><button type="button" class="qty-stepper__btn" data-qty-up aria-label="Increase quantity">▲</button><button type="button" class="qty-stepper__btn" data-qty-down aria-label="Decrease quantity">▼</button></div></div></div><button type="button" class="btn btn-primary" data-buy-now="${product.id}">Buy Now</button></div>
      <p><a class="btn btn-secondary" href="https://wa.me/${whatsapp}?text=${message}" target="_blank" rel="noopener noreferrer">Ask about this product on WhatsApp</a></p>
      <div class="product-specs"><h2>Product details</h2><ul>${features}</ul><dl><div><dt>Dimensions</dt><dd>${escapeHtml(product.dimensions)}</dd></div><div><dt>Materials</dt><dd>${escapeHtml(product.materials)}</dd></div><div><dt>Compatibility</dt><dd>${escapeHtml(product.compatibility)}</dd></div></dl></div></div></div>
      <section class="faq"><h2>Frequently asked questions</h2><h3>How does the product work?</h3><p>Tap an NFC-enabled phone or scan the QR code to open the configured link. Setup is completed before dispatch where the product requires it.</p><h3>How do I order?</h3><p>Use Add to Cart or send a WhatsApp inquiry. Product details and delivery are confirmed in WhatsApp.</p></section>
    </div>`;
}

function productSchema(product, slug) {
  return { "@context": "https://schema.org", "@type": "Product", name: product.title, image: [`${siteUrl}/${product.image}`], description: product.summary, brand: { "@type": "Brand", name: "Tapzy" }, offers: { "@type": "Offer", url: `${siteUrl}/${slug}`, priceCurrency: "PKR", price: product.price } };
}

const productPages = [
  ["google-review-nfc-card/", byId["google-review-stand"], "Google Review NFC Cards for Pakistan | Tapzy"],
  ["digital-menu-nfc-card/", byId["digital-menu-stand"], "Digital Menu NFC Cards for Restaurants | Tapzy"],
  ["custom-nfc-cards/", byId["custom-review-stand"], "Custom NFC Cards for Businesses | Tapzy"],
  ["products/linkedin-nfc-card/", byId["linkedin-card"], "LinkedIn NFC Business Card | Tapzy"],
  ["products/instagram-nfc-card/", byId["instagram-card"], "Instagram NFC Business Card | Tapzy"],
];
for (const [slug, product, title] of productPages) {
  const dir = path.join(root, slug);
  fs.mkdirSync(dir, { recursive: true });
  const description = `${product.title}: ${product.summary}`.slice(0, 155);
  fs.writeFileSync(path.join(dir, "index.html"), shell({ slug, title, description, body: productBody(product, slug), schema: productSchema(product, slug) }));
}

const categoryPages = [
  ["nfc-business-cards/", "NFC Business Cards for Networking | Tapzy", "Compare Tapzy LinkedIn and Instagram NFC business cards for quick profile sharing.", `<p class="breadcrumbs"><a href="../">Home</a> / NFC business cards</p><h1>NFC business cards for networking</h1><p>Share a LinkedIn or Instagram profile with a tap or QR scan using a wallet-sized PVC card.</p><div class="product-grid">${["linkedin-card", "instagram-card"].map((id) => { const href = byId[id].url.replace(/^\//, ""); return `<article class="product-card"><a class="product-card__media" href="../${href}"><img src="../${byId[id].image}" alt="${escapeHtml(byId[id].title)}" width="1000" height="1000" loading="lazy"></a><div class="product-card__body"><h2><a href="../${href}">${escapeHtml(byId[id].title)}</a></h2><p>${escapeHtml(byId[id].summary)}</p><a class="btn btn-primary" href="../${href}">View card</a></div></article>`; }).join("")}</div><section class="faq"><h2>Networking card questions</h2><h3>Will it work with iPhone and Android?</h3><p>The product information specifies iOS and Android compatibility for NFC-enabled phones, with QR scanning available through a standard camera.</p></section>`],
  ["bulk-orders-and-reseller/", "Bulk NFC Orders and Reseller Enquiries | Tapzy", "Ask Tapzy about bulk NFC cards, custom products, and reseller orders through WhatsApp.", `<p class="breadcrumbs"><a href="../">Home</a> / Bulk orders and reseller</p><h1>Bulk orders and reseller enquiries</h1><h2>Bulk business orders</h2><p>Tapzy lists quantity-based pricing on selected products. Send your required product and quantity on WhatsApp so the current tier can be confirmed.</p><h2>Reseller enquiries</h2><p>For reseller questions, share the products and quantities you are considering. Tapzy can confirm the available ordering details directly.</p><p><a class="btn btn-primary" href="https://wa.me/${whatsapp}?text=Hi%20Tapzy%2C%20I%27m%20interested%20in%20bulk%20or%20reseller%20orders." target="_blank" rel="noopener noreferrer">Start a WhatsApp enquiry</a></p><section class="faq"><h2>Bulk order questions</h2><h3>Is delivery free?</h3><p>Free delivery is advertised for orders over PKR 5,000. Confirm delivery details during order confirmation.</p><h3>Can products be customized?</h3><p>Tapzy describes custom NFC and QR products and pre-configuration before dispatch. Share your requirements on WhatsApp.</p></section>`],
];
for (const [slug, title, description, body] of categoryPages) {
  const dir = path.join(root, slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), shell({ slug, title, description, body }));
}

console.log(`Generated ${productPages.length + categoryPages.length} static pages.`);
