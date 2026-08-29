const TAPZY_WHATSAPP = "923375392447";

function formatPkr(amount) {
  return `PKR ${amount.toLocaleString("en-PK")}`;
}

const PRODUCTS = [
  {
    id: "google-review-stand",
    title: "Tapzy Google Review Acrylic Card",
    price: 2500,
    priceLabel: "PKR 2,500",
    pricingNote: "1-49: PKR 2,500 each · 50-99: PKR 600 each · 100+: PKR 550 each",
    image: "assets/products/google-review-stand.jpg",
    summary:
      "Boost your business ratings instantly with this sleek, dual-action display card that lets customers leave a 5-star review in seconds with a simple tap or scan.",
    features: [
      "Built-in NFC Chip: Allows customers to simply tap their smartphones against the card to instantly open your direct Google review link.",
      "Dynamic QR Code: Provides a secondary scanning option for customers whose phones don't support instant NFC reading.",
      "Durable Acrylic Build: Features a sturdy 0.3 cm thickness that looks professional on checkout counters, reception desks, or tables.",
      "Sleek Multi-Wave Aesthetic: Styled with clean blue graphics and wave-curve accents that match professional business environments.",
    ],
    dimensions: "10 x 10 x 0.3 cm",
    materials: "Acrylic",
    compatibility:
      "iOS / Android (compatible with all NFC-enabled smartphones and any device with a standard camera for QR code scanning)",
  },
  {
    id: "digital-menu-stand",
    title: "Tapzy Smart NFC & QR Digital Menu Card",
    price: 2500,
    priceLabel: "PKR 2,500",
    pricingNote: "10 for PKR 17,000 (OFFER)",
    image: "assets/products/digital-menu-stand.jpg",
    summary:
      "Upgrade your restaurant, cafe, or dining experience with a modern touchless menu card that lets customers instantly view your full digital menu by simply tapping or scanning with their phone.",
    features: [
      "Fully Pre-Configured Digital Menu: We transform your traditional paper menu into a custom digital version and completely set it up before dispatch so it is ready to use out of the box.",
      "Dual Tap-and-Scan Access: Features an embedded NFC chip for instant tap-to-phone connectivity alongside a sharp QR code for universal scanning compatibility.",
      "Custom Styled Design: Showcases an elegant restaurant-themed layout complete with cutlery icons, decorative patterns, and your brand tag.",
      "Durable & Premium Construction: Built with a sturdy 0.3 cm acrylic profile designed to withstand high-traffic tabletop environments.",
    ],
    dimensions: "10 x 10 x 0.3 cm",
    materials: "Acrylic",
    compatibility:
      "iOS / Android (compatible with all NFC-enabled smartphones and standard device cameras for QR code access)",
  },
  {
    id: "custom-review-stand",
    title: "Tapzy Custom Branded Google Review NFC Display Card",
    price: 3000,
    priceLabel: "PKR 3,000",
    pricingNote: "Orders over 8: PKR 2,200 per card",
    image: "assets/products/custom-review-stand.jpg",
    summary:
      "Drive more 5-star Google reviews effortlessly with a fully customized card tailored to your brand's unique colors, logo, and ambient style, fully pre-configured and ready to use right out of the box.",
    features: [
      "Fully Pre-Configured for Your Business: Both the embedded NFC chip and dynamic QR code are completely pre-setup by us to point directly to your business's Google review page before delivery.",
      "Custom Branded Aesthetics: Fully personalized to match your business's exact visual identity, incorporating your unique color scheme, logo, and theme.",
      "Seamless Tap-and-Scan Technology: Allows customers to either tap their NFC-enabled smartphone or scan the QR code to open your review portal instantly in seconds.",
      "Durable Countertop Design: Crafted from a sturdy 0.3 cm acrylic profile that sits professionally on checkout counters, reception desks, or dining tables.",
    ],
    dimensions: "10 x 10 x 0.3 cm",
    materials: "Acrylic",
    compatibility:
      "iOS / Android (compatible with all NFC-enabled smartphones and standard device cameras for QR code scanning)",
  },
  {
    id: "linkedin-card",
    title: "Tapzy Smart NFC & QR LinkedIn Networking Card",
    price: 1500,
    priceLabel: "PKR 1,500",
    image: "assets/products/linkedin-card.jpg",
    summary:
      "Skip the hassle of typing out names at networking events and make an unforgettable first impression. Let professionals instantly pull up your LinkedIn profile with a single tap or scan.",
    features: [
      "Instant Tap-to-Connect: Embedded NFC technology lets you share your LinkedIn profile immediately by simply tapping your card against another person's phone.",
      "Universal QR Code Option: Includes a clean, scannable QR code on the reverse side to ensure effortless connection even with devices that don't use NFC.",
      "Stand Out and Be Remembered: Replaces traditional paper cards with a modern, high-tech networking tool that leaves a lasting, professional impression on everyone you meet.",
      "Sleek & Professional Design: Features a polished corporate look with clean typography, the recognizable LinkedIn branding, and your @tapzy.pk handle.",
    ],
    dimensions: "5.398 x 8.56 cm (Standard Credit Card Size)",
    materials: "PVC",
    compatibility:
      "iOS / Android (compatible with all NFC-enabled smartphones and standard device cameras for QR code scanning)",
  },
  {
    id: "instagram-card",
    title: "Tapzy Smart NFC & QR Instagram Networking Card",
    price: 1500,
    priceLabel: "PKR 1,500",
    image: "assets/products/instagram-card.jpg",
    summary:
      "Share your Instagram handle instantly and leave a lasting impression with this creative, pocket-sized smart card designed for content creators, influencers, and professionals on the go.",
    features: [
      "Instant Tap-to-Profile Connectivity: Embedded with advanced NFC technology so followers or connections can simply tap your card with their phone to open your Instagram profile immediately.",
      "Universal QR Code Backup: Features a clear, scannable QR code on the reverse side for effortless scanning on any device.",
      "Vibrant Dual-Sided Design: Styled with a sleek, eye-catching aesthetic and clean typography that captures attention at networking events, meetups, or creator spaces.",
      "Ultra-Portable & Durable: Built to standard credit-card dimensions using sturdy PVC, making it lightweight and resilient enough to carry in your wallet or pocket everywhere you go.",
    ],
    dimensions: "5.398 x 8.56 cm (Standard Credit Card Size)",
    materials: "PVC",
    compatibility:
      "iOS / Android (compatible with all NFC-enabled smartphones and standard device cameras for QR code scanning)",
  },
];
function getProductById(id) {
  return PRODUCTS.find((product) => product.id === id) || null;
}

function formatWhatsAppInvoice(items, customer) {
  const lines = [
    "TAPZY.PK - ORDER INVOICE",
    "========================",
    "",
    "CUSTOMER DETAILS",
    `Name: ${customer.name}`,
    `Address: ${customer.address}`,
    `Phone: ${customer.phone}`,
    `Email: ${customer.email}`,
    `Payment Method: ${customer.paymentMethod}`,
    "",
    "ORDER ITEMS",
    "-----------",
  ];

  let grandTotal = 0;

  items.forEach((item, index) => {
    const line = calculateLineItem(item.id, item.quantity);
    if (!line) return;

    grandTotal += line.lineTotal;

    lines.push(`${index + 1}. ${line.title}`);
    lines.push(`   Quantity: ${line.quantity}`);
    lines.push(`   Unit Price: ${formatPkr(line.unitPrice)}`);
    if (line.rateNote) {
      lines.push(`   Note: ${line.rateNote}`);
    }
    lines.push(`   Subtotal: ${formatPkr(line.lineTotal)}`);
    lines.push("");
  });

  lines.push("-------------------------");
  lines.push(`GRAND TOTAL: ${formatPkr(grandTotal)}`);
  lines.push("");
  lines.push("Please confirm my order and share payment/delivery details.");
  lines.push("");
  lines.push("Thank you!");

  return lines.join("\n");
}

function openWhatsAppCheckout(items, customer) {
  const message = formatWhatsAppInvoice(items, customer);
  const url = `https://wa.me/${TAPZY_WHATSAPP}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}
