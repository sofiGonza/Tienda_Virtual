import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

from app.core.config import settings


database_url = settings.DATABASE_URL

if database_url.startswith("mysql://"):
    database_url = database_url.replace(
        "mysql://",
        "mysql+pymysql://",
        1
    )

# ------------------------------------------------------------------
# Certificado CA para SSL (Aiven exige TLS).
# Orden de resolución:
#   1. MYSQL_SSL_CA (variable de entorno, ruta explícita)
#   2. backend/ca.pem  (junto al proyecto, relativo al backend)
#   3. ca.pem junto a este archivo
# ------------------------------------------------------------------

def _buscar_ca() -> str:
    candidatas = []

    if settings.MYSQL_SSL_CA:
        candidatas.append(settings.MYSQL_SSL_CA)

    base_dir = Path(__file__).resolve().parent  # app/database
    candidatas.append(str(Path(base_dir).parent.parent / "ca.pem"))      # backend/ca.pem
    candidatas.append(str(Path(base_dir).parent / "ca.pem"))             # app/ca.pem
    candidatas.append(str(Path(base_dir) / "ca.pem"))                    # app/database/ca.pem

    for ruta in candidatas:
        if Path(ruta).is_file():
            return str(ruta)

    return ""


ca_path = _buscar_ca()

connect_args = {}
if ca_path:
    connect_args["ssl"] = {"ca": ca_path}

if "ssl_ca=" in database_url:
    connect_args = {}


engine = create_engine(
    database_url,
    pool_pre_ping=True,
    connect_args=connect_args
)


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


Base = declarative_base()


def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()