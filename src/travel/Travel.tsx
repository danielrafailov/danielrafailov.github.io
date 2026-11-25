import { useState } from "react";
import { Section } from "../ui";
import { countryBorderPath, landPath, MAP_HEIGHT, MAP_WIDTH, places, stateBorderPath, type Place } from "./map";

// Where each label sits relative to its pin, chosen so none overlap.
const LABELS: Record<string, { dx: number; dy: number; anchor: "start" | "middle" | "end" }> = {
  toronto: { dx: -12, dy: 6, anchor: "end" },
  ottawa: { dx: -12, dy: 2, anchor: "end" },
  quebec: { dx: 12, dy: 6, anchor: "start" },
  nyc: { dx: 12, dy: 6, anchor: "start" },
  dc: { dx: 12, dy: 8, anchor: "start" },
  virginia: { dx: -12, dy: 8, anchor: "end" },
  myrtle: { dx: 12, dy: 6, anchor: "start" },
  orlando: { dx: 12, dy: 6, anchor: "start" },
  dr: { dx: 0, dy: -16, anchor: "middle" },
};

const COUNTRIES = 3; // Canada, the United States and the Dominican Republic

function Pin({ place, active, setActive }: { place: Place; active: boolean; setActive: (id: string | null) => void }) {
  const label = LABELS[place.id];
  return (
    <g
      className={`pin${active ? " on" : ""}`}
      transform={`translate(${place.x} ${place.y})`}
      onMouseEnter={() => setActive(place.id)}
      onMouseLeave={() => setActive(null)}
      onClick={() => setActive(active ? null : place.id)}
    >
      <circle className="pin-ring" r="14" />
      <circle className="pin-dot" r="6" />
      <text className="pin-label" x={label.dx} y={label.dy} textAnchor={label.anchor}>
        {place.name}
      </text>
    </g>
  );
}

export function Travel() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <Section id="travel" label="Travel">
      <p className="travel-intro">
        {places.length} places across {COUNTRIES} countries so far.
      </p>
      <figure className="travel-map">
        <svg
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          role="img"
          aria-label={`Map of places I've visited: ${places.map((p) => p.name).join(", ")}`}
        >
          <path className="map-land" d={landPath} />
          <path className="map-states" d={stateBorderPath} />
          <path className="map-countries" d={countryBorderPath} />
          {/* Draw the active pin last so it sits on top. */}
          {[...places]
            .sort((a, b) => Number(a.id === active) - Number(b.id === active))
            .map((p) => (
              <Pin key={p.id} place={p} active={p.id === active} setActive={setActive} />
            ))}
        </svg>
        <figcaption>Map data: Natural Earth.</figcaption>
      </figure>
      <ul className="travel-list">
        {places.map((p) => (
          <li
            key={p.id}
            className={p.id === active ? "on" : undefined}
            onMouseEnter={() => setActive(p.id)}
            onMouseLeave={() => setActive(null)}
            onClick={() => setActive(active === p.id ? null : p.id)}
          >
            <span className="travel-name">{p.name}</span>
            {p.region && <span className="travel-region">{p.region}</span>}
          </li>
        ))}
      </ul>
    </Section>
  );
}
