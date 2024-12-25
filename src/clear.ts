import simpleGit, { SimpleGit } from "simple-git";
import readline from "readline";

const git: SimpleGit = simpleGit();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function clear(): Promise<void> {
  try {
    handleLocalBranches();
  } catch (err) {
    console.error("Error cleaning branches:", err);
  }
}

async function handleLocalBranches() {
  const localBranches = [
    ...(await git.branchLocal()).all.filter((branch) => branch !== "main"),
  ];

  if (localBranches.length > 0) {
    console.log(`The following local branches will be deleted:`);
    console.log(localBranches.join("\n"));
    rl.question(
      "Are you sure you want to delete these local branches? (yes/no): ",
      async (answer) => {
        if (answer.toLowerCase() === "yes" || answer.toLowerCase() === "y") {
          for (const branch of localBranches) {
            console.log(`Deleting local branch ${branch}...`);
            await git.deleteLocalBranch(branch);
            console.log(`Local branch ${branch} deleted.`);
            rl.close();
          }
        } else {
          console.log("Process canceled. No local branches were deleted.");
          rl.close();
        }
        await handleRemoteBranches();
      }
    );
  } else {
    console.log("No local branches to delete.");
    await handleRemoteBranches();
  }
}

async function handleRemoteBranches() {
  const remoteBranches = [
    ...(await git.branch(["-r"])).all.filter(
      (branch) => branch !== "origin/main"
    ),
  ];

  if (remoteBranches.length > 0) {
    console.log(`The following remote branches will be deleted:`);
    console.log(remoteBranches.join("\n"));

    rl.question(
      "Are you sure you want to delete these remote branches? (yes/no): ",
      async (answer) => {
        if (answer.toLowerCase() === "yes" || answer.toLowerCase() === "y") {
          for (const branch of remoteBranches) {
            console.log(`Deleting remote branch ${branch}...`);
            await git.push("origin", branch.replace("origin/", ""), [
              "--delete",
            ]);
            console.log(`Remote branch ${branch} deleted.`);
          }
          rl.close();
        } else {
          console.log("Process canceled. No remote branches were deleted.");
          rl.close();
        }
      }
    );
  } else {
    console.log("No remote branches to delete.");
    rl.close();
  }
}

clear();
