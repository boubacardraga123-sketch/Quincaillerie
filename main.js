const { app, BrowserWindow, Menu, dialog } = require("electron");
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
      contextIsolation: true
    }
  });

  // Masque la barre de menu (Fichier/Édition/Affichage...) pour une
  // apparence plus proche d'un vrai logiciel.
  Menu.setApplicationMenu(null);

  var indexPath = path.join(__dirname, "app", "index.html");
  win.loadFile(indexPath);

  // Filet de sécurité : si la page ne se charge pas, on l'affiche à
  // l'écran (au lieu d'un écran blanc silencieux) pour comprendre pourquoi.
  win.webContents.on("did-fail-load", function(event, errorCode, errorDescription){
    dialog.showErrorBox(
      "Erreur de chargement",
      "Impossible de charger l'application.\nChemin: " + indexPath +
      "\nCode: " + errorCode + " — " + errorDescription
    );
  });

  win.webContents.on("render-process-gone", function(event, details){
    dialog.showErrorBox(
      "L'application s'est arrêtée",
      "Raison: " + details.reason
    );
  });

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
