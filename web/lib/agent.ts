// Starts an agent session. The agent stores its results in Postgres, so the web app does not wait for the reply.
export async function runAgent(message: string): Promise<boolean> {
  try {
    const res = await fetch(`${process.env.AGENT_URL}/eve/v1/session`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Basic ${Buffer.from(`web:${process.env.AGENT_PASSWORD}`).toString("base64")}`,
      },
      body: JSON.stringify({ message }),
      signal: AbortSignal.timeout(10_000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
