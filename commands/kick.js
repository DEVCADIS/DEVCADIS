export const name = "kick";

export async function execute(sock, msg, args) {
  try {
    const groupMetadata = await sock.groupMetadata(msg.key.remoteJid);
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;

    if (!mentioned || mentioned.length === 0) {
      return await sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Mentionne la personne à expulser." }, { quoted: msg });
    }

    await sock.groupParticipantsUpdate(msg.key.remoteJid, mentioned, "remove");
    await sock.sendMessage(msg.key.remoteJid, { text: `👋 Expulsé avec succès.` });

  } catch (err) {
    console.error("❌ Erreur kick :", err);
  }
}