import { NextRequest, NextResponse } from 'next/server';
import { Document, NodeIO } from '@gltf-transform/core';

const processColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];

// Enhanced color palette with better visual appeal
const enhancedColors = [
  '#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6',
  '#1ABC9C', '#E67E22', '#34495E', '#E91E63', '#00BCD4'
];

// Helper to convert hex to linear RGB with gamma correction
const hexToRgb = (hex: string): [number, number, number] => {
  const r = Math.pow(parseInt(hex.slice(1, 3), 16) / 255, 2.2);
  const g = Math.pow(parseInt(hex.slice(3, 5), 16) / 255, 2.2);
  const b = Math.pow(parseInt(hex.slice(5, 7), 16) / 255, 2.2);
  return [r, g, b];
};

// Create a rectangular box primitive for Gantt chart bars
function createRectangularBoxPrimitive(
  doc: Document, 
  material: any, 
  size: [number, number, number]
) {
  const [width, height, depth] = size;
  const hw = width / 2;
  const hh = height / 2;
  const hd = depth / 2;

  // Create a simple rectangular box
  const positions = new Float32Array([
    // Front face
    -hw, -hh,  hd,
     hw, -hh,  hd,
     hw,  hh,  hd,
    -hw,  hh,  hd,

    // Back face
    -hw, -hh, -hd,
    -hw,  hh, -hd,
     hw,  hh, -hd,
     hw, -hh, -hd,

    // Top face
    -hw,  hh, -hd,
    -hw,  hh,  hd,
     hw,  hh,  hd,
     hw,  hh, -hd,

    // Bottom face
    -hw, -hh, -hd,
     hw, -hh, -hd,
     hw, -hh,  hd,
    -hw, -hh,  hd,

    // Right face
     hw, -hh, -hd,
     hw,  hh, -hd,
     hw,  hh,  hd,
     hw, -hh,  hd,

    // Left face
    -hw, -hh, -hd,
    -hw, -hh,  hd,
    -hw,  hh,  hd,
    -hw,  hh, -hd,
  ]);

  const indices = new Uint16Array([
     0,  1,  2,  0,  2,  3, // front
     4,  5,  6,  4,  6,  7, // back
     8,  9, 10,  8, 10, 11, // top
    12, 13, 14, 12, 14, 15, // bottom
    16, 17, 18, 16, 18, 19, // right
    20, 21, 22, 20, 22, 23, // left
  ]);

  const buffer = doc.getRoot().listBuffers()[0] || doc.createBuffer();
  
  const positionAccessor = doc.createAccessor()
    .setArray(positions)
    .setType('VEC3')
    .setBuffer(buffer);

  const indicesAccessor = doc.createAccessor()
    .setArray(indices)
    .setType('SCALAR')
    .setBuffer(buffer);

  const primitive = doc.createPrimitive()
    .setIndices(indicesAccessor)
    .setAttribute('POSITION', positionAccessor)
    .setMaterial(material);
    
  return primitive;
}

// Create visible text using 3D geometry
function createVisibleTextPrimitive(
  doc: Document,
  material: any,
  text: string,
  size: number = 0.3
) {
  const positions: number[] = [];
  const indices: number[] = [];
  let vertexIndex = 0;

  // Create 3D text by building letter shapes
  const letterWidth = size * 0.6;
  const letterSpacing = size * 0.7;
  const thickness = size * 0.1;

  // Helper to add a rectangular character
  const addCharRect = (x: number, width: number = letterWidth) => {
    const hw = width / 2;
    const hh = size / 2;
    const hd = thickness / 2;

    // Add vertices for this character
    const baseIndex = vertexIndex;
    
    // Front face
    positions.push(x - hw, -hh, hd, x + hw, -hh, hd, x + hw, hh, hd, x - hw, hh, hd);
    // Back face  
    positions.push(x - hw, -hh, -hd, x - hw, hh, -hd, x + hw, hh, -hd, x + hw, -hh, -hd);
    // Top face
    positions.push(x - hw, hh, -hd, x - hw, hh, hd, x + hw, hh, hd, x + hw, hh, -hd);
    // Bottom face
    positions.push(x - hw, -hh, -hd, x + hw, -hh, -hd, x + hw, -hh, hd, x - hw, -hh, hd);
    // Right face
    positions.push(x + hw, -hh, -hd, x + hw, hh, -hd, x + hw, hh, hd, x + hw, -hh, hd);
    // Left face
    positions.push(x - hw, -hh, -hd, x - hw, -hh, hd, x - hw, hh, hd, x - hw, hh, -hd);

    // Add indices for faces
    for (let face = 0; face < 6; face++) {
      const faceStart = baseIndex + face * 4;
      indices.push(
        faceStart, faceStart + 1, faceStart + 2,
        faceStart, faceStart + 2, faceStart + 3
      );
    }
    
    vertexIndex += 24;
    return letterSpacing;
  };

  // Create simple blocks for each character
  let xOffset = -(text.length * letterSpacing) / 2;
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== ' ') {
      addCharRect(xOffset);
    }
    xOffset += letterSpacing;
  }

  const buffer = doc.getRoot().listBuffers()[0] || doc.createBuffer();
  
  const positionAccessor = doc.createAccessor()
    .setArray(new Float32Array(positions))
    .setType('VEC3')
    .setBuffer(buffer);

  const indicesAccessor = doc.createAccessor()
    .setArray(new Uint16Array(indices))
    .setType('SCALAR')
    .setBuffer(buffer);

  const primitive = doc.createPrimitive()
    .setIndices(indicesAccessor)
    .setAttribute('POSITION', positionAccessor)
    .setMaterial(material);
    
  return primitive;
}

// Create timeline markers
function createTimelinePrimitive(
  doc: Document,
  material: any,
  maxTime: number
) {
  const positions: number[] = [];
  const indices: number[] = [];
  let vertexIndex = 0;

  // Create timeline base
  const timelineLength = maxTime + 1;
  const timelineHeight = 0.05;
  const timelineDepth = 0.05;

  // Timeline base
  positions.push(
    0, -timelineHeight, -timelineDepth,
    timelineLength, -timelineHeight, -timelineDepth,
    timelineLength, timelineHeight, -timelineDepth,
    0, timelineHeight, -timelineDepth,
    
    0, -timelineHeight, timelineDepth,
    0, timelineHeight, timelineDepth,
    timelineLength, timelineHeight, timelineDepth,
    timelineLength, -timelineHeight, timelineDepth
  );

  // Timeline faces
  indices.push(
    0, 1, 2, 0, 2, 3, // front
    4, 5, 6, 4, 6, 7, // back
    3, 2, 6, 3, 6, 5, // top
    0, 4, 7, 0, 7, 1, // bottom
    1, 7, 6, 1, 6, 2, // right
    0, 3, 5, 0, 5, 4  // left
  );

  // Add time markers
  for (let t = 0; t <= maxTime; t++) {
    const markerHeight = 0.2;
    const baseIndex = positions.length / 3;
    
    positions.push(
      t, 0, -0.02,
      t, markerHeight, -0.02,
      t, markerHeight, 0.02,
      t, 0, 0.02
    );

    const faceStart = baseIndex;
    indices.push(
      faceStart, faceStart + 1, faceStart + 2,
      faceStart, faceStart + 2, faceStart + 3
    );
  }

  const buffer = doc.getRoot().listBuffers()[0] || doc.createBuffer();
  
  const positionAccessor = doc.createAccessor()
    .setArray(new Float32Array(positions))
    .setType('VEC3')
    .setBuffer(buffer);

  const indicesAccessor = doc.createAccessor()
    .setArray(new Uint16Array(indices))
    .setType('SCALAR')
    .setBuffer(buffer);

  const primitive = doc.createPrimitive()
    .setIndices(indicesAccessor)
    .setAttribute('POSITION', positionAccessor)
    .setMaterial(material);
    
  return primitive;
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const ganttData = searchParams.get('data');

  if (!ganttData) {
    return new NextResponse('Missing gantt data', { status: 400 });
  }

  try {
    const gantt = JSON.parse(ganttData);

    const doc = new Document();
    doc.createBuffer();
    const scene = doc.createScene('Process_Execution_Timeline');

    // Calculate chart dimensions to match the 2D layout
    const maxTime = Math.max(...gantt.map((entry: any) => entry.end));
    const processCount = gantt.length;
    const barHeight = 0.6;
    const barDepth = 0.3;
    const chartScale = 1.0; // Scale factor for the entire chart

    // Create materials matching the image colors
    const processColorMap = new Map<string, { material: any, color: string }>();
    const imageColors = ['#4285F4', '#34A853', '#EA4335', '#FBBC04', '#9C27B0']; // Blue, Green, Red, Yellow, Purple
    
    let colorIndex = 0;

    // Create text material (dark for visibility)
    const textMaterial = doc.createMaterial('Text')
      .setBaseColorFactor([0.2, 0.2, 0.2, 1])
      .setMetallicFactor(0)
      .setRoughnessFactor(0.9)
      .setEmissiveFactor([0.1, 0.1, 0.1]);

    // Create title "Process Execution Timeline" at the top
    const titlePrimitive = createVisibleTextPrimitive(doc, textMaterial, 'Process Execution Timeline', 0.4);
    const titleMesh = doc.createMesh('Chart_Title').addPrimitive(titlePrimitive);
    const titleNode = doc.createNode('Title_Node')
      .setMesh(titleMesh)
      .setTranslation([maxTime / 2, 2.0, 0]);
    scene.addChild(titleNode);

    // Create "Total Time: X units" label
    const totalTimePrimitive = createVisibleTextPrimitive(doc, textMaterial, `Total Time: ${maxTime} units`, 0.25);
    const totalTimeMesh = doc.createMesh('Total_Time').addPrimitive(totalTimePrimitive);
    const totalTimeNode = doc.createNode('TotalTime_Node')
      .setMesh(totalTimeMesh)
      .setTranslation([maxTime - 1, 1.5, 0]);
    scene.addChild(totalTimeNode);

    // Create process bars in a single row (like the image)
    let currentX = 0;
    gantt.forEach((entry: { name: string, start: number, end: number }, index: number) => {
      const { name, start, end } = entry;
      const duration = end - start;

      if (duration <= 0) return;

      // Create or get material for this process using image-like colors
      if (!processColorMap.has(name)) {
        const color = imageColors[colorIndex % imageColors.length];
        const [r, g, b] = hexToRgb(color);
        const material = doc.createMaterial(`Process_${name}`)
          .setBaseColorFactor([r, g, b, 1])
          .setMetallicFactor(0.1)
          .setRoughnessFactor(0.8)
          .setEmissiveFactor([r * 0.1, g * 0.1, b * 0.1]);
        
        processColorMap.set(name, { material, color });
        colorIndex++;
      }
      
      const { material } = processColorMap.get(name)!;

      // Create rectangular process bar positioned exactly like in the image
      const boxPrimitive = createRectangularBoxPrimitive(doc, material, [duration, barHeight, barDepth]);
      const mesh = doc.createMesh(`Process_Bar_${name}`).addPrimitive(boxPrimitive);
      
      // Position the bar - all bars in the same row at y=0
      const xPosition = start + duration / 2;
      
      const node = doc.createNode(`Process_${name}`)
        .setMesh(mesh)
        .setTranslation([xPosition, 0, 0]);
      scene.addChild(node);

      // Create process name label on the bar (like "P1", "P2")
      const labelPrimitive = createVisibleTextPrimitive(doc, textMaterial, name, 0.3);
      const labelMesh = doc.createMesh(`Label_${name}`).addPrimitive(labelPrimitive);
      const labelNode = doc.createNode(`Label_${name}`)
        .setMesh(labelMesh)
        .setTranslation([xPosition, 0, 0.4]);
      scene.addChild(labelNode);
    });

    // Create time markers at the bottom (like 0, 4, 7 in the image)
    const timeMarkers = [0, ...gantt.map((entry: any) => entry.end)];
    const uniqueTimeMarkers = [...new Set(timeMarkers)].sort((a, b) => a - b);

    uniqueTimeMarkers.forEach(time => {
      // Create time marker line
      const markerMaterial = doc.createMaterial(`Marker_${time}`)
        .setBaseColorFactor([0.7, 0.7, 0.7, 1])
        .setMetallicFactor(0)
        .setRoughnessFactor(1);

      const markerPrimitive = createRectangularBoxPrimitive(doc, markerMaterial, [0.02, 0.3, 0.02]);
      const markerMesh = doc.createMesh(`Marker_${time}`).addPrimitive(markerPrimitive);
      const markerNode = doc.createNode(`Marker_${time}_Node`)
        .setMesh(markerMesh)
        .setTranslation([time, -0.6, 0]);
      scene.addChild(markerNode);

      // Create time label
      const timeLabelPrimitive = createVisibleTextPrimitive(doc, textMaterial, time.toString(), 0.2);
      const timeLabelMesh = doc.createMesh(`TimeLabel_${time}`).addPrimitive(timeLabelPrimitive);
      const timeLabelNode = doc.createNode(`TimeLabel_${time}_Node`)
        .setMesh(timeLabelMesh)
        .setTranslation([time, -1.0, 0]);
      scene.addChild(timeLabelNode);
    });

    // Create process legend at the bottom (like the colored squares in the image)
    let legendX = 0;
    gantt.forEach((entry: { name: string, start: number, end: number }, index: number) => {
      const { name } = entry;
      const { material, color } = processColorMap.get(name)!;

      // Create small colored square for legend
      const legendSquarePrimitive = createRectangularBoxPrimitive(doc, material, [0.3, 0.2, 0.1]);
      const legendSquareMesh = doc.createMesh(`Legend_${name}`).addPrimitive(legendSquarePrimitive);
      const legendSquareNode = doc.createNode(`Legend_${name}_Node`)
        .setMesh(legendSquareMesh)
        .setTranslation([legendX, -1.8, 0]);
      scene.addChild(legendSquareNode);

      // Create legend label
      const legendLabelPrimitive = createVisibleTextPrimitive(doc, textMaterial, name, 0.15);
      const legendLabelMesh = doc.createMesh(`LegendLabel_${name}`).addPrimitive(legendLabelPrimitive);
      const legendLabelNode = doc.createNode(`LegendLabel_${name}_Node`)
        .setMesh(legendLabelMesh)
        .setTranslation([legendX + 0.6, -1.8, 0]);
      scene.addChild(legendLabelNode);

      legendX += 1.5; // Space between legend items
    });

    // Create a subtle background base
    const baseMaterial = doc.createMaterial('Base')
      .setBaseColorFactor([0.95, 0.95, 0.95, 0.8])
      .setMetallicFactor(0)
      .setRoughnessFactor(1)
      .setAlphaMode('BLEND');

    const basePrimitive = createRectangularBoxPrimitive(doc, baseMaterial, [maxTime + 1, 0.05, 2]);
    const baseMesh = doc.createMesh('Base').addPrimitive(basePrimitive);
    const baseNode = doc.createNode('Base_Node')
      .setMesh(baseMesh)
      .setTranslation([maxTime / 2, -0.4, -0.5]);
    scene.addChild(baseNode);

    const io = new NodeIO();
    const glb = await io.writeBinary(doc);

    return new NextResponse(glb, {
      status: 200,
      headers: {
        'Content-Type': 'model/gltf-binary',
        'Content-Disposition': 'attachment; filename="process-execution-timeline.glb"',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Error generating Process Execution Timeline:', error);
    return new NextResponse('Error generating model', { status: 500 });
  }
} 