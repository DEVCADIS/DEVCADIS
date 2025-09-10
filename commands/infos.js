export const name = "infos";

export async function execute(sock, msg, args, options = {}) {
  const { botNumber = "", baileysVersion = "6.6.0" } = options;
  const from = msg?.key?.remoteJid || (msg?.key?.participant || "");

  // uptime
  const uptime = process.uptime(); // sec
  const h = Math.floor(uptime / 3600);
  const m = Math.floor((uptime % 3600) / 60);
  const s = Math.floor(uptime % 60);
  const uptimeStr = `${h}h ${m}m ${s}s`;

  // mémoire
  const usedMem = (process.memoryUsage().rss / 1024 / 1024).toFixed(2); // MB
  let totalMemGB = "N/A";
  let platform = "N/A";

  try {
    const os = await import("os");
    totalMemGB = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2); // GB
    platform = `${os.platform()} ${os.release()}`;
  } catch (e) {
    // si import échoue, on continue quand même
    console.warn("Impossible d'importer 'os' dynamiquement :", e?.message || e);
  }

  // latence (simple mesure en envoyant un message)
  const start = Date.now();
  await sock.sendMessage(from, { text: "⏳ Calcul de la latence..." }, { quoted: msg }).catch(()=>{});
  const latency = Date.now() - start;

  // numéro du bot (normalisé)
  const botJid = botNumber || (sock?.user?.id || sock?.user?.jid || "").split?.(":")?.[0] || "Inconnu";

  const text = `🤖 *RENEGADES BOT INFO* 🤖

📌 *Nom du bot:* RENEGADES MD
📱 *Numéro:* ${botJid}
⚡ *Uptime:* ${uptimeStr}
🛠️ *Version Baileys:* ${baileysVersion}
💾 *Mémoire utilisée:* ${usedMem} MB / ${totalMemGB} GB
📡 *Latence:* ${latency} ms
🖥️ *Plateforme:* ${platform}`;

  await sock.sendMessage(from, { text }, { quoted: msg }).catch(err => console.error("infos sendMessage:", err));
}