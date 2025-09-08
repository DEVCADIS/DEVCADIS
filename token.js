import fs from 'fs';
import path from 'path';

const CONFIG_PATH = path.join('./config.json');

let config = {};
if (fs.existsSync(CONFIG_PATH)) {
  config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
} else {
  // Création d'un config.json par défaut si inexistant
  config = { users: {}, startupPassword: "raizel", authFolder: "auth_info_multi" };
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

// Export des variables nécessaires
export const startupPassword = config.startupPassword || "raizel";
export const authFolder = config.authFolder || "auth_info_multi";