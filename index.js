const fs = require("fs"),
  fsProm = require("fs/promises"),
  path = require("path"),
  parser = require("ua-parser-js"),
  lineByLine = require("n-readlines"),
  createCsvWriter = require("csv-writer").createObjectCsvWriter,
  colors = require("colors");

const fileName = "./log/gobankingrates-short.log";
const stats = fs.statSync(fileName);

/* Connection to geolite.info (LIMIT OF 1000 queries for a day) */
const WebServiceClient = require("@maxmind/geoip2-node").WebServiceClient;
const client = new WebServiceClient("723917", "5X0g2mEX0Pf426OS", {
  host: "geolite.info",
});

if (stats.size === 0) {
  console.log("The log file is empty");
  process.exit();
}

/* FUNCTIONS */
async function getCityInfo(ipAddress) {
  try {
    return await client.city(ipAddress).then((response) => {
      return response;
    });
  } catch (e) {
    console.log("An error occurred while obtaining the information: ", e);
  }
}

function uaConverter(uaString) {
  const info = parser(uaString);

  let deviceType = info.device["type"],
    browser = info.browser["name"];

  if (info.device["type"] === undefined) {
    deviceType = "unknown";
  }
  if (info.browser["name"] === undefined) {
    browser = "unknown";
  }

  return {
    deviceType: deviceType,
    browser: browser,
  };
}

async function appendFile(filePath, content) {
  try {
    await fsProm.appendFile(filePath, content + "\n");
    console.log(
      `Write in file ${path.basename(filePath)} successfully.`.green,
      content.blue
    );
  } catch (err) {
    console.log(err);
  }
}

async function genCSVFile() {
  const liner = new lineByLine(`./log/geodevice${path.basename(fileName)}`);
  let line,
    lineNumber = 0;

  const records = [];

  const header = [
    {
      id: "ip",
      title: "IP",
    },
    {
      id: "deviceType",
      title: "Device Type",
    },
    {
      id: "browser",
      title: "Browser",
    },
    {
      id: "country",
      title: "Country",
    },
    {
      id: "city",
      title: "City",
    },
  ];

  while ((line = liner.next())) {
    const strLine = line.toString("ascii");
    const ip = strLine.match(/[0-9]+(?:\.[0-9]+){3}/)[0];
    const strSplit = strLine.split('"');

    const obj = {
      ip: ip,
      deviceType: strSplit[7],
      browser: strSplit[9],
      country: strSplit[11],
      city: strSplit[13],
    };

    records[records.length] = obj;

    lineNumber++;
  }

  const csvWriter = createCsvWriter({
    path: `./csv/${path.basename(fileName)}.csv`,
    header: header,
  });

  try {
    await csvWriter.writeRecords(records);
    console.log(`${path.basename(fileName)}.csv file generated.`.yellow);
  } catch (e) {
    console.log(e);
  }
}

async function readWriteFiles(fileName) {
  const liner = new lineByLine(fileName);
  let line,
    lineNumber = 0;

  while ((line = liner.next())) {
    const strLine = line.toString("ascii"),
      arrLine = strLine.split('"'),
      ip = arrLine[0].split(" ")[0];

    const uaInfo = await getCityInfo(ip);

    const arrTrackedInfo = {
      deviceType: uaConverter(arrLine[5]).deviceType,
      browser: uaConverter(arrLine[5]).browser,
      country: uaInfo?.country
        ? uaInfo?.country.names.en || Object.values(uaInfo?.country.names)
        : "unknown",
      city: uaInfo?.city
        ? uaInfo?.city.names.en || Object.values(uaInfo?.city.names)[0]
        : "unknown",
    };

    newLine =
      strLine +
      ` "${arrTrackedInfo.deviceType}" "${arrTrackedInfo.browser}" "${arrTrackedInfo.country}" "${arrTrackedInfo.city}"`;

    await appendFile(`./log/geodevice${path.basename(fileName)}`, newLine);

    lineNumber++;
  }

  await genCSVFile(`./csv/${fileName}.csv`);
}

readWriteFiles(fileName);
