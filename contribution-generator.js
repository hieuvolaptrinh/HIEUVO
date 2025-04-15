import jsonfile from "jsonfile";
import moment from "moment";
import simpleGit from "simple-git";
import random from "random";
import fs from "fs";

const path = "./data.json";

// Adjusted Pattern "VND HIEU" to be more centered (starting from column 10 to fit within 53 columns)
const VND_HIEU_NEGATIVE_PATTERN = [
  // V (cols 10-14)
  [10, 0],
  [10, 1],
  [10, 2],
  [10, 3],
  [11, 4],
  [12, 3],
  [12, 2],
  [12, 1],
  [12, 0],

  // N (cols 15-19)
  [15, 0],
  [15, 1],
  [15, 2],
  [15, 3],
  [15, 4],
  [16, 1],
  [17, 2],
  [18, 3],
  [19, 0],
  [19, 1],
  [19, 2],
  [19, 3],
  [19, 4],

  // D (cols 20-24)
  [20, 0],
  [20, 1],
  [20, 2],
  [20, 3],
  [20, 4],
  [21, 0],
  [21, 4],
  [22, 0],
  [22, 4],
  [23, 1],
  [23, 2],
  [23, 3],

  // Space (col 25)

  // H (cols 26-30)
  [26, 0],
  [26, 1],
  [26, 2],
  [26, 3],
  [26, 4],
  [27, 2],
  [28, 2],
  [29, 0],
  [29, 1],
  [29, 2],
  [29, 3],
  [29, 4],

  // I (cols 31-33)
  [31, 0],
  [31, 4],
  [32, 0],
  [32, 1],
  [32, 2],
  [32, 3],
  [32, 4],
  [33, 0],
  [33, 4],

  // E (cols 34-38)
  [34, 0],
  [34, 1],
  [34, 2],
  [34, 3],
  [34, 4],
  [35, 0],
  [35, 2],
  [35, 4],
  [36, 0],
  [36, 2],
  [36, 4],
  [37, 0],
  [37, 4],

  // U (cols 39-43)
  [39, 0],
  [39, 1],
  [39, 2],
  [39, 3],
  [40, 4],
  [41, 4],
  [42, 0],
  [42, 1],
  [42, 2],
  [42, 3],
];

// Get all days in 2023
const getAllDaysIn2023 = () => {
  const startDate = moment("2023-01-01");
  const endDate = moment("2023-12-31");
  const allDays = [];
  let currentDate = moment(startDate);

  while (currentDate.isSameOrBefore(endDate)) {
    allDays.push(moment(currentDate));
    currentDate.add(1, "days");
  }
  return allDays;
};

const isDateInNegativePattern = (date) => {
  const startOfYear = moment("2023-01-01");
  const dayOfYear = date.diff(startOfYear, "days");
  const col = Math.floor(dayOfYear / 7);
  const row = dayOfYear % 7;

  return VND_HIEU_NEGATIVE_PATTERN.some(
    ([patternCol, patternRow]) => patternCol === col && patternRow === row
  );
};

// Create commits for a specific date
const markCommit = async (date) => {
  let data = [];
  try {
    data = await jsonfile.readFile(path);
  } catch (err) {
    console.log("File not found, creating new one...");
  }

  const numCommits = random.int(5, 10); // Reduced commits for efficiency
  for (let i = 0; i < numCommits; i++) {
    const commitDate = moment(date);
    commitDate.set({
      hour: random.int(9, 18),
      minute: random.int(0, 59),
      second: random.int(0, 59),
    });

    data.push({ date: commitDate.toISOString(), id: Date.now() + i });
    await jsonfile.writeFile(path, data);

    const git = simpleGit();
    await git.add([path]);
    await git.commit(`Commit ${i + 1} for ${commitDate.format("YYYY-MM-DD")}`, {
      "--date": commitDate.toISOString(),
    });
  }
};

// Main function to create commits
const createNegativePattern = async () => {
  if (!fs.existsSync(path)) {
    fs.writeFileSync(path, JSON.stringify([]));
  }

  const allDays = getAllDaysIn2023();
  const daysToCommit = allDays.filter((date) => !isDateInNegativePattern(date));

  console.log(
    `Creating commits for ${daysToCommit.length} days out of ${allDays.length} total days in 2023...`
  );

  let completed = 0;
  for (const date of daysToCommit) {
    await markCommit(date);
    completed++;
    if (completed % 10 === 0 || completed === daysToCommit.length) {
      console.log(
        `Progress: ${completed}/${daysToCommit.length} days (${Math.round(
          (completed / daysToCommit.length) * 100
        )}%)`
      );
    }
  }

  console.log("Pushing all commits...");
  const git = simpleGit();
  await git.push("origin", "main");
  console.log("Done! Check your GitHub profile.");
};

// Execute the script
createNegativePattern();
