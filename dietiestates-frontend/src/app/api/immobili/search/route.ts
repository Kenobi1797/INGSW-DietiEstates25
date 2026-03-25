import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const response = await fetch(`${apiUrl}/immobili/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error('Errore nella ricerca');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Errore API search:', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}