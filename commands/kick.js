export const name = "kick";

export async function execute(sock, msg, args) {
  try {
    const groupMetadata = await sock.groupMetadata(msg.key.remoteJid);

    // Récupère les mentions
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

    // Récupère l'auteur du message auquel on répond
    const quotedUser = msg.message?.extendedTextMessage?.contextInfo?.participant;

    // Combine les deux sources
    let targets = [...mentioned];
    if (quotedUser && !targets.includes(quotedUser)) {
      targets.push(quotedUser);
    }

    if (targets.length === 0) {
      return await sock.sendMessage(
        msg.key.remoteJid,
        { text: "⚠️ Mentionne ou répond au message de la personne à expulser." },
        { quoted: msg }
      );
    }

    // Expulsion
    await sock.groupParticipantsUpdate(msg.key.remoteJid, targets, "remove");
    await sock.sendMessage(msg.key.remoteJid, { text: `👋 Expulsé avec succès.` });

  } catch (err) {
    console.error("❌ Erreur kick :", err);
  }
}