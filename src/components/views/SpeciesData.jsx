import { useMemo } from "react";
import { notFound } from "../../constants";
import MovesData from "./MovesData";

export default function SpeciesData({ url, content }) {
  const allMoves = useMemo(() => {
    const retval = {};
    if (!content) {
      return null
    }
    retval[content.name] = content.moves;
    
    content.forms.forEach(({name, moves}) => {
      retval[name] = moves;
    })

    return retval;
  }, [content]);

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
        {Object.entries(allMoves).map(([form, moves]) => <MovesData key={form} moves={moves} form={form} />)}
      </>
    ))
  );
}
