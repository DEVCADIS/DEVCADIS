import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import fs from "fs";
import { join } from "path";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";

ffmpeg.setFfmpegPath(ffmpegPath);

export const name = "toaudio";
export async function execute(sock, m, args) {
  try {
    // Récupération du message (direct ou cité)
    let msg =
      m.message?.extendedTextMessage?.contextInfo?.quotedMessage ||
      m.message;

    // Vérifie s’il y a bien une vidéo
    let videoMsg =
      msg.videoMessage ||
      msg.viewOnceMessageV2?.message?.videoMessage ||
      msg.viewOnceMessageV2Extension?.message?.videoMessage;

    if (!videoMsg) {
      await sock.sendMessage(
        m.key.remoteJid,
        { text: "⚠️ Réponds ou envoie une vidéo pour la convertir en audio." },
        { quoted: m }
      );
      return;
    }

    // Téléchargement du flux vidéo
    const stream = await downloadContentFromMessage(videoMsg, "video");
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }

    // Dossier temporaire
    const tempDir = "./temp";
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const inputPath = join(tempDir, "video.mp4");
    const outputPath = join(tempDir, "audio.mp3");
    fs.writeFileSync(inputPath, buffer);

    // Conversion vidéo → audio (mp3)
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .toFormat("mp3")
        .on("end", resolve)
        .on("error", reject)
        .save(outputPath);
    });

    // Lecture audio converti
    const audioBuffer = fs.readFileSync(outputPath);
    await sock.sendMessage(
      m.key.remoteJid,
      { audio: audioBuffer, mimetype: "audio/mp4" },
      { quoted: m }
    );

    // Nettoyage
    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);
  } catch (e) {
    await sock.sendMessage(
      m.key.remoteJid,
      { text: "❌ Erreur conversion audio : " + e.message },
      { quoted: m }
    );
  }
}