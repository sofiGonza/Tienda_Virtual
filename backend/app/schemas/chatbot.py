from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
class ChatMessageCreate(BaseModel):
    conversacion_id: int | None = Field(default=None, gt=0)
    mensaje: str = Field(min_length=1, max_length=4000)
class ChatMessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int; conversacion_id: int; rol: str; contenido: str; creado_en: datetime
class ConversacionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int; usuario_id: int; titulo: str | None; creada_en: datetime; actualizada_en: datetime; mensajes: list[ChatMessageResponse] = []
