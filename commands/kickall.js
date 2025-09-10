export const name = "kickall";

export async function execute(sock, msg, args) {
  try {
    const groupMetadata = await sock.groupMetadata(msg.key.remoteJid);
    const participants = groupMetadata.participants;

    const admins = participants.filter(p => p.admin).map(p => p.id);
    const members = participants.map(p => p.id).filter(id => !admins.includes(id));

    if (members.length === 0) {
      return await sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Aucun membre à expulser (hors admins)." });
    }

    for (const m of members) {
      await sock.groupParticipantsUpdate(msg.key.remoteJid, [m], "remove");
    }

    await sock.sendMessage(msg.key.remoteJid, { text: `🚨 Tous les membres ont été expulsés.` });

  } catch (err) {
    console.error("❌ Erreur kickall :", err);
  }
}