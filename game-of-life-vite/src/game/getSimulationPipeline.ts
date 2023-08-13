export default function getSimulationPipeline(
  device: GPUDevice,
  layout: GPUPipelineLayout,
  module: GPUShaderModule
) {
  return device.createComputePipeline({
    label: "Simulation pipeline",
    layout,
    compute: { module, entryPoint: "computeMain" },
  });
}
