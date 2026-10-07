#!/usr/bin/env python3
"""Analiza HTTP/TLS sin claves TLS ni acceso a la base de datos."""
import argparse
import json
import os
import tempfile
import subprocess
from pathlib import Path

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('capture', type=Path)
parser.add_argument('port', nargs='?', type=int, default=8080)
args = parser.parse_args()
# Perfil limpio: no heredar claves de sesión/RSA del Wireshark del operador.
profile = tempfile.TemporaryDirectory(prefix='forense-tshark-')
env = {**os.environ, 'WIRESHARK_CONFIG_DIR': profile.name, 'XDG_CONFIG_HOME': profile.name}
env.pop('SSLKEYLOGFILE', None)
if not args.capture.is_file() or not 1 <= args.port <= 65535:
    parser.error('Indica una captura existente y un puerto entre 1 y 65535')


def fields(display_filter, names, decode_http=False):
    command = ['tshark', '-n', '-2', '-r', str(args.capture),
               '-o', 'tcp.desegment_tcp_streams:TRUE',
               '-o', 'http.desegment_body:TRUE',
               # No usar claves de sesión configuradas por el operador.
               '-o', 'tls.keylog_file:']
    if decode_http:
        command += ['-d', f'tcp.port=={args.port},http']
    else:
        command += ['-d', f'tcp.port=={args.port},tls']
    command += ['-Y', display_filter, '-T', 'fields', '-E', 'occurrence=f']
    for name in names:
        command += ['-e', name]
    return subprocess.run(command, check=True, capture_output=True, text=True, env=env).stdout.splitlines()


try:
    packets = fields(f'tcp.port == {args.port}', ['frame.number'])
    tls = fields(f'tcp.port == {args.port} && tls', ['frame.number'])
    requests = fields(
        f'tcp.port == {args.port} && http.request.method == "POST" && http.request.uri == "/api/login"',
        ['frame.number', 'tcp.stream', 'http.file_data'], decode_http=True)
except FileNotFoundError:
    parser.exit(1, 'Falta tshark en PATH.\n')
except subprocess.CalledProcessError as error:
    parser.exit(1, error.stderr)

recovered = 0
print(f'Paquetes TCP del puerto {args.port}: {len(packets)}; paquetes TLS: {len(tls)}')
for row in requests:
    values = row.split('\t')
    if len(values) != 3:
        continue
    frame, stream, raw = values
    try:
        # http.file_data es FT_BYTES; tshark lo representa como hexadecimal.
        body = json.loads(bytes.fromhex(raw.replace(':', '')).decode('utf-8'))
    except (ValueError, UnicodeError):
        print(f'Frame {frame}: cuerpo no decodificable; revisar Follow TCP Stream.')
        continue
    if isinstance(body, dict) and 'username' in body and 'password' in body:
        recovered += 1
        print(json.dumps({'frame': frame, 'tcp_stream': stream,
                          'username': body['username'], 'password': body['password']}, ensure_ascii=False))
print(f'Credenciales ficticias recuperadas: {recovered}')
if not packets:
    print('INCONCLUSO: no hay tráfico del puerto indicado. Revisa interfaz, filtro y generación del login.')
elif not recovered:
    print('No se recuperó un login HTTP. Correlaciona TLS, horarios y éxito del cliente; esto por sí solo no prueba seguridad.')
