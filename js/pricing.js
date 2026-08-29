function calculateLineItem(productId, quantity) {
  const product = getProductById(productId);
  if (!product) return null;

  const qty = Math.max(1, Number.parseInt(quantity, 10) || 1);
  let unitPrice = product.price;
  let lineTotal = 0;
  let rateNote = "";

  switch (productId) {
    case "digital-menu-stand":
      if (qty >= 10) {
        unitPrice = 1700;
        lineTotal = qty * unitPrice;
        rateNote = "Offer rate applied (10+): PKR 1,700 per card";
      } else {
        unitPrice = 2500;
        lineTotal = qty * unitPrice;
        rateNote = "Standard rate: PKR 2,500 per card";
      }
      break;

    case "custom-review-stand":
      if (qty > 8) {
        unitPrice = 2200;
        lineTotal = qty * unitPrice;
        rateNote = "Bulk rate applied (9+): PKR 2,200 per card";
      } else {
        unitPrice = 3000;
        lineTotal = qty * unitPrice;
        rateNote = "Standard rate: PKR 3,000 per card";
      }
      break;

    case "google-review-stand":
      if (qty < 50) {
        unitPrice = 2500;
        lineTotal = qty * unitPrice;
        rateNote = "Standard rate (1-49): PKR 2,500 per card";
      } else if (qty < 100) {
        unitPrice = 600;
        lineTotal = qty * unitPrice;
        rateNote = "Bulk rate applied (50-99): PKR 600 per card";
      } else {
        unitPrice = 550;
        lineTotal = qty * unitPrice;
        rateNote = "Bulk rate applied (100+): PKR 550 per card";
      }
      break;

    default:
      unitPrice = product.price;
      lineTotal = qty * unitPrice;
      break;
  }

  return {
    productId,
    title: product.title,
    quantity: qty,
    unitPrice,
    lineTotal,
    rateNote,
  };
}

function calculateOrderTotal(items) {
  return items.reduce((sum, item) => {
    const line = calculateLineItem(item.id, item.quantity);
    return sum + (line ? line.lineTotal : 0);
  }, 0);
}
