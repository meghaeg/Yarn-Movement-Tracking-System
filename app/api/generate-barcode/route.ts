import { NextRequest, NextResponse } from 'next/server';

// Simple text-based barcode generation
function generateBarcodeImage(data: string): Buffer {
  // Parse the JSON data to extract fields
  const yarnData = JSON.parse(data);
  
  const svgContent = `
    <svg width="400" height="150" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="150" fill="white"/>
      <text x="200" y="20" font-family="monospace" font-size="10" text-anchor="middle" fill="black">
        ${data.substring(0, 40)}...
      </text>
      <text x="200" y="35" font-family="monospace" font-size="8" text-anchor="middle" fill="black">
        Yarn: ${yarnData.yarnName || 'N/A'}
      </text>
      <text x="200" y="45" font-family="monospace" font-size="8" text-anchor="middle" fill="black">
        Grade: ${yarnData.grade || 'N/A'}
      </text>
      <text x="200" y="55" font-family="monospace" font-size="8" text-anchor="middle" fill="black">
        Supplier: ${yarnData.supplier || 'N/A'}
      </text>
      <text x="200" y="65" font-family="monospace" font-size="8" text-anchor="middle" fill="black">
        Weight: ${yarnData.weight || 0}kg
      </text>
      <text x="200" y="75" font-family="monospace" font-size="8" text-anchor="middle" fill="black">
        Cost: ₹${yarnData.cost || 0}
      </text>
      <text x="200" y="90" font-family="monospace" font-size="6" text-anchor="middle" fill="gray">
        ${new Date().toISOString()}
      </text>
    </svg>
  `;
  return Buffer.from(svgContent);
}

export async function POST(request: NextRequest) {
  try {
    const yarnData = await request.json();

    // Validate required fields
    const required = ['yarnName', 'grade', 'supplier', 'weight', 'cost'];
    for (const field of required) {
      if (!yarnData[field] || yarnData[field] === '') {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate numeric fields
    if (typeof yarnData.weight !== 'number' || yarnData.weight <= 0) {
      return NextResponse.json(
        { success: false, error: 'Weight must be a positive number' },
        { status: 400 }
      );
    }

    if (typeof yarnData.cost !== 'number' || yarnData.cost <= 0) {
      return NextResponse.json(
        { success: false, error: 'Cost must be a positive number' },
        { status: 400 }
      );
    }

    // Create JSON string for barcode
    const jsonData = JSON.stringify({
      ...yarnData,
      generated_at: new Date().toISOString()
    });

    // Generate barcode image
    const barcodeBuffer = generateBarcodeImage(jsonData);

    // Return as image
    return new NextResponse(new Uint8Array(barcodeBuffer), {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Content-Disposition': 'inline; filename=barcode.svg',
      },
    });

  } catch (error) {
    console.error('Barcode generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate barcode' },
      { status: 500 }
    );
  }
}
