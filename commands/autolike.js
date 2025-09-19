// commands/autolike.js
import { statusProtections } from "../protections.js";

export const name = "autolike";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;

  if (!args[0] || !["on","off"].includes(args[0])) {
    await sock.sendMessage(from, { text: `⚙️ AutoLike est ${statusProtections.autoLikeStatus ? "activé" : "désactivé"}\nUsage : !autolike <on/off>` });
    return;
  }

  statusProtections.autoLikeStatus = args[0] === "on";
  await sock.sendMessage(from, { text: `✅ AutoLike ${args[0] === "on" ? "activé" : "désactivé"} !` });
}