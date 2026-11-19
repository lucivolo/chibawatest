
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const limit = Math.min(
    Math.max(Number(url.searchParams.get("limit")) || 50, 1),
    50
  );

  const result = await env.DB.prepare(
    "SELECT id, name, message, created_at FROM guestbook ORDER BY id DESC LIMIT ?"
  ).bind(limit).all();

  return Response.json({ messages: result.results ?? [] });
}

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get("Origin");
  const host = new URL(request.url).host;

  if (origin && new URL(origin).host !== host) {
    return new Response("Forbidden", { status: 403 });
  }

  let data;
  try {
    data = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = String(data.name ?? "").trim();
  const message = String(data.message ?? "").trim();

  if (!name || name.length > 32 || !message || message.length > 240) {
    return Response.json(
      { error: "Name must be 1–32 characters and message 1–240 characters." },
      { status: 400 }
    );
  }

  await env.DB.prepare(
    "INSERT INTO guestbook (name, message) VALUES (?, ?)"
  ).bind(name, message).run();

  return Response.json({ success: true });
}
