import { notFound } from "../../constants";
import MovesData from "./MovesData";

export default function SpeciesData({ url, content }) {
  return (
    url &&
    (url === notFound ? (
      <div>Could not find species data</div>
    ) : (
      <>
        <div>
          <a href={url} target="_blank" rel="noreferrer">
            Species Data
          </a>
        </div>
        <MovesData moves={content.moves} />
      </>
    ))
  );
}
