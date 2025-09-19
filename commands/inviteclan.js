export const name = "inviteclan";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;

  const imageUrl = "https://files.catbox.moe/jvwq8s.jpeg";
  const chatLink = "https://chat.whatsapp.com/KG9UJ8inC7r6QPOv0QB7iL?mode=ems_copy_t";

  const caption = `
╔════════════════════╗
       🌟 INVITE CLAN 🌟
╚════════════════════╝

📌 Rejoignez ꧁☬❖『☨ 𝑇𝐻𝐸 𝑅𝐸𝑁𝐸𝐺𝐴𝐷𝐸𝑆 𝐶𝐿𝐴𝑁 ☨』❖☬꧂  :
${chatLink}

`;

  try {
    await sock.sendMessage(from, {
      image: { url: imageUrl },
      caption: caption
    }, { quoted: msg });

  } catch (error) {
    console.error("❌ Erreur inviteclan :", error);
    await sock.sendMessage(from, { text: "❌ Impossible d'envoyer l'invitation." }, { quoted: msg });
  }
}