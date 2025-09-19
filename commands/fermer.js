export const name = "fermer";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;

  // Vérifier si c'est un groupe
  if (!from.endsWith("@g.us")) {
    await sock.sendMessage(from, { text: "❌ Cette commande ne peut être utilisée que dans un groupe." }, { quoted: msg });
    return;
  }

  try {
    // Mettre le groupe en mode admin uniquement (fermé)
    await sock.groupSettingUpdate(from, "announcement"); // "announcement" = seuls les admins peuvent envoyer des messages
    await sock.sendMessage(from, { text: "🔒 Le groupe est désormais **fermé**. Seuls les admins peuvent envoyer des messages." }, { quoted: msg });
  } catch (err) {
    console.error("Erreur lors de la fermeture du groupe :", err);
    await sock.sendMessage(from, { text: "❌ Impossible de fermer le groupe. Assurez-vous que je suis admin." }, { quoted: msg });
  }
}