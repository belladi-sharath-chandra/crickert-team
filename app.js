const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const path = require("path");
const dbpath = path.join(__dirname, "cricketTeam.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running");
    });
  } catch (e) {
    console.log(`DB ERROR: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjToResponseObj = (newObj) => {
  return {
    playerId: newObj.player_id,
    playerName: newObj.player_name,
    jerseyNumber: newObj.jersey_number,
    role: newObj.role,
  };
};

app.get("/players/", async (request, response) => {
  const getTeamQuery = `
        SELECT * FROM cricket_team ORDER By player_id;
    `;
  const playersArray = await db.all(getTeamQuery);
  response.send(
    playersArray.map((eachPlayer) => convertDbObjToResponseObj(eachPlayer))
  );
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
        SELECT * FROM cricket_team WHERE player_id = ${playerId}
    `;
  const player = await db.get(getPlayerQuery);
  response.send(convertDbObjToResponseObj(player));
});

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `
        INSERT INTO
            cricket_team(player_name,jersey_number,role)
        VALUES
         (
              '${playerName}',
               ${jerseyNumber},
               '${role}'
         );`;
  const dbResponse = await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

//PUT METHOD

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const putQuery = `
        UPDATE
            cricket_team
        SET
            player_name = '${playerName}',
            jersey_number = ${jerseyNumber},
            role = '${role}'
        WHERE
          player_id = ${playerId};`;
  await db.run(putQuery);
  response.send("Player Details Updated");
});
//DELETE METHOD

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteQuery = `
        DELETE FROM cricket_team WHERE player_id = ${playerId};            
`;
  await db.run(deleteQuery);
  response.send("Player Removed");
});
module.exports = app;
