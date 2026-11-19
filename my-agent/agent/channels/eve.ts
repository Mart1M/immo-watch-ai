import { eveChannel } from "eve/channels/eve";
import { httpBasic, localDev } from "eve/channels/auth";

// The web app calls the agent with this shared password (AGENT_PASSWORD).
export default eveChannel({
  auth: [httpBasic({ username: "web", password: process.env.AGENT_PASSWORD ?? "" }), localDev()],
});
