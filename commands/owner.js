export const name = "owner";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;

  const text = `
╭─────────────❖─────────────╮
       👑 𝗣𝗥𝗢𝗣𝗥𝗜𝗘́𝗧𝗔𝗜𝗥𝗘 👑
╰─────────────❖─────────────╯

✨ *Nom*       : 𝘋𝘌𝘝-𝘙𝘈𝘐𝘡𝘌𝘓
📞 *WhatsApp* : wa.me/237699777530
🌍 *Réseaux*  : t.me/devraizel

╭─────────────❖─────────────╮
      🚀 “Les autres rêvent d’inventer,
         moi j’invente des rêves.” 🚀
╰─────────────❖─────────────╯
  `;

  await sock.sendMessage(from, { text }, { quoted: msg });
}