export const name = "tag";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;

  // Vérifie si c'est un groupe
  if (!msg.key.remoteJid.endsWith("@g.us")) {
    return await sock.sendMessage(from, { text: "❌ *Commande réservée aux groupes seulement.*" }, { quoted: msg });
  }

  // Vérifie si un message a été fourni
  if (!args.length) {
    return await sock.sendMessage(from, { text: "⚠️ *Veuillez fournir un message à envoyer.*" }, { quoted: msg });
  }

  try {
    const groupMetadata = await sock.groupMetadata(from);
    const participants = groupMetadata.participants;

    const message = args.join(" ");

    await sock.sendMessage(
      from,
      {
        text: message,
        mentions: participants.map(p => p.id)
      },
      { quoted: msg }
    );

  } catch (e) {
    console.error("❌ Erreur commande tag :", e);
    await sock.sendMessage(from, { text: "⚠️ Erreur lors de l'envoi du tag." }, { quoted: msg });
  }
}