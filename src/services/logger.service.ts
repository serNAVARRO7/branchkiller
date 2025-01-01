import colors from "colors";
import figlet from "figlet";
import { ColorPalette } from "src/types/color-palette.type";

export class LoggerService {
  private _verbose: boolean;

  constructor(verbose: boolean = true) {
    this._verbose = verbose;
  }

  get verbose(): boolean {
    return this._verbose;
  }

  set verbose(value: boolean) {
    this._verbose = value;
  }

  log(message: string, color?: ColorPalette, force = false): void {
    if (!this._verbose && !force) return;

    const coloredMessage = color ? colors[color](message) : message;

    console.log(coloredMessage);
  }

  displayBanner() {
    if (!this._verbose) return;

    console.log(
      figlet.textSync("BRANCH KILLER", {
        font: "Small Shadow",
        horizontalLayout: "full",
      })
    );
  }
}
