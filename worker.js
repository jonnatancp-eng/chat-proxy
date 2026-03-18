export default {
  async fetch(request, env) {
    // Solo aceptar POST
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    // CORS — permite peticiones desde tu dominio
    const origin = request.headers.get("Origin") || "";
    const allowedOrigins = ["https://iaagency.online/"]; // ← cambia esto

    if (!allowedOrigins.includes(origin)) {
      return new Response("Forbidden", { status: 403 });
    }

    // Leer el body del frontend
    const body = await request.json();

    // Llamar a n8n con el token secreto
    const n8nResponse = await fetch(env.N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.N8N_API_KEY, // ← token secreto, nunca expuesto
      },
      body: JSON.stringify(body),
    });

    const data = await n8nResponse.text();

    return new Response(data, {
      status: n8nResponse.status,
      headers: {
        "Content-Type": n8nResponse.headers.get("Content-Type") || "text/plain",
        "Access-Control-Allow-Origin": origin,
      },
    });
  }
};
