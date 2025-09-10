import path from "path";
import {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  Browsers
} from "@whiskeysockets/baileys";

export const name = "connect";

export async function execute(sock, m, args) {
  try {
    if (args.length === 0) {
      await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Usage: .connect <numéro international>" }, { quoted: m });
      return;
    }

    const number = String(args[0]).replace(/[^0-9]/g, ""); // garde uniquement les chiffres
    if (!number) {
      await sock.sendMessage(m.key.remoteJid, { text: "❌ Numéro invalide." }, { quoted: m });
      return;
    }

    const sessionPath = path.join(process.env.DOSSIER_AUTH || "auth_baileys", number);
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version } = await fetchLatestBaileysVersion();

    const newSock = makeWASocket({
      version,
      logger: sock.logger,
      printQRInTerminal: false,
      browser: Browsers.macOS("Google Chrome"),
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, sock.logger)
      }
    });

    newSock.ev.on("creds.update", saveCreds);

    await new Promise(r => setTimeout(r, 500));

    // ✅ Ici on donne juste le numéro brut
    const code = await newSock.requestPairingCode(number);

    await sock.sendMessage(m.key.remoteJid, { text: code.trim() }, { quoted: m });

  } catch (error) {
    await sock.sendMessage(m.key.remoteJid, { text: "❌ Erreur connect : " + error.message }, { quoted: m });
  }
}