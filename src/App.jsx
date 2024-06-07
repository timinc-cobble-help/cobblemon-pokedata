import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
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
import coinJar from "./assets/Ko-fi_COIN.gif";
import SpeciesData from "./components/views/SpeciesData";
import { notFound } from "./constants";

const staticBranches = ["1.3.0", "1.3.1", "1.4.0", "1.4.0a", "1.4.1"].reverse();

function App() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pokemonName, _setPokemonName, pokemonNameRegistration] = useFormEntry(
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
  const [cookieEaten, setCookieEaten] = useState(false);

  const cleanPokemonName = useMemo(
    () =>
      pokemonName
        .replace(/\s+/g, " ")
        .replace(/\s/g, "-")
        .replace(/[^a-zA-Z0-9_-]/g, "")
        .toLowerCase(),
    [pokemonName]
  );

  useEffect(() => {
    getTags().then((e) => {
      setTags([...e.map(({ name }) => name), ...staticBranches]);
      if (tag === "") {
        setTag(e[0].name);
      }
    });
  }, [setTag, tag]);

  const updateSpawn = useCallback(async () => {
    try {
      setSpawn(null);
      const spawnData = await huntForSpawn(cleanPokemonName, tag);
      setSpawn(spawnData);
    } catch (error) {
      setSpawn(notFound);
    }
  }, [cleanPokemonName, tag]);

  const updateSpecies = useCallback(async () => {
    try {
      setSpecies(null);
      const speciesData = await huntForPokemon(cleanPokemonName, tag);
      setSpecies(speciesData);
    } catch (error) {
      setSpecies(notFound);
    }
  }, [cleanPokemonName, tag]);

  const updateModel = useCallback(async () => {
    try {
      setModel(null);
      const modelData = await huntForModel(cleanPokemonName, tag);
      setModel(modelData);
    } catch (error) {
      setModel(notFound);
    }
  }, [cleanPokemonName, tag]);

  const updateTexture = useCallback(async () => {
    try {
      setTexture(null);
      const textureData = await huntForTexture(cleanPokemonName, tag);
      setTexture(textureData);
    } catch (error) {
      setTexture(notFound);
    }
  }, [cleanPokemonName, tag]);

  const handleSearch = useCallback(async () => {
    setLoading(true);
    setSearchParams({
      tag: tag,
      name: cleanPokemonName,
    });
    await Promise.all([
      updateSpawn(),
      updateSpecies(),
      updateModel(),
      updateTexture(),
    ]);
    setLoading(false);
  }, [
    setSearchParams,
    tag,
    cleanPokemonName,
    updateSpawn,
    updateSpecies,
    updateModel,
    updateTexture,
  ]);

  return (
    <div id="pico-root">
      <header>
        <h1>Cobblemon Pokedata Lookup</h1>
      </header>
      <main>
        <Input
          label="Enter the name of the Pokemon species you would like information on and the version you're playing"
          btn={{
            label: "Search",
            onClick: handleSearch,
          }}
          loading={loading}
          {...pokemonNameRegistration}
        >
          <select {...tagRegistration} disabled={loading}>
            {tags?.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </Input>
        <SpeciesData {...species} />
        {spawn &&
          (spawn === notFound ? (
            <div>Could not find spawn data</div>
          ) : (
            <div>
              <a href={spawn} target="_blank" rel="noreferrer">
                Spawn Data
              </a>
            </div>
          ))}
        {model &&
          (model === notFound ? (
            <div>Could not find model data</div>
          ) : (
            <div>
              <a href={model} target="_blank" rel="noreferrer">
                Model Data
              </a>
            </div>
          ))}
        {texture &&
          (texture === notFound ? (
            <div>Could not find texture data</div>
          ) : (
            <div>
              <a href={texture} target="_blank" rel="noreferrer">
                Texture Data
              </a>
            </div>
          ))}
      </main>
      <footer>
        <div>Made with ❤️ by Tim</div>
        <div>
          <a
            href="https://ko-fi.com/programmingwithtim"
            target="_blank"
            rel="noreferrer"
            data-tooltip="Drop a coin in my coin jar ^^"
          >
            <img src={coinJar} className="logo" />
          </a>
          <span
            onClick={() => setCookieEaten(true)}
            data-tooltip="JK we don't use cookies"
          >
            🍪
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
