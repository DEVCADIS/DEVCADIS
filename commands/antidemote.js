// commands/antidemote.js
import { statusProtections } from "../protections.js";

export const name = "antidemote";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;

  if (!args[0] || !["on","off"].includes(args[0])) {
    await sock.sendMessage(from, { text: `⚙️ AntiDemote est ${statusProtections.antiDemote ? "activé" : "désactivé"}\nUsage : !antidemote <on/off>` });
    return;
  }

  statusProtections.antiDemote = args[0] === "on";
  await sock.sendMessage(from, { text: `✅ AntiDemote ${args[0] === "on" ? "activé" : "désactivé"} !` });
}