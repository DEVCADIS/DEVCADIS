// Normaliser un JID pour supprimer les suffixes type ":30"
function normalizeJid(jid) {
  if (!jid) return null;
  return jid.split(":")[0] + "@s.whatsapp.net";
}

import {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  DisconnectReason
} from "@whiskeysockets/baileys";

import chalk from "chalk";
import fs from "fs";
import path from "path";
import pino from "pino";
import qrcode from "qrcode-terminal";
import dotenv from "dotenv";

import { initProtections } from "./protections.js";

// === Modules d'événements spéciaux ===
import { welcomeEvents } from "./commands/welcome.js";
import { autoreactEvents } from "./commands/autoreact.js";
import { autorecordingEvents } from "./commands/autorecording.js";
import { statusReactEvents } from "./commands/statusreact.js";

dotenv.config();

// === Config via .env ===
const config = {
  PREFIXE_COMMANDE: process.env.PREFIXE || "!",
  DOSSIER_AUTH: process.env.DOSSIER_AUTH || "auth_baileys",
  NUMBER: process.env.NUMBER,
  USE_QR: process.env.USE_QR === "true",
  LOG_LEVEL: process.env.LOG_LEVEL || "silent",
  RECONNECT_DELAY: parseInt(process.env.RECONNECT_DELAY) || 5000
};

// Logger
const logger = pino({
  level: config.LOG_LEVEL,
  transport: {
    target: "pino-pretty",
    options: { colorize: true, ignore: "pid,hostname", translateTime: "HH:MM:ss" }
  },
  base: null
});

// === Config utilisateurs ===
const CONFIG_PATH = path.join("./config.json");
function getConfig() {
  if (!fs.existsSync(CONFIG_PATH)) fs.writeFileSync(CONFIG_PATH, JSON.stringify({ users: {}, owners: [] }, null, 2));
  return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
}
function saveConfig(configFile) { fs.writeFileSync(CONFIG_PATH, JSON.stringify(configFile, null, 2)); }
function getUserConfig(number) { return getConfig().users[number] || null; }
function setUserConfig(number, data) {
  const cfg = getConfig();
  cfg.users[number] = { ...(cfg.users[number] || {}), ...data };
  saveConfig(cfg);
}

// === Helpers numéros ===
function getBareNumber(input) {
  if (!input) return "";
  const s = String(input);
  const beforeAt = s.split("@")[0];
  const beforeColon = beforeAt.split(":")[0];
  return beforeColon.replace(/[^0-9]/g, "");
}

// === Définir automatiquement les propriétaires ===
function setOwner(user) {
  const cfg = getConfig();
  if (!cfg.owners) cfg.owners = [];

  const mainJid = normalizeJid(user?.id);
  if (mainJid) {
    const num = getBareNumber(mainJid);
    if (num && !cfg.owners.includes(num)) {
      cfg.owners.push(num);
    }
  }

  if (user?.lid) {
    const numLid = getBareNumber(user.lid);
    if (numLid && !cfg.owners.includes(numLid)) {
      cfg.owners.push(numLid);
    }
  }

  saveConfig(cfg);
  return cfg.owners;
}

// === Helpers message ===
function unwrapMessage(m) {
  return m?.ephemeralMessage?.message ||
         m?.viewOnceMessageV2?.message ||
         m?.viewOnceMessageV2Extension?.message ||
         m?.documentWithCaptionMessage?.message ||
         m?.viewOnceMessage?.message ||
         m;
}

function pickText(m) {
  return m?.conversation ||
         m?.extendedTextMessage?.text ||
         m?.imageMessage?.caption ||
         m?.videoMessage?.caption ||
         m?.buttonsResponseMessage?.selectedButtonId ||
         m?.listResponseMessage?.singleSelectReply?.selectedRowId ||
         m?.templateButtonReplyMessage?.selectedId ||
         m?.reactionMessage?.text ||
         m?.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson;
}

// === Banner ASCII ===
function afficherBanner() {
  console.log(`
🎉 DEV-RAIZEL 🎉
`);
}

// === Pairing code ===
async function requestPairingCode(sock) {
  try {
    logger.info("Demande de code pairing pour " + config.NUMBER);
    const pairingCode = await sock.requestPairingCode(config.NUMBER);

    const intervalId = setInterval(() => {
      logger.info("🔑 Code de pairing: " + pairingCode + " (Valable 20s)");
    }, 5000);

    setTimeout(() => clearInterval(intervalId), 20000);
  } catch (error) {
    logger.error({ error }, "❌ Échec de la demande de code pairing");
  }
}

// === Lancement bot ===
async function startBot() {
  const { version } = await fetchLatestBaileysVersion();
  const { state, saveCreds } = await useMultiFileAuthState(config.DOSSIER_AUTH);

  const sock = makeWASocket({
    version,
    logger: pino({ level: "silent" }),
    printQRInTerminal: false,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger)
    },
    msgRetryCounterCache: new Map()
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, lastDisconnect, qr }) => {
    if (qr && config.USE_QR) {
      console.log("\n📲 Scannez ce QR avec WhatsApp :");
      qrcode.generate(qr, { small: true });
    }
    if (connection === "open") {
      console.log(chalk.green("✅ Bot connecté et authentifié avec succès !"));
      afficherBanner();

      // Définir propriétaires dès la connexion
      const owners = setOwner(sock.user);
      global.owners = owners;

      console.log(chalk.green(`✅ Propriétaires définis : ${owners.join(", ")}`));
      console.log(chalk.yellow(`👋 Seuls ${owners.join(", ")} pourront utiliser le bot.`));
    }
    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.message;
      console.log(chalk.red("❌ Déconnecté :", reason));
      if (reason !== DisconnectReason.loggedOut) {
        setTimeout(startBot, config.RECONNECT_DELAY);
      } else {
        console.log(chalk.red("🔑 Session expirée. Supprimez le dossier auth et relancez."));
      }
    }
  });

  // === Protections ===
  initProtections(sock);

  // === Initialiser les events spéciaux ===
  welcomeEvents(sock);
  autoreactEvents(sock);
  autorecordingEvents(sock);
  statusReactEvents(sock);

  // Charger commandes
  const commands = {};
  const commandFiles = fs.readdirSync(path.join("./commands")).filter(f => f.endsWith(".js"));
  for (const file of commandFiles) {
    const command = await import(path.resolve(`./commands/${file}`));
    commands[command.name] = command;
  }

  // Pairing si pas enregistré
  setTimeout(async () => {
    if (!state.creds.registered && !config.USE_QR) {
      await requestPairingCode(sock);
    }
  }, 2000);

  // Gestion messages (commande)
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;

    const from = msg.key.remoteJid;
    const isGroup = (from || "").endsWith("@g.us");

    let realSenderJid;
    if (msg.key.fromMe) {
      realSenderJid = sock.user.id;
    } else if (isGroup) {
      realSenderJid = msg.key.participant || msg.participant;
      if (!realSenderJid) {
        realSenderJid =
          msg.message?.extendedTextMessage?.contextInfo?.participant ||
          msg.message?.imageMessage?.contextInfo?.participant ||
          msg.message?.videoMessage?.contextInfo?.participant ||
          msg.message?.buttonsResponseMessage?.contextInfo?.participant ||
          msg.message?.listResponseMessage?.contextInfo?.participant ||
          msg.message?.templateButtonReplyMessage?.contextInfo?.participant;
      }
      if (!realSenderJid) {
        realSenderJid = msg.key.remoteJid;
      }
    } else {
      realSenderJid = msg.key.remoteJid;
    }

    if (realSenderJid && realSenderJid.includes("@lid")) {
      try {
        realSenderJid = sock.decodeJid(realSenderJid);
      } catch (e) {
        console.log("DEBUG impossible decodeJid pour", realSenderJid);
      }
    }

    const senderNum = getBareNumber(realSenderJid);

    const inner = unwrapMessage(msg.message);
    const text = pickText(inner);
    if (!text) return;

    const senderBare = getBareNumber(senderNum);

    // Toujours recharger les owners depuis config.json
    const ownersBare = (getConfig().owners || []).map(getBareNumber);

    if (!ownersBare.includes(senderBare)) {
      return;
    } else {
      console.log(`📩 Commande propriétaire: ${senderBare} → ${text}`);
    }

    let userPrefs = getUserConfig(from) || {};
    if (!userPrefs.prefix) userPrefs.prefix = config.PREFIXE_COMMANDE;

    if (!text.startsWith(userPrefs.prefix)) return;
    const args = text.slice(userPrefs.prefix.length).trim().split(/ +/);
    const cmd = args.shift().toLowerCase();

    if (commands[cmd]) {
      try {
        await commands[cmd].execute(sock, msg, args, from);
      } catch (err) {
        console.error(chalk.red(`Erreur commande ${cmd} :`), err);
      }
    }
  });
}

startBot();
