export const name = "link";

export async function execute(sock, msg, args) {
  try {
    const from = msg.key.remoteJid;

    // Vérifie que c'est bien un groupe
    if (!from.endsWith("@g.us")) {
      return await sock.sendMessage(from, { text: "⚠️ Cette commande ne peut être utilisée que dans un groupe." }, { quoted: msg });
    }

    // Récupère le lien d'invitation
    const groupInviteCode = await sock.groupInviteCode(from);
    const inviteLink = `https://chat.whatsapp.com/${groupInviteCode}`;

    await sock.sendMessage(from, { text: `🔗 Lien d'invitation du groupe :\n${inviteLink}` }, { quoted: msg });

  } catch (err) {
    console.error("❌ Erreur link :", err);
    await sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Impossible de récupérer le lien du groupe." }, { quoted: msg });
  }
}