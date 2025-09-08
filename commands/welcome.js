// commands/welcome.js
import { readJSON, writeJSON } from "../lib/dataManager.js";

export const name = "welcome";
export const aliases = ["bienvenue", "bye"];

const FILE = "welcome.json";

export async function execute(sock, msg, args) {
  try {
    const jid = msg.key.remoteJid;
    if (!jid?.endsWith?.("@g.us")) {
      await sock.sendMessage(jid, { text: "❌ Utilise cette commande dans un groupe." }, { quoted: msg });
      return;
    }
    const opt = (args[0] || "").toLowerCase();
    if (!["on", "off"].includes(opt)) {
      await sock.sendMessage(jid, { text: "⚙️ Utilisation : !welcome on / off" }, { quoted: msg });
      return;
    }
    const cfg = readJSON(FILE);
    cfg[jid] = opt === "on";
    writeJSON(FILE, cfg);
    await sock.sendMessage(jid, { text: `✅ Welcome ${opt === "on" ? "activé" : "désactivé"} pour ce groupe.` }, { quoted: msg });
  } catch (e) {
    console.error("[welcome.execute]", e);
    await sock.sendMessage(msg.key.remoteJid, { text: "❌ Erreur welcome : " + e.message }, { quoted: msg });
  }
}

// écoute join/leave — à appeler une seule fois au démarrage : welcomeEvents(sock)
export function welcomeEvents(sock) {
  sock.ev.on("group-participants.update", async (update) => {
    try {
      const cfg = readJSON(FILE);
      if (!cfg[update.id]) return;

      for (const participant of update.participants) {
        let pp = "https://files.catbox.moe/2yz2qu.jpg";
        try { pp = await sock.profilePictureUrl(participant, "image"); } catch {}
        const name = participant.split("@")[0];
        if (update.action === "add") {
          await sock.sendMessage(update.id, { image: { url: pp }, caption: `👋 Bienvenue @${name} !`, mentions: [participant] });
        } else if (update.action === "remove") {
          await sock.sendMessage(update.id, { image: { url: pp }, caption: `👋 @${name} a quitté le groupe.`, mentions: [participant] });
        }
      }
    } catch (e) {
      console.error("[welcomeEvents]", e);
    }
  });
}