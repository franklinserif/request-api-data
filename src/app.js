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
  const headers = [
    "Creado el",
    "Empresa",
    "Fecha de encuesta",
    "¿Cuál es la probabilidad de que recomiendes nuestro servicio a otra empresa?",
    "¿Qué tan satisfecho/a estas con el avance del proyecto en función de los objetivos planteados y los desafíos de tu empresa?",
    "¿Qué tan satisfecho/a estas con el direccionamiento del proyecto por parte del consultor/a?",
    "¿Qué tan satisfecho/a estás con el plan de trabajo de  este mes?",
    "¿Cómo evalúas la implementación por parte de tu empresa de las estrategias sugeridas por ArchGroup este mes?",
  ];

  const fichacliente = [];

  items.data.items.forEach((item, index) => {
    const { fields } = item;
    let currentItem = [];
    currentItem.push({ title: "Creado el", value: item.created_on });

    Object.values(fields).forEach((field) => {
      if (headers.includes(field.label)) {
        if (field.values[0].value?.text) {
          currentItem.push({
            title: field.label,
            value: field.values[0].value.text,
          });
        } else if (field.values[0].value?.start_date_utc) {
          currentItem.push({
            title: field.label,
            value: field.values[0].value.start_date_utc,
          });
        } else if (field.values[0].value) {
          currentItem.push({
            title: field.label,
            value: field.values[0].value,
          });
        }
      }
    });

    let newItem = [];

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
