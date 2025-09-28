import 'dotenv/config'; // loads .env automatically

export default async function () {
  const base = process.env.STRAPI_API_URL;
  if (!base) {
    console.error("❌ STRAPI_API_URL not set. Did you create your .env file?");
    return [];
  }

  const url = `${base}/api/products?populate=image&pagination[pageSize]=100`;

  const res = await fetch(url);
  if (!res.ok) {
    console.error("❌ Failed to fetch products:", res.status, res.statusText);
    return [];
  }

  const json = await res.json();

  return (json.data || []).map(item => {
    // Strapi v5 puts fields directly on the item
    const rawImg = item.image?.url || null;
    const image = rawImg ? (rawImg.startsWith("http") ? rawImg : `${base}${rawImg}`) : null;

    // Handle rich text array (flatten to string)
    let shortDesc = "";
    if (Array.isArray(item.short_description)) {
      shortDesc = item.short_description
        .map(block => block.children?.map(child => child.text).join("") || "")
        .join("\n")
        .trim();
    } else if (typeof item.short_description === "string") {
      shortDesc = item.short_description;
    }

    return {
      id: item.id,
      name: item.name || "Unnamed",
      short_description: shortDesc,
      price: parseFloat(item.price) || 0,
      image,
      vendor_phone:
        (item.vendor_phone && item.vendor_phone.replace(/\D/g, "")) ||
        process.env.VENDOR_PHONE ||
        "",
    };
  });
}
