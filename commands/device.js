import pkg from "@whiskeysockets/baileys";
const { getDevice } = pkg;

export const name = "device";

export async function execute(sock, m, args) {
  try {
    const stanzaId = m.message?.extendedTextMessage?.contextInfo?.stanzaId;
    if (!stanzaId) {
      await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Réponds à un message pour détecter l’appareil." }, { quoted: m });
      return;
    }

    const device = getDevice(stanzaId);

    await sock.sendMessage(m.key.remoteJid, { text: `_L’utilisateur utilise un ${device}_` }, { quoted: m });
  } catch (error) {
    await sock.sendMessage(m.key.remoteJid, { text: "❌ Erreur device : " + error.message }, { quoted: m });
  }
}