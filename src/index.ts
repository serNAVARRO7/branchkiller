#!/usr/bin/env node
import simpleGit, { SimpleGit } from "simple-git";
import { program } from "commander";
import figlet from "figlet";
import inquirer from "inquirer";

const git: SimpleGit = simpleGit();

console.log(
  figlet.textSync("BRANCH KILLER", {
    font: "ANSI Shadow",
    horizontalLayout: "full",
  })
);

program
  .option("-E, --exclude [branches...]", "Exclude branches", [
    "main",
    "origin/main",
  ])
  .action((options) => {
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
    console.log("No local branches to delete.");
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
    console.log("No local branches were selected.");
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
    console.log("No local branches were deleted.");
    return;
  }

  for (const branch of branches.selected) {
    console.log(`Deleting local branch ${branch}...`);
    await git.deleteLocalBranch(branch);
    console.log(`Local branch ${branch} deleted.`);
  }
}

async function handleRemoteBranches(exclude: string[]) {
  const remoteBranches = [
    ...(await git.branch(["-r"])).all.filter(
      (branch) => !exclude.includes(branch)
    ),
  ];

  if (remoteBranches.length === 0) {
    console.log("No remote branches to delete.");
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
    console.log("No remote branches were selected.");
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
    console.log("No remote branches were deleted.");
    return;
  }

  for (const branch of branches.selected) {
    console.log(`Deleting remote branch ${branch}...`);
    await git.push("origin", branch.replace("origin/", ""), ["--delete"]);
    console.log(`Remote branch ${branch} deleted.`);
  }
}
