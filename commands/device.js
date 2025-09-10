export const name = "device";

export async function execute(sock, m, args) {
  try {
    // Récupère l’ID du message
    const stanzaId =
      m.message?.extendedTextMessage?.contextInfo?.stanzaId ||
      m.key.id;

    if (!stanzaId) {
      await sock.sendMessage(
        m.key.remoteJid,
        { text: "⚠️ Réponds à un message pour détecter l’appareil." },
        { quoted: m }
      );
      return;
    }

    let device = "Inconnu";

    // === Détection par motif connu ===
    if (stanzaId.includes("BAE5")) device = "Android 📱";
    else if (stanzaId.includes("3EB0")) device = "iPhone 🍏";
    else if (stanzaId.length < 20) device = "WhatsApp Web 💻";
    else if (stanzaId.match(/[A-F0-9]{32}/)) device = "Desktop 🖥️";
    else device = "Autre appareil";

    await sock.sendMessage(
      m.key.remoteJid,
      { text: `_L’utilisateur utilise un ${device}_` },
      { quoted: m }
    );
  } catch (error) {
    await sock.sendMessage(
      m.key.remoteJid,
      { text: "❌ Erreur device : " + error.message },
      { quoted: m }
    );
  }
}