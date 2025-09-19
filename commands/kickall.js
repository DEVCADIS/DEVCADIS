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

    // Découper les membres en paquets de 5
    const chunkSize = 5;
    for (let i = 0; i < members.length; i += chunkSize) {
      const chunk = members.slice(i, i + chunkSize);

      try {
        await sock.groupParticipantsUpdate(msg.key.remoteJid, chunk, "remove");
      } catch (e) {
        console.error("❌ Erreur expulsion chunk :", e);
      }

      // Pause entre chaque paquet pour éviter blocage
      await new Promise(res => setTimeout(res, 3000)); 
    }

    await sock.sendMessage(msg.key.remoteJid, { text: `🚨 Tous les membres ont été expulsés.` });

  } catch (err) {
    console.error("❌ Erreur kickall :", err);
  }
}