export const name = "promote";

export async function execute(sock, msg, args) {
  try {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;

    if (!mentioned || mentioned.length === 0) {
      return await sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Mentionne la personne à promouvoir." }, { quoted: msg });
    }

    await sock.groupParticipantsUpdate(msg.key.remoteJid, mentioned, "promote");
    await sock.sendMessage(msg.key.remoteJid, { text: `✅ ${mentioned[0]} est maintenant admin.` });

  } catch (err) {
    console.error("❌ Erreur promote :", err);
  }
}