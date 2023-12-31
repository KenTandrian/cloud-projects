const canvas = document.querySelector("canvas");

// Constants
const GRID_SIZE = 32;
const WORKGROUP_SIZE = 8;
const UPDATE_INTERVAL = 100; // Update every 100ms (10 times/sec)

// WebGPU code begin here
if (!navigator.gpu) {
  throw new Error("WebGPU not supported on this browser.");
}

// Get a GPU adapter
const adapter = await navigator.gpu.requestAdapter();
if (!adapter) {
  throw new Error("No appropriate GPUAdapter found.");
}

// Request the GPU device
const device = await adapter.requestDevice();

// Configure the canvas
const context = canvas?.getContext("webgpu");
const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
context?.configure({ device, format: canvasFormat });

// Vertices of a square, divided into two right triangles
const vertices = new Float32Array([
  // Triangle 1
  -0.8, -0.8, 0.8, -0.8, 0.8, 0.8,
  // Triangle 2
  -0.8, -0.8, 0.8, 0.8, -0.8, 0.8,
]);
const vertexBuffer = device.createBuffer({
  label: "Cell vertices",
  size: vertices.byteLength,
  usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
});
device.queue.writeBuffer(vertexBuffer, /*bufferOffset=*/ 0, vertices);

// Define the vertex data structure
const vertexBufferLayout = {
  arrayStride: 2 * 4, // 2 floats per vertex, 4 bytes per float
  attributes: [
    {
      format: "float32x2",
      offset: 0,
      shaderLocation: 0,
    },
  ],
};

// Create the bind group layout and pipeline layout.
const bindGroupLayout = device.createBindGroupLayout({
  label: "Cell Bind Group Layout",
  entries: [
    {
      binding: 0,
      visibility: GPUShaderStage.VERTEX | GPUShaderStage.COMPUTE,
      buffer: {}, // Grid uniform buffer
    },
    {
      binding: 1,
      visibility: GPUShaderStage.VERTEX | GPUShaderStage.COMPUTE,
      buffer: { type: "read-only-storage" }, // Cell state input buffer
    },
    {
      binding: 2,
      visibility: GPUShaderStage.COMPUTE,
      buffer: { type: "storage" }, // Cell state output buffer
    },
  ],
});

const pipelineLayout = device.createPipelineLayout({
  label: "Cell Pipeline Layout",
  bindGroupLayouts: [bindGroupLayout],
});

const cellShaderModule = device.createShaderModule({
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

const cellPipeline = device.createRenderPipeline({
  label: "Cell pipeline",
  layout: pipelineLayout,
  vertex: {
    module: cellShaderModule,
    entryPoint: "vertexMain",
    buffers: [vertexBufferLayout],
  },
  fragment: {
    module: cellShaderModule,
    entryPoint: "fragmentMain",
    targets: [{ format: canvasFormat }],
  },
});

// Create the compute shader that will process the simulation.
const simulationShaderModule = device.createShaderModule({
  label: "Game of Life simulation shader",
  code: `
    @group(0) @binding(0) var<uniform> grid: vec2f;
    @group(0) @binding(1) var<storage> cellStateIn: array<u32>;
    @group(0) @binding(2) var<storage, read_write> cellStateOut: array<u32>;

    fn cellIndex(cell: vec2u) -> u32 {
      return (cell.y % u32(grid.y)) * u32(grid.x) + (cell.x % u32(grid.x));
    }

    fn cellActive(x: u32, y: u32) -> u32 {
      return cellStateIn[cellIndex(vec2(x, y))];
    }
  
    @compute
    @workgroup_size(${WORKGROUP_SIZE}, ${WORKGROUP_SIZE})
    fn computeMain(@builtin(global_invocation_id) cell: vec3u) {
      let activeNeighbors = cellActive(cell.x+1, cell.y+1) +
                        cellActive(cell.x+1, cell.y) +
                        cellActive(cell.x+1, cell.y-1) +
                        cellActive(cell.x, cell.y-1) +
                        cellActive(cell.x-1, cell.y-1) +
                        cellActive(cell.x-1, cell.y) +
                        cellActive(cell.x-1, cell.y+1) +
                        cellActive(cell.x, cell.y+1);

      let i = cellIndex(cell.xy);

      // Conway's game of life rules:
      switch activeNeighbors {
        case 2: {
          // Active cells with 2 neighbors stay active.
          cellStateOut[i] = cellStateIn[i];
        }
        case 3: {
          // Cells with 3 neighbors become or stay active.
          cellStateOut[i] = 1;
        }
        default: {
          // Cells with < 2 or > 3 neighbors become inactive.
          cellStateOut[i] = 0;
        }
      }                        
    }`,
});

// Create a compute pipeline that updates the game state.
const simulationPipeline = device.createComputePipeline({
  label: "Simulation pipeline",
  layout: pipelineLayout,
  compute: {
    module: simulationShaderModule,
    entryPoint: "computeMain",
  },
});

const uniformArray = new Float32Array([GRID_SIZE, GRID_SIZE]);
const uniformBuffer = device.createBuffer({
  label: "Grid uniforms",
  size: uniformArray.byteLength,
  usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
});
device.queue.writeBuffer(uniformBuffer, 0, uniformArray);

// Create an array representing the active state of each cell.
const cellStateArray = new Uint32Array(GRID_SIZE * GRID_SIZE);

// Create a storage buffer to hold the cell state.
const cellStateStorage = [
  device.createBuffer({
    label: "Cell active state A",
    size: cellStateArray.byteLength,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  }),
  device.createBuffer({
    label: "Cell active state B",
    size: cellStateArray.byteLength,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  }),
];

// Mark every third cell of the grid as active.
for (let i = 0; i < cellStateArray.length; ++i) {
  cellStateArray[i] = Math.random() > 0.6 ? 1 : 0;
}
device.queue.writeBuffer(cellStateStorage[0], 0, cellStateArray);

// Mark every other cell of the second grid as active.
for (let i = 0; i < cellStateArray.length; i++) {
  cellStateArray[i] = i % 2;
}
device.queue.writeBuffer(cellStateStorage[1], 0, cellStateArray);

const bindGroups = [
  device.createBindGroup({
    label: "Cell renderer bind group A",
    layout: bindGroupLayout,
    entries: [
      { binding: 0, resource: { buffer: uniformBuffer } },
      { binding: 1, resource: { buffer: cellStateStorage[0] } },
      { binding: 2, resource: { buffer: cellStateStorage[1] } },
    ],
  }),
  device.createBindGroup({
    label: "Cell renderer bind group B",
    layout: bindGroupLayout,
    entries: [
      { binding: 0, resource: { buffer: uniformBuffer } },
      { binding: 1, resource: { buffer: cellStateStorage[1] } },
      { binding: 2, resource: { buffer: cellStateStorage[0] } },
    ],
  }),
];

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
        view: context.getCurrentTexture().createView(),
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
