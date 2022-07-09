const fs = require("fs");
const csv = require("csvtojson");
const { start } = require("repl");

require("dotenv").config();
const PORT = process.env.PORT;

const createProduct = async () => {
  let newData = await csv().fromFile("./datasets/pokemon2.csv"); // this is an array
  // let newData = await csv().fromFile("./datasets/Pokemon.csv"); // this is an array
  newData = Array.from(newData);
  // console.log(newData);

  newData = newData
    .map((e, index) => {
      return {
        id: index + 1,
        name: e.Name,
        types: [e.Type1?.toLowerCase(), e.Type2?.toLowerCase()],
        // types: [e.Type1, e.Type2],
        url: `http://localhost:${PORT}/pokepic/${index + 1}.jpg`,
      };
    })
    .filter((e) => e.name !== "")
    .map((e) => {
      e.types = e.types.filter((type) => {
        // console.log(type);
        return type !== undefined;
      });
      return e;
    })
    .slice(0, 721);

  let data = JSON.parse(fs.readFileSync("./db.json"));

  data.data = newData;
  data.totalPokemons = newData.length;
  // before write to db.json, convert data to JSON string
  fs.writeFileSync("db.json", JSON.stringify(data));
  // console.log(newData);
};

createProduct();
