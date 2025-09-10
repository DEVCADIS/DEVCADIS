// commands/antipromote.js
import { statusProtections } from "../protections.js";

export const name = "antipromote";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;

  if (!args[0] || !["on","off"].includes(args[0])) {
    await sock.sendMessage(from, { text: `⚙️ AntiPromote est ${statusProtections.antiPromote ? "activé" : "désactivé"}\nUsage : !antipromote <on/off>` });
    return;
  }

  statusProtections.antiPromote = args[0] === "on";
  await sock.sendMessage(from, { text: `✅ AntiPromote ${args[0] === "on" ? "activé" : "désactivé"} !` });
}