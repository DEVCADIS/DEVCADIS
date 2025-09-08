export const name = "owner";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;

  // Texte principal
  const text = `
👑 Développeur : RAIZEL
Contact WhatsApp : https://wa.me/237699777530

👑 Collaboration : TARIQ
Contact WhatsApp : https://wa.me/237672354348
  `;

  // Envoi du message
  await sock.sendMessage(from, { text }, { quoted: msg });
}