import { downloadMediaMessage, getContentType } from "@whiskeysockets/baileys";

export const name = "save";

export async function execute(sock, m, args) {
  try {
    const selfJid = sock.user.id;

    // Récupération du message cité ou reçu
    let msg =
      m.message?.extendedTextMessage?.contextInfo?.quotedMessage || m.message;

    if (!msg) {
      await sock.sendMessage(
        m.key.remoteJid,
        { text: "📌 Réponds à un média ou texte avec `.save`" },
        { quoted: m }
      );
      return;
    }

    // 🔎 Déroule toutes les couches jusqu’au vrai contenu
    while (
      msg.ephemeralMessage ||
      msg.viewOnceMessage ||
      msg.viewOnceMessageV2 ||
      msg.documentWithCaptionMessage
    ) {
      msg =
        msg.ephemeralMessage?.message ||
        msg.viewOnceMessage?.message ||
        msg.viewOnceMessageV2?.message ||
        msg.documentWithCaptionMessage?.message;
    }

    const type = getContentType(msg);

    // === Sauvegarde texte ===
    if (type === "conversation" || type === "extendedTextMessage") {
      const text =
        msg.conversation || msg.extendedTextMessage?.text || "⚡ Message vide";
      await sock.sendMessage(selfJid, { text: `💾 Sauvegarde:\n\n${text}` });
      await sock.sendMessage(
        m.key.remoteJid,
        { text: "✅ Texte sauvegardé" },
        { quoted: m }
      );
      return;
    }

    // === Sauvegarde média ===
    const buffer = await downloadMediaMessage(
      { message: msg },
      "buffer",
      {},
      { logger: console }
    );

    let fileName = Date.now().toString();
    let sendContent = {};

    switch (type) {
      case "imageMessage":
        fileName += ".jpg";
        sendContent = { image: buffer, caption: "💾 Sauvegarde image" };
        break;
      case "videoMessage":
        fileName += ".mp4";
        sendContent = { video: buffer, caption: "💾 Sauvegarde vidéo" };
        break;
      case "audioMessage":
        fileName += ".mp3";
        sendContent = { audio: buffer, mimetype: "audio/mpeg", fileName };
        break;
      case "documentMessage":
        fileName = msg.documentMessage.fileName || fileName + ".doc";
        sendContent = { document: buffer, fileName };
        break;
      case "stickerMessage":
        fileName += ".webp";
        sendContent = { sticker: buffer };
        break;
      default:
        await sock.sendMessage(
          m.key.remoteJid,
          { text: "❌ Type non supporté : " + type },
          { quoted: m }
        );
        return;
    }

    // ✅ Envoi en privé
    await sock.sendMessage(selfJid, sendContent);
    await sock.sendMessage(
      m.key.remoteJid,
      { text: "✅ Média sauvegardé" },
      { quoted: m }
    );
  } catch (e) {
    await sock.sendMessage(
      m.key.remoteJid,
      { text: "❌ Erreur save : " + e.message },
      { quoted: m }
    );
  }
}