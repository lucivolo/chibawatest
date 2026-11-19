
export async function onRequestPost({ request, env }) {
  const origin = request.headers.get("Origin");
  const host = new URL(request.url).host;

  if (origin && new URL(origin).host !== host) {
    return new Response("Forbidden", { status: 403 });
  }

  await env.DB.prepare(
    "UPDATE site_stats SET visits = visits + 1 WHERE id = 1"
  ).run();

  const result = await env.DB.prepare(
    "SELECT visits FROM site_stats WHERE id = 1"
  ).first();

  return Response.json({ visits: result?.visits ?? 0 });
}
