#!/usr/bin/env node
import colors from "colors";
import { program } from "commander";
import figlet from "figlet";
import inquirer from "inquirer";
import { loadPackageJson } from "package-json-from-dist";
import simpleGit, { SimpleGit } from "simple-git";

const { version } = loadPackageJson(import.meta.url, "../package.json");
const git: SimpleGit = simpleGit();

program
  .option("-e, --exclude [branches...]", "exclude branches", [
    "main",
    "origin/main",
  ])
  .version(version, "-v, --version", "display version")
  .action((options) => {
    console.log(
      figlet.textSync("BRANCH KILLER", {
        font: "Small Shadow",
        horizontalLayout: "full",
      })
    );
    kill(options.exclude);
  });

program.parse(process.argv);

async function kill(exclude: string[]): Promise<void> {
  try {
    await handleLocalBranches(exclude);
    await handleRemoteBranches(exclude);
  } catch (err: any) {
    console.error("Process aborted.", err.message);
  }
}

async function handleLocalBranches(exclude: string[]) {
  const localBranches = [
    ...(await git.branchLocal()).all.filter(
      (branch) => !exclude.includes(branch)
    ),
  ];

  if (localBranches.length === 0) {
    console.log(colors.blue("No local branches to delete."));
    return;
  }

  const choices = localBranches.map((branch) => ({
    name: branch,
    value: branch,
  }));

  const branches = await inquirer.prompt([
    {
      type: "checkbox",
      name: "selected",
      message: "Which local branches do you want to delete?",
      choices,
      default: localBranches,
    },
  ]);

  if (branches.selected.length === 0) {
    console.log(colors.blue("No local branches were selected."));
    return;
  }

  const answer = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: `Are you sure?`,
      default: false,
    },
  ]);

  if (!answer.confirm) {
    console.log(colors.blue("No local branches were deleted."));
    return;
  }

  for (const branch of branches.selected) {
    console.log(`Deleting local branch ${branch}...`);
    try {
      await git.deleteLocalBranch(branch);
      console.log(colors.green(`Local branch ${branch} deleted.`));
    } catch (err: any) {
      console.error(
        colors.red(`Failed to delete local branch ${branch}: ${err.message}`)
      );
    }
  }
}

async function handleRemoteBranches(exclude: string[]) {
  const remoteBranches = [
    ...(await git.branch(["-r"])).all.filter(
      (branch) => !exclude.includes(branch)
    ),
  ];

  if (remoteBranches.length === 0) {
    console.log(colors.blue("No remote branches to delete."));
    return;
  }

  const choices = remoteBranches.map((branch) => ({
    name: branch,
    value: branch,
  }));

  const branches = await inquirer.prompt([
    {
      type: "checkbox",
      name: "selected",
      message: "Which remote branches do you want to delete?",
      choices,
      default: remoteBranches,
    },
  ]);

  if (branches.selected.length === 0) {
    console.log(colors.blue("No remote branches were selected."));
    return;
  }

  const answer = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: "Are you sure?",
      default: false,
    },
  ]);

  if (!answer.confirm) {
    console.log(colors.blue("No remote branches were deleted."));
    return;
  }

  for (const branch of branches.selected) {
    console.log(`Deleting remote branch ${branch}...`);
    try {
      await git.push("origin", branch.replace("origin/", ""), ["--delete"]);
      console.log(colors.green(`Remote branch ${branch} deleted.`));
    } catch (err: any) {
      console.error(
        colors.red(`Failed to delete remote branch ${branch}: ${err.message}`)
      );
    }
  }
}
