import { GRID_SIZE } from "../constants";

function createStorageBuffer(device: GPUDevice, label: string, size: number) {
  return device.createBuffer({
    label,
    size,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });
}

export default function getCellStateStorage(device: GPUDevice) {
  // Create an array representing the active state of each cell.
  const cellStateArray = new Uint32Array(GRID_SIZE * GRID_SIZE);

  const cellStateStorage = [
    createStorageBuffer(
      device,
      "Cell active state A",
      cellStateArray.byteLength
    ),
    createStorageBuffer(
      device,
      "Cell active state B",
      cellStateArray.byteLength
    ),
  ];

  // Mark random cell of the grid as active.
  for (let i = 0; i < cellStateArray.length; ++i) {
    cellStateArray[i] = Math.random() > 0.6 ? 1 : 0;
  }
  device.queue.writeBuffer(cellStateStorage[0], 0, cellStateArray);

  return cellStateStorage;
}
