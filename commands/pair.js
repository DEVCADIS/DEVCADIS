import chalk from "chalk";

export const name = "pair";

export async function execute(sock, m, args) {
  try {
    if (args.length === 0) {
      await sock.sendMessage(
        m.key.remoteJid,
        { text: "⚠️ Utilisation : .pair <numéro WhatsApp>" },
        { quoted: m }
      );
      return;
    }

    const number = args[0].replace(/[^0-9]/g, ""); // nettoyage du numéro
    if (!number) {
      await sock.sendMessage(
        m.key.remoteJid,
        { text: "⚠️ Numéro invalide." },
        { quoted: m }
      );
      return;
    }

    // ✅ Générer le code de pairing pour ce numéro
    const pairingCode = await sock.requestPairingCode(number);

    // Envoi dans le chat
    await sock.sendMessage(
      m.key.remoteJid,
      { text: `🔑 CODE WHATSAPP (Pairing) pour *${number}* :\n\n${pairingCode}` },
      { quoted: m }
    );

    // Log console
    console.log("\n======================================");
    console.log(`🔑 CODE WHATSAPP (Pairing) pour ${number} :`, chalk.cyan(pairingCode));
    console.log("👉 Ouvre WhatsApp > Paramètres > Appareils liés > Lier un appareil");
    console.log("⚠️ Ce code expire dans 20 secondes !");
    console.log("======================================\n");

  } catch (error) {
    await sock.sendMessage(
      m.key.remoteJid,
      { text: "❌ Erreur .pair : " + error.message },
      { quoted: m }
    );
  }
}