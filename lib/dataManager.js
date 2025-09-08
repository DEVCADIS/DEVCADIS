// lib/dataManager.js
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

// retourne le chemin absolu d'un fichier JSON dans /data
export function filePath(name) {
  ensureDataDir();
  return path.join(DATA_DIR, name);
}

export function readJSON(name) {
  const fp = filePath(name);
  if (!fs.existsSync(fp)) {
    fs.writeFileSync(fp, "{}");
    return {};
  }
  try {
    const raw = fs.readFileSync(fp, "utf8");
    return JSON.parse(raw || "{}");
  } catch (e) {
    console.error(`[dataManager] erreur lecture ${name}:`, e.message);
    return {};
  }
}

export function writeJSON(name, data) {
  const fp = filePath(name);
  try {
    fs.writeFileSync(fp, JSON.stringify(data, null, 2));
    return true;
  } catch (e) {
    console.error(`[dataManager] erreur écriture ${name}:`, e.message);
    return false;
  }
}
