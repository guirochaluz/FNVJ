import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("Defina a variável de ambiente DATABASE_URL (veja .env.example).")

# Engine com pool_pre_ping para validar conexões
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()

def get_session():
    return SessionLocal()

def init_db():
    # Import late para evitar import circular
    import models  # noqa
    Base.metadata.create_all(bind=engine)