export const name = "demote";

export async function execute(sock, msg, args) {
  try {
    // Récupère les mentions
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

    // Récupère l’auteur du message auquel on répond
    const quotedUser = msg.message?.extendedTextMessage?.contextInfo?.participant;

    // Combine les deux
    let targets = [...mentioned];
    if (quotedUser && !targets.includes(quotedUser)) {
      targets.push(quotedUser);
    }

    if (targets.length === 0) {
      return await sock.sendMessage(
        msg.key.remoteJid,
        { text: "⚠️ Mentionne ou répond au message de la personne à rétrograder." },
        { quoted: msg }
      );
    }

    // Rétrogradation
    await sock.groupParticipantsUpdate(msg.key.remoteJid, targets, "demote");
    await sock.sendMessage(
      msg.key.remoteJid,
      { 
        text: `✅ ${targets.map(t => `@${t.split("@")[0]}`).join(", ")} n’est plus admin.` , 
        mentions: targets 
      }
    );

  } catch (err) {
    console.error("❌ Erreur demote :", err);
  }
}