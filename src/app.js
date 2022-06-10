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
    "https://api.podio.com/item/app/24984980?limit=350"
  );
  const headers = [
    "Creado el",
    "Creado por",
    "Cliente",
    "Fecha de Finalización Estimada - P1",
    "Fecha de Finalización Efectiva - P1",
    "Consultor responsable",
    "Fecha de finalización estimada - P2",
    "Fecha Finalización P2",
    "Fecha de finalización estimada P3",
    "Fecha finalización P3",
    "Número de Proyecto en el que se encuentra la cuenta",
    "Estado",
    "Tipo de empresa",
    "País",
    "Expectativas y objetivo del proyecto",
  ];

  const fichacliente = [];

  items.data.items.forEach((item, index) => {
    const { fields } = item;
    let currentItem = [];
    currentItem.push({ title: "Creado el", value: item.created_on });
    currentItem.push({ title: "Creado por", value: item.created_by.name });
    Object.values(fields).forEach((field) => {
      if (headers[2] === field.label || headers[14] === field.label) {
        currentItem.push({ title: field.label, value: field.values[0].value });
      } else if (
        field.label === headers[5] ||
        field.label === headers[10] ||
        field.label === headers[11] ||
        field.label === headers[12] ||
        field.label === headers[13]
      ) {
        //console.log(field.text);
        currentItem.push({
          title: field.label,
          value: field.values[0].value.text,
        });
      } else if (
        field.label === headers[3] ||
        field.label === headers[4] ||
        field.label === headers[6] ||
        field.label === headers[7] ||
        field.label === headers[8] ||
        field.label === headers[9]
      ) {
        currentItem.push({
          title: field.label,
          value: field.values[0].start_date_utc,
        });
      }
    });

    let newItem = [];
    //console.table(currentItem);
    headers.forEach((header, index) => {
      let currentField = null;
      Object.values(currentItem).forEach((item) => {
        if (item.title === header) {
          currentField = item.value;
        }
      });

      if (!currentField) {
        newItem.push({ title: header, value: null });
      } else {
        newItem.push({ title: header, value: currentField });
      }

      /* 
      if (
        currentItem[index] === undefined ||
        currentItem[index].title !== header
      ) {
        newItem.push({ title: header, value: null });
      } else {
        newItem.push(currentItem[index]);
      } */
    });

    console.table(newItem);
    fichacliente.push([...newItem]);
  });

  res.send("completed");
});

app.get("/", (req, res) => {
  res.status(200).send("ok");
});

app.listen(3000, () => {});
