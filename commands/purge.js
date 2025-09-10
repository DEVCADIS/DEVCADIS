export const name = "purge";

export async function execute(sock, msg, args, options = {}) {
  const from = msg?.key?.remoteJid;

  // Vérifie si c'est un groupe
  if (!from || !from.endsWith("@g.us")) {
    await sock.sendMessage(from || msg.key.remoteJid, { text: "🚫 *Commande réservée aux groupes seulement.*" }, { quoted: msg });
    return;
  }

  try {
    const groupData = await sock.groupMetadata(from);
    const participants = groupData.participants || [];

    // JID du bot (pour ne pas se supprimer lui-même)
    const botJid = (sock?.user?.id || sock?.user?.jid || "").split?.(":")?.[0] || "";

    // Liste de tous les membres sauf le bot
    const toKick = participants
      .map(p => p.id)
      .filter(id => id !== botJid);

    if (toKick.length === 0) {
      await sock.sendMessage(from, { text: "✅ *Aucun membre à expulser.*" }, { quoted: msg });
      return;
    }

    // Expulsion massive
    await sock.groupParticipantsUpdate(from, toKick, "remove");

    await sock.sendMessage(from, { text: `🚨 *Purge exécutée : ${toKick.length} membre(s) expulsé(s).*` }, { quoted: msg });
  } catch (err) {
    console.error("❌ Erreur purge :", err);
    await sock.sendMessage(from, { text: "❌ *Erreur lors de la purge.* Vérifie mes permissions ou réessaye." }, { quoted: msg });
  }
}