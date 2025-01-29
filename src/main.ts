import { program } from "commander";
import inquirer from "inquirer";
import ora from "ora";
import { loadPackageJson } from "package-json-from-dist";
import { GitService } from "./services/git.service.js";
import { LoggerService } from "./services/logger.service.js";
import { BranchType } from "./types/branch-type.type";
import { Options } from "./types/options.type.js";
import { startCase } from "./utils/start-case.util.js";

const { version } = loadPackageJson(import.meta.url, "../package.json");

const gitService = new GitService();
const loggerService = new LoggerService();

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
  .option(
    "-V --verbose",
    "be verbose when deleting branches, showing them as they are deleted",
    false
  )
  .option(
    "--no-verbose",
    "be silent when deleting branches, showing nothing as they are deleted",
    true
  )
  .option(
    "-i --interactive",
    "ask for confirmation before deleting branches",
    true
  )
  .option(
    "--no-interactive",
    "do not ask for confirmation before deleting branches",
    false
  )
  .version(version, "-v, --version", "display version")
  .action((options: Options) => {
    loggerService.verbose = options.verbose;
    loggerService.displayBanner();
    kill(options);
  });

program.parse(process.argv);

async function kill(options: Options) {
  try {
    await gitService.fetchPrune();

    const exclude = Array.isArray(options.exclude) ? options.exclude : [];

    if (options.local) {
      const localBranches = await gitService.getLocalBranches(exclude);
      await handleBranches("local", localBranches, options.interactive);
    }

    if (options.remote) {
      const remoteBranches = await gitService.getRemoteBranches(exclude);
      await handleBranches("remote", remoteBranches, options.interactive);
    }
  } catch (err: any) {
    loggerService.log(`Process aborted. ${err.message}`);
  }
}

async function handleBranches(
  type: BranchType,
  branches: string[],
  interactive: boolean
) {
  const naming = type === "local" ? "local" : "remote";

  if (branches.length === 0) {
    loggerService.log(`No ${naming} branches to delete.`, "blue", true);
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
    loggerService.log(`No ${naming} branches were selected.`, "blue", true);
    return;
  }

  if (interactive) {
    const confirm = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: `Are you sure?`,
        default: false,
      },
    ]);

    if (!confirm.confirm) {
      loggerService.log(`No ${naming} branches were deleted.`, "blue");
      return;
    }
  }

  const spinner = ora(`Deleting ${naming} branches. \n`).start();
  for (const branch of question.selected) {
    loggerService.log(`Deleting ${naming} branch ${branch}...`);
    try {
      await gitService.deleteBranch(type, branch);
      loggerService.log(
        `${startCase(naming)} branch ${branch} deleted.`,
        "green"
      );
    } catch (err: any) {
      loggerService.log(
        `Failed to delete ${naming} branch ${branch}: ${err.message}.`,
        "red",
        true
      );
    }
  }
  spinner.succeed(`${startCase(naming)} branches deleted.`);
}

export default (): void => {};
