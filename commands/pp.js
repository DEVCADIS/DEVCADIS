// commands/pp.js
export const name = "pp";
export const aliases = ["profile", "avatar"];

export async function execute(sock, msg, args) {
  try {
    // Déterminer la cible
    const target =
      msg.quoted?.key?.participant || // si réponse à un msg
      msg.mentionedJid?.[0] ||       // si mention
      (args[0] ? args[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net" : null) || // si numéro donné
      msg.key.participant ||         // sinon l’expéditeur
      msg.key.remoteJid;

    // Récupérer pp
    let ppUrl;
    try {
      ppUrl = await sock.profilePictureUrl(target, "image");
    } catch {
      ppUrl = "https://files.catbox.moe/2yz2qu.jpg"; // image par défaut si pas de PP
    }

    const user = target.split("@")[0];

    await sock.sendMessage(
      msg.key.remoteJid,
      {
        image: { url: ppUrl },
        caption: `🖼️ *Photo de profil*\n👤 Utilisateur : ${user}`,
      },
      { quoted: msg }
    );
  } catch (e) {
    await sock.sendMessage(
      msg.key.remoteJid,
      { text: "❌ Erreur pp : " + e.message },
      { quoted: msg }
    );
  }
}