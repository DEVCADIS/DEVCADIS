// commands/gpp.js
export const name = "gpp";
export const aliases = ["grouppp", "groupicon", "groupavatar"];

export async function execute(sock, msg, args) {
  try {
    const jid = msg.key.remoteJid;

    if (!jid.endsWith("@g.us")) {
      await sock.sendMessage(
        jid,
        { text: "❌ Cette commande doit être utilisée dans un groupe." },
        { quoted: msg }
      );
      return;
    }

    // Récupérer photo de profil du groupe
    let ppUrl;
    try {
      ppUrl = await sock.profilePictureUrl(jid, "image");
    } catch {
      ppUrl = "https://files.catbox.moe/2yz2qu.jpg"; // image par défaut si pas de pp
    }

    const metadata = await sock.groupMetadata(jid);

    await sock.sendMessage(
      jid,
      {
        image: { url: ppUrl },
        caption: `🖼️ *Photo de profil du groupe*\n👥 Nom : ${metadata.subject}`,
      },
      { quoted: msg }
    );
  } catch (e) {
    await sock.sendMessage(
      msg.key.remoteJid,
      { text: "❌ Erreur gpp : " + e.message },
      { quoted: msg }
    );
  }
}