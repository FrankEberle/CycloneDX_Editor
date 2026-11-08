#!/usr/bin/env python3
"""
CycloneDX Validation Mock Service

Emuliert den Validierungs-Web-Service fuer CycloneDX SBOMs.
Erlaubt das Vorgeben von Validierungsergebnis (--success / --failure)
sowie des Informationstextes (--information / -i).
Unterstuetzt optional eine kuenstliche Verzoegerung (--delay) zum Testen des Busy-Indikators.
"""

import argparse
import json
import sys
from http.server import HTTPServer, BaseHTTPRequestHandler


def create_handler(success: bool, information: str, delay: float):
    import time

    class ValidationHandler(BaseHTTPRequestHandler):
        def _send_cors_headers(self):
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")

        def do_OPTIONS(self):
            self.send_response(204)
            self._send_cors_headers()
            self.end_headers()

        def do_POST(self):
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length)

            print(f"\n[ValidationService] Received POST request ({len(body)} bytes)")

            # Optional: Kurz prüfen, ob es valides JSON ist
            try:
                bom = json.loads(body.decode("utf-8"))
                bom_format = bom.get("bomFormat", "unknown")
                spec_version = bom.get("specVersion", "unknown")
                print(f"[ValidationService] SBOM parsed: bomFormat={bom_format}, specVersion={spec_version}")
            except Exception as e:
                print(f"[ValidationService] Warning: Received payload is not valid JSON ({e})")

            if delay > 0:
                print(f"[ValidationService] Waiting {delay}s delay...")
                time.sleep(delay)

            response_data = {
                "success": success,
                "information": information
            }
            payload = json.dumps(response_data, indent=2).encode("utf-8")

            self.send_response(200)
            self._send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)

            print(f"[ValidationService] Sent response: success={success}, information={information!r}")

        def log_message(self, format, *args):
            # Kompaktes Logging
            sys.stderr.write(f"[{self.log_date_time_string()}] {format % args}\n")

    return ValidationHandler


def main():
    parser = argparse.ArgumentParser(
        description="Emuliert den CycloneDX-Validierungs-Webservice."
    )
    parser.add_argument(
        "--port", "-p",
        type=int,
        default=8080,
        help="Port fuer den HTTP-Server (Standard: 8080)"
    )
    status_group = parser.add_mutually_exclusive_group()
    status_group.add_argument(
        "--success",
        dest="success",
        action="store_true",
        default=True,
        help="Validierung liefert success=True (Standard)"
    )
    status_group.add_argument(
        "--failure",
        dest="success",
        action="store_false",
        help="Validierung liefert success=False"
    )
    parser.add_argument(
        "--information", "-i",
        type=str,
        default="Die SBOM wurde erfolgreich gegen die Schema-Vorgaben validiert.",
        help="Informationstext fuer das Validierungsergebnis"
    )
    parser.add_argument(
        "--delay", "-d",
        type=float,
        default=1.0,
        help="Kuenstliche Verzoegerung in Sekunden (Standard: 1.0, um den Busy-Indikator zu sehen)"
    )

    args = parser.parse_args()

    handler_cls = create_handler(args.success, args.information, args.delay)
    server_address = ("", args.port)
    httpd = HTTPServer(server_address, handler_cls)

    print("=" * 60)
    print(" CycloneDX Validation Mock Service gestartet")
    print("=" * 60)
    print(f" URL:         http://localhost:{args.port}/validate")
    print(f" Ergebnis:    success = {args.success}")
    print(f" Information: {args.information}")
    print(f" Delay:       {args.delay}s")
    print(" Beenden mit: Ctrl + C")
    print("=" * 60)

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer wird beendet...")
    finally:
        httpd.server_close()


if __name__ == "__main__":
    main()
