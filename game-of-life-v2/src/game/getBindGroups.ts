export default function getBindGroups(
  device: GPUDevice,
  layout: GPUBindGroupLayout,
  uniformBuffer: GPUBuffer,
  cellStateStorage: GPUBuffer[]
) {
  return [
    device.createBindGroup({
      label: "Cell renderer bind group A",
      layout,
      entries: [
        { binding: 0, resource: { buffer: uniformBuffer } },
        { binding: 1, resource: { buffer: cellStateStorage[0] } },
        { binding: 2, resource: { buffer: cellStateStorage[1] } },
      ],
    }),
    device.createBindGroup({
      label: "Cell renderer bind group B",
      layout,
      entries: [
        { binding: 0, resource: { buffer: uniformBuffer } },
        { binding: 1, resource: { buffer: cellStateStorage[1] } },
        { binding: 2, resource: { buffer: cellStateStorage[0] } },
      ],
    }),
  ];
}
