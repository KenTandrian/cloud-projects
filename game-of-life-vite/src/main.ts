import "./style.css";
import { setupGame } from "./game.ts";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <h1>Conway's Game of Life</h1>
  <canvas width="512" height="512"></canvas>
  <div>
    <button onclick="window.location.reload();">
      Restart
    </button>
  </div>
`;

setupGame(document.querySelector<HTMLCanvasElement>("canvas")!);
