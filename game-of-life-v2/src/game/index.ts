/// <reference types="@webgpu/types" />

import configureCanvas from "./configureCanvas";
import { GRID_SIZE, UPDATE_INTERVAL, WORKGROUP_SIZE } from "../constants";
import getBindGroupLayout from "./getBindGroupLayout";
import getBindGroups from "./getBindGroups";
import getCellPipeline from "./getCellPipeline";
import getCellShaderModule from "./getCellShaderModule";
import getCellStateStorage from "./getCellStateStorage";
import getGPUDevice from "./getGPUDevice";
import getSimulationPipeline from "./getSimulationPipeline";
import getSimulationShaderModule from "./getSimulationShaderModule";
import getUniformBuffer from "./getUniformBuffer";
import getVertexBuffer from "./getVertexBuffer";

export async function setupGame(canvas: HTMLCanvasElement) {
  // WebGPU code begin here
  const device = await getGPUDevice();

  // Configure the canvas
  const { context, canvasFormat } = configureCanvas(canvas, device);

  // Configure the square vertex
  const { vertexBuffer, vertices } = getVertexBuffer(device);

  // Define the vertex data structure
  const vertexBufferLayout: GPUVertexBufferLayout = {
    arrayStride: 2 * 4, // 2 floats per vertex, 4 bytes per float
    attributes: [{ format: "float32x2", offset: 0, shaderLocation: 0 }],
  };

  // Create the bind group layout and pipeline layout.
  const bindGroupLayout = getBindGroupLayout(device);
  const pipelineLayout = device.createPipelineLayout({
    label: "Cell Pipeline Layout",
    bindGroupLayouts: [bindGroupLayout],
  });

  const cellShaderModule = getCellShaderModule(device);

  const cellPipeline = getCellPipeline(
    device,
    pipelineLayout,
    cellShaderModule,
    vertexBufferLayout,
    canvasFormat
  );

  // Create the compute shader that will process the simulation.
  const simulationShaderModule = getSimulationShaderModule(device);

  // Create a compute pipeline that updates the game state.
  const simulationPipeline = getSimulationPipeline(
    device,
    pipelineLayout,
    simulationShaderModule
  );

  // Create a uniform buffer to hold the grid.
  const uniformBuffer = getUniformBuffer(device);

  // Create a storage buffer to hold the cell state.
  const cellStateStorage = getCellStateStorage(device);

  const bindGroups = getBindGroups(
    device,
    bindGroupLayout,
    uniformBuffer,
    cellStateStorage
  );

  let step = 0; // Track how many simulation steps have been run
  function updateGrid() {
    const encoder = device.createCommandEncoder();

    // Start a compute pass
    const computePass = encoder.beginComputePass();
    computePass.setPipeline(simulationPipeline);
    computePass.setBindGroup(0, bindGroups[step % 2]);

    const workgroupCount = Math.ceil(GRID_SIZE / WORKGROUP_SIZE);
    computePass.dispatchWorkgroups(workgroupCount, workgroupCount);
    computePass.end();

    step++; // Increment the step count

    // Start a render pass
    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: context?.getCurrentTexture().createView()!,
          loadOp: "clear",
          clearValue: { r: 0, g: 0, b: 0.4, a: 1.0 },
          storeOp: "store",
        },
      ],
    });

    // Draw the grid.
    pass.setPipeline(cellPipeline);
    pass.setBindGroup(0, bindGroups[step % 2]); // Updated!
    pass.setVertexBuffer(0, vertexBuffer);
    pass.draw(vertices.length / 2, GRID_SIZE * GRID_SIZE);

    // End the render pass and submit the command buffer
    pass.end();
    device.queue.submit([encoder.finish()]);
  }

  // Schedule updateGrid() to run repeatedly
  setInterval(updateGrid, UPDATE_INTERVAL);
}
