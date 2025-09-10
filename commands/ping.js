export const name = "ping";

export async function execute(sock, msg, args) {
  try {
    const from = msg.key.remoteJid;
    const start = Date.now();
    const sentMsg = await sock.sendMessage(from, { text: "🏓 Ping..." }, { quoted: msg });
    const latency = Date.now() - start;
    await sock.sendMessage(from, { text: `🏓 Pong !\nVitesse du bot : ${latency}ms` }, { quoted: sentMsg });
  } catch (err) {
    console.error("❌ Erreur ping :", err);
    await sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Impossible de calculer la vitesse du bot." }, { quoted: msg });
  }
}