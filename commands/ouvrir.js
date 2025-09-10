export const name = "ouvrir";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;

  // Vérifier si c'est un groupe
  if (!from.endsWith("@g.us")) {
    await sock.sendMessage(from, { text: "❌ Cette commande ne peut être utilisée que dans un groupe." }, { quoted: msg });
    return;
  }

  try {
    // Mettre le groupe en mode normal (tous les membres peuvent envoyer des messages)
    await sock.groupSettingUpdate(from, "not_announcement"); // "not_announcement" = tous les membres peuvent envoyer des messages
    await sock.sendMessage(from, { text: "🔓 Le groupe est désormais **ouvert**. Tous les membres peuvent envoyer des messages." }, { quoted: msg });
  } catch (err) {
    console.error("Erreur lors de l'ouverture du groupe :", err);
    await sock.sendMessage(from, { text: "❌ Impossible d'ouvrir le groupe. Assurez-vous que je suis admin." }, { quoted: msg });
  }
}