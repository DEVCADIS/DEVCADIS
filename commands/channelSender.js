import fs from "fs";
import path from "path";

/**
 * Envoie un message stylisé avec miniature + preview externe
 * @param {object} message - Le message d'origine (pour récupérer le remoteJid)
 * @param {object} client - L'instance Baileys (sock)
 * @param {string} texts - Le texte à afficher comme légende
 * @param {number} num - Le numéro du fichier PNG utilisé (ex: 1.png)
 */
async function channelSender(message, client, texts, num) {
  const remoteJid = message.key.remoteJid;

  const imagePath = path.resolve(`${num}.png`);

  let thumbBuffer;
  try {
    thumbBuffer = fs.readFileSync(imagePath); // ✅ lit le PNG local
  } catch (err) {
    console.error("❌ Thumbnail not found:", err.message);
    thumbBuffer = null; // fallback pour éviter crash
  }

  await client.sendMessage(remoteJid, {
    image: { url: imagePath }, // ✅ si le fichier existe
    caption: `> ${texts}`,
    contextInfo: {
      externalAdReply: {
        title: "Join Our WhatsApp Channel",
        body: "DEV RAIZEL", // ✅ ton body personnalisé
        mediaType: 1,
        thumbnail: thumbBuffer, // ✅ Buffer obligatoire
        renderLargerThumbnail: false,
        mediaUrl: "https://whatsapp.com/channel/0029Vb6DOLCCxoAvIfxngr3P", // ✅ lien corrigé
        sourceUrl: "https://whatsapp.com/channel/0029Vb6DOLCCxoAvIfxngr3P", // ✅ idem
        thumbnailUrl: "https://whatsapp.com/channel/0029Vb6DOLCCxoAvIfxngr3P", // ✅ idem
      },
    },
  });
}

export default channelSender;