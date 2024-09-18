export default async function getGPUDevice() {
  if (!navigator.gpu) throw new Error("WebGPU not supported on this browser.");
  // Get a GPU adapter
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) throw new Error("No appropriate GPUAdapter found.");
  // Request the GPU device
  return await adapter.requestDevice();
}
