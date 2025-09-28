import 'dotenv/config'; // loads .env automatically
import fetch from "node-fetch";

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
    const attrs = item.attributes || {};

    // ✅ Image path
    const rawImg = attrs.image?.data?.attributes?.url || null;
    const image = rawImg
      ? (rawImg.startsWith("http") ? rawImg : `${base}${rawImg}`)
      : null;

    // ✅ Handle description
    let shortDesc = "";
    if (Array.isArray(attrs.short_description)) {
      shortDesc = attrs.short_description
        .map(block => block.children?.map(child => child.text).join("") || "")
        .join("\n")
        .trim();
    } else if (typeof attrs.short_description === "string") {
      shortDesc = attrs.short_description;
    }

    return {
      id: item.id,
      name: attrs.name || "Unnamed",
      short_description: shortDesc,
      price: parseFloat(attrs.price) || 0,
      image,
      vendor_phone:
        (attrs.vendor_phone && attrs.vendor_phone.replace(/\D/g, "")) ||
        process.env.VENDOR_PHONE ||
        "",
    };
  });
}
