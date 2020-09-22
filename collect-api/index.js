const axios = require("axios");
const cheerio = require("cheerio");
const readline = require("readline");
const mongoose = require('mongoose');
const express = require('express');
const requireDir = require('require-dir');
const cors = require('cors');
const config = require('./src/config/config');

const url = config.URI_MONGO;
const options = {
  useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}
dasdas
mongoose.set('useCreateIndex', true);

mongoose
    .connect(url, options)
    // .then(() => console.log('Mongo is ready'))
    // .catch(err => console.log('mongo avec error', err))


// mongoose.Promise = global.Promise

module.exports = mongoose

//let urlInicial = "http://testphp.vulnweb.com/";

const app = express();
app.use(express.json());
app.use(cors());


requireDir('./src/models');

app.use('/sistema', require('./src/routes/routes'));
app.listen(3001);

const endereco = axios.create({
  baseURL: 'http://localhost:3001'
})


let arrayLinks = [];
let linksVerificados = [];


coletarLinks = async url => {
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

  arrayLinks = arrayLinks.filter(item => {
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
          arrayLinks.map(item => {
            if (item === href) {
              ++count;
            }
          });
          linksVerificados.map(item => {
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
          arrayLinks.map(item => {
            if (item === newHref) {
              ++count;
            }
          });
          linksVerificados.map(item => {
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
    output: process.stdout
  });

  console.log("===============================================");
  console.log("Collect Web Links");
  console.log("===============================================");

  input.question("Digite o site a ser coletados as URL's: ", async resposta => {
    urlInicial = resposta;

    if (urlInicial.includes("http://") || urlInicial.includes("https://")) {
      arrayLinks = await coletarLinks(urlInicial);
      console.log("\nBuscando links no site...");
      console.log("\nItens iniciais:", arrayLinks.length);

      do {
        await Promise.all(
          await arrayLinks.map(async item => {
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

      console.log("\nLinks Encontrados:");
      console.log(linksVerificados);

      try{
        
        await 'http://localhost:3001'.post('/link/sistema',{
          linksVerificados,
      });

      }catch(err){
        console.log('nao deu bom');
      }

      
    } else {
      console.log("Url inválida");
    }

    input.close();
  });
})();