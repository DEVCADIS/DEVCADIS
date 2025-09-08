export const name = "promoteall";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;

  if (!from.endsWith("@g.us")) {
    return await sock.sendMessage(from, { text: "🚫 *Commande réservée aux groupes seulement.*" }, { quoted: msg });
  }

  try {
    const groupMetadata = await sock.groupMetadata(from);
    const participants = groupMetadata.participants || [];

    const toPromote = participants
      .filter(p => !p.admin) // seulement ceux qui ne sont pas encore admins
      .map(p => p.id);

    if (toPromote.length === 0) {
      return await sock.sendMessage(from, { text: "✅ *Tous les membres sont déjà administrateurs.*" }, { quoted: msg });
    }

    await sock.groupParticipantsUpdate(from, toPromote, "promote");

    await sock.sendMessage(from, { text: `🔼 *${toPromote.length} membre(s) promu(s) admin.*` }, { quoted: msg });
  } catch (err) {
    console.error("❌ Erreur promoteall :", err);
    await sock.sendMessage(from, { text: "❌ *Erreur lors du promoteall.* Vérifie mes permissions ou réessaye." }, { quoted: msg });
  }
}