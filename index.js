// === Normaliser un JID pour supprimer les suffixes type ":30" et convertir @lid ===
function normalizeJid(jid) {
  if (!jid) return null;
  return jid.split(":")[0].replace("@lid", "@s.whatsapp.net");
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
import { welcomeEvents } from "./commands/welcome.js";
import { autoreactEvents } from "./commands/autoreact.js";
import { autorecordingEvents } from "./commands/autorecording.js";
import { statusReactEvents } from "./commands/statusreact.js";
import statusLike from "./events/statuslike.js";

dotenv.config();

const config = {
  PREFIXE_COMMANDE: process.env.PREFIXE || "!",
  DOSSIER_AUTH: process.env.DOSSIER_AUTH || "auth_baileys",
  NUMBER: process.env.NUMBER,
  USE_QR: process.env.USE_QR === "true",
  LOG_LEVEL: process.env.LOG_LEVEL || "silent",
  RECONNECT_DELAY: parseInt(process.env.RECONNECT_DELAY) || 5000,
  STATUS_REACT: process.env.STATUS_REACT || "💚"
};

const logger = pino({
  level: config.LOG_LEVEL,
  transport: {
    target: "pino-pretty",
    options: { colorize: true, ignore: "pid,hostname", translateTime: "HH:MM:ss" }
  },
  base: null
});

// === Gestion sudo.json ===
const SUDO_FILE = "./sudo.json";
function loadSudo() {
  if (!fs.existsSync(SUDO_FILE)) return [];
  return JSON.parse(fs.readFileSync(SUDO_FILE, "utf-8"));
}

// === Gestion firstRun.json (pour envoyer message 1 seule fois) ===
const FIRST_RUN_FILE = "./firstRun.json";
function isFirstRun() {
  if (!fs.existsSync(FIRST_RUN_FILE)) {
    fs.writeFileSync(FIRST_RUN_FILE, JSON.stringify({ done: true }, null, 2));
    return true;
  }
  return false;
}

// === Fonctions config utilisateurs ===
const CONFIG_PATH = path.join("./config.json");
function getConfig() {
  if (!fs.existsSync(CONFIG_PATH)) fs.writeFileSync(CONFIG_PATH, JSON.stringify({ users: {} }, null, 2));
  return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
}
function saveConfig(configFile) { fs.writeFileSync(CONFIG_PATH, JSON.stringify(configFile, null, 2)); }
function getUserConfig(number) { return getConfig().users[number] || null; }
function setUserConfig(number, data) {
  const cfg = getConfig();
  cfg.users[number] = { ...(cfg.users[number] || {}), ...data };
  saveConfig(cfg);
}

function getBareNumber(input) {
  if (!input) return "";
  const s = String(input);
  const beforeAt = s.split("@")[0];
  const beforeColon = beforeAt.split(":")[0];
  return beforeColon.replace(/[^0-9]/g, "");
}

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

    console.log("\n======================================");
    console.log("🔑 CODE WHATSAPP (Pairing) : " + chalk.cyan(pairingCode));
    console.log("👉 Ouvre WhatsApp > Paramètres > Appareils liés > Lier un appareil");
    console.log("⚠️ Ce code expire dans 20 secondes !");
    console.log("======================================\n");
  } catch (error) {
    logger.error({ error }, "❌ Échec de la demande de code pairing");
  }
}

// === Lancement du bot ===
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

  sock.ev.on("connection.update", async ({ connection, lastDisconnect, qr }) => {
    if (qr && config.USE_QR) {
      console.log("\n📲 Scannez ce QR avec WhatsApp :");
      qrcode.generate(qr, { small: true });
    }
    if (connection === "open") {
      console.log(chalk.green("✅ Bot connecté et authentifié avec succès !"));
      afficherBanner();

      const ownerId = normalizeJid(sock.user?.id);
      const ownerBare = getBareNumber(ownerId);
      const ownerLid = sock.user?.lid ? getBareNumber(sock.user.lid) : null;

      global.owners = [ownerBare];
      if (ownerLid) global.owners.push(ownerLid);

      console.log(chalk.green(`✅ Ton ID : ${ownerBare}`));
      if (ownerLid) console.log(chalk.green(`✅ Ton LID : ${ownerLid}`));

      // ✅ Message privé automatique UNIQUEMENT au premier démarrage
      if (isFirstRun()) {
        const ownerJid = config.NUMBER + "@s.whatsapp.net";
        await sock.sendMessage(ownerJid, {
          video: { url: "https://files.catbox.moe/qiqdaw.mp4" },
          caption: `🚀 RENEGADES MD V1 TERMINÉ    Bot Disponible ! 🚀

📢 Rejoignez la communauté :
  • 📲 WhatsApp Channel : Cliquez ici👉 https://whatsapp.com/channel/0029Vb6DOLCCxoAvIfxngr3P
  • ✈️ Telegram Channel : Cliquez ici👉 https://t.me/RAIZEL_SUPPORT

📬 Contact direct :
  • WhatsApp : wa.me/237699777530
  • Telegram : t.me/devraizel

🔥 N’hésitez pas à partager, tester et donner vos retours !

✨ Les autres rêvent d’inventer, moi j’invente des rêves.

By 𝘋𝘌𝘝-𝘙𝘈𝘐𝘡𝘌𝘓`
        });
      }
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

  initProtections(sock);
  welcomeEvents(sock);
  autoreactEvents(sock);
  autorecordingEvents(sock);
  statusReactEvents(sock);

  const commands = {};
  const commandFiles = fs.readdirSync(path.join("./commands")).filter(f => f.endsWith(".js"));
  for (const file of commandFiles) {
    const command = await import(path.resolve(`./commands/${file}`));
    commands[command.name] = command;
  }

  setTimeout(async () => {
    if (!state.creds.registered && !config.USE_QR) {
      await requestPairingCode(sock);
    }
  }, 2000);

  // === Gestion des messages (PRIVÉ + GROUPE) ===
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;

    const from = msg.key.remoteJid;
    const isGroup = from.endsWith("@g.us");

    if (isGroup && !msg.key.participant) {
      msg.key.participant =
        msg.participant ||
        msg.message?.extendedTextMessage?.contextInfo?.participant ||
        msg.key.remoteJid;
    }

    let realSenderJid = msg.key.fromMe ? sock.user.id : (msg.key.participant || from);
    try {
      realSenderJid = sock.decodeJid(realSenderJid);
    } catch {
      realSenderJid = normalizeJid(realSenderJid);
    }

    const senderNum = getBareNumber(realSenderJid);
    const inner = unwrapMessage(msg.message);
    const text = pickText(inner);

    if (!text) return;

    const sudoList = loadSudo().map(n => String(n).replace(/[^0-9]/g, ""));
    const allowedUsers = [...(global.owners || []), ...sudoList];

    if (!allowedUsers.includes(senderNum)) return;

    if (!text.startsWith(config.PREFIXE_COMMANDE)) return;

    const args = text.slice(config.PREFIXE_COMMANDE.length).trim().split(/ +/);
    const cmd = args.shift().toLowerCase();

    if (commands[cmd]) {
      try {
        await commands[cmd].execute(sock, msg, args, from);
      } catch (err) {
        console.error(chalk.red(`Erreur commande ${cmd} :`), err);
      }
    }
  });

  // === Auto réaction aux statuts ===
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (msg.key.remoteJid === "status@broadcast") {
      await statusLike(sock, messages, config.STATUS_REACT);
    }
  });
}

startBot();