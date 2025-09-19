// commands/antibot.js
import { statusProtections } from "../protections.js";

export const name = "antibot";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;

  if (!args[0] || !["on","off"].includes(args[0])) {
    await sock.sendMessage(from, { text: `⚙️ AntiBot est ${statusProtections.antiBot ? "activé" : "désactivé"}\nUsage : !antibot <on/off>` });
    return;
  }

  statusProtections.antiBot = args[0] === "on";
  await sock.sendMessage(from, { text: `✅ AntiBot ${args[0] === "on" ? "activé" : "désactivé"} !` });
}