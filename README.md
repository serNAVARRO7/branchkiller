# Branch Killer

<p align="center">
  <img src="https://github.com/serNAVARRO7/branchkiller/blob/main/assets/logo.png" width="520" alt="branchkiller logo" />
</p>
<p align="center">
<img alt="npm" src="https://img.shields.io/npm/dy/branchkiller.svg">
<img alt="npm version" src="https://img.shields.io/npm/v/branchkiller.svg">
<img alt="NPM" src="https://img.shields.io/npm/l/branchkiller.svg">
</p>

### A command-line tool to easily delete all git local and remote branches except 'main'. Delete Git branches in bulk ✂️

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
  - [Options](#options)
  - [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

<a name="features"></a>

# :heavy_check_mark: Features

- **Delete Local Branches:** Easily manage and remove unnecessary local branches in your Git repository with an interactive CLI interface.

- **Delete Remote Branches:** Clean up remote branches that are no longer needed by pushing deletions directly to the origin.

- **Branch Exclusion:** Exclude specific branches (e.g., main, origin/main) from being selected for deletion to avoid accidental removal of important branches.

- **Interactive Selection:** Choose which branches to delete through a user-friendly prompt, with checkboxes for easy multi-selection.

- **Confirmation Step:** Prevent accidental deletions by requiring confirmation before proceeding with branch removal.

<a name="installation"></a>

# :cloud: Installation

```bash
$ npm i -g branchkiller
```
<a name="usage"></a>

# :clipboard: Usage

```bash
$ branchkiller
```

By default, branchkiller will scan your local and remote branches, excluding branches like main and origin/main from being selected for deletion.

<a name="options"></a>

## Options

| ARGUMENT                         | DESCRIPTION                                                                                                                                    |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| -e, --exclude [branches...]      | Exclude branches (default: ["main","origin/main",<current-local-branch>])                                                                      |
| -h, --help                       | Display help for command                                                                                                                       |
| -v, --version                    | Display branchkiller version                                                                                                                   |

## Examples

- Exclude local custom branch

```bash
branchkiller --exclude mylocalbranch

# other alternative:
branchkiller -e mylocalbranch
```

- Exclude multiple branches (local and remote)

```bash
branchkiller --exclude mylocalbranch origin/myremotebranch

# other alternative:
branchkiller -e mylocalbranch origin/myremotebranch
```

<a name="contributing"></a>

# :hammer_and_wrench: Contributing

Contributions are welcome! Please feel free to fork the repository, make changes, and submit pull requests.

<a name="license"></a>

# :scroll: License

MIT © [Sergio Navarro](https://github.com/serNAVARRO7)
