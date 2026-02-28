from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers.pipeline import router as pipeline_router

app = FastAPI(title="Clarity", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1", "http://127.0.0.1:8000", "http://localhost", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(pipeline_router, prefix="/api")


@app.get("/api/health")
async def health():
    return {"status": "ok"}
