// commands/autorecording.js
import { readJSON, writeJSON } from "../lib/dataManager.js";

export const name = "autorecording";
export const aliases = ["recording", "autovocal"];
const FILE = "autorecording.json";

export async function execute(sock, msg, args) {
  try {
    const jid = msg.key.remoteJid;
    const opt = (args[0] || "").toLowerCase();
    if (!["on","off"].includes(opt)) {
      await sock.sendMessage(jid, { text: "⚙️ Usage: !autorecording on/off" }, { quoted: msg }); return;
    }
    const cfg = readJSON(FILE);
    cfg[jid] = opt === "on";
    writeJSON(FILE, cfg);
    await sock.sendMessage(jid, { text: `✅ AutoRecording ${opt === "on" ? "activé" : "désactivé"}` }, { quoted: msg });
  } catch (e) { console.error("[autorecording.execute]", e); }
}

export function autorecordingEvents(sock) {
  sock.ev.on("messages.upsert", async ({ messages }) => {
    try {
      for (const m of messages) {
        if (!m?.message) continue;
        const jid = m.key.remoteJid;
        const cfg = readJSON(FILE);
        if (!cfg[jid]) continue;
        await sock.sendPresenceUpdate("recording", jid).catch(err => console.error("[autorecording.presence]", err.message));
      }
    } catch (e) { console.error("[autorecordingEvents]", e); }
  });
}