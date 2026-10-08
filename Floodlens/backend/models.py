import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, Text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker
from config import DATABASE_URL

Base = declarative_base()


class Report(Base):
    __tablename__ = "reports"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    severity = Column(String, nullable=False)       # clear | caution | avoid
    confidence = Column(Float, nullable=False)
    water_coverage_pct = Column(Float, nullable=True)
    reasoning = Column(Text, nullable=True)
    image_url = Column(Text, nullable=True)
    location_label = Column(String, nullable=True)  # optional human-readable label
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


# Async engine + session factory
engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
