export const name = "tagall";

export async function execute(sock, msg, args) {
  try {
    const groupMetadata = await sock.groupMetadata(msg.key.remoteJid);
    const participants = groupMetadata.participants;

    const mentions = participants.map(p => p.id);
    const text = participants.map(p => `@${p.id.split("@")[0]}`).join("\n");

    const signature = "✨ 𝑷𝒂𝒔 𝒃𝒆𝒔𝒐𝒊𝒏 𝒅𝒆 𝒍𝒊𝒌𝒆, 𝒋𝒆 𝒔𝒂𝒊𝒔 𝒅𝒆́𝒋𝒂̀ 𝒒𝒖𝒆 𝒋𝒆 𝒔𝒖𝒊𝒔 𝒍𝒂 𝒏𝒐𝒕𝒊𝒇 𝒍𝒂 𝒑𝒍𝒖𝒔 𝒊𝒎𝒑𝒐𝒓𝒕𝒂𝒏𝒕𝒆\n👑 𝐃𝐄𝐕-𝐑𝐀𝐈𝐙𝐄𝐋";

    await sock.sendMessage(msg.key.remoteJid, {
      image: { url: "https://files.catbox.moe/n0m1z9.jpg" },
      caption: "📢 TAGALL\n\n" + text + "\n\n" + signature,
      mentions
    });

  } catch (err) {
    console.error("❌ Erreur tagall :", err);
  }
}