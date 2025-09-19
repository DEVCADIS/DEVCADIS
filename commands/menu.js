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
│ pair
│ delpair
│ device
│ sudo
│ delete
╰────────────────────╯

╭───👾 PRUDENCE 👾───╮
│ tagcreator
│ kickadmin
│ antilink
│ antipromote
│ antidemote
│ autoreact
│ antibot
│ autorecording
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

╭───♾️ PREMIUM ───╮
│ ban
│ spam
╰────────────────╯

✨ ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝘋𝘌𝘝-𝘙𝘈𝘐𝘡𝘌𝘓 👑
`;

    // Envoi de l’image à la place de la vidéo
    await sock.sendMessage(
      from,
      {
        image: { url: "https://files.catbox.moe/iqril4.jpeg" },
        caption: text
      },
      { quoted: msg }
    );

    // Envoi de l'audio
    await sock.sendMessage(
      from,
      {
        audio: { url: "https://files.catbox.moe/f103si.mp3" },
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