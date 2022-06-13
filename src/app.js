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
    "https://api.podio.com/item/app/26520248?limit=500"
  );
  const headers = [
    "cliente",
    "Nº reuniones o demos realizados",
    "Nº propuestas realizadas",
    "Mes",
    "Semana - start",
    "Semana - end",
    "Reuniones generadas por: Outbound",
    "Reuniones en Argentina",
    "Cierres en Argentina",
    "Reuniones generadas por: Prospectin",
    "Reuniones en Chile",
    "Cierres en Chile",
    "Reuniones generadas por: Redes",
    "Reuniones en Colombia",
    "Cierres en Colombia",
    "Reuniones generadas por: Google Ads",
    "Reuniones en España",
    "Cierres en España",
    "Reuniones generadas por: Orgánico",
    "Reuniones en México",
    "Cierres en México",
    "Reuniones generadas por: Webinar /charla /similar",
    "Reuniones en Perú",
    "Cierres en Perú",
    "Reuniones generadas por: partners",
    "Reuniones en  USA",
    "Cierres en USA",
    "Reuniones generadas por: Referidos o contactos",
    "Reuniones en otros mercados",
    "Cierres en otros mercados",
    "Nº de cierres realizados",
  ];

  const fichacliente = [];

  items.data.items.forEach((item, index) => {
    const { fields } = item;
    let currentItem = [];
    /*  currentItem.push({
      title: "Creado el",
      value: item.created_on,
    }); */
    Object.values(fields).forEach((field) => {
      if (headers[3].trim() === field.label) {
        currentItem.push({
          title: headers[4],
          value: field.values[0].value.start_date_utc,
        });
        currentItem.push({
          title: field.label.trim(),
          value: field.values[0].value.text,
        });
      } else if (headers.includes(field.label.trim())) {
        if (field.values[0].value?.text) {
          currentItem.push({
            title: field.label.trim(),
            value: field.values[0].value.text,
          });
        } else if (field.values[0].value?.start_date_utc) {
          currentItem.push({
            title: field.label.trim(),
            value: field.values[0].value.start_date_utc,
          });
        } else if (field.values[0].start_date_utc) {
          currentItem.push({
            title: field.label.trim(),

            value: field.values[0].start_date_utc,
          });
        } else if (field.values[0].value) {
          currentItem.push({
            title: field.label.trim(),
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
