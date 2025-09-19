export const name = "delpair";

export async function execute(sock, m) {
  try {
    // Comme WhatsApp invalide automatiquement le code après 20s,
    // on envoie juste un message de confirmation.
    await sock.sendMessage(
      m.key.remoteJid,
      { text: "❌ Code pairing annulé / expiré." },
      { quoted: m }
    );

    console.log("🗑️ delpair exécuté → code pairing annulé (si actif).");

  } catch (error) {
    await sock.sendMessage(
      m.key.remoteJid,
      { text: "⚠️ Erreur delpair : " + error.message },
      { quoted: m }
    );
  }
}