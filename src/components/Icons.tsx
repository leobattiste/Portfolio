/* Big line icons for the home page. Each has one marigold shape and one
   part (.move) that shifts a little when its section is hovered. */

const props = {
  viewBox: "0 0 200 200",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 3,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: false,
} as const;

const gold = "var(--marigold)";

/* Work: an artboard with a selected shape and its handles */
export function WorkIcon() {
  return (
    <svg {...props} className="big-icon">
      <rect x="22" y="40" width="156" height="120" rx="10" />
      <g className="move">
        <rect x="60" y="66" width="80" height="68" rx="5" fill={gold} />
        {[
          [60, 66],
          [140, 66],
          [60, 134],
          [140, 134],
        ].map(([x, y]) => (
          <rect
            key={`${x}-${y}`}
            x={x - 6}
            y={y - 6}
            width="12"
            height="12"
            rx="2"
            fill="var(--paper)"
          />
        ))}
      </g>
    </svg>
  );
}

/* Journal: a page of lines and a pencil writing on it */
export function JournalIcon() {
  return (
    <svg {...props} className="big-icon">
      <rect x="38" y="22" width="108" height="156" rx="10" />
      <path d="M62 66h60M62 92h60M62 118h34" />
      <g className="move">
        <g transform="rotate(38 150 120)">
          <rect x="138" y="62" width="24" height="86" rx="3" fill={gold} />
          <path d="M138 148l12 26 12-26z" fill="var(--paper)" />
          <path d="M138 80h24" />
        </g>
      </g>
    </svg>
  );
}

/* Playground: a circle, a triangle and a square that don't quite agree */
export function PlaygroundIcon() {
  return (
    <svg {...props} className="big-icon">
      <circle cx="72" cy="116" r="46" fill={gold} />
      <path d="M126 30l48 84H78z" />
      <g className="move">
        <rect x="104" y="118" width="62" height="62" rx="6" fill="var(--paper)" transform="rotate(-8 135 149)" />
      </g>
    </svg>
  );
}
