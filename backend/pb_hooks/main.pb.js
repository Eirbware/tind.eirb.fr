// gemini slop
onRecordAuthRequest((e) => {
  const parseGroups = (filePath) => {
    try {
      const lines = String.fromCharCode.apply(null, $os.readFile(filePath)).split('\n');
      const headers = lines[0].split(',');
      const acc = {};

      for (let i = 1; i < lines.length; i++) {
        const users = lines[i].split(',');

        // min() to avoid having user = undefined
        for (let j = 0; j < Math.min(headers.length, users.length); j++) {
          const user = users[j].trim();
          if (user === "")
            continue;

          acc[user] = headers[j];
        }
      }

      return acc;
    } catch (e) {
      console.log(e);
      return {};
    }
  }


  // WARNING: Les heures sont au format UTC donc heure reel = heure + 2
  const SHOTGUN_WAVES = {
    WEB: "2026-09-14 09:00:00",
    BUREAU_BDE: "2026-09-14 14:50:00",
    BDE: "2026-09-14 15:00:00",
    BAR: "2026-09-14 15:30:00",
    BUREAU_BAE: "2026-09-14 15:45:00",
    BDA: "2026-09-14 16:00:00",
    BDS: "2026-09-14 16:00:00",
  }

  const SHOTGUNW_DATE_FOR_OTHERS = "2026-09-15 17:00:00";
  const groupes = parseGroups("./pb_hooks/shotgun_groups.csv");

  // e.meta contains the OAuth2 provider data (if it was an OAuth2 login)
  if (e.meta && e.meta.rawUser) {
    const claims = e.meta.rawUser;
    let needsUpdate = false;

    // Map your custom claims
    if (claims.diplome) {
      e.record.set("diploma", claims.diplome);

      const AUTHORIZED_DIPLOMAS = [
        "IIEIN3", "IIEIN4", "IIEIN5",  // Infos 
        "IIETE3", "IIETE4", "IIETE5",  // Telecom
        "IIEMM3", "IIEMM4", "IIEMM5",  // MMK
        "IIEEL3", "IIEEL4", "IIEEL5",  // Elec
        "IAERI3", "IAERI4", "IAERI5",  // R&I
        "IAESE3", "IAESE4", "IAESE5"   // SEE
      ];

      console.log("feur");
      const DEROGATIONS = JSON.parse(String.fromCharCode.apply(null, $os.readFile("./pb_hooks/derogations.json")));
      console.log("feur");
      console.log(JSON.stringify(DEROGATIONS));

      if (!AUTHORIZED_DIPLOMAS.includes(claims.diplome)) {
        return c.json(403, {
          status: "error",
          message: "Vous n'êtes pas autorisé à vous connecter, seuls les 1A, 2A et 3A ont accès à cette application"
        })
      }

      console.log("feur");
      console.log(JSON.stringify(claims));
      console.log(claims.preferred_username);

      if (DEROGATIONS.hasOwnProperty(claims.preferred_username)) {
        console.log(DEROGATIONS[claims.preferred_username]);
        e.record.set("diploma", DEROGATIONS[claims.preferred_username]);
        needsUpdate = true;
      }

      // NOTE: commented because we'll change those manually in the DB directly instead of using a CSV
      // needsUpdate = true;
    }

    if (claims.nom_complet) {
      e.record.set("name", claims.nom_complet);
      needsUpdate = true;
    }

    if (claims.prenom) {
      e.record.set("firstName", claims.prenom);
      needsUpdate = true;
    }

    if (claims.nom) {
      e.record.set("lastName", claims.nom);
      needsUpdate = true;
    }

    const group = groupes[e.record.get("username")] ?? null;
    const shotgunDate = (group === null) ? SHOTGUNW_DATE_FOR_OTHERS : SHOTGUN_WAVES[group];

    if (!e.record.get("shotgunDate") || e.record.get("shotgunDate") != shotgunDate) {
      e.record.set("shotgunDate", shotgunDate);
      needsUpdate = true;
    }

    // Because v0.22 runs this hook AFTER the user is saved,
    // we must manually save the record to the database if we changed it.
    if (needsUpdate) {
      $app.dao().saveRecord(e.record);
    }
  }
}, "users"); // Replace "users" with your collection name if different

routerAdd("GET", "/api/fillots", (c) => {
  let idParrain = c.queryParam("idParrain");

  if (!idParrain || typeof idParrain !== 'string') {
    return c.json(400, {
      status: "error",
      message: "Requête invalide"
    });
  }

  const parrain = $app.dao().findRecordById("users", idParrain);

  if (!parrain) {
    return c.json(404, {
      status: "error",
      message: "Parrain introuvable"
    });
  }

  const parrainDiploma = parrain.get("diploma");

  const fillots = arrayOf(new Record());
  const fillotDiploma = parrainDiploma.slice(0, -1) + "3";


  $app.dao()
    .recordQuery("users")
    .where($dbx.exp("diploma = {:fillotDiploma}", { fillotDiploma }))
    .all(fillots);

  const fillotResponse = fillots.map(fillot => ({
    id: fillot.get("id"),
    firstName: fillot.get("firstName"),
    lastName: fillot.get("lastName"),
    diploma: fillot.get("diploma"),
    parrain: fillot.get("parrain"),
    infos: fillot.get("infos"),
  }));

  return c.json(200, {
    status: "success",
    fillots: fillotResponse
  });
});

routerAdd("GET", "/api/nbFillots", (c) => {
  let id = c.queryParam("id");
  if (!id | typeof id !== 'string') {
    return c.json(400, {
      status: "error",
      message: "Requête invalide"
    });
  }

  const fillots = arrayOf(new Record());
  $app.dao()
    .recordQuery("users")
    .where($dbx.exp("parrain = {:id}", { id }))
    .all(fillots);

  return c.json(200, {
    status: "success",
    nbfillots: fillots.length
  })

})

cronAdd("hello", "*/1 * * * *", () => {
  const config = arrayOf(new Record());
  $app.dao()
    .recordQuery("config")
    .where($dbx.exp("key = {:key}", { key: "TIME" }))
    .all(config);

  if (config.length > 0) {
    const now = new Date();
    const timezoneOffset = now.getTimezoneOffset() * 60000;
    const localISOTime = new Date(now - timezoneOffset).toISOString().slice(0, 19);

    config[0].set("value", localISOTime);

    $app.dao().saveRecord(config[0]);

    console.log("La clé 'TIME' a été mise à jour avec l'heure locale actuelle:", localISOTime);
  } else {
    console.log("La clé 'TIME' n'a pas été trouvée dans la table config.");
  }
});

routerAdd("POST", "/api/adoptFillot", (c) => {
  const body = JSON.parse(readerToString(c.request().body));
  const idParrain = body.idParrain;
  const idFillot = body.idFillot;

  if (!idParrain || typeof idParrain !== 'string' || !idFillot || typeof idFillot !== 'string') {
    return c.json(400, {
      status: "error",
      message: "Requête invalide"
    });
  }

  const fillot = $app.dao().findRecordById("users", idFillot);
  const parrain = $app.dao().findRecordById("users", idParrain);

  if (!fillot || !parrain) {
    return c.json(404, {
      status: "error",
      message: "Fillot ou Parrain introuvable"
    });
  }

  if (fillot.get("parrain") !== "") {
    return c.json(400, {
      status: "error",
      message: "Ce fillot a déjà un parrain."
    });
  }

  const MAX_FILLOTS = parseInt($app.dao().findFirstRecordByData("config", "key", "MAX_FILLOTS").get("value"));

  const fillots = arrayOf(new Record());
  $app.dao().recordQuery("users").where($dbx.exp("parrain = {:idParrain}", { idParrain })).all(fillots);

  if (fillots.length >= MAX_FILLOTS) {
    return c.json(400, {
      status: "error",
      message: "Ce parrain a déjà trop de fillots."
    });
  }

  const now = new Date($app.dao().findFirstRecordByData("config", "key", "TIME").get("value")).toISOString();;
  const shotgunDate = new Date(parrain.get("shotgunDate").toString().replace(" ", "T")).toISOString();

  if (shotgunDate > now) {
    return c.json(400, {
      status: "error",
      message: "La date de shotgun n'est pas encore passée."
    })
  }

  const parrainFiliere = parrain.get("diploma").substring(0, 5);
  const fillotFiliere = fillot.get("diploma").substring(0, 5);

  if (parrainFiliere !== fillotFiliere) {
    return c.json(400, {
      status: "error",
      message: "Le parrain et le fillot ne sont pas dans la même filière."
    });
  }

  const parrainYear = parrain.get("diploma").substring(5, 6);
  if (parrainYear !== "4") {
    return c.json(400, {
      status: "error",
      message: "Seuls les 2A peuvent parrainer."
    });
  }

  fillot.set("parrain", idParrain);
  $app.dao().saveRecord(fillot);

  return c.json(200, {
    status: "success",
    message: `Le fillot ${fillot.get("firstname")} ${fillot.get("lastname")} a été adopté par ${parrain.get("firstname")} ${parrain.get("lastname")}.`
  });
});
