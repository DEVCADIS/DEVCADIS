export const name = "ai";

export async function execute(sock, msg, args) {
  const from = msg?.key?.remoteJid || (msg?.key?.participant || "");

  if (!args || args.length === 0) {
    return await sock.sendMessage(from, { text: "❌ Veuillez fournir un message à envoyer à l'IA.\nExemple : !ai Bonjour" }, { quoted: msg });
  }

  const question = args.join(" ");

  try {
    // Ici tu peux connecter à ton API d'IA. Exemple générique avec fetch vers un endpoint OpenAI
    const fetch = (await import("node-fetch")).default;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: question }],
        max_tokens: 500
      })
    });

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || "❌ Aucun résultat de l'IA.";

    await sock.sendMessage(from, { text: `💬 *Question:* ${question}\n\n🤖 *Réponse:* ${answer}` }, { quoted: msg });

  } catch (err) {
    console.error("Erreur AI :", err);
    await sock.sendMessage(from, { text: "❌ Erreur lors de la requête à l'IA." }, { quoted: msg });
  }
}