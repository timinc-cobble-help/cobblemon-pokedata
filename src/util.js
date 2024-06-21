const cleanName = (name) => name.replace(/-/g, "");

const huntForPokemon = async (pokemonName, branchName) => {
  const speciesRoot = "common/src/main/resources/data/cobblemon/species";
  const data = await fetchDirectory(speciesRoot, branchName);
  for (let { name: folder } of data) {
    const response = await fetch(
      `https://gitlab.com/api/v4/projects/cable-mc%2Fcobblemon/repository/files/common%2Fsrc%2Fmain%2Fresources%2Fdata%2Fcobblemon%2Fspecies%2F${folder}%2F${cleanName(
        pokemonName
      )}.json?ref=${branchName}`
    );
    if (response.ok) {
      const data = await response.json();
      return {
        url: `https://gitlab.com/cable-mc/cobblemon/-/blob/${branchName}/common/src/main/resources/data/cobblemon/species/${folder}/${cleanName(
          pokemonName
        )}.json`,
        content: JSON.parse(atob(data.content)),
      };
    }
  }
  throw new Error(`No species found for ${branchName}:${pokemonName}`);
};

const huntForSpawn = async (pokemonName, branchName) => {
  const number = await getNumberFromName(pokemonName);
  const filePath = `common/src/main/resources/data/cobblemon/spawn_pool_world/${number}_${cleanName(
    pokemonName
  )}.json?ref=${branchName}`;
  const response = await fetch(
    `https://gitlab.com/api/v4/projects/cable-mc%2Fcobblemon/repository/files/${filePath.replaceAll(
      "/",
      "%2F"
    )}`
  );
  if (response.ok) {
    return `https://gitlab.com/cable-mc/cobblemon/-/blob/${branchName}/${filePath}?ref_type=tags`;
  }
  throw new Error(`No spawn found for ${branchName}:${pokemonName}`);
};

const specialNameNumbers = {
  mimikyu: "0778",
  basculin: "0550"
};
const getNumberFromName = async (pokemonName) => {
  if (pokemonName in specialNameNumbers) {
    return specialNameNumbers[pokemonName];
  }
  const response = await fetch(
    "https://pokeapi.co/api/v2/pokemon/" + pokemonName
  );
  const data = await response.json();
  return `${data.id}`.padStart(4, "0");
};

const huntForModel = async (pokemonName, branchName) => {
  const number = await getNumberFromName(pokemonName);
  const filePath = `common/src/main/resources/assets/cobblemon/bedrock/pokemon/models/${number}_${cleanName(
    pokemonName
  )}`;
  const response = await fetch(
    `https://gitlab.com/api/v4/projects/cable-mc%2Fcobblemon/repository/tree/?path=${filePath}&ref=${branchName}`
  );
  if (response.ok) {
    return `https://gitlab.com/cable-mc/cobblemon/-/blob/${branchName}/${filePath}?ref_type=tags`;
  }
  throw new Error(`No model found for ${branchName}:${pokemonName}`);
};

const huntForTexture = async (pokemonName, branchName) => {
  const number = await getNumberFromName(pokemonName);
  const filePath = `common/src/main/resources/assets/cobblemon/textures/pokemon/${number}_${cleanName(
    pokemonName
  )}`;
  const response = await fetch(
    `https://gitlab.com/api/v4/projects/cable-mc%2Fcobblemon/repository/tree/?path=${filePath}&ref=${branchName}`
  );
  if (response.ok) {
    return `https://gitlab.com/cable-mc/cobblemon/-/blob/${branchName}/${filePath}?ref_type=tags`;
  }
  throw new Error(`No model found for ${branchName}:${pokemonName}`);
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

const getTags = async () => {
  const response = await fetch(
    `https://gitlab.com/api/v4/projects/cable-mc%2Fcobblemon/repository/tags?id=cable-mc%2Fcobblemon`
  );
  const data = await response.json();
  return data;
};

export { huntForPokemon, huntForSpawn, huntForModel, huntForTexture, getTags };
