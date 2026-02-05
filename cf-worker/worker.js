export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(env) });
    }

    if (url.pathname !== "/v1/ask" || request.method !== "POST") {
      return new Response("Not Found", { status: 404, headers: corsHeaders(env) });
    }

    try {
      const body = await request.json();
      const text = (body && body.text ? String(body.text) : "").trim();
      const model = (body && body.model ? String(body.model) : "").trim() || (env.DEFAULT_MODEL || "llama-3.1-8b-instant");

      if (!text) {
        return json({ error: "Missing text" }, 400, env);
      }

      const apiKey = env.GROQ_API_KEY;
      if (!apiKey) {
        return json({ error: "Server not configured" }, 500, env);
      }

      const payload = {
        model,
        messages: [
          { role: "system", content: "You are a helpful automotive software and safety assistant. Answer succinctly." },
          { role: "user", content: text }
        ],
        temperature: 0.2,
        max_tokens: 512
      };

      const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await resp.json();
      if (!resp.ok) {
        return json({ error: data }, resp.status, env);
      }

      const answer = data?.choices?.[0]?.message?.content ?? "";
      return json({ answer, model }, 200, env);
    } catch (err) {
      return json({ error: "Unexpected error" }, 500, env);
    }
  }
};

function corsHeaders(env) {
  const origin = env.ALLOWED_ORIGIN || "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}

function json(obj, status, env) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(env)
    }
  });
}
