import { useMemo, useState } from "react";

export default function MovesData({ moves }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const parsedMoves = useMemo(
    () =>
      moves.map((move) => {
        const split = move.split(":");

        let obtainment;
        let level;
        if (!isNaN(+split[0])) {
          obtainment = "level";
          level = +split[0];
        } else {
          obtainment = split[0];
        }

        return { name: split[1], obtainment, level };
      }),
    [moves]
  );

  return (
    <>
      <button onClick={() => setOpen(true)}>Moves</button>
      <dialog open={open}>
        <article>
          <header>
            <button
              aria-label="Close"
              rel="prev"
              onClick={() => setOpen(false)}
            ></button>
            <p>
              <strong>Move List</strong>
            </p>
          </header>
          <input
            placeholder="Search for move"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <table class="overflow-auto">
            <thead>
              <tr>
                <th>Name</th>
                <th>How to obtain</th>
              </tr>
            </thead>
            <tbody>
              {parsedMoves
                .filter(({ name }) => name.includes(search.toLowerCase()))
                .map((move) => (
                  <MoveRow {...move} key={move} />
                ))}
            </tbody>
          </table>
        </article>
      </dialog>
    </>
  );
}

function MoveRow({ name, obtainment, level }) {
  return (
    <tr>
      <td>{name}</td>
      <td>{level ? `Level ${level}` : obtainment}</td>
    </tr>
  );
}
