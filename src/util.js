import crypto from "crypto";

let cachedModelRefs = [];
const setCachedModelRefs = (newValue) => cachedModelRefs = newValue;

const cleanName = name => name.replace(/-/g, "");

const huntForPokemon = async (pokemonName, branchName) => {
  const speciesRoot = "common/src/main/resources/data/cobblemon/species";
  const data = await fetchDirectory(
    speciesRoot,
    branchName
  );
  for (let { name: folder } of data) {
    const response = await fetch(`https://gitlab.com/api/v4/projects/cable-mc%2Fcobblemon/repository/files/common%2Fsrc%2Fmain%2Fresources%2Fdata%2Fcobblemon%2Fspecies%2F${folder}%2F${cleanName(pokemonName)}.json?ref=${branchName}`);
    if (response.ok) {
      return `https://gitlab.com/cable-mc/cobblemon/-/blob/${branchName}/common/src/main/resources/data/cobblemon/species/${folder}/${cleanName(pokemonName)}.json`;
    }
  }
  throw new Error(`No species found for ${branchName}:${pokemonName}`);
};

const huntForSpawn = async (pokemonName, branchName) => {
  const number = await getNumberFromName(pokemonName);
  const filePath = `common/src/main/resources/data/cobblemon/spawn_pool_world/${number}_${cleanName(pokemonName)}.json?ref=${branchName}`;
  const response = await fetch(`https://gitlab.com/api/v4/projects/cable-mc%2Fcobblemon/repository/files/${filePath.replaceAll("/", "%2F")}`);
  if (response.ok) {
    return `https://gitlab.com/cable-mc/cobblemon/-/blob/${branchName}/${filePath}?ref_type=tags`;
  }
  throw new Error(`No spawn found for ${branchName}:${pokemonName}`);
};

const getNumberFromName = async (pokemonName) => {
  const response = await fetch("https://pokeapi.co/api/v2/pokemon/" + pokemonName);
  const data = await response.json();
  return `${data.id}`.padStart(4, "0");
};

const huntForModel = async (pokemonName, branchName) => {
  const number = await getNumberFromName(pokemonName);
  const filePath = `common/src/main/resources/assets/cobblemon/bedrock/pokemon/models/${number}_${cleanName(pokemonName)}/${pokemonName.replace(/-/g, "_")}.geo.json`;
  const response = await fetch(`https://gitlab.com/api/v4/projects/cable-mc%2Fcobblemon/repository/files/${filePath.replaceAll("/", "%2F")}?ref=${branchName}`);
  if (response.ok) {
    return `https://gitlab.com/cable-mc/cobblemon/-/blob/${branchName}/${filePath}?ref_type=tags`;
  }
  throw new Error(`No model found for ${branchName}:${pokemonName}`);
};

const huntForTexture = async (pokemonName, branchName) => {
  const currentKnownModels = [...cachedModelRefs];
  while (!currentKnownModels.some(({ name }) => name.endsWith(`${pokemonName}`))) {
    const data = await fetchDirectory(
      "common/src/main/resources/assets/cobblemon/textures/pokemon",
      branchName,
      { page: currentKnownModels.length / 20 + 1 }
    );
    if (!data?.length)
      throw new Error("Pokemon not found: " + pokemonName);
    currentKnownModels.push(...data);
  }
  setCachedModelRefs(currentKnownModels);
  return currentKnownModels.find(
    ({ name }) => name.endsWith(`${pokemonName}`)
  );
};

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
};

export { huntForPokemon, huntForSpawn, huntForModel, huntForTexture, isShiny, getTags };