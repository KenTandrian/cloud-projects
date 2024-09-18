export default function getCellPipeline(
  device: GPUDevice,
  layout: GPUPipelineLayout,
  module: GPUShaderModule,
  vertexBufferLayout: GPUVertexBufferLayout,
  format: GPUTextureFormat
) {
  return device.createRenderPipeline({
    label: "Cell pipeline",
    layout,
    vertex: { module, entryPoint: "vertexMain", buffers: [vertexBufferLayout] },
    fragment: { module, entryPoint: "fragmentMain", targets: [{ format }] },
  });
}
