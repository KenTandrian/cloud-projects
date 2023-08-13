/**
 * Get the cell shader module.
 * @param device The GPU Device to connect to.
 * @returns The cell shader module instance
 */
export default function getCellShaderModule(device: GPUDevice) {
  return device.createShaderModule({
    label: "Cell shader",
    code: `
        struct VertexInput {
            @location(0) pos: vec2f,
            @builtin(instance_index) instance: u32,
        };
        
        struct VertexOutput {
            @builtin(position) pos: vec4f,
            @location(0) cell: vec2f,
        };
    
        @group(0) @binding(0) var<uniform> grid: vec2f;
        @group(0) @binding(1) var<storage> cellState: array<u32>;
    
        @vertex
        fn vertexMain(input: VertexInput) -> VertexOutput {
            let i = f32(input.instance);
            let cell = vec2f(i % grid.x, floor(i / grid.x));
            let state = f32(cellState[input.instance]);
        
            let cellOffset = cell / grid * 2;
            let gridPos = (input.pos * state + 1) / grid - 1 + cellOffset;
        
            var output: VertexOutput;
            output.pos = vec4f(gridPos, 0, 1); // (X, Y, Z, W)
            output.cell = cell / grid;
            return output;
        }
        @fragment
        fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
            let c = input.cell;
            return vec4f(c, 1.0 - c.x, 1); // (Red, Green, Blue, Alpha)
        }
    `,
  });
}
