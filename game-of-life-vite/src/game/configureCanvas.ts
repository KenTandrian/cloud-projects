export default function configureCanvas(
  canvas: HTMLCanvasElement,
  device: GPUDevice
) {
  const context = canvas?.getContext("webgpu");
  const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
  context?.configure({ device, format: canvasFormat });
  return { context, canvasFormat };
}
