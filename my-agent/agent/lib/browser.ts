// Client of the `browser` service (stealth Chromium the agent drives like a user).
export async function browser(path: string, body: Record<string, unknown>) {
  const res = await fetch(`${process.env.BROWSER_URL}/${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${process.env.BROWSER_TOKEN ?? ""}` },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(130_000),
  });
  if (!res.ok) throw new Error(`browser ${path}: ${res.status} ${(await res.text()).slice(0, 300)}`);
  return res.json();
}
