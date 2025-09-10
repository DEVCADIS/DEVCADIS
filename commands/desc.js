// commands/desc.js
export const name = "desc";
export const aliases = ["description", "gdesc"];

export async function execute(sock, msg, args) {
  try {
    const jid = msg.key.remoteJid;

    if (!jid.endsWith("@g.us")) {
      await sock.sendMessage(
        jid,
        { text: "❌ Cette commande doit être utilisée dans un groupe." },
        { quoted: msg }
      );
      return;
    }

    const metadata = await sock.groupMetadata(jid);
    const desc = metadata.desc || "📭 Aucune description définie pour ce groupe.";

    const text = `
📌 *Description du groupe*  
👥 Nom : ${metadata.subject}  
📝 Description :  

${desc}
    `.trim();

    await sock.sendMessage(jid, { text }, { quoted: msg });

  } catch (e) {
    await sock.sendMessage(
      msg.key.remoteJid,
      { text: "❌ Erreur desc : " + e.message },
      { quoted: msg }
    );
  }
}