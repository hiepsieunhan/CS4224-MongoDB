import fs from "fs";

const { STATS_FILE } = process.env;
if (!STATS_FILE) {
  process.exit(1);
}

const contents = fs.readFileSync(STATS_FILE, "utf8");
const values = contents
  .split("\n")
  .map(value => value)
  .map(value => parseFloat(value));

const max = values.length
  ? values.reduce((max, value) => Math.max(max, value), values[0])
  : 0;

const min = values.length
  ? values.reduce((max, value) => Math.min(max, value), values[0])
  : 0;

const avg = values.length
  ? values.reduce((sum, value) => sum + value, 0) / values.length
  : 0;

console.log(min, max, avg);
