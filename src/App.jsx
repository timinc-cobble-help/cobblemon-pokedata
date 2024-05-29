import { useCallback, useEffect, useMemo, useState } from "react";
import "./style.scss";
import useFormEntry from "./hooks/useFormEntry";
import {
  getTags,
  huntForModel,
  huntForPokemon,
  huntForSpawn,
  huntForTexture,
} from "./util";
import Input from "./components/Input";
import { useSearchParams } from "react-router-dom";

const notFound = "notFound";

function App() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pokemonName, setPokemonName, pokemonNameRegistration] = useFormEntry(
    searchParams.get("name") || ""
  );
  const [tag, setTag, tagRegistration] = useFormEntry(
    searchParams.get("tag") || ""
  );
  const [tags, setTags] = useState(null);
  const [species, setSpecies] = useState(null);
  const [spawn, setSpawn] = useState(null);
  const [model, setModel] = useState(null);
  const [texture, setTexture] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getTags().then((e) => {
      setTags(e);
      if (tag === "") {
        tag.setValue(e[0].name);
      }
    });
  }, [tag]);

  const updateSpawn = useCallback(async () => {
    try {
      const spawnData = await huntForSpawn(pokemonName, tag);
      setSpawn(spawnData.path);
    } catch (error) {
      setSpawn(notFound);
    }
  }, [pokemonName, tag]);

  const updateSpecies = useCallback(async () => {
    try {
      const speciesData = await huntForPokemon(pokemonName, tag);
      setSpecies(speciesData.path);
    } catch (error) {
      setSpecies(notFound);
    }
  }, [pokemonName, tag]);

  const updateModel = useCallback(async () => {
    try {
      const modelData = await huntForModel(pokemonName, tag);
      setModel(modelData.path);
    } catch (error) {
      setModel(notFound);
    }
  }, [pokemonName, tag]);

  const updateTexture = useCallback(async () => {
    try {
      const textureData = await huntForTexture(pokemonName, tag);
      setTexture(textureData.path);
    } catch (error) {
      setTexture(notFound);
    }
  }, [pokemonName, tag]);

  const handleSearch = useCallback(async () => {
    setLoading(true);
    setSearchParams({
      tag: tag,
      name: pokemonName,
    });
    await Promise.all([
      updateSpawn(),
      updateSpecies(),
      updateModel(),
      updateTexture(),
    ]);
    setLoading(false);
  }, [updateSpawn, updateSpecies, updateModel, updateTexture]);

  return (
    <div id="pico-root">
      <header>
        <h1>Cobblemon Pokedata Lookup</h1>
      </header>
      <main>
        <Input
          label="1) Enter the name of the Pokemon species you would like information on and the version you're playing"
          btn={{
            label: "Search",
            onClick: handleSearch,
          }}
          loading={loading}
          {...pokemonNameRegistration}
        >
          <select {...tagRegistration} disabled={loading}>
            {tags?.map(({ name }) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </Input>
        {species &&
          (species === notFound ? (
            <div>Could not find species data</div>
          ) : (
            <div>
              <a
                href={`https://gitlab.com/cable-mc/cobblemon/-/tree/${tag}/${species}`}
                target="_blank"
                rel="noreferrer"
              >
                Species Data
              </a>
            </div>
          ))}
        {spawn &&
          (spawn === notFound ? (
            <div>Could not find spawn data</div>
          ) : (
            <div>
              <a
                href={`https://gitlab.com/cable-mc/cobblemon/-/tree/${tag}/${spawn}`}
                target="_blank"
                rel="noreferrer"
              >
                Spawn Data
              </a>
            </div>
          ))}
        {model &&
          (model === notFound ? (
            <div>Could not find model data</div>
          ) : (
            <div>
              <a
                href={`https://gitlab.com/cable-mc/cobblemon/-/tree/${tag}/${model}`}
                target="_blank"
                rel="noreferrer"
              >
                Model Data
              </a>
            </div>
          ))}
        {texture &&
          (texture === notFound ? (
            <div>Could not find texture data</div>
          ) : (
            <div>
              <a
                href={`https://gitlab.com/cable-mc/cobblemon/-/tree/${tag}/${texture}`}
                target="_blank"
                rel="noreferrer"
              >
                Texture Data
              </a>
            </div>
          ))}
      </main>
      <footer></footer>
    </div>
  );
}

export default App;
