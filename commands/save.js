import fs from "fs";
import path from "path";
import { downloadMediaMessage } from "@whiskeysockets/baileys";

export const name = "save";
export async function execute(sock, m, args) {
  try {
    const selfJid = sock.user.id; // ton propre JID
    const msg = m.message?.extendedTextMessage
      ? m.message?.extendedTextMessage?.contextInfo?.quotedMessage
      : m.message;

    if (!msg) {
      await sock.sendMessage(m.key.remoteJid, { text: "📌 Réponds à un média ou texte avec `.save`" }, { quoted: m });
      return;
    }

    const type = Object.keys(msg)[0];

    // === Texte ===
    if (type === "conversation" || type === "extendedTextMessage") {
      const text =
        msg.conversation || msg.extendedTextMessage?.text || "⚡ Message vide";
      await sock.sendMessage(selfJid, { text: `💾 Sauvegarde:\n\n${text}` });
      await sock.sendMessage(m.key.remoteJid, { text: "✅ Texte sauvegardé" }, { quoted: m });
      return;
    }

    // === Médias ===
    const buffer = await downloadMediaMessage(
      { message: msg },
      "buffer",
      {},
      { logger: console }
    );

    let fileName = Date.now().toString();
    let sendContent = {};

    if (type === "imageMessage") {
      fileName += ".jpg";
      sendContent = { image: buffer, caption: "💾 Sauvegarde image" };
    } else if (type === "videoMessage") {
      fileName += ".mp4";
      sendContent = { video: buffer, caption: "💾 Sauvegarde vidéo" };
    } else if (type === "audioMessage") {
      fileName += ".mp3";
      sendContent = { audio: buffer, mimetype: "audio/mpeg", fileName };
    } else if (type === "documentMessage") {
      const ext = msg.documentMessage.fileName || "doc";
      fileName += `_${ext}`;
      sendContent = { document: buffer, fileName };
    } else if (type === "stickerMessage") {
      fileName += ".webp";
      sendContent = { sticker: buffer };
    } else {
      await sock.sendMessage(m.key.remoteJid, { text: "❌ Type non supporté." }, { quoted: m });
      return;
    }

    // Envoi dans ton privé
    await sock.sendMessage(selfJid, sendContent);
    await sock.sendMessage(m.key.remoteJid, { text: "✅ Média sauvegardé" }, { quoted: m });
  } catch (e) {
    await sock.sendMessage(m.key.remoteJid, { text: "❌ Erreur save : " + e.message }, { quoted: m });
  }
}