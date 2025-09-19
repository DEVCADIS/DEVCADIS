// commands/autoreact.js
import { readJSON, writeJSON } from "../lib/dataManager.js";

export const name = "autoreact";
export const aliases = ["reactauto", "autolike"];
const FILE = "autoreact.json";

export async function execute(sock, msg, args) {
  try {
    const jid = msg.key.remoteJid;
    const opt = (args[0] || "").toLowerCase();
    if (!["on","off"].includes(opt)) {
      await sock.sendMessage(jid, { text: "⚙️ Usage: !autoreact on/off" }, { quoted: msg }); return;
    }
    const cfg = readJSON(FILE);
    cfg[jid] = opt === "on";
    writeJSON(FILE, cfg);
    await sock.sendMessage(jid, { text: `✅ AutoReact ${opt === "on" ? "activé" : "désactivé"}` }, { quoted: msg });
  } catch (e) {
    console.error("[autoreact.execute]", e);
  }
}

export function autoreactEvents(sock) {
  sock.ev.on("messages.upsert", async ({ messages }) => {
    try {
      for (const m of messages) {
        if (!m?.message) continue;
        const jid = m.key.remoteJid;
        const cfg = readJSON(FILE);
        if (!cfg[jid]) continue;
        const emojis = ["😂","🔥","❤️","👍","🤖","⚡"];
        const emoji = emojis[Math.floor(Math.random()*emojis.length)];
        await sock.sendMessage(jid, { react: { text: emoji, key: m.key } }).catch(err => console.error("[autoreact.react]", err.message));
      }
    } catch (e) { console.error("[autoreactEvents]", e); }
  });
}