// commands/antilink.js
import { statusProtections } from "../protections.js";

export const name = "antilink";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;

  if (!args[0] || !["on","off"].includes(args[0])) {
    await sock.sendMessage(from, { text: `⚙️ AntiLink est ${statusProtections.antiLink ? "activé" : "désactivé"}\nUsage : !antilink <on/off>` });
    return;
  }

  statusProtections.antiLink = args[0] === "on";
  await sock.sendMessage(from, { text: `✅ AntiLink ${args[0] === "on" ? "activé" : "désactivé"} !` });
}