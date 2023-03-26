const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "covid19India.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

/* API 1 */

app.get("/states/", async (request, response) => {
  const getqry = `
    SELECT 
        *
    FROM
        state;`;

  const getqryres = await db.all(getqry);
  response.send(getqryres.map((geteachqry) => getqrycheck(geteachqry)));
});

const getqrycheck = (getqryobj) => {
  return {
    stateId: getqryobj.state_id,
    stateName: getqryobj.state_name,
    population: getqryobj.population,
  };
};

/* API 2 */

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;

  const getsteqry = `
    SELECT 
        *
    FROM
        state
    WHERE
        state_id = ${stateId};`;

  const getsteres = await db.all(getsteqry);
  response.send(getsteres.map((eachste) => getqrycheck1(eachste)));
});

const getqrycheck1 = (getqryobj) => {
  return {
    stateId: getqryobj.state_id,
    stateName: getqryobj.state_name,
    population: getqryobj.population,
  };
};

/* API 3 */

app.post("/districts/", async (request, response) => {
  const districtdetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtdetails;

  const districtqry = `
    INSERT INTO
        district (district_name,state_id,cases,cured,active,deaths)
    VALUES
    (
        '${districtName}',
        '${stateId}',
        '${cases}',
        '${cured}',
        '${active}',
        '${deaths}'
    );`;

  const districtarr = await db.run(districtqry);
  response.send("District Successfully Added");
});

/* API 4 */

app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;

  const getdisqry = `
    SELECT 
        *
    FROM
        district
    WHERE
        district_id = ${districtId};`;

  const getdisres = await db.all(getdisqry);
  response.send(
    getdisres.map((eachdistrict) => getdistrictdetails(eachdistrict))
  );
});

const getdistrictdetails = (districtobj) => {
  return {
    districtId: districtobj.district_id,
    districtName: districtobj.district_name,
    stateId: districtobj.state_id,
    cases: districtobj.cases,
    cured: districtobj.cured,
    active: districtobj.active,
    deaths: districtobj.deaths,
  };
};

/* API 5 */
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;

  const deleteqry = `
    DELETE FROM
        district
    WHERE
        district_id = ${districtId};`;

  await db.run(deleteqry);
  response.send("District Removed");
});

/* API 6 */

app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const districtdetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtdetails;

  const updateqry = `
  UPDATE 
    district
SET
    district_name='${districtName}',
    state_id='${stateId}',
    cases='${cases}',
    cured='${cured}',
    active='${active}',
    deaths='${deaths}'
where 
    district_id =${districtId};`;

  const deleteArray = await db.run(updateqry);
  response.send("District Details Updated");
});

/*  API 8 */

app.get("/districts/:districtId/details/",async (request, response) => {
const { districtId } = request.params;
const getDistrictIdQuery = `
SELECT state_id from district
where district_id = ${districtId};
`;//With this we will get the state_id using district table
const getDistrictIdQueryResponse =await db.get(getDistrictIdQuery);

const getStateNameQuery = `
SELECT state_name as stateName from state
where state_id = ${getDistrictIdQueryResponse.state_id};
`;//With this we will get state_name as stateName using the state_id
const getStateNameQueryResponse =await db.get(getStateNameQuery);
response.send(getStateNameQueryResponse);});//sending the required response

module.exports = app;
