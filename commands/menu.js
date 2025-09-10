export const name = "menu";

export async function execute(sock, msg, args) {
  try {
    const from = msg.key.remoteJid;

    // Uptime du bot
    const totalSeconds = process.uptime();
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const uptime = `${hours}h ${minutes}m ${seconds}s`;

    const text = `
╭─────────────❖─────────────╮
       🟢 RENEGADES MD MENU
╰─────────────❖─────────────╯

👤 *Utilisateur* : ${msg.pushName || "Invité"}
⚙️ *Mode*        : 🔒 Privé
🕰️ *Uptime*      : ${uptime}
🧠 *Version*     : 1.0
👑 *Développeur* : RAIZEL

╭───💬 COMMANDES GROUPE ───╮
│ kick @mention
│ kickall
│ promote @mention
│ fermer
│ ouvrir
│ tagadmin
│ gpp
│ desc
│ welcome
│ tagall
│ purge
│ link
│ tag
│ leave
│ demoteall
│ promoteall
╰──────────────────────────╯

╭───⚙️ UTILITAIRES ───╮
│ ping
│ owner
│ ai
│ delete
╰────────────────────╯

╭───👾 PRUDENCE 👾───╮
│ tagcreator
│ Vortex
│ kickadmin
│ antilink
│ antipromote
│ antidemote
│ autoreact
│ antibot
│ autorecording
│ statusreact
╰────────────────╯

╭───⚙️ MEDIA ───╮
│ vv
│ sticker
│ toaudio
│ url
│ save
│ take
│ photo
│ img
│ pp
╰────────────────────╯

╭───♾️ OPTIONS ───╮
│ help
│ infos
│ inviteClan
╰────────────────╯

✨ ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝘋𝘌𝘝-𝘙𝘈𝘐𝘡𝘌𝘓 👑
`;

    // Envoi du GIF animé remplacé par le nouveau MP4
    await sock.sendMessage(
      from,
      {
        video: { url: "https://files.catbox.moe/xug2w1.mp4" },
        caption: text,
        gifPlayback: true
      },
      { quoted: msg }
    );

    // Envoi de l'audio
    await sock.sendMessage(
      from,
      {
        audio: { url: "https://files.catbox.moe/l38ipf.mp3" },
        mimetype: "audio/mpeg"
      },
      { quoted: msg }
    );

  } catch (err) {
    console.error("❌ Erreur commande menu :", err);
    await sock.sendMessage(
      msg.key.remoteJid,
      { text: "⚠️ Impossible d’afficher le menu." },
      { quoted: msg }
    );
  }
}