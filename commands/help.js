// help.js
export const name = "help";
export const aliases = ["menu", "aide", "commands", "cmd", "?"];

function formatUptime() {
  const sec = Math.floor(process.uptime());
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${h}h ${m}m ${s}s`;
}

export async function execute(sock, msg, args) {
  try {
    const user =
      msg.pushName ||
      msg.key?.participant?.split("@")[0] ||
      msg.key.remoteJid;

    const helpText = `
╭─────────────❖─────────────╮
       🟢 RENEGADES MD MENU
╰─────────────❖─────────────╯

👤 *Utilisateur* : ${user}
⚙️ *Mode*        : 🔒 Privé
🕰️ *Uptime*      : ${formatUptime()}
🧠 *Version*     : 1.0
👑 *Développeur* : RAIZEL

*Note importante* :
Les modules suivants sont *activés par défaut* : 
> 🔗 antilink  
> ⛔ antipromote  
> ⛔ antidemote  
> ❤️ autolike  
> 🤖 antibot  

➡️ Pensez à les *désactiver* si vous ne les utilisez pas souvent.  
(Exemple : *antipromote* et *antidemote* peuvent gêner lorsque vous utilisez *promoteall* ou autres commandes similaires.)

╭───💬 COMMANDES GROUPE ───╮
│ kick @mention → expulse un membre
│ kickall → expulse tout le groupe sauf admins
│ promote @mention → passer admin
│ demote @mention → retirer admin
│ promoteall → rendre tout le monde admin
│ demoteall → retirer tous les admins
│ fermer → fermer le groupe
│ ouvrir → rouvrir le groupe
│ tagadmin → mentionner les admins
│ tagall → mentionner tout le monde
│ purge → expulser tout le monde en 3s
│ link → récupérer le lien du groupe
│ tag → taguer un membre
│ leave → bot quitte le groupe
╰──────────────────────────╯

╭───⚙️ UTILITAIRES ───╮
│ ping → tester la réactivité
│ owner → infos sur le propriétaire
│ ai → question à l’IA
│ delete → supprimer un message
│ save → sauvegarder média/texte en privé
│ device → appareil utilisé
│ sudo → ajouter un sudo-user
╰────────────────────╯

╭───🎵 MEDIA ───╮
│ sticker → transformer en sticker
│ take → renommer un sticker
│ photo → sticker en image
│ toaudio → vidéo en audio
│ vv → convertir vue unique en normal
│ url → transformer média en lien
│ img [texte] → générer une image
│ song [titre] → télécharger musique
│ pp → changer photo profil
╰────────────────────╯

╭───🔊 INTERACTIONS ───╮
│ respon → répondre avec audio prédéfini
│ autorecording → activer enregistrement auto
╰────────────────╯

╭───👾 PRUDENCE 👾───╮
│ tagcreator → mentionner le créateur
│ kickadmin → expulse un admin (⚠️)
│ antilink on/off
│ antipromote on/off
│ antidemote on/off
│ antibot on/off
│ antibug on/off
│ autoreact on/off
╰────────────────╯

╭───🐞 MODULES BUG ───╮
│ bugs1 → envoyer bugs du dossier ./bug
│ raizeldead [numéro] → attaque spéciale
╰────────────────╯

╭───♾️ OPTIONS ───╮
│ infos → infos du clan
│ priere → prière spéciale
│ inviteClan → invitation du clan
╰────────────────╯

╭───♾️ PREMIUM ───╮
│ ban → bannir utilisateur
│ spam → spam message
╰────────────────╯

🛠️ *Utilisation* :
Toutes les commandes se lancent avec le préfixe \`!\`
Exemples :
!tagall
!kick @user
!sticker
    `;

    // Envoi avec image
    await sock.sendMessage(
      msg.key.remoteJid,
      {
        image: { url: "https://files.catbox.moe/iqril4.jpeg" }, // <- ta photo
        caption: helpText,
      },
      { quoted: msg }
    );
  } catch (e) {
    await sock.sendMessage(
      msg.key.remoteJid,
      { text: "❌ Erreur help : " + e.message },
      { quoted: msg }
    );
  }
}