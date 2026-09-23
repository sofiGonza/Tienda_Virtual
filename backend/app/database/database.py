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

# Parámetros de conexión: SSL cuando MYSQL_SSL_CA está definido (Aiven en
# producción exige TLS). Si el query string ya trae ssl_ca, se respeta tal cual.
connect_args = {}

if settings.MYSQL_SSL_CA:
    connect_args["ssl"] = {"ca": settings.MYSQL_SSL_CA}

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