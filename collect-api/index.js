const axios = require("axios");
const cheerio = require("cheerio");
const readline = require("readline");
const mongoose = require("mongoose");
const express = require("express");
const requireDir = require("require-dir");
const cors = require("cors");
const config = require("./src/config/config");

const endereco = axios.create({
  baseURL: "http://localhost:3001",
});

const url = config.URI_MONGO;
const options = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
};

mongoose.set("useCreateIndex", true);
mongoose.connect(url, options);
module.exports = mongoose;

const app = express();
app.use(express.json());
app.use(cors());
requireDir("./src/models");
app.use("/sistema", require("./src/routes/routes"));
var server = app.listen(3001);

let arrayLinks = [];
let linksVerificados = [];

coletarLinks = async (url) => {
  let newUrl = url;
  let protocol = "http://";
  if (newUrl.includes("http://")) {
    newUrl = newUrl.replace("http://", "");
  }
  if (newUrl.includes("https://")) {
    newUrl = newUrl.replace("https://", "");
    protocol = "https://";
  }

  newUrl = protocol + newUrl.substr(0, newUrl.indexOf("/"));

  let siteInfo = url.split("/");
  siteInfo = siteInfo[2];

  arrayLinks = arrayLinks.filter((item) => {
    return item !== url;
  });

  linksVerificados.push(url);

  let linksColetados = [];

  try {
    const page = await axios.get(url);

    var $ = cheerio.load(page.data);

    const links = $("a");

    await $(links).each((i, link) => {
      const href = $(link).attr("href");
      if (href.includes("http")) {
        if (href.includes(siteInfo)) {
          let count = 0;
          arrayLinks.map((item) => {
            if (item === href) {
              ++count;
            }
          });
          linksVerificados.map((item) => {
            if (item === href) {
              ++count;
            }
          });
          if (count === 0) {
            linksColetados.push(href);
          }
        }
      } else {
        if (
          !href.includes("mailto:") &&
          !href.includes("ftp:") &&
          href.substring(0, 1) !== "#" &&
          !href.includes("javascript:") &&
          !href.includes(".jpg")
        ) {
          let newHref = "";
          if (href.substring(0, 1) === "/") {
            newHref = newUrl + href;
          } else {
            newHref = newUrl + "/" + href;
          }

          let count = 0;
          arrayLinks.map((item) => {
            if (item === newHref) {
              ++count;
            }
          });
          linksVerificados.map((item) => {
            if (item === newHref) {
              ++count;
            }
          });
          if (count === 0) {
            linksColetados.push(newHref);
          }
        }
      }
    });

    return linksColetados;
  } catch (err) {
    return [];
  }
};

//Main code
(async () => {
  const input = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("===============================================");
  console.log("Collect Web Links");
  console.log("===============================================");

  //url de teste = "http://testphp.vulnweb.com/";

  input.question(
    "Digite o site a ser coletados as URL's: ",
    async (resposta) => {
      urlInicial = resposta;

      if (urlInicial.includes("http://") || urlInicial.includes("https://")) {
        arrayLinks = await coletarLinks(urlInicial);
        console.log("\nBuscando links no site...");
        console.log("\nItens iniciais:", arrayLinks.length);

        do {
          await Promise.all(
            await arrayLinks.map(async (item) => {
              const respostaArray = await coletarLinks(item);
              if (respostaArray.length > 0) {
                console.log(
                  "Adicionado mais " + respostaArray.length + " links."
                );
              }
              arrayLinks.push(...respostaArray);
            })
          );
        } while (arrayLinks.length !== 0);

        console.log("===============================================");
        console.log("\nLinks Encontrados:" + linksVerificados.length + "links");
        console.log("\n===============================================");
      } else {
        console.log("\nUrl inválida, execute 'node index.js' novamente..");
        process.exit();
      }

      input.question(
        "\nDeseja salvar os links no Banco de Dados? Digite 'S' ou 'N'...: ",
        async (resposta3) => {
          resp3 = resposta3;

          if (
            resp3 === "sim" ||
            resp3 === "s" ||
            resp3 === "Sim" ||
            resp3 === "SIM"
          ) {
            await endereco.post("/sistema/link", {
              url: linksVerificados.join(),
            });
            console.log("\n===============================================");
            console.log("\nLinks salvos no Banco de Dados");
            console.log("\n===============================================");
          } else {
          }
          input.question(
            "\nDeseja imprimir todos os links salvos no Banco de Dados? Digite 'S' ou 'N'...: ",
            async (resposta2) => {
              resp2 = resposta2;

              if (
                resp2 === "sim" ||
                resp2 === "s" ||
                resp2 === "Sim" ||
                resp2 === "SIM"
              ) {
                let temp = [];
                temp = await endereco.get("/sistema/list");
                console.log(temp.data);
              } else {
                input.close();
                process.exit();
              }

              process.exit();
            }
          );
        }
      );
    }
  );
})();
