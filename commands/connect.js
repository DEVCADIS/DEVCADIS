import path from "path";
import { makeWASocket, useMultiFileAuthState } from "@whiskeysockets/baileys";

export const name = "connect";

export async function execute(sock, m, args) {
  try {
    if (args.length === 0) {
      await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Utilisation: .connect <numéro WhatsApp>" }, { quoted: m });
      return;
    }

    const number = args[0];
    const sessionPath = path.join(process.env.DOSSIER_AUTH || "auth_baileys", number);

    await sock.sendMessage(m.key.remoteJid, { text: `🔗 Initialisation de la session pour ${number}...` }, { quoted: m });

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

    const newSock = makeWASocket({
      auth: state,
      printQRInTerminal: process.env.USE_QR === "true",
      logger: sock.logger,
    });

    newSock.ev.on("creds.update", saveCreds);

    await sock.sendMessage(m.key.remoteJid, { text: `✅ Session connectée pour ${number}` }, { quoted: m });

  } catch (error) {
    await sock.sendMessage(m.key.remoteJid, { text: "❌ Erreur connect : " + error.message }, { quoted: m });
  }
}