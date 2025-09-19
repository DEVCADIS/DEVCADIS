import chalk from "chalk";

// =================== CONFIG ===================
const owners = []; // ajouter les numéros propriétaires ici

// =================== ETAT DES PROTECTIONS ===================
export const statusProtections = {
  antiLink: true,
  antiPromote: true,
  antiDemote: true,
  antiBot: true
};

// =================== FONCTIONS ===================

// Vérifie si le bot est admin
async function isBotAdmin(sock, groupId) {
  try {
    const metadata = await sock.groupMetadata(groupId);
    const botId = sock.user.id;
    const botInfo = metadata.participants.find(p => p.id === botId);
    return botInfo?.admin !== null;
  } catch {
    return false;
  }
}

// Anti-Link (supprime message + expulse auteur si bot admin)
export function antiLink(sock) {
  sock.ev.on("messages.upsert", async ({ messages }) => {
    if (!statusProtections.antiLink) return;
    const msg = messages[0];
    if (!msg.message) return;
    const from = msg.key.remoteJid;

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      msg.message.imageMessage?.caption ||
      msg.message.videoMessage?.caption;

    if (!text) return;

    try {
      if (!from.endsWith("@g.us")) return;

      const groupMetadata = await sock.groupMetadata(from);
      const sender = msg.key.participant || from;
      const isAdmin = groupMetadata.participants.find(p => p.id === sender)?.admin;

      if (owners.includes(sender) || isAdmin) return;

      const linkRegex =
        /(https?:\/\/[^\s]+|www\.[^\s]+|\b[a-z0-9.-]+\.[a-z]{2,}\b)/gi;

      if (linkRegex.test(text)) {
        if (!msg.key.fromMe) {
          const botIsAdmin = await isBotAdmin(sock, from);

          await sock.sendMessage(from, { delete: msg.key });

          if (botIsAdmin) {
            await sock.groupParticipantsUpdate(from, [sender], "remove");
          }

          console.log(
            chalk.yellow(`[ANTI-LINK] Lien supprimé et ${botIsAdmin ? "auteur expulsé" : "bot non-admin"} dans ${from}`)
          );
        }
      }
    } catch (e) {
      console.error(e);
    }
  });
}

// Anti-Promote
export function antiPromote(sock) {
  sock.ev.on("group-participants.update", async (update) => {
    if (!statusProtections.antiPromote) return;
    if (update.action !== "promote") return;
    const groupId = update.id;

    try {
      const botIsAdmin = await isBotAdmin(sock, groupId);
      for (const participant of update.participants) {
        if (owners.includes(participant)) continue;

        await sock.groupParticipantsUpdate(groupId, [participant], "demote");

        if (botIsAdmin) {
          await sock.groupParticipantsUpdate(groupId, [participant], "remove");
        }

        console.log(
          chalk.yellow(`[ANTI-PROMOTE] ${participant} rétrogradé et ${botIsAdmin ? "expulsé" : "non expulsé"} dans ${groupId}`)
        );
      }
    } catch (e) {
      console.error(e);
    }
  });
}

// Anti-Demote
export function antiDemote(sock) {
  sock.ev.on("group-participants.update", async (update) => {
    if (!statusProtections.antiDemote) return;
    if (update.action !== "demote") return;
    const groupId = update.id;

    try {
      const botIsAdmin = await isBotAdmin(sock, groupId);
      for (const participant of update.participants) {
        if (owners.includes(participant)) continue;

        await sock.groupParticipantsUpdate(groupId, [participant], "promote");

        if (botIsAdmin) {
          await sock.groupParticipantsUpdate(groupId, [participant], "remove");
        }

        console.log(
          chalk.yellow(`[ANTI-DEMOTE] ${participant} re-promu et ${botIsAdmin ? "expulsé" : "non expulsé"} dans ${groupId}`)
        );
      }
    } catch (e) {
      console.error(e);
    }
  });
}

// Anti-Bot
export function antiBot(sock) {
  // Cas 1 : ajout d’un bot détecté
  sock.ev.on("group-participants.update", async (update) => {
    if (!statusProtections.antiBot) return;
    if (update.action === "add") {
      try {
        const botIsAdmin = await isBotAdmin(sock, update.id);

        for (const participant of update.participants) {
          if (participant.includes("bot") && !owners.includes(participant)) {
            await sock.groupParticipantsUpdate(update.id, [participant], "remove");

            console.log(
              chalk.red(`[ANTI-BOT] Bot ${participant} supprimé et ${botIsAdmin ? "expulsé" : "non expulsé"} du groupe ${update.id}`)
            );
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  });

  // Cas 2 : utilisation de commande par un non-admin
  sock.ev.on("messages.upsert", async ({ messages }) => {
    if (!statusProtections.antiBot) return;
    const msg = messages[0];
    if (!msg.message) return;
    const from = msg.key.remoteJid;
    if (!from.endsWith("@g.us")) return;

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text;

    if (!text) return;
    if (!text.startsWith("!")) return; // une commande du bot

    try {
      const groupMetadata = await sock.groupMetadata(from);
      const sender = msg.key.participant || from;
      const isAdmin = groupMetadata.participants.find(p => p.id === sender)?.admin;

      if (owners.includes(sender) || isAdmin) return;

      const botIsAdmin = await isBotAdmin(sock, from);
      if (botIsAdmin) {
        await sock.groupParticipantsUpdate(from, [sender], "remove");
      }

      console.log(
        chalk.red(`[ANTI-BOT] ${sender} a tenté une commande dans ${from} et ${botIsAdmin ? "a été expulsé" : "bot non-admin"}`)
      );
    } catch (e) {
      console.error(e);
    }
  });
}

// Commande pour activer/désactiver protections
export function protectCommand(sock) {
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;

    const from = msg.key.remoteJid;
    const text =
      msg.message.conversation || msg.message.extendedTextMessage?.text;
    if (!text || !text.startsWith("!protect")) return;

    const args = text.trim().split(/ +/).slice(1);
    if (args.length === 0) {
      await sock.sendMessage(from, {
        text: `⚙️ Status protections :\n${JSON.stringify(
          statusProtections,
          null,
          2
        )}`,
      });
      return;
    }

    const [action, feature] = args;
    if (
      !["on", "off"].includes(action) ||
      !Object.keys(statusProtections).includes(feature)
    ) {
      await sock.sendMessage(from, {
        text: "❌ Utilisation : !protect <on/off> <antiLink|antiPromote|antiDemote|antiBot>",
      });
      return;
    }

    statusProtections[feature] = action === "on";
    await sock.sendMessage(from, {
      text: `✅ Protection ${feature} ${
        action === "on" ? "activée" : "désactivée"
      } !`,
    });
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