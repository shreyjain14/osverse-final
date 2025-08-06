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

// Create sophisticated 3D text using actual letter shapes
function createAdvanced3DTextPrimitive(
  doc: Document,
  material: any,
  text: string,
  size: number = 0.3,
  depth: number = 0.05
) {
  const positions: number[] = [];
  const indices: number[] = [];
  let vertexIndex = 0;

  const letterWidth = size * 0.7;
  const letterSpacing = size * 0.8;
  const letterHeight = size;
  const letterDepth = depth;

  // Helper to add line segment (for drawing letter strokes)
  const addLineSegment = (x1: number, y1: number, x2: number, y2: number, baseX: number, thickness: number = 0.015) => {
    const startIdx = positions.length / 3;
    
    // Calculate direction and perpendicular vectors
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    if (length === 0) return; // Skip zero-length segments
    
    const ux = dx / length;
    const uy = dy / length;
    const perpX = -uy * thickness;
    const perpY = ux * thickness;

    // Create smoother rectangular line segment with rounded ends
    const hd = letterDepth / 2;
    const segments = 3; // Add segments for smoother curves
    
    // Create main body with multiple segments for smoothness
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = x1 + (x2 - x1) * t;
      const y = y1 + (y2 - y1) * t;
      
      // Front face vertices (with slight curve)
      const curve = Math.sin(t * Math.PI) * 0.01; // Small curve for smoothness
      positions.push(
        baseX + x + perpX + curve, y + perpY, hd,
        baseX + x - perpX - curve, y - perpY, hd
      );
      
      // Back face vertices
      positions.push(
        baseX + x + perpX + curve, y + perpY, -hd,
        baseX + x - perpX - curve, y - perpY, -hd
      );
    }

    const vIdx = vertexIndex + startIdx;
    
    // Create triangulated surfaces for smoothness
    for (let i = 0; i < segments; i++) {
      const base = i * 4;
      const next = (i + 1) * 4;
      
      // Front face triangles
      indices.push(
        vIdx + base, vIdx + base + 1, vIdx + next + 1,
        vIdx + base, vIdx + next + 1, vIdx + next
      );
      
      // Back face triangles
      indices.push(
        vIdx + base + 2, vIdx + next + 3, vIdx + base + 3,
        vIdx + base + 2, vIdx + next + 2, vIdx + next + 3
      );
      
      // Side triangles for smooth connections
      indices.push(
        vIdx + base, vIdx + next, vIdx + next + 2,
        vIdx + base, vIdx + next + 2, vIdx + base + 2
      );
      
      indices.push(
        vIdx + base + 1, vIdx + base + 3, vIdx + next + 3,
        vIdx + base + 1, vIdx + next + 3, vIdx + next + 1
      );
    }
  };

  // Helper to create specific letter shapes
  const createLetter = (char: string, baseX: number) => {
    const hw = letterWidth / 2;
    const hh = letterHeight / 2;
    
    switch(char.toUpperCase()) {
      case 'A':
        addLineSegment(-hw, -hh, 0, hh, baseX); // Left diagonal
        addLineSegment(0, hh, hw, -hh, baseX);   // Right diagonal
        addLineSegment(-hw/2, 0, hw/2, 0, baseX); // Cross bar
        break;
        
      case 'B':
        addLineSegment(-hw, -hh, -hw, hh, baseX);      // Vertical line
        addLineSegment(-hw, hh, hw/2, hh, baseX);      // Top horizontal
        addLineSegment(-hw, 0, hw/3, 0, baseX);        // Middle horizontal
        addLineSegment(-hw, -hh, hw/2, -hh, baseX);    // Bottom horizontal
        addLineSegment(hw/2, hh, hw/2, 0, baseX);      // Top right vertical
        addLineSegment(hw/3, 0, hw/2, -hh, baseX);     // Bottom right vertical
        break;
        
      case 'C':
        addLineSegment(-hw, -hh, -hw, hh, baseX);      // Vertical line
        addLineSegment(-hw, hh, hw, hh, baseX);        // Top horizontal
        addLineSegment(-hw, -hh, hw, -hh, baseX);      // Bottom horizontal
        break;
        
      case 'D':
        addLineSegment(-hw, -hh, -hw, hh, baseX);      // Vertical line
        addLineSegment(-hw, hh, hw/2, hh, baseX);      // Top horizontal
        addLineSegment(-hw, -hh, hw/2, -hh, baseX);    // Bottom horizontal
        addLineSegment(hw/2, hh, hw, 0, baseX);        // Top right diagonal
        addLineSegment(hw, 0, hw/2, -hh, baseX);       // Bottom right diagonal
        break;
        
      case 'E':
        addLineSegment(-hw, -hh, -hw, hh, baseX);      // Vertical line
        addLineSegment(-hw, hh, hw, hh, baseX);        // Top horizontal
        addLineSegment(-hw, 0, hw/2, 0, baseX);        // Middle horizontal
        addLineSegment(-hw, -hh, hw, -hh, baseX);      // Bottom horizontal
        break;
        
      case 'F':
        addLineSegment(-hw, -hh, -hw, hh, baseX);      // Vertical line
        addLineSegment(-hw, hh, hw, hh, baseX);        // Top horizontal
        addLineSegment(-hw, 0, hw/2, 0, baseX);        // Middle horizontal
        break;
        
      case 'G':
        addLineSegment(-hw, -hh, -hw, hh, baseX);      // Vertical line
        addLineSegment(-hw, hh, hw, hh, baseX);        // Top horizontal
        addLineSegment(-hw, -hh, hw, -hh, baseX);      // Bottom horizontal
        addLineSegment(hw, -hh, hw, 0, baseX);         // Right vertical (partial)
        addLineSegment(0, 0, hw, 0, baseX);            // Right horizontal
        break;
        
      case 'H':
        addLineSegment(-hw, -hh, -hw, hh, baseX);      // Left vertical
        addLineSegment(hw, -hh, hw, hh, baseX);        // Right vertical
        addLineSegment(-hw, 0, hw, 0, baseX);          // Middle horizontal
        break;
        
      case 'I':
        addLineSegment(0, -hh, 0, hh, baseX);          // Vertical line
        addLineSegment(-hw/2, hh, hw/2, hh, baseX);    // Top horizontal
        addLineSegment(-hw/2, -hh, hw/2, -hh, baseX);  // Bottom horizontal
        break;
        
      case 'J':
        addLineSegment(hw, hh, hw, -hh/2, baseX);      // Vertical line
        addLineSegment(hw, -hh/2, 0, -hh, baseX);      // Bottom curve
        addLineSegment(0, -hh, -hw/2, -hh, baseX);     // Bottom horizontal
        break;
        
      case 'L':
        addLineSegment(-hw, -hh, -hw, hh, baseX);      // Vertical line
        addLineSegment(-hw, -hh, hw, -hh, baseX);      // Bottom horizontal
        break;
        
      case 'M':
        addLineSegment(-hw, -hh, -hw, hh, baseX);      // Left vertical
        addLineSegment(hw, -hh, hw, hh, baseX);        // Right vertical
        addLineSegment(-hw, hh, 0, 0, baseX);          // Left diagonal
        addLineSegment(0, 0, hw, hh, baseX);           // Right diagonal
        break;
        
      case 'N':
        addLineSegment(-hw, -hh, -hw, hh, baseX);      // Left vertical
        addLineSegment(hw, -hh, hw, hh, baseX);        // Right vertical
        addLineSegment(-hw, -hh, hw, hh, baseX);       // Diagonal
        break;
        
      case 'O':
        addLineSegment(-hw, -hh, -hw, hh, baseX);      // Left vertical
        addLineSegment(hw, -hh, hw, hh, baseX);        // Right vertical
        addLineSegment(-hw, hh, hw, hh, baseX);        // Top horizontal
        addLineSegment(-hw, -hh, hw, -hh, baseX);      // Bottom horizontal
        break;
        
      case 'P':
        addLineSegment(-hw, -hh, -hw, hh, baseX);      // Vertical line
        addLineSegment(-hw, hh, hw, hh, baseX);        // Top horizontal
        addLineSegment(-hw, 0, hw, 0, baseX);          // Middle horizontal
        addLineSegment(hw, hh, hw, 0, baseX);          // Right vertical (upper)
        break;
        
      case 'Q':
        addLineSegment(-hw, -hh, -hw, hh, baseX);      // Left vertical
        addLineSegment(hw, -hh, hw, hh, baseX);        // Right vertical
        addLineSegment(-hw, hh, hw, hh, baseX);        // Top horizontal
        addLineSegment(-hw, -hh, hw, -hh, baseX);      // Bottom horizontal
        addLineSegment(hw/2, -hh/2, hw*1.2, -hh*1.2, baseX); // Tail
        break;
        
      case 'R':
        addLineSegment(-hw, -hh, -hw, hh, baseX);      // Vertical line
        addLineSegment(-hw, hh, hw, hh, baseX);        // Top horizontal
        addLineSegment(-hw, 0, hw, 0, baseX);          // Middle horizontal
        addLineSegment(hw, hh, hw, 0, baseX);          // Right vertical (upper)
        addLineSegment(0, 0, hw, -hh, baseX);          // Diagonal leg
        break;
        
      case 'S':
        addLineSegment(-hw, hh, hw, hh, baseX);        // Top horizontal
        addLineSegment(-hw, hh, -hw, 0, baseX);        // Left vertical (upper)
        addLineSegment(-hw, 0, hw, 0, baseX);          // Middle horizontal
        addLineSegment(hw, 0, hw, -hh, baseX);         // Right vertical (lower)
        addLineSegment(hw, -hh, -hw, -hh, baseX);      // Bottom horizontal
        break;
        
      case 'T':
        addLineSegment(-hw, hh, hw, hh, baseX);        // Top horizontal
        addLineSegment(0, hh, 0, -hh, baseX);          // Vertical line
        break;
        
      case 'U':
        addLineSegment(-hw, hh, -hw, -hh, baseX);      // Left vertical
        addLineSegment(hw, hh, hw, -hh, baseX);        // Right vertical
        addLineSegment(-hw, -hh, hw, -hh, baseX);      // Bottom horizontal
        break;
        
      case 'V':
        addLineSegment(-hw, hh, 0, -hh, baseX);        // Left diagonal
        addLineSegment(0, -hh, hw, hh, baseX);         // Right diagonal
        break;
        
      case 'W':
        addLineSegment(-hw, hh, -hw/2, -hh, baseX);    // Left outer diagonal
        addLineSegment(-hw/2, -hh, 0, hh/2, baseX);    // Left inner diagonal
        addLineSegment(0, hh/2, hw/2, -hh, baseX);     // Right inner diagonal
        addLineSegment(hw/2, -hh, hw, hh, baseX);      // Right outer diagonal
        break;
        
      case 'X':
        addLineSegment(-hw, hh, hw, -hh, baseX);       // Top-left to bottom-right
        addLineSegment(-hw, -hh, hw, hh, baseX);       // Bottom-left to top-right
        break;
        
      case 'Y':
        addLineSegment(-hw, hh, 0, 0, baseX);          // Left diagonal
        addLineSegment(hw, hh, 0, 0, baseX);           // Right diagonal
        addLineSegment(0, 0, 0, -hh, baseX);           // Vertical line
        break;
        
      case 'Z':
        addLineSegment(-hw, hh, hw, hh, baseX);        // Top horizontal
        addLineSegment(hw, hh, -hw, -hh, baseX);       // Diagonal
        addLineSegment(-hw, -hh, hw, -hh, baseX);      // Bottom horizontal
        break;
        
      // Numbers
      case '0':
        addLineSegment(-hw, -hh, -hw, hh, baseX);      // Left vertical
        addLineSegment(hw, -hh, hw, hh, baseX);        // Right vertical
        addLineSegment(-hw, hh, hw, hh, baseX);        // Top horizontal
        addLineSegment(-hw, -hh, hw, -hh, baseX);      // Bottom horizontal
        addLineSegment(-hw, -hh, hw, hh, baseX);       // Diagonal
        break;
        
      case '1':
        addLineSegment(0, -hh, 0, hh, baseX);          // Vertical line
        addLineSegment(-hw/2, hh/2, 0, hh, baseX);     // Top diagonal
        break;
        
      case '2':
        addLineSegment(-hw, hh, hw, hh, baseX);        // Top horizontal
        addLineSegment(hw, hh, hw, 0, baseX);          // Right vertical (upper)
        addLineSegment(hw, 0, -hw, 0, baseX);          // Middle horizontal
        addLineSegment(-hw, 0, -hw, -hh, baseX);       // Left vertical (lower)
        addLineSegment(-hw, -hh, hw, -hh, baseX);      // Bottom horizontal
        break;
        
      case '3':
        addLineSegment(-hw, hh, hw, hh, baseX);        // Top horizontal
        addLineSegment(hw, hh, hw, -hh, baseX);        // Right vertical
        addLineSegment(-hw, 0, hw, 0, baseX);          // Middle horizontal
        addLineSegment(-hw, -hh, hw, -hh, baseX);      // Bottom horizontal
        break;
        
      case '4':
        addLineSegment(-hw, hh, -hw, 0, baseX);        // Left vertical (upper)
        addLineSegment(hw, hh, hw, -hh, baseX);        // Right vertical
        addLineSegment(-hw, 0, hw, 0, baseX);          // Middle horizontal
        break;
        
      case '5':
        addLineSegment(-hw, hh, hw, hh, baseX);        // Top horizontal
        addLineSegment(-hw, hh, -hw, 0, baseX);        // Left vertical (upper)
        addLineSegment(-hw, 0, hw, 0, baseX);          // Middle horizontal
        addLineSegment(hw, 0, hw, -hh, baseX);         // Right vertical (lower)
        addLineSegment(hw, -hh, -hw, -hh, baseX);      // Bottom horizontal
        break;
        
      case '6':
        addLineSegment(-hw, hh, hw, hh, baseX);        // Top horizontal
        addLineSegment(-hw, hh, -hw, -hh, baseX);      // Left vertical
        addLineSegment(-hw, 0, hw, 0, baseX);          // Middle horizontal
        addLineSegment(hw, 0, hw, -hh, baseX);         // Right vertical (lower)
        addLineSegment(-hw, -hh, hw, -hh, baseX);      // Bottom horizontal
        break;
        
      case '7':
        addLineSegment(-hw, hh, hw, hh, baseX);        // Top horizontal
        addLineSegment(hw, hh, hw/2, -hh, baseX);      // Diagonal
        break;
        
      case '8':
        addLineSegment(-hw, -hh, -hw, hh, baseX);      // Left vertical
        addLineSegment(hw, -hh, hw, hh, baseX);        // Right vertical
        addLineSegment(-hw, hh, hw, hh, baseX);        // Top horizontal
        addLineSegment(-hw, 0, hw, 0, baseX);          // Middle horizontal
        addLineSegment(-hw, -hh, hw, -hh, baseX);      // Bottom horizontal
        break;
        
      case '9':
        addLineSegment(-hw, hh, hw, hh, baseX);        // Top horizontal
        addLineSegment(-hw, hh, -hw, 0, baseX);        // Left vertical (upper)
        addLineSegment(hw, hh, hw, -hh, baseX);        // Right vertical
        addLineSegment(-hw, 0, hw, 0, baseX);          // Middle horizontal
        addLineSegment(hw, -hh, -hw, -hh, baseX);      // Bottom horizontal
        break;
        
      default:
        // For unknown characters, create a simple rectangle
        addLineSegment(-hw, -hh, -hw, hh, baseX);      // Left vertical
        addLineSegment(hw, -hh, hw, hh, baseX);        // Right vertical
        addLineSegment(-hw, hh, hw, hh, baseX);        // Top horizontal
        addLineSegment(-hw, -hh, hw, -hh, baseX);      // Bottom horizontal
        break;
    }
  };

  // Create 3D characters for each letter
  let xOffset = -(text.length * letterSpacing) / 2;
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== ' ') {
      createLetter(text[i], xOffset);
    }
    xOffset += letterSpacing;
  }

  if (positions.length === 0) {
    // Create a simple fallback if no geometry was generated
    positions.push(0, 0, 0, 0.1, 0, 0, 0.1, 0.1, 0);
    indices.push(0, 1, 2);
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
  const algorithm = searchParams.get('algorithm') || 'FCFS'; // Get algorithm type

  if (!ganttData) {
    return new NextResponse('Missing gantt data', { status: 400 });
  }

  try {
    const gantt = JSON.parse(ganttData);

    const doc = new Document();
    doc.createBuffer();
    const scene = doc.createScene(`${algorithm}_GanttChart_Scene`);

    // Calculate chart dimensions to match the 2D layout
    const maxTime = Math.max(...gantt.map((entry: any) => entry.end));
    const processCount = gantt.length;
    const barHeight = 0.6;
    const barDepth = 0.3;
    const chartScale = 1.0; // Scale factor for the entire chart

    // Algorithm-specific information (simplified)
    const algorithmInfo = {
      'FCFS': { name: 'First Come First Served' },
      'SJF': { name: 'Shortest Job First' },
      'SRTF': { name: 'Shortest Remaining Time First' },
      'RR': { name: 'Round Robin' },
      'PRIORITY': { name: 'Priority Scheduling' },
      'MLFQ': { name: 'Multi-Level Feedback Queue' }
    };

    const currentAlgorithm = algorithmInfo[algorithm as keyof typeof algorithmInfo] || algorithmInfo['FCFS'];

    // Create materials matching the image colors
    const processColorMap = new Map<string, { material: any, color: string }>();
    const imageColors = ['#4285F4', '#34A853', '#EA4335', '#FBBC04', '#9C27B0']; // Blue, Green, Red, Yellow, Purple
    
    let colorIndex = 0;

    // Create text material (smooth and clear)
    const textMaterial = doc.createMaterial('Text')
      .setBaseColorFactor([0.05, 0.05, 0.05, 1])
      .setMetallicFactor(0.1)
      .setRoughnessFactor(0.4)
      .setEmissiveFactor([0.2, 0.2, 0.2]);

    // Create algorithm-specific title
    const titlePrimitive = createAdvanced3DTextPrimitive(doc, textMaterial, `${currentAlgorithm.name}`, 0.35, 0.07);
    const titleMesh = doc.createMesh('Chart_Title').addPrimitive(titlePrimitive);
    const titleNode = doc.createNode('Title_Node')
      .setMesh(titleMesh)
      .setTranslation([maxTime / 2, 2.2, 0]);
    scene.addChild(titleNode);

    // Create "Total Time: X units" label
    const totalTimePrimitive = createAdvanced3DTextPrimitive(doc, textMaterial, `Total Time: ${maxTime} units`, 0.25, 0.05);
    const totalTimeMesh = doc.createMesh('Total_Time').addPrimitive(totalTimePrimitive);
    const totalTimeNode = doc.createNode('TotalTime_Node')
      .setMesh(totalTimeMesh)
      .setTranslation([maxTime - 1, 1.8, 0]);
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
      const labelPrimitive = createAdvanced3DTextPrimitive(doc, textMaterial, name, 0.3, 0.06);
      const labelMesh = doc.createMesh(`Label_${name}`).addPrimitive(labelPrimitive);
      const labelNode = doc.createNode(`Label_${name}`)
        .setMesh(labelMesh)
        .setTranslation([xPosition, 0, 0.4]);
      scene.addChild(labelNode);

      // Add execution time on the bar
      const durationLabelPrimitive = createAdvanced3DTextPrimitive(doc, textMaterial, `${duration}u`, 0.15, 0.03);
      const durationLabelMesh = doc.createMesh(`Duration_${name}`).addPrimitive(durationLabelPrimitive);
      const durationLabelNode = doc.createNode(`Duration_${name}_Node`)
        .setMesh(durationLabelMesh)
        .setTranslation([xPosition, -0.2, 0.2]);
      scene.addChild(durationLabelNode);
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
      const timeLabelPrimitive = createAdvanced3DTextPrimitive(doc, textMaterial, time.toString(), 0.2, 0.04);
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
      const legendLabelPrimitive = createAdvanced3DTextPrimitive(doc, textMaterial, name, 0.15, 0.03);
      const legendLabelMesh = doc.createMesh(`LegendLabel_${name}`).addPrimitive(legendLabelPrimitive);
      const legendLabelNode = doc.createNode(`LegendLabel_${name}_Node`)
        .setMesh(legendLabelMesh)
        .setTranslation([legendX + 0.6, -1.8, 0]);
      scene.addChild(legendLabelNode);

      legendX += 1.5; // Space between legend items
    });

    // Add axis labels
    const timeAxisPrimitive = createAdvanced3DTextPrimitive(doc, textMaterial, 'TIME UNITS', 0.18, 0.03);
    const timeAxisMesh = doc.createMesh('TimeAxis').addPrimitive(timeAxisPrimitive);
    const timeAxisNode = doc.createNode('TimeAxis_Node')
      .setMesh(timeAxisMesh)
      .setTranslation([maxTime / 2, -1.4, 0]);
    scene.addChild(timeAxisNode);

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
        'Content-Disposition': `attachment; filename="${algorithm.toLowerCase()}-gantt-chart.glb"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Error generating Process Execution Timeline:', error);
    return new NextResponse('Error generating model', { status: 500 });
  }
} 