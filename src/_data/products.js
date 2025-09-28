import fetch from "node-fetch";

export default async function () {
  const base = process.env.STRAPI_API_URL;
  if (!base) {
    console.error("❌ STRAPI_API_URL not set!");
    return [];
  }

  const url = `${base}/api/products?populate=image&pagination[pageSize]=100`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const json = await res.json();

    return (json.data || []).map(item => {
      const rawImg = item.image?.url || null;
      const image = rawImg && (rawImg.startsWith("http") ? rawImg : `${base}${rawImg}`);

      let shortDesc = "";
      if (Array.isArray(item.short_description)) {
        shortDesc = item.short_description
          .map(block => block.children?.map(c => c.text).join("") || "")
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
        vendor_phone: (item.vendor_phone?.replace(/\D/g, "") || process.env.VENDOR_PHONE || ""),
      };
    });
  } catch (err) {
    console.error("❌ Fetch failed:", err);
    return [];
  }
}
