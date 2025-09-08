export const name = "leave";

export async function execute(sock, msg, args) {
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: "👋 Je quitte le groupe, à bientôt." });
    await sock.groupLeave(msg.key.remoteJid);
  } catch (err) {
    console.error("❌ Erreur leave :", err);
  }
}