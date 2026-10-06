import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // VERY BASIC / INSECURE login specifically for this forensics lab
    // We want the plaintext credentials to be visible in the network
    const result = await query(
      'SELECT id, username FROM users WHERE username = $1 AND password = $2',
      [username, password]
    );

    if (result.rows.length > 0) {
      return NextResponse.json({ success: true, message: 'Login exitoso', user: result.rows[0] });
    } else {
      return NextResponse.json({ success: false, message: 'Credenciales inválidas' }, { status: 401 });
    }
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json({ success: false, message: 'Error interno del servidor' }, { status: 500 });
  }
}
