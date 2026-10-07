import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

const headers = { 'Cache-Control': 'no-store' };

export async function POST(request: Request) {
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    return NextResponse.json({ message: 'Envía un cuerpo JSON' }, { status: 415, headers });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'JSON inválido' }, { status: 400, headers });
  }
  const { username, password } = body ?? {};
  if (typeof username !== 'string' || typeof password !== 'string' ||
      !username.trim() || !password || username.length > 50 || password.length > 128) {
    return NextResponse.json({ message: 'Usuario o contraseña inválidos' }, { status: 400, headers });
  }

  try {
    // Cuenta ficticia heredada del laboratorio. La exposición HTTP ocurre en
    // el transporte independientemente del almacenamiento de la contraseña.
    const result = await query(
      'SELECT id, username FROM users WHERE username = $1 AND password = $2',
      [username, password]
    );
    if (!result.rows.length) {
      return NextResponse.json({ success: false, message: 'Credenciales inválidas' }, { status: 401, headers });
    }
    // Esta demo valida credenciales; no crea una sesión ni emite un token.
    return NextResponse.json({ success: true, message: 'Login exitoso', user: result.rows[0] }, { headers });
  } catch {
    console.error('No se pudo consultar PostgreSQL durante el login');
    return NextResponse.json({ success: false, message: 'Servicio temporalmente no disponible' }, { status: 503, headers });
  }
}
