export const name = "demoteall";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;

  if (!from.endsWith("@g.us")) {
    return await sock.sendMessage(from, { text: "🚫 *Commande réservée aux groupes seulement.*" }, { quoted: msg });
  }

  try {
    const groupMetadata = await sock.groupMetadata(from);
    const participants = groupMetadata.participants || [];

    const botJid = (sock?.user?.id || sock?.user?.jid || "").split?.(":")?.[0] || "";

    const toDemote = participants
      .filter(p => p.admin && p.id !== botJid) // enlève le bot de la liste
      .map(p => p.id);

    if (toDemote.length === 0) {
      return await sock.sendMessage(from, { text: "✅ *Aucun admin à rétrograder.*" }, { quoted: msg });
    }

    await sock.groupParticipantsUpdate(from, toDemote, "demote");

    await sock.sendMessage(from, { text: `🔽 *${toDemote.length} admin(s) rétrogradé(s).*` }, { quoted: msg });
  } catch (err) {
    console.error("❌ Erreur demoteall :", err);
    await sock.sendMessage(from, { text: "❌ *Erreur lors du demoteall.* Vérifie mes permissions ou réessaye." }, { quoted: msg });
  }
}