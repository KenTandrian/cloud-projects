import { GRID_SIZE_X, GRID_SIZE_Y } from "../constants";

export default function getUniformBuffer(device: GPUDevice) {
  const uniformArray = new Float32Array([GRID_SIZE_X, GRID_SIZE_Y]);
  const uniformBuffer = device.createBuffer({
    label: "Grid uniforms",
    size: uniformArray.byteLength,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(uniformBuffer, 0, uniformArray);
  return uniformBuffer;
}
