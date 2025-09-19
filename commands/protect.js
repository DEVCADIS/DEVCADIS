// commands/protect.js
import { statusProtections } from "../protections.js";

export const name = "protect";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;

  if (args.length === 0) {
    await sock.sendMessage(from, { text: `⚙️ Status protections :\n${JSON.stringify(statusProtections, null, 2)}` });
    return;
  }

  const [action, feature] = args; // !protect on antiLink
  if (!["on", "off"].includes(action) || !Object.keys(statusProtections).includes(feature)) {
    await sock.sendMessage(from, { text: "❌ Utilisation : !protect <on/off> <antiLink|antiPromoteDemote|antiBot|autoLikeStatus>" });
    return;
  }

  statusProtections[feature] = action === "on";
  await sock.sendMessage(from, { text: `✅ Protection ${feature} ${action === "on" ? "activée" : "désactivée"} !` });
}