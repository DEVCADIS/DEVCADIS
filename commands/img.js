import axios from "axios";

export const name = "img";
export async function execute(sock, m, args) {
  try {
    if (!args.length) {
      await sock.sendMessage(
        m.key.remoteJid,
        { text: "⚠️ Exemple: .img goku" },
        { quoted: m }
      );
      return;
    }

    const query = args.join(" ");
    const url = `https://picsum.photos/seed/${encodeURIComponent(query)}/600/400`;

    // Récupérer l’image
    const res = await axios.get(url, { responseType: "arraybuffer" });
    const buffer = Buffer.from(res.data);

    // Envoyer l’image
    await sock.sendMessage(
      m.key.remoteJid,
      {
        image: buffer,
        caption: `🖼️ Image générée pour : *${query}*`,
      },
      { quoted: m }
    );
  } catch (e) {
    await sock.sendMessage(
      m.key.remoteJid,
      { text: "❌ Erreur génération image : " + e.message },
      { quoted: m }
    );
  }
}