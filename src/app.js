const express = require("express");
const axios = require("axios");
const pool = require("./db/config");
const config = require("./config");
const fs = require("fs");
const app = express();

const { clientId, clientSecret, localTokenUrl, callbackUrl } = config;

const authUrl = `https://podio.com/oauth/authorize?client_id=${clientId}&redirect_uri=${localTokenUrl}&scope=app:read`;

async function auth(url) {
  const response = await axios.get(url);
  return response;
}

app.get("/auth", async (req, res) => {
  const response = await auth(authUrl);

  res.redirect(response.request.res.responseUrl);
});

app.get("/token", async (req, res) => {
  const { code } = req.query;

  const response = await axios({
    method: "post",
    url: `https://api.podio.com/oauth/token?grant_type=authorization_code&client_id=${clientId}&redirect_uri=${callbackUrl}&client_secret=${clientSecret}&code=${code}`,
  });

  const { access_token } = response.data;

  const axiosAuth = axios.create({
    headers: { Authorization: "Bearer " + access_token },
  });

  await axiosAuth({
    method: "get",
    url: "https://api.podio.com//item/app/25014884/xlsx",
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
    mode: "cors",
    responseType: "arraybuffer",
  }).then((buffer) => {
    const outputFilename = "encuesta-cliente.xlsx";
    fs.writeFileSync(outputFilename, buffer.data);
  });

  res.send("completed");
});

app.get("/", (req, res) => {
  res.status(200).send("ok");
});

app.listen(3000, () => {});
