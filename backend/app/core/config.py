from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    REDIS_URL: str = "redis://localhost:6379"

    ANTHROPIC_API_KEY: str

    AZURE_SPEECH_KEY: str
    AZURE_SPEECH_REGION: str = "eastasia"

    # Railway는 postgres:// 로 주입하므로 postgresql:// 로 변환
    @property
    def db_url(self) -> str:
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        return url

    class Config:
        env_file = ".env"


settings = Settings()
