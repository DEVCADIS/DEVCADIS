import chalk from "chalk";

// =================== CONFIG ===================
const blockedLinks = ["chat.whatsapp.com", "bit.ly", "t.me"];
const owners = []; // ajouter les numéros propriétaires ici
const autoLikeInterval = 60_000;

// =================== ETAT DES PROTECTIONS ===================
export const statusProtections = {
  antiLink: true,
  antiPromote: true,
  antiDemote: true,
  antiBot: true,
  autoLikeStatus: true
};

// =================== FONCTIONS ===================

// Anti-Link
export function antiLink(sock) {
  sock.ev.on("messages.upsert", async ({ messages }) => {
    if (!statusProtections.antiLink) return;
    const msg = messages[0];
    if (!msg.message) return;
    const from = msg.key.remoteJid;
    const text = msg.message.conversation
                 || msg.message.extendedTextMessage?.text
                 || msg.message.imageMessage?.caption
                 || msg.message.videoMessage?.caption;
    if (!text) return;

    try {
      const groupMetadata = from.endsWith("@g.us") ? await sock.groupMetadata(from) : null;
      const sender = msg.key.participant || from;
      const isAdmin = groupMetadata?.participants?.find(p => p.id === sender)?.admin;
      if (owners.includes(sender) || isAdmin) return;

      for (const link of blockedLinks) {
        if (text.includes(link)) {
          await sock.sendMessage(from, { text: "🚫 Les liens sont interdits ici !" });
          if (!msg.key.fromMe && from.endsWith("@g.us")) await sock.sendMessage(from, { delete: msg.key });
          console.log(chalk.yellow(`[ANTI-LINK] Message supprimé de ${sender} dans ${from}`));
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
    const groupId = update.id;
    for (const participant of update.participants) {
      if (owners.includes(participant)) continue;
      try {
        await sock.groupParticipantsUpdate(groupId, [participant], "demote");
        console.log(chalk.yellow(`[ANTI-PROMOTE] ${participant} a été rétrogradé dans ${groupId}`));
      } catch (e) { console.error(e); }
    }
  });
}

// Anti-Demote
export function antiDemote(sock) {
  sock.ev.on("group-participants.update", async (update) => {
    if (!statusProtections.antiDemote) return;
    if (update.action !== "demote") return;
    const groupId = update.id;
    for (const participant of update.participants) {
      if (owners.includes(participant)) continue;
      try {
        await sock.groupParticipantsUpdate(groupId, [participant], "promote");
        console.log(chalk.yellow(`[ANTI-DEMOTE] ${participant} a été promu dans ${groupId}`));
      } catch (e) { console.error(e); }
    }
  });
}

// Anti-Bot
export function antiBot(sock) {
  sock.ev.on("group-participants.update", async (update) => {
    if (!statusProtections.antiBot) return;
    if (update.action === "add") {
      for (const participant of update.participants) {
        if (participant.includes("bot") && !owners.includes(participant)) {
          try {
            await sock.groupParticipantsUpdate(update.id, [participant], "remove");
            console.log(chalk.red(`[ANTI-BOT] Bot ${participant} supprimé du groupe ${update.id}`));
          } catch (e) { console.error(e); }
        }
      }
    }
  });
}

// Auto-Like Statuts
// Auto-Like Statuts
export function autoLikeStatus(sock) {
  setInterval(async () => {
    if (!statusProtections.autoLikeStatus) return;

    try {
      // Récupérer les contacts et statuts visibles
      const results = await sock.query({ json: ["action", "get", "status"] });
      if (!results?.status) return;

      for (const status of results.status) {
        const statusId = status.key?.id;
        const senderId = status.key?.fromMe ? sock.user.id : status.key?.participant || status.key?.from;

        if (!statusId) continue;

        // Réagir seulement si le bot n'a pas encore liké
        if (!status.views?.includes(sock.user.id)) {
          await sock.sendMessage(statusId, { react: { text: "❤️" } });
          console.log(chalk.green(`[AUTO-LIKE] Statut liké de ${senderId}`));
        }
      }
    } catch (e) {
      console.error("[AUTO-LIKE] Erreur :", e);
    }
  }, autoLikeInterval);
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
      await sock.sendMessage(from, { text: "❌ Utilisation : !protect <on/off> <antiLink|antiPromote|antiDemote|antiBot|autoLikeStatus>" });
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
  autoLikeStatus(sock);
  protectCommand(sock); // commande !protect
}