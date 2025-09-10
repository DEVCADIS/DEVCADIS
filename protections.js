import chalk from "chalk";

const blockedLinks = ["chat.whatsapp.com", "bit.ly", "t.me"];
const owners = []; // numéros propriétaires ici

// === Vérifier si le bot est admin dans un groupe ===
async function isBotAdmin(sock, groupId) {
  try {
    const metadata = await sock.groupMetadata(groupId);
    const botId = sock.user.id.split(":")[0] + "@s.whatsapp.net";
    return metadata.participants.some(p => p.id === botId && p.admin);
  } catch (e) {
    console.error("Erreur vérif admin:", e);
    return false;
  }
}

// =================== ETAT DES PROTECTIONS ===================
export const statusProtections = {
  antiLink: true,
  antiPromote: true,
  antiDemote: true,
  antiBot: true
};

// =================== FONCTIONS ===================

// Anti-Link
export function antiLink(sock) {
  sock.ev.on("messages.upsert", async ({ messages }) => {
    if (!statusProtections.antiLink) return;
    const msg = messages[0];
    if (!msg.message) return;
    const from = msg.key.remoteJid;
    if (!from.endsWith("@g.us")) return; // seulement groupe

    const text = msg.message.conversation
      || msg.message.extendedTextMessage?.text
      || msg.message.imageMessage?.caption
      || msg.message.videoMessage?.caption;
    if (!text) return;

    try {
      if (!(await isBotAdmin(sock, from))) return; // ⚠️ ignorer si pas admin

      for (const link of blockedLinks) {
        if (text.includes(link)) {
          await sock.sendMessage(from, { text: "🚫 Les liens sont interdits ici !" });
          if (!msg.key.fromMe) {
            await sock.sendMessage(from, { delete: msg.key });
          }
          console.log(chalk.yellow(`[ANTI-LINK] Message supprimé dans ${from}`));
          return;
        }
      }
    } catch (e) { console.error(e); }
  });
}

// Anti-Promote
export function antiPromote(sock) {
  sock.ev.on("group-participants.update", async (update) => {
    if (!statusProtections.antiPromote) return;
    if (update.action !== "promote") return;
    if (!(await isBotAdmin(sock, update.id))) return;

    for (const participant of update.participants) {
      if (owners.includes(participant)) continue;
      try {
        await sock.groupParticipantsUpdate(update.id, [participant], "demote");
        console.log(chalk.yellow(`[ANTI-PROMOTE] ${participant} rétrogradé dans ${update.id}`));
      } catch (e) { console.error(e); }
    }
  });
}

// Anti-Demote
export function antiDemote(sock) {
  sock.ev.on("group-participants.update", async (update) => {
    if (!statusProtections.antiDemote) return;
    if (update.action !== "demote") return;
    if (!(await isBotAdmin(sock, update.id))) return;

    for (const participant of update.participants) {
      if (owners.includes(participant)) continue;
      try {
        await sock.groupParticipantsUpdate(update.id, [participant], "promote");
        console.log(chalk.yellow(`[ANTI-DEMOTE] ${participant} promu dans ${update.id}`));
      } catch (e) { console.error(e); }
    }
  });
}

// Anti-Bot
export function antiBot(sock) {
  sock.ev.on("group-participants.update", async (update) => {
    if (!statusProtections.antiBot) return;
    if (update.action !== "add") return;
    if (!(await isBotAdmin(sock, update.id))) return;

    for (const participant of update.participants) {
      if (participant.includes("bot") && !owners.includes(participant)) {
        try {
          await sock.groupParticipantsUpdate(update.id, [participant], "remove");
          console.log(chalk.red(`[ANTI-BOT] Bot ${participant} supprimé de ${update.id}`));
        } catch (e) { console.error(e); }
      }
    }
  });
}

// Commande pour activer/désactiver protections depuis le chat
export function protectCommand(sock) {
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;

    const from = msg.key.remoteJid;
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
    if (!text || !text.startsWith("!protect")) return;

    const args = text.trim().split(/ +/).slice(1);
    if (args.length === 0) {
      await sock.sendMessage(from, { text: `⚙️ Status protections :\n${JSON.stringify(statusProtections, null, 2)}` });
      return;
    }

    const [action, feature] = args;
    if (!["on","off"].includes(action) || !Object.keys(statusProtections).includes(feature)) {
      await sock.sendMessage(from, { text: "❌ Utilisation : !protect <on/off> <antiLink|antiPromote|antiDemote|antiBot>" });
      return;
    }

    statusProtections[feature] = action === "on";
    await sock.sendMessage(from, { text: `✅ Protection ${feature} ${action === "on" ? "activée" : "désactivée"} !` });
  });
}

// =================== INIT ===================
export function initProtections(sock) {
  antiLink(sock);
  antiPromote(sock);
  antiDemote(sock);
  antiBot(sock);
  protectCommand(sock); // commande !protect
}