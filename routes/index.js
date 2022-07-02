var express = require("express");
var router = express.Router();
const fs = require("fs");

/* GET home page. */
// localhost:3000/api/pokemons?limit=20&page=5&type=grass&haha=lala
// localhost:3000/api/pokemons?type=grass
// localhost:3000/api/pokemons/1

router.get("/pokemons", function (req, res, next) {
  // res.status(200).send("Welcome to Coderschool!");
  try {
    let { page, limit, ...filterQuery } = req.query; //{ limit:"20", type: "grass"} => destructure {...rest}
    console.log("page", page); //undefined
    console.log("limit", limit);
    console.log("filterQuery", filterQuery); // {type: "grass", name:"lala", haha:"lala"}
    const allowFilter = ["type", "name"];

    //check if filterQuery match allowFilterQuerry
    for (let key of Object.keys(filterQuery)) {
      //["type","name", "haha"]
      if (!allowFilter.includes(key)) {
        throw new Error("Invalid filter query");
      }
    }
    //big O notation:
    //performance: time complexity, memory complexity

    page = parseInt(page) || 1; //1
    limit = parseInt(limit) || 10;
    let offset = limit * (page - 1);

    const allPokemons = fs.readFileSync("db.json", "utf8");
    let dbPokemons = JSON.parse(allPokemons);
    // console.log(dbPokemons);

    //filer with filterQuery
    for (let [key, value] of Object.entries(filterQuery)) {
      dbPokemons.data = dbPokemons.data.filter((pokemon) => {
        return pokemon[key].includes(value.toLowerCase());
      });
      console.log(dbPokemons);
    }

    // const { data } = dbPokemons;
    // const data = dbPokemons.data;
    dbPokemons.data = dbPokemons.data.slice(offset, offset + limit);
    res.status(200).send(dbPokemons);
  } catch (error) {
    next(error);
  }
});

//localhost:5000/api/pokemons/1
router.get("/pokemons/:id", function (req, res, next) {
  try {
    id = parseInt(req.params.id); //req ={params:{id:"1"}}
    const allPokemons = fs.readFileSync("db.json", "utf8");
    let dbPokemons = JSON.parse(allPokemons);

    // dbPokemons.data = dbPokemons.data.filter((pokemon) => {
    //   if (id === 1) {
    //     return (pokemon.id === id) | (pokemon.id === 721) | (pokemon.id === 2);
    //   }
    //   if (id === 721) {
    //     return (pokemon.id === id) | (pokemon.id === 720) | (pokemon.id === 1);
    //   }
    //   return (
    //     (pokemon.id === id) | (pokemon.id === id - 1) | (pokemon.id === id + 1)
    //   );
    // });

    let pokemonObj = {};
    let previousPokemon = {};
    let nextPokemon = {};

    if (id === 1) {
      previousPokemon = dbPokemons.data[720];
      nextPokemon = dbPokemons.data[1];
    } else if (id === 721) {
      previousPokemon = dbPokemons.data[719];
      nextPokemon = dbPokemons.data[0];
    } else {
      previousPokemon = dbPokemons.data[id - 2];
      nextPokemon = dbPokemons.data[id];
    }

    pokemonObj = {
      pokemon: dbPokemons.data[id - 1],
      previousPokemon: previousPokemon,
      nextPokemon: nextPokemon,
    };

    res.status(200).send(pokemonObj);
  } catch (error) {
    next(error);
  }
});

router.post("/pokemons", (req, res, next) => {
  try {
    // Front end request
    const { id, name, types, url } = req.body;

    // READ DB
    const allPokemons = fs.readFileSync("db.json", "utf8");
    let dbPokemons = JSON.parse(allPokemons);
    // VALIDATE DATA
    const validPokemonTypes = [
      "bug",
      "dragon",
      "fairy",
      "fire",
      "ghost",
      "ground",
      "normal",
      "psychic",
      "steel",
      "dark",
      "electric",
      "fighting",
      "flyingText",
      "grass",
      "ice",
      "poison",
      "rock",
      "water",
    ];

    //types length =0 =>
    if (!id || !name || !types?.length || !url) {
      const exception = new Error(`Missing required data`);
      exception.statusCode = 401;
      throw exception;
    }

    //types length>2 =>
    if (types.length > 2) {
      const exception = new Error(`Pokémon can only have one or two types.`);
      exception.statusCode = 401;
      throw exception;
    }
    const containAll = types.every((element) => {
      return validPokemonTypes.indexOf(element) !== -1;
    });
    // console.log(containAll);
    //invalid type
    if (!containAll) {
      const exception = new Error(`Pokémon’s type is invalid.`);
      exception.statusCode = 401;
      throw exception;
    }
    //id & name exists

    const existPokemon = dbPokemons.data.filter((pokemon) => {
      return (pokemon.id === parseInt(id)) & (pokemon.name === name);
    });

    console.log(existPokemon);

    //const x = arr.filter()
    if (existPokemon.length) {
      const exception = new Error(`The Pokémon already exists.`);
      exception.statusCode = 401;
      throw exception;
    }

    // ADD POKEMONS
    const newPokemon = { id, name, types, url };
    dbPokemons.data.push(newPokemon);

    // WRITE DB
    fs.writeFileSync("db.json", JSON.stringify(dbPokemons));

    // POST RESPONSE
    res.status(200).send({ message: "Pokemon created successfully" });
  } catch (error) {
    next(error);
  }
});

// UPDATE A SELECTED POKEMON
router.put("/pokemons/:id", (req, res, next) => {
  try {
    const allowUpdate = ["id", "name", "types", "url"];

    const { id, name, types, url } = req.params;
    const updates = req.body;

    // console.log(req.body);

    const updateKeys = Object.keys(updates);
    const notAllow = updateKeys.filter((el) => !allowUpdate.includes(el));

    if (notAllow.length) {
      const exception = new Error(`Update field not allow`);
      exception.statusCode = 401;
      throw exception;
    }
    // READ DB
    const allPokemons = fs.readFileSync("db.json", "utf8");
    let dbPokemons = JSON.parse(allPokemons);

    //find book by id
    const targetIndex = dbPokemons.data.findIndex(
      (pokemon) => pokemon.id === parseInt(id)
    );
    if (targetIndex < 0) {
      const exception = new Error(`Pokemon not found`);
      exception.statusCode = 404;
      throw exception;
    }
    //Update new content to db pokemon JS object
    const updatedPokemon = { ...dbPokemons.data[targetIndex], ...updates };
    dbPokemons.data[targetIndex] = updatedPokemon;
    dbPokemons = JSON.stringify(dbPokemons);
    fs.writeFileSync("db.json", dbPokemons);

    // POST RESPONSE
    res.status(200).send({ message: "Pokemon updated successfully" });
  } catch (error) {
    next(error);
  }
});

// DELETE A SELECTED POKEMON

router.delete("/pokemons/:id", (req, res, next) => {
  try {
    const { id, name, types, url } = req.params;
    // READ DB
    const allPokemons = fs.readFileSync("db.json", "utf8");
    let dbPokemons = JSON.parse(allPokemons);

    //find book by id
    const targetIndex = dbPokemons.data.findIndex(
      (pokemon) => pokemon.id === parseInt(id)
    );
    if (targetIndex < 0) {
      const exception = new Error(`Pokemon not found`);
      exception.statusCode = 404;
      throw exception;
    }

    //Delete pokemon from db
    dbPokemons.data = dbPokemons.data.filter((pokemon) => {
      return pokemon.id !== parseInt(id);
    });

    // WRITE DB
    fs.writeFileSync("db.json", JSON.stringify(dbPokemons));

    //delete send response
    res.status(200).send("delete success");
  } catch (error) {
    next(error);
  }
});

module.exports = router;
// 20 pokemons; page= 3  limit=20
// allPoke = [{},{}] 721 elements
// allPoke.slice(40, end)
// 1 : 0-19
// 2 : 20-39
// 3 : 40 -59

// total : 721 ; limit=20; page
// 1 -2 -3....-37
