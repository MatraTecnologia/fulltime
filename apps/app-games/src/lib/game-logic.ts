export function selectedWord(
  grid: string[],
  selection: number[],
  width: number,
): string | null {
  if (!selection.length || new Set(selection).size !== selection.length)
    return null;
  if (selection.some((i) => i < 0 || i >= grid.length || !Number.isInteger(i)))
    return null;
  if (selection.length > 1) {
    const dx = (selection[1] % width) - (selection[0] % width);
    const dy =
      Math.floor(selection[1] / width) - Math.floor(selection[0] / width);
    if (Math.abs(dx) > 1 || Math.abs(dy) > 1 || (!dx && !dy)) return null;
    for (let i = 1; i < selection.length; i++) {
      if (
        (selection[i] % width) - (selection[i - 1] % width) !== dx ||
        Math.floor(selection[i] / width) -
          Math.floor(selection[i - 1] / width) !==
          dy
      )
        return null;
    }
  }
  return selection.map((i) => grid[i]).join("");
}

export type Point = { x: number; y: number };
export const letterPaths: { letter: string; strokes: Point[][] }[] = [
  {
    letter: "A",
    strokes: [
      [
        { x: 85, y: 235 },
        { x: 160, y: 55 },
        { x: 235, y: 235 },
      ],
      [
        { x: 115, y: 165 },
        { x: 205, y: 165 },
      ],
    ],
  },
  {
    letter: "L",
    strokes: [
      [
        { x: 110, y: 60 },
        { x: 110, y: 230 },
        { x: 220, y: 230 },
      ],
    ],
  },
  {
    letter: "E",
    strokes: [
      [
        { x: 220, y: 60 },
        { x: 105, y: 60 },
        { x: 105, y: 230 },
        { x: 220, y: 230 },
      ],
      [
        { x: 105, y: 145 },
        { x: 200, y: 145 },
      ],
    ],
  },
];

function distanceToSegment(p: Point, a: Point, b: Point) {
  const dx = b.x - a.x,
    dy = b.y - a.y;
  const t = Math.max(
    0,
    Math.min(
      1,
      ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy || 1),
    ),
  );
  return Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy);
}

export function traceCoverage(target: Point[][], drawing: Point[][]) {
  const segments = drawing.flatMap((stroke) =>
    stroke.slice(1).map((p, i) => [stroke[i], p] as const),
  );
  if (!segments.length) return 0;
  const coverageByStroke: number[] = [];
  for (const stroke of target) {
    let covered = 0,
      total = 0;
    for (let i = 1; i < stroke.length; i++) {
      const a = stroke[i - 1],
        b = stroke[i];
      const steps = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 8);
      for (let s = 0; s <= steps; s++) {
        const p = {
          x: a.x + ((b.x - a.x) * s) / steps,
          y: a.y + ((b.y - a.y) * s) / steps,
        };
        total++;
        if (
          segments.some(
            ([start, end]) => distanceToSegment(p, start, end) <= 24,
          )
        )
          covered++;
      }
    }
    coverageByStroke.push(total ? covered / total : 0);
  }
  return coverageByStroke.length ? Math.min(...coverageByStroke) : 0;
}
