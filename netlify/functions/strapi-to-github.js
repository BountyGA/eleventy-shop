// netlify/functions/strapi-to-github.js
export async function handler(event, context) {
  try {
    // Strapi will send JSON payload
    const strapiBody = JSON.parse(event.body || "{}");

    // 🔑 GitHub expects at least { "event_type": "..." }
    const githubPayload = {
      event_type: "strapi_update",
      client_payload: strapiBody, // optional: forward the whole Strapi payload
    };

    const response = await fetch(
      "https://api.github.com/repos/BountyGA/eleventy-shop/dispatches",
      {
        method: "POST",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${process.env.GITHUB_PAT}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(githubPayload),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return {
        statusCode: response.status,
        body: `GitHub dispatch failed: ${error}`,
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: `Server error: ${err.message}`,
    };
  }
}
