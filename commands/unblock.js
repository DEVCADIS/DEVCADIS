export const name = "unblock";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;

  // Vérifie si un message est cité
  const quoted = msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] 
                 || msg.message.extendedTextMessage?.contextInfo?.quotedMessage?.key?.participant;

  if (!quoted) {
    return await sock.sendMessage(from, { text: "❌ Veuillez taguer ou répondre au message de la personne à débloquer." }, { quoted: msg });
  }

  try {
    await sock.updateBlockStatus(quoted, "unblock");
    await sock.sendMessage(from, { text: `✅ La personne a été débloquée.` }, { quoted: msg });
  } catch (error) {
    console.error("❌ Erreur unblock :", error);
    await sock.sendMessage(from, { text: "❌ Impossible de débloquer la personne." }, { quoted: msg });
  }
}