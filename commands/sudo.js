import fs from "fs";

const SUDO_FILE = "./sudo.json";

function loadSudo() {
  if (!fs.existsSync(SUDO_FILE)) return [];
  return JSON.parse(fs.readFileSync(SUDO_FILE, "utf-8"));
}

function saveSudo(list) {
  fs.writeFileSync(SUDO_FILE, JSON.stringify(list, null, 2));
}

let sudoList = loadSudo();

export const name = "sudo";

export async function execute(sock, m, args) {
  try {
    const cmd = args[0]; // add / del / list
    let target;

    if (m.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
      target = m.message.extendedTextMessage.contextInfo.participant.split("@")[0];
    } else if (args.length > 1) {
      target = args[1].replace("@", "");
    }

    if (cmd === "add") {
      if (!target) {
        await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Mentionne ou donne le numéro à ajouter en sudo." }, { quoted: m });
        return;
      }
      if (!sudoList.includes(target)) {
        sudoList.push(target);
        saveSudo(sudoList);
      }
      await sock.sendMessage(m.key.remoteJid, { text: `✅ ${target} ajouté à la liste sudo.` }, { quoted: m });

    } else if (cmd === "del") {
      if (!target) {
        await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Mentionne ou donne le numéro à retirer du sudo." }, { quoted: m });
        return;
      }
      sudoList = sudoList.filter(n => n !== target);
      saveSudo(sudoList);
      await sock.sendMessage(m.key.remoteJid, { text: `🚫 ${target} retiré de la liste sudo.` }, { quoted: m });

    } else if (cmd === "list") {
      if (sudoList.length === 0) {
        await sock.sendMessage(m.key.remoteJid, { text: "📭 Aucun sudo défini." }, { quoted: m });
      } else {
        await sock.sendMessage(m.key.remoteJid, { text: "👑 Liste des sudo:\n\n" + sudoList.map((n, i) => `${i + 1}. ${n}`).join("\n") }, { quoted: m });
      }

    } else {
      await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Utilise: !sudo add @user | !sudo del @user | !sudo list" }, { quoted: m });
    }
  } catch (error) {
    await sock.sendMessage(m.key.remoteJid, { text: "❌ Erreur sudo : " + error.message }, { quoted: m });
  }
}