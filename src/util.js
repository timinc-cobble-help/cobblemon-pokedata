import crypto from "crypto";

let cachedPokemonRefs = [];
const setCachedPokemonRefs = (newValue) => cachedPokemonRefs = newValue;

let cachedSpawnRefs = [];
const setCachedSpawnRefs = (newValue) => cachedSpawnRefs = newValue;

let cachedModelRefs = [];
const setCachedModelRefs = (newValue) => cachedModelRefs = newValue;

const huntForPokemon = async (pokemonName, branchName) => {
  const currentKnownPokemon = [...cachedPokemonRefs];
  while (
    !currentKnownPokemon.some(({ name }) => name === `${pokemonName}.json`)
  ) {
    const data = await fetchDirectory(
      "common/src/main/resources/data/cobblemon/species",
      branchName,
      { page: currentKnownPokemon.length / 20 + 1, recursive: true }
    );
    if (!data?.length)
      throw new Error("Pokemon not found: " + pokemonName);
    currentKnownPokemon.push(...data);
  }
  setCachedPokemonRefs(currentKnownPokemon);
  return currentKnownPokemon.find(
    ({ name }) => name === `${pokemonName}.json`
  );
}

const huntForSpawn = async (pokemonName, branchName) => {
  const currentKnownSpawns = [...cachedSpawnRefs];
  while (
    !currentKnownSpawns.some(({ name }) => name.endsWith(`${pokemonName}.json`))
  ) {
    const data = await fetchDirectory(
      "common/src/main/resources/data/cobblemon/spawn_pool_world",
      branchName,
      { page: currentKnownSpawns.length / 20 + 1, recursive: true }
    );
    if (!data?.length)
      throw new Error("Pokemon not found: " + pokemonName);
    currentKnownSpawns.push(...data);
  }
  setCachedSpawnRefs(currentKnownSpawns);
  return currentKnownSpawns.find(
    ({ name }) => name.endsWith(`${pokemonName}.json`)
  );
}

const huntForModel = async (pokemonName, branchName) => {
  const currentKnownModels = [...cachedModelRefs];
  while (!currentKnownModels.some(({ name }) => name.endsWith(`${pokemonName}`))) {
    const data = await fetchDirectory(
      "common/src/main/resources/assets/cobblemon/bedrock/pokemon/models",
      branchName,
      { page: currentKnownModels.length / 20 + 1, recursive: true }
    )
    if (!data?.length)
      throw new Error("Pokemon not found: " + pokemonName)
    currentKnownModels.push(...data);
  }
  setCachedModelRefs(currentKnownModels);
  return currentKnownModels.find(
    ({ name }) => name.endsWith(`${pokemonName}`)
  )
}

const huntForTexture = async (pokemonName, branchName) => {
  const currentKnownModels = [...cachedModelRefs];
  while (!currentKnownModels.some(({ name }) => name.endsWith(`${pokemonName}`))) {
    const data = await fetchDirectory(
      "common/src/main/resources/assets/cobblemon/textures/pokemon",
      branchName,
      { page: currentKnownModels.length / 20 + 1, recursive: true }
    )
    if (!data?.length)
      throw new Error("Pokemon not found: " + pokemonName)
    currentKnownModels.push(...data);
  }
  setCachedModelRefs(currentKnownModels);
  return currentKnownModels.find(
    ({ name }) => name.endsWith(`${pokemonName}`)
  )
}

async function fetchDirectory(
  dirname,
  branch = "main",
  { page = 1, recursive = false, pageSize = 20 } = {}
) {
  const response = await fetch(
    `https://gitlab.com/api/v4/projects/cable-mc%2Fcobblemon/repository/tree?id=cable-mc%2Fcobblemon&page=${page}&pagination=keyset&path=${dirname.replaceAll(
      "/",
      "%2F"
    )}&per_page=${pageSize}&recursive=${recursive}&ref=${branch}`
  );
  const data = await response.json();
  return data;
}

const alwaysShinyFor = ["139558026100211712", "180548391158153216"];
function isShiny(unixTimestamp, userMention) {
  if (!unixTimestamp || !userMention) return false;
  const possiblyUserIdContainingThing = userMention.match(/<@([a-zA-Z0-9]+)>/);
  if (!possiblyUserIdContainingThing) {
    return false;
  }
  const userId = possiblyUserIdContainingThing[1];
  if (alwaysShinyFor.includes(userId)) {
    return true;
  }

  // Combine the Unix timestamp and the user's alphanumeric ID
  const inputString = `${unixTimestamp}-${userId}`;

  // Hash the combined string using SHA-256
  const hash = crypto.createHash('sha256').update(inputString).digest('hex');

  // Convert the first (or any) 8 characters of the hash to an integer
  // Note: This is for demonstration; different approaches can be used for conversion
  const hashSegment = hash.substring(0, 8);
  const randomNumber = parseInt(hashSegment, 16);

  // Perform the modulo operation to determine if it's shiny
  return randomNumber % (isWeekend(unixTimestamp) ? 4098 : 8196) === 0;
}

function isWeekend(unixTimestamp) {
  // Convert the Unix timestamp to milliseconds (JavaScript Date works in milliseconds)
  const date = new Date(unixTimestamp * 1000);

  // Get the day of the week
  const dayOfWeek = date.getDay();

  // Check if it's a weekend (0 for Sunday or 6 for Saturday)
  return dayOfWeek === 0 || dayOfWeek === 6;
}

const getTags = async () => {
    const response = await fetch(`https://gitlab.com/api/v4/projects/cable-mc%2Fcobblemon/repository/tags?id=cable-mc%2Fcobblemon`);
    const data = await response.json();
    return data;
}

export { huntForPokemon, huntForSpawn, huntForModel, huntForTexture, isShiny, getTags }