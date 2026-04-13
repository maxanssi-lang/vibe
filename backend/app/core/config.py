from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str

    ANTHROPIC_API_KEY: str

    AZURE_SPEECH_KEY: str
    AZURE_SPEECH_REGION: str = "eastasia"

    @property
    def db_url(self) -> str:
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        return url

    class Config:
        env_file = ".env"


settings = Settings()
