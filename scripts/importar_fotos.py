#!/usr/bin/env python3
"""
Carga las fotos del catálogo en el sitio, a través de la API del panel.

Sube cada archivo al almacenamiento configurado en el backend (disco local o
Cloudinary, según app.media-provider) y asocia las URLs resultantes al producto
o terminación que corresponde.

Es idempotente: reemplaza la lista de imágenes de cada ítem en lugar de sumarle,
así que se puede volver a correr —por ejemplo, al migrar de disco a Cloudinary—
sin duplicar nada.

    python3 scripts/importar_fotos.py ~/Downloads/moimpresiones-fotos

El mapeo es explícito y no por coincidencia de nombres: los archivos traen
irregularidades ("Carpetas Institucioinales" con erratas, "Naipes 1 FINAL" en
lugar de "FINAL 1") que un emparejamiento automático resolvería mal en silencio.
"""
import json
import mimetypes
import sys
import urllib.error
import urllib.request
import uuid
from pathlib import Path

API = "http://localhost:8080"
USUARIO, CLAVE = "admin", "desarrollo123"

# slug del producto -> archivos, en el orden en que se muestran. El primero es la portada.
PRODUCTOS = {
    "carpetas-institucionales": ["institucional/Carpetas Institucionales FINAL 1.png",
                                 "institucional/Carpetas Institucioinales FINAL 2.png",
                                 "institucional/Carpetas Institucionales FINAL 3.png"],
    "tarjetas-personales-empresariales": ["institucional/Tarjetas empresariales FINAL 1.png",
                                          "institucional/Tarjetas empresariales FINAL 2.png",
                                          "institucional/Tarjetas empresariales FINAL 3.png"],
    "sobres-personalizados": ["institucional/Sobres FINAL 1.png"],
    "anotadores-corporativos": ["institucional/Anotadores Corporativos FINAL 1.png",
                                "institucional/Anotadores Corporativos FINAL 2.png",
                                "institucional/Anotadores Corporativos FINAL 3.png"],
    "folletos": ["comercial/Folletos FINAL 1.png", "comercial/Folletos FINAL 2.png",
                 "comercial/Folletos FINAL 3.png"],
    "catalogos": ["comercial/Catalogos FINAL 1.png"],
    "individuales-personalizados": ["comercial/Individuales FINAL 1.png",
                                    "comercial/Individuales FINAL 2.png",
                                    "comercial/Individuales FINAL 3.png"],
    "libros": ["editorial/Libros FINAL 1.png", "editorial/Libros FINAL 2.png",
               "editorial/Libros FINAL 3.png", "editorial/Libros FINAL 4.png"],
    "revistas": ["editorial/Revista FINAL 1.png"],
    "comics": ["editorial/Comics FINAL 1.png", "editorial/Comics FINAL 2.png"],
    "manuales-instructivos": ["editorial/Manual FINAL 1.png", "editorial/Manual FINAL 2.png"],
    "talonarios": ["impresos numerados/Talonarios FINAL 1.png"],
    "remitos": ["impresos numerados/Remitos FINAL 1.png"],
    "rifas": ["impresos numerados/Rifas FINAL 1.png", "impresos numerados/Rifas FINAL 2.png"],
    "entradas": ["impresos numerados/Entradas FINAL 1.png"],
    "estuches": ["packaging/Estuches FINAL 1.png", "packaging/Estuches FINAL 2.png"],
    "etiquetas-autoadhesivas": ["packaging/Etiquetas FINAL 1.png", "packaging/Etiquetas FINAL 2.png"],
    "cajas-para-delivery": ["packaging/Caja Delivery FINAL 1.png",
                            "packaging/Caja Delivery Final 2.png"],
    "collarines-cenefas-gondola": ["packaging/Collarines y Cenefas FINAL 1.png",
                                   "packaging/Collarines y Cenefas FINAL 2.png"],
    "naipes-personalizados": ["regalos empresariales/Naipes 1 FINAL.png",
                              "regalos empresariales/Naipes 2 FINAL.png"],
    "cuadernos-personalizados": ["regalos empresariales/Cuaderno FINAL 1.png",
                                 "regalos empresariales/Cuaderno FINAL 2.png",
                                 "regalos empresariales/Cuaderno FINAL 3.png",
                                 "regalos empresariales/Cuaderno FINAL 4.png"],
    "calendarios-personalizados": ["regalos empresariales/Calendario FINAL 1.png",
                                   "regalos empresariales/Calendario FINAL 2.png",
                                   "regalos empresariales/Calendario Final 3.png",
                                   "regalos empresariales/Calendario Final 4.png"],
}

TERMINACIONES = {
    "plastificado-opp": "terminaciones/plastificado OPP brillante y mate.png",
    "barniz-uv": "terminaciones/barniz uv.png",
    "uv-sectorizado": "terminaciones/uv sectorizado.png",
    "hot-stamping": "terminaciones/hot stamping.png",
    "troquelado": "terminaciones/troquelado.png",
    "puntillado-numerado": "terminaciones/numerado y puntillado.png",
    "despuntado-esquinas": "terminaciones/redondeado de esquinas.png",
    "plegado": "terminaciones/plegado.png",
    "cuno-en-seco": "terminaciones/cuño en seco.png",
}


def pedir(ruta, metodo="GET", cuerpo=None, token=None, campos=None):
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    if campos:  # multipart, para subir un archivo
        limite = uuid.uuid4().hex
        nombre, contenido, tipo = campos
        cuerpo_bin = (
            f"--{limite}\r\n"
            f'Content-Disposition: form-data; name="file"; filename="{nombre}"\r\n'
            f"Content-Type: {tipo}\r\n\r\n"
        ).encode() + contenido + f"\r\n--{limite}--\r\n".encode()
        headers["Content-Type"] = f"multipart/form-data; boundary={limite}"
        datos = cuerpo_bin
    else:
        datos = json.dumps(cuerpo).encode() if cuerpo is not None else None
        if datos:
            headers["Content-Type"] = "application/json"

    req = urllib.request.Request(f"{API}{ruta}", data=datos, headers=headers, method=metodo)
    with urllib.request.urlopen(req) as r:
        texto = r.read().decode()
        return json.loads(texto) if texto else None


def subir(token, raiz, relativo):
    archivo = raiz / relativo
    if not archivo.is_file():
        raise FileNotFoundError(archivo)
    tipo = mimetypes.guess_type(archivo.name)[0] or "image/png"
    return pedir("/api/admin/media", "POST", token=token,
                 campos=(archivo.name, archivo.read_bytes(), tipo))["url"]


def texto_alternativo(slug, indice, total):
    """Descripción para lectores de pantalla y buscadores."""
    nombre = slug.replace("-", " ")
    return f"{nombre} impresos por MO Impresiones" + (f" ({indice} de {total})" if total > 1 else "")


def main():
    if len(sys.argv) < 2:
        sys.exit("Uso: importar_fotos.py <carpeta con las fotos>")
    raiz = Path(sys.argv[1]).expanduser()

    token = pedir("/api/auth/login", "POST", {"username": USUARIO, "password": CLAVE})["token"]
    print(f"Sesión iniciada. Origen: {raiz}\n")

    for slug, archivos in PRODUCTOS.items():
        producto = pedir(f"/api/admin/catalog/products/{slug}", token=token)
        imagenes = []
        for i, relativo in enumerate(archivos, start=1):
            imagenes.append({"url": subir(token, raiz, relativo),
                             "altText": texto_alternativo(slug, i, len(archivos))})
        pedir(f"/api/admin/catalog/products/{slug}", "PUT", token=token, cuerpo={
            "categorySlug": producto["categorySlug"], "slug": producto["slug"],
            "name": producto["name"], "summary": producto["summary"],
            "description": producto["description"], "displayOrder": 0,
            "active": producto["active"],
            "specs": [{"label": s["label"], "value": s["value"]} for s in producto["specs"]],
            "images": imagenes,
        })
        print(f"  {producto['name']:42} {len(imagenes)} foto(s)")

    print()
    for slug, relativo in TERMINACIONES.items():
        actual = pedir(f"/api/finishings/{slug}")
        pedir(f"/api/admin/finishings/{slug}", "PUT", token=token, cuerpo={
            "slug": actual["slug"], "name": actual["name"],
            "description": actual["description"],
            "imageUrl": subir(token, raiz, relativo),
            "displayOrder": actual["displayOrder"],
        })
        print(f"  {actual['name']:42} 1 foto")


if __name__ == "__main__":
    try:
        main()
    except urllib.error.HTTPError as e:
        sys.exit(f"\nError {e.code} en {e.url}\n{e.read().decode()[:400]}")
    except FileNotFoundError as e:
        sys.exit(f"\nNo encontré el archivo: {e}")
