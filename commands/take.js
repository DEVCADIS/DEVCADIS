import { Sticker, StickerTypes } from "wa-sticker-formatter";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";

export const name = "take";
export async function execute(sock, m, args) {
  try {
    const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage;
    if (!quoted) {
      await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Réponds à un sticker pour le modifier." }, { quoted: m });
      return;
    }

    // Téléchargement du sticker
    const stream = await downloadContentFromMessage(quoted, "sticker");
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }

    // Re-création du sticker avec ton pseudo
    const sticker = new Sticker(buffer, {
      pack: "Sticker By",
      author: m.pushName || "RENEGADES_MD",
      type: StickerTypes.FULL,
      quality: 70,
    });

    await sock.sendMessage(m.key.remoteJid, { sticker: await sticker.build() }, { quoted: m });

  } catch (e) {
    await sock.sendMessage(m.key.remoteJid, { text: "❌ Erreur take : " + e.message }, { quoted: m });
  }
}