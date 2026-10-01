import { test } from "node:test";
import assert from "node:assert/strict";
import { selectedWord, traceCoverage, letterPaths } from "./game-logic.ts";

test("word search accepts straight adjacent selections and rejects jumps or row wrapping", () => {
  const grid = "SOLARGATOMLUAIPABCDEFGHIJKL".split("");
  assert.equal(selectedWord(grid, [0, 1, 2], 5), "SOL");
  assert.equal(selectedWord(grid, [2, 1, 0], 5), "LOS");
  assert.equal(selectedWord(grid, [0, 2, 1], 5), null);
  assert.equal(selectedWord(grid, [4, 5, 6], 5), null);
  assert.equal(selectedWord(grid, [0, 1, 1], 5), null);
  assert.equal(selectedWord(grid, [-1, 0], 5), null);
});

test("tracing requires coverage of the letter, not arbitrary scribbling", () => {
  const target = letterPaths[0].strokes;
  assert.equal(traceCoverage(target, []), 0);
  assert.equal(
    traceCoverage(target, [
      [
        { x: 10, y: 10 },
        { x: 20, y: 20 },
      ],
    ]),
    0,
  );
  assert.equal(traceCoverage(target, target), 1);
  assert.ok(traceCoverage(target, [target[0]]) < 0.85);
});
