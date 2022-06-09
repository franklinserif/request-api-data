const express = require("express");
const axios = require("axios");
const pool = require("./db/config");
const config = require("./config");
const app = express();

const { clientId, clientSecret, localTokenUrl, callbackUrl } = config;

const authUrl = `https://podio.com/oauth/authorize?client_id=${clientId}&redirect_uri=${localTokenUrl}&scope=app:read`;

async function auth(url) {
  const response = await axios.get(url);
  return response;
}

app.get("/auth", async (req, res) => {
  const response = await auth(authUrl);
  try {
    pool.query(
      "SELECT * FROM ficha_de_cliente",
      function (error, results, fields) {
        if (error) throw error;
        //console.log("sql query result: ", results[0]);
      }
    );
  } catch (error) {
    console.log(`mysql error: ${error}`);
  }

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

  const items = await axiosAuth.get(
    "https://api.podio.com/item/app/25014884?limit=500"
  );
  const headers1 = [221515173];

  const fichacliente = [];

  items.data.items.forEach((item, index) => {
    const { fields } = item;
    let currentItem = [];
    Object.values(fields).forEach((field) => {
      if (headers[0] === field.field_id) {
        currentItem.push({
          title: field.field_id,
          value: field.values[0].start_date_utc,
        });
      } else if (headers.includes(field.field_id)) {
        currentItem.push({
          title: field.field_id,
          value: field.values[0].value.text,
        });
      }
      // console.log(`label : ${field.label} value: ${field.values["0"].value}`);
    });

    let newItem = [];

    headers.forEach((header, index) => {
      if (
        currentItem[index] === undefined ||
        currentItem[index].title !== header
      ) {
        newItem.push({ title: header, value: null });
      } else {
        newItem.push(currentItem[index]);
      }
    });
    console.table(newItem);
    fichacliente.push([...newItem]);
  });

  res.send("cool");
});

app.get("/", (req, res) => {
  res.status(200).send("ok");
});

app.listen(3000, () => {});
