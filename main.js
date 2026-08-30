const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 900,
    minHeight: 600,
    title: "Quincaillerie Diallo — Gestion Stock & Factures",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  });

  // Masque la barre de menu (Fichier/Édition/Affichage...) pour une
  // apparence plus proche d'un vrai logiciel.
  Menu.setApplicationMenu(null);

  win.loadFile(path.join(__dirname, "app", "index.html"));

  // Décommenter la ligne suivante pour ouvrir les outils de développement
  // (utile pour déboguer, à ne pas garder dans la version livrée aux clients) :
  // win.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
