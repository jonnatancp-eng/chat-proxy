export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowedOrigins = ["https://iaagency.online"]; // ← tu dominio real

    const corsHeaders = {
      "Access-Control-Allow-Origin": allowedOrigins.includes(origin) ? origin : "",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Manejar preflight OPTIONS
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    if (!allowedOrigins.includes(origin)) {
      return new Response("Forbidden", { status: 403 });
    }

    const body = await request.json();

    const n8nResponse = await fetch(env.N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.N8N_API_KEY,
      },
      body: JSON.stringify(body),
    });

    const data = await n8nResponse.text();

    return new Response(data, {
      status: n8nResponse.status,
      headers: {
        ...corsHeaders,
        "Content-Type": n8nResponse.headers.get("Content-Type") || "text/plain",
      },
    });
  }
};
