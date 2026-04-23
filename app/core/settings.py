from pydantic_settings import BaseSettings
import logging
import sys

class Settings(BaseSettings):
    # 這裡的變數名稱要對應 .env 裡的內容 (不分大小寫，但大寫比較標準)
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256" # 建議加上預設值
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"

    class Config:
        env_file = ".env"
        # 如果你的變數在 .env 是大寫，Pydantic 會自動對應
        case_sensitive = False 


settings = Settings()


logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO), 
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)

logger = logging.getLogger("koko-ai-api")
logger.info("Logging is configured. Level: %s", settings.LOG_LEVEL)
