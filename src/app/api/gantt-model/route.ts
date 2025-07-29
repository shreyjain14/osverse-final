import { NextRequest, NextResponse } from 'next/server';
import { Document, NodeIO, Accessor, Primitive } from '@gltf-transform/core';
import { createCanvas } from 'canvas';

const processColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];

// Helper to convert hex to linear RGB
const hexToRgb = (hex: string): [number, number, number] => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b];
};

function createTexturedBoxPrimitive(
  doc: Document, 
  material: any, 
  size: [number, number, number],
  text: string,
  textColor: string = 'white',
  font: string = '24px sans-serif'
): Primitive {
  const [width, height, depth] = size;

  const positions = new Float32Array([
    // Front face
    -width / 2, -height / 2,  depth / 2,
     width / 2, -height / 2,  depth / 2,
     width / 2,  height / 2,  depth / 2,
    -width / 2,  height / 2,  depth / 2,

    // Back face
    -width / 2, -height / 2, -depth / 2,
    -width / 2,  height / 2, -depth / 2,
     width / 2,  height / 2, -depth / 2,
     width / 2, -height / 2, -depth / 2,

    // Top face
    -width / 2,  height / 2, -depth / 2,
    -width / 2,  height / 2,  depth / 2,
     width / 2,  height / 2,  depth / 2,
     width / 2,  height / 2, -depth / 2,

    // Bottom face
    -width / 2, -height / 2, -depth / 2,
     width / 2, -height / 2, -depth / 2,
     width / 2, -height / 2,  depth / 2,
    -width / 2, -height / 2,  depth / 2,

    // Right face
     width / 2, -height / 2, -depth / 2,
     width / 2,  height / 2, -depth / 2,
     width / 2,  height / 2,  depth / 2,
     width / 2, -height / 2,  depth / 2,

    // Left face
    -width / 2, -height / 2, -depth / 2,
    -width / 2, -height / 2,  depth / 2,
    -width / 2,  height / 2,  depth / 2,
    -width / 2,  height / 2, -depth / 2,
  ]);

  const uvs = new Float32Array([
    // Front face
    0, 0,
    1, 0,
    1, 1,
    0, 1,

    // Other faces - not textured
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
  ]);
  
  const indices = new Uint16Array([
     0,  1,  2,  0,  2,  3, // front
     4,  5,  6,  4,  6,  7, // back
     8,  9, 10,  8, 10, 11, // top
    12, 13, 14, 12, 14, 15, // bottom
    16, 17, 18, 16, 18, 19, // right
    20, 21, 22, 20, 22, 23, // left
  ]);

  // Create text texture
  const canvas = createCanvas(256, 128);
  const ctx = canvas.getContext('2d');
  
  const [r, g, b] = material.getBaseColorFactor().slice(0, 3).map((c: number) => Math.floor(c * 255));
  ctx.fillStyle = `rgb(${r},${g},${b})`;
  ctx.fillRect(0, 0, 256, 128); // Use material color as background

  ctx.font = font;
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 64);
  const textureImage = canvas.toBuffer('image/png');

  const texture = doc.createTexture(text)
    .setImage(textureImage)
    .setMimeType('image/png');
  
  material.setBaseColorTexture(texture);

  const buffer = doc.getRoot().listBuffers()[0] || doc.createBuffer();
  
  const positionAccessor = doc.createAccessor()
    .setArray(positions)
    .setType(Accessor.Type.VEC3)
    .setBuffer(buffer);
  
  const uvAccessor = doc.createAccessor()
    .setArray(uvs)
    .setType(Accessor.Type.VEC2)
    .setBuffer(buffer);

  const indicesAccessor = doc.createAccessor()
    .setArray(indices)
    .setType(Accessor.Type.SCALAR)
    .setBuffer(buffer);

  const primitive = doc.createPrimitive()
    .setIndices(indicesAccessor)
    .setAttribute('POSITION', positionAccessor)
    .setAttribute('TEXCOORD_0', uvAccessor)
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
    const scene = doc.createScene('GanttChartScene');

    const processColorMap = new Map<string, { material: any, colorIndex: number }>();
    let colorIndex = 0;

    gantt.forEach((entry: { name:string, start: number, end: number }) => {
      const { name, start, end } = entry;
      const duration = end - start;

      if (duration <= 0) return;

      if (!processColorMap.has(name)) {
        const material = doc.createMaterial(name)
          .setBaseColorFactor([...hexToRgb(processColors[colorIndex % processColors.length]), 1])
          .setMetallicFactor(0)
          .setRoughnessFactor(0.8);
        processColorMap.set(name, { material, colorIndex });
        colorIndex++;
      }
      
      const { material } = processColorMap.get(name)!;

      const boxPrimitive = createTexturedBoxPrimitive(doc, material, [duration, 0.5, 0.5], name);
      const mesh = doc.createMesh(name).addPrimitive(boxPrimitive);
      const node = doc.createNode(name).setMesh(mesh).setTranslation([start + duration / 2, 0, 0]);
      scene.addChild(node);
    });

    const io = new NodeIO();
    const glb = await io.writeBinary(doc);

    return new NextResponse(glb, {
      status: 200,
      headers: {
        'Content-Type': 'model/gltf-binary',
        'Content-Disposition': 'attachment; filename="gantt-chart.glb"',
      },
    });
  } catch (error) {
    console.error(error);
    return new NextResponse('Error generating model', { status: 500 });
  }
} 