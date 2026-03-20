import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { barcodeData } = await request.json();

    if (!barcodeData) {
      return NextResponse.json(
        { success: false, error: 'Barcode data is required' },
        { status: 400 }
      );
    }

    // Parse JSON from barcode data
    let yarnData;
    try {
      yarnData = JSON.parse(barcodeData);
    } catch (parseError) {
      return NextResponse.json(
        { success: false, error: 'Invalid barcode format' },
        { status: 400 }
      );
    }

    // Validate required fields
    const required = ['yarnName', 'grade', 'supplier', 'weight', 'cost'];
    for (const field of required) {
      if (!yarnData[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field in barcode: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate numeric fields
    if (typeof yarnData.weight !== 'number' || yarnData.weight <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid weight in barcode data' },
        { status: 400 }
      );
    }

    if (typeof yarnData.cost !== 'number' || yarnData.cost <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid cost in barcode data' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: yarnData
    });

  } catch (error) {
    console.error('Barcode decode error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to decode barcode' },
      { status: 500 }
    );
  }
}
