// === Normaliser un JID ===
function normalizeJid(jid) {
  if (!jid) return null;
  return jid.split(":")[0].replace(/@lid$/, "") + "@s.whatsapp.net";
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

// === Logger ===
const logger = pino({
  level: config.LOG_LEVEL,
  transport: {
    target: "pino-pretty",
    options: { colorize: true, ignore: "pid,hostname", translateTime: "HH:MM:ss" }
  },
  base: null
});

// === Helpers numéros ===
function getBareNumber(input) {
  if (!input) return "";
  const s = String(input);
  const beforeAt = s.split("@")[0];
  const beforeColon = beforeAt.split(":")[0];
  return beforeColon.replace(/[^0-9]/g, "");
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

// === Résolution expéditeur ===
function resolveSenderJid(msg, sock) {
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
    if (!realSenderJid) realSenderJid = from;
  } else {
    realSenderJid = from;
  }

  // Corrige les LIDs
  if (realSenderJid && realSenderJid.includes("@lid")) {
    try {
      realSenderJid = sock.decodeJid(realSenderJid);
    } catch (e) {
      console.log("DEBUG impossible decodeJid pour", realSenderJid);
    }
  }
  return realSenderJid;
}

// === Banner ASCII ===
function afficherBanner() {
  console.log(`
🎉 DEV-RAIZEL - MODE DEBUG 🎉
`);
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

  // === Charger commandes ===
  const commands = {};
  const commandFiles = fs.readdirSync(path.join("./commands")).filter(f => f.endsWith(".js"));
  for (const file of commandFiles) {
    const command = await import(path.resolve(`./commands/${file}`));
    commands[command.name] = command;
  }

  // === Gestion des messages (DEBUG) ===
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;

    const from = msg.key.remoteJid;
    const isGroup = from.endsWith("@g.us");
    const sender = resolveSenderJid(msg, sock);
    const senderNum = getBareNumber(sender);

    console.log("=== NOUVEAU MESSAGE ===");
    console.log("from:", from);
    console.log("isGroup:", isGroup);
    console.log("sender:", sender);
    console.log("senderNum:", senderNum);
    console.log("contenu brut:", JSON.stringify(msg.message, null, 2));

    // Récupération texte
    const inner = unwrapMessage(msg.message);
    let text = pickText(inner);

    if (!text) {
      // fallback brut
      text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
    }

    if (!text) return;
    console.log("Texte détecté:", text);

    // Pas de filtre propriétaire (test)
    const prefix = config.PREFIXE_COMMANDE || "!";
    if (!text.startsWith(prefix)) return;

    const args = text.slice(prefix.length).trim().split(/ +/);
    const cmd = args.shift().toLowerCase();

    console.log(`Commande détectée: ${cmd} | args:`, args);

    if (commands[cmd]) {
      try {
        await commands[cmd].execute(sock, msg, args, from);
      } catch (err) {
        console.error("Erreur commande:", err);
      }
    }
  });
}

startBot();
