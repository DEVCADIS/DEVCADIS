export const name = "kickadmin";

export async function execute(sock, msg, args) {
  try {
    const from = msg.key.remoteJid;
    if (!from.endsWith("@g.us")) {
      await sock.sendMessage(from, { text: "❌ Cette commande doit être utilisée dans un groupe." }, { quoted: msg });
      return;
    }

    // Vérifie que l'expéditeur est bien admin
    const metadata = await sock.groupMetadata(from);
    const sender = msg.key.participant;
    const isAdmin = metadata.participants.find(p => p.id === sender && (p.admin === "admin" || p.admin === "superadmin"));

    if (!isAdmin) {
      await sock.sendMessage(from, { text: "❌ Seuls les admins peuvent utiliser cette commande." }, { quoted: msg });
      return;
    }

    // Si pas de cible mentionnée
    if (!msg.message.extendedTextMessage || !msg.message.extendedTextMessage.contextInfo?.mentionedJid?.length) {
      await sock.sendMessage(from, { text: "❌ Mentionnez l'admin que vous voulez expulser." }, { quoted: msg });
      return;
    }

    const target = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];

    // Vérifie que la cible est admin
    const targetInfo = metadata.participants.find(p => p.id === target);
    if (!targetInfo || !(targetInfo.admin === "admin" || targetInfo.admin === "superadmin")) {
      await sock.sendMessage(from, { text: "❌ La personne mentionnée n'est pas admin." }, { quoted: msg });
      return;
    }

    // Expulser l'admin
    await sock.groupParticipantsUpdate(from, [target], "remove");
    await sock.sendMessage(from, { text: `✅ Admin @${target.split("@")[0]} expulsé du groupe.` }, { quoted: msg, mentions: [target] });

  } catch (err) {
    console.error("Erreur kickadmin :", err);
    await sock.sendMessage(msg.key.remoteJid, { text: "❌ Erreur lors de l'exécution de la commande." }, { quoted: msg });
  }
}