import { Sticker, StickerTypes } from "wa-sticker-formatter";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";

export const name = "sticker";
export async function execute(sock, m, args) {
  try {
    let quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    let msg = quoted || m.message;

    // Détecte si c’est une image ou une vidéo
    let type = msg.imageMessage ? "imageMessage" : msg.videoMessage ? "videoMessage" : null;

    if (!type) {
      await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Réponds ou envoie une image/vidéo pour créer un sticker." }, { quoted: m });
      return;
    }

    // Téléchargement du média
    const stream = await downloadContentFromMessage(msg[type], type.replace("Message", ""));
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }

    // Création du sticker
    const sticker = new Sticker(buffer, {
      pack: "RENEGADES_MD",
      author: m.pushName || "Bot",
      type: StickerTypes.FULL,
      quality: 70,
    });

    await sock.sendMessage(m.key.remoteJid, { sticker: await sticker.build() }, { quoted: m });

  } catch (e) {
    await sock.sendMessage(m.key.remoteJid, { text: "❌ Erreur création sticker : " + e.message }, { quoted: m });
  }
}