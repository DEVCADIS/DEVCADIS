// commands/device.js
export const name = "device";
export const aliases = ["dev", "system", "os"];

export async function execute(sock, msg, args) {
  try {
    const target =
      msg.quoted?.key?.participant || // si on répond à un message
      msg.mentionedJid?.[0] ||       // si on mentionne quelqu’un
      msg.key.participant ||         // sinon l’expéditeur
      msg.key.remoteJid;

    const user = target?.split("@")[0] || "Utilisateur";
    const deviceType = msg.key.device || "Inconnu";

    let system;
    switch (deviceType) {
      case "android":
        system = "🤖 Android";
        break;
      case "ios":
        system = "🍏 iOS";
        break;
      case "web":
        system = "💻 WhatsApp Web";
        break;
      case "desktop":
        system = "🖥️ WhatsApp Desktop";
        break;
      default:
        system = `❓ ${deviceType}`;
        break;
    }

    await sock.sendMessage(
      msg.key.remoteJid,
      {
        text: `📱 *Informations sur l’appareil* 📱\n\n👤 Utilisateur : ${user}\n🖥️ Système : ${system}`,
      },
      { quoted: msg }
    );
  } catch (e) {
    await sock.sendMessage(
      msg.key.remoteJid,
      { text: "❌ Erreur device : " + e.message },
      { quoted: msg }
    );
  }
}