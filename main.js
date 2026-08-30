const { app, BrowserWindow, Menu, dialog } = require("electron");
const path = require("path");
const fs = require("fs");

function listerDossier(dossier, profondeur){
  profondeur = profondeur || 0;
  var lignes = [];
  var prefixe = "  ".repeat(profondeur);
  var entrees;
  try{ entrees = fs.readdirSync(dossier, { withFileTypes: true }); }
  catch(e){ return [prefixe + "(impossible de lire ce dossier: " + e.message + ")"]; }
  entrees.forEach(function(entree){
    lignes.push(prefixe + (entree.isDirectory() ? "[dossier] " : "") + entree.name);
    if(entree.isDirectory() && profondeur < 2){
      lignes = lignes.concat(listerDossier(path.join(dossier, entree.name), profondeur+1));
    }
  });
  return lignes;
}

function trouverIndexHtml(dossierDepart){
  var trouve = null;
  function parcourir(dossier, profondeur){
    if(trouve || profondeur > 4) return;
    var entrees;
    try{ entrees = fs.readdirSync(dossier, { withFileTypes: true }); }
    catch(e){ return; }
    for(var i=0; i<entrees.length; i++){
      if(trouve) return;
      var entree = entrees[i];
      var chemin = path.join(dossier, entree.name);
      if(entree.isDirectory()){
        parcourir(chemin, profondeur+1);
      } else if(entree.name.toLowerCase()==="index.html"){
        trouve = chemin;
        return;
      }
    }
  }
  parcourir(dossierDepart, 0);
  return trouve;
}

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

  Menu.setApplicationMenu(null);

  var indexPath = path.join(__dirname, "app", "index.html");
  if(!fs.existsSync(indexPath)){
    var trouve = trouverIndexHtml(__dirname);
    if(trouve) indexPath = trouve;
  }
  win.loadFile(indexPath);

  win.webContents.on("did-fail-load", function(event, errorCode, errorDescription){
    var contenu = listerDossier(__dirname).join("\n");
    dialog.showErrorBox(
      "Erreur de chargement",
      "Impossible de charger l'application.\n" +
      "Chemin attendu: " + indexPath + "\n" +
      "Code: " + errorCode + " — " + errorDescription + "\n\n" +
      "Contenu réellement trouvé dans:\n" + __dirname + "\n" + contenu
    );
  });

  win.webContents.on("render-process-gone", function(event, details){
    dialog.showErrorBox(
      "L'application s'est arrêtée",
      "Raison: " + details.reason
    );
  });

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
