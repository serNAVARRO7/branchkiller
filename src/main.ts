import colors from "colors";
import { program } from "commander";
import figlet from "figlet";
import inquirer from "inquirer";
import { loadPackageJson } from "package-json-from-dist";
import { GitService } from "./services/git.service.js";
import { BranchType } from "./types/branch-type.type";
import { Options } from "./types/options.type.js";
import { startCase } from "./utils/start-case.util.js";

const { version } = loadPackageJson(import.meta.url, "../package.json");

const gitService = new GitService();

program
  .option("-e, --exclude [branches...]", "exclude branches", [
    "main",
    "origin/main",
    await gitService.getCurrentBranch(),
  ])
  .option("-l, --local", "delete local branches", true)
  .option("--no-local", "do not delete local branches", false)
  .option("-r, --remote", "delete remote branches", true)
  .option("--no-remote", "do not delete remote branches", false)
  .version(version, "-v, --version", "display version")
  .action((options: Options) => {
    displayBanner();
    kill(options);
  });

program.parse(process.argv);

function displayBanner() {
  console.log(
    figlet.textSync("BRANCH KILLER", {
      font: "Small Shadow",
      horizontalLayout: "full",
    })
  );
}

async function kill(options: Options): Promise<void> {
  try {
    const exclude = Array.isArray(options.exclude) ? options.exclude : [];

    if (options.local) {
      const localBranches = await gitService.getLocalBranches(exclude);
      await handleBranches("local", localBranches);
    }

    if (options.remote) {
      const remoteBranches = await gitService.getRemoteBranches(exclude);
      await handleBranches("remote", remoteBranches);
    }
  } catch (err: any) {
    console.error("Process aborted.", err.message);
  }
}

async function handleBranches(type: BranchType, branches: string[]) {
  const naming = type === "local" ? "local" : "remote";

  if (branches.length === 0) {
    console.log(colors.blue(`No ${naming} branches to delete.`));
    return;
  }

  const choices = branches.map((branch) => ({
    name: branch,
    value: branch,
  }));

  const question = await inquirer.prompt([
    {
      type: "checkbox",
      name: "selected",
      message: `Which ${naming} branches do you want to delete?`,
      choices,
      default: branches,
    },
  ]);

  if (question.selected.length === 0) {
    console.log(colors.blue(`No ${naming} branches were selected.`));
    return;
  }

  const confirm = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: `Are you sure?`,
      default: false,
    },
  ]);

  if (!confirm.confirm) {
    console.log(colors.blue(`No ${naming} branches were deleted.`));
    return;
  }

  for (const branch of question.selected) {
    console.log(`Deleting ${naming} branch ${branch}...`);
    try {
      await gitService.deleteBranch(type, branch);
      console.log(
        colors.green(`${startCase(naming)} branch ${branch} deleted.`)
      );
    } catch (err: any) {
      console.error(
        colors.red(
          `Failed to delete ${naming} branch ${branch}: ${err.message}`
        )
      );
    }
  }
}

export default (): void => {};
