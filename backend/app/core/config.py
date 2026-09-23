from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):

    # URL de la base de datos. Si no está definida en el despliegue se usa
    # el valor local de desarrollo, de modo que uvicorn SIEMPRE arranque
    # (evita crash-loop en Railway cuando falta la variable). Las consultas
    # fallarán con un error claro, pero /health seguirá respondiendo.
    DATABASE_URL: str = "mysql+pymysql://root:root@localhost:3306/pixel_store"

    # Clave por defecto: evita que el arranque falle (crash-loop en Railway)
    # si la variable SECRET_KEY no está definida en el despliegue.
    # En producción siempre debe sobrescribirse vía variable de entorno.
    SECRET_KEY: str = "cambiar_esta_clave_en_produccion"

    ALGORITHM: str = "HS256"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    FRONTEND_URL: str = "http://localhost:5173"

    # Configuración SMTP para recuperación de contraseña.
    # Se dejan vacíos por defecto para que el desarrollo local no dependa
    # de un proveedor de correo hasta configurar las variables en .env.
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = ""
    SMTP_FROM_NAME: str = "Pixel Store"
    SMTP_USE_TLS: bool = True
    AI_PROVIDER: str = "local"
    AI_API_KEY: str = ""
    AI_MODEL: str = ""
    AI_TIMEOUT_SECONDS: int = 30

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
