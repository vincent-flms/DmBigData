const pm2 = require("pm2");
const csv = require('csv-parser');
const fs = require('fs');
const mongoose = require('mongoose');
const Etablissement = require('./models/etablissement');

pm2.connect(function(err) {
  if (err) {
    console.error(err);
    process.exit(2);
  }

  pm2.start("process.json", function(err, apps) {
    if (err) {
      console.error(err);
      pm2.disconnect();
      process.exit(2);
    }

    console.log("PM2 process started");

    pm2.launchBus(function(err, bus) {
      if (err) {
        console.error(err);
        pm2.disconnect();
        process.exit(2);
      }

      mongoose.connect('mongodb://localhost:27017/syreneInvader', { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => {
          console.log('Connexion à MongoDB réussie');

          const csvFilePath = 'C:\\Users\\33607.FLAMS\\Downloads\\StockEtablissementHistorique_utf8.csv';

          fs.createReadStream(csvFilePath)
            .pipe(csv())
            .on('data', (row) => {
              const etablissement = new Etablissement({
                siren: row.siren,
                nic: row.nic,
                siret: row.siret,
                dateCreationEtablissement: new Date(row.dateCreationEtablissement),
                dateDernierTraitementEtablissement: new Date(row.dateDernierTraitementEtablissement),
                typeVoieEtablissement: row.typeVoieEtablissement,
                libelleVoieEtablissement: row.libelleVoieEtablissement,
                codePostalEtablissement: row.codePostalEtablissement,
                libelleCommuneEtablissement: row.libelleCommuneEtablissement,
                codeCommuneEtablissement: row.codeCommuneEtablissement,
                dateDebut: new Date(row.dateDebut),
                etatAdministratifEtablissement: row.etatAdministratifEtablissement
              });

              etablissement.save()
                .then(() => console.log('Etablissement enregistré avec succès'))
                .catch(err => console.error('Erreur lors de l\'enregistrement de l\'établissement :', err));
            })
            .on('end', () => {
              console.log('Lecture du fichier CSV terminée');
              mongoose.disconnect();
            });
        })
        .catch(err => console.error('Erreur lors de la connexion à MongoDB :', err));
    });
  });
});