import simpleGit, { SimpleGit } from "simple-git";
import { BranchType } from "../types/branch-type.type";

export class GitService {
  private git: SimpleGit;

  constructor() {
    this.git = simpleGit();
  }

  async getCurrentBranch(): Promise<string> {
    return (await this.git.branch()).current;
  }

  async getLocalBranches(exclude: string[]): Promise<string[]> {
    return [
      ...(await this.git.branchLocal()).all.filter(
        (branch) => !exclude.includes(branch)
      ),
    ];
  }

  async getRemoteBranches(exclude: string[]): Promise<string[]> {
    return [
      ...(await this.git.branch(["-r"])).all.filter(
        (branch) => !exclude.includes(branch)
      ),
    ];
  }

  async deleteBranch(type: BranchType, branch: string, force = false): Promise<void> {
    if (type == "local") {
      await this.git.deleteLocalBranch(branch, force);
    } else {
      const options = ["--delete"];
      if (force) options.push("--force");  
      await this.git.push("origin", branch.replace("origin/", ""), options);
    }
  }

  async fetchPrune(): Promise<void> {
    await this.git.fetch(["--prune"]);
  }
}
