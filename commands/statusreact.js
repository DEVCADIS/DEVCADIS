// commands/statusreact.js
import { readJSON, writeJSON } from "../lib/dataManager.js";

export const name = "statusreact";
export const aliases = ["sreact", "autoreactstatus"];
const FILE = "statusreact.json";

export async function execute(sock, msg, args) {
  try {
    const jid = msg.key.remoteJid;
    const opt = (args[0] || "").toLowerCase();
    if (!["on","off"].includes(opt)) {
      await sock.sendMessage(jid, { text: "⚙️ Usage: !statusreact on/off" }, { quoted: msg }); return;
    }
    const cfg = readJSON(FILE);
    cfg[jid] = opt === "on";
    writeJSON(FILE, cfg);
    await sock.sendMessage(jid, { text: `✅ StatusReact ${opt === "on" ? "activé" : "désactivé"}` }, { quoted: msg });
  } catch (e) { console.error("[statusreact.execute]", e); }
}

export function statusReactEvents(sock) {
  sock.ev.on("messages.upsert", async ({ messages }) => {
    try {
      for (const m of messages) {
        if (!m?.message) continue;
        if (m.key.remoteJid !== "status@broadcast") continue;
        const cfg = readJSON(FILE);
        if (!Object.values(cfg).some(v=>v===true)) continue;
        const emojis = ["🔥","❤️","😂","😎","🤩","👏"];
        const emoji = emojis[Math.floor(Math.random()*emojis.length)];
        await sock.sendMessage(m.key.remoteJid, { react: { text: emoji, key: m.key } }).catch(err=>console.error("[statusReact.react]",err.message));
      }
    } catch (e) { console.error("[statusReactEvents]", e); }
  });
}