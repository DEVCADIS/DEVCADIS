export const name = "demote";

export async function execute(sock, msg, args) {
  try {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;

    if (!mentioned || mentioned.length === 0) {
      return await sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Mentionne la personne à rétrograder." }, { quoted: msg });
    }

    await sock.groupParticipantsUpdate(msg.key.remoteJid, mentioned, "demote");
    await sock.sendMessage(msg.key.remoteJid, { text: `✅ ${mentioned[0]} n’est plus admin.` });

  } catch (err) {
    console.error("❌ Erreur demote :", err);
  }
}