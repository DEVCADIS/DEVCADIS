export const name = "pair";

export async function execute(sock, m) {
  try {
    const number = process.env.NUMBER?.replace(/[^0-9]/g, "");
    if (!number) {
      await sock.sendMessage(
        m.key.remoteJid,
        { text: "❌ Aucun numéro configuré dans .env (NUMBER)." },
        { quoted: m }
      );
      return;
    }

    // ⚡ Générer le code pairing pour ton numéro unique (env)
    const pairingCode = await sock.requestPairingCode(number);

    // 📌 Envoi du code uniquement
    await sock.sendMessage(
      m.key.remoteJid,
      { text: pairingCode }, // uniquement le code brut
      { quoted: m }
    );

    // Log console pour debug
    console.log(`🔑 Pairing code pour ${number} → ${pairingCode}`);

  } catch (error) {
    await sock.sendMessage(
      m.key.remoteJid,
      { text: "❌ Erreur .pair : " + error.message },
      { quoted: m }
    );
  }
}