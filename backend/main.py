from fastapi import FastAPI
from backend.routers.pipeline import router as pipeline_router

app = FastAPI(title="Clarity", version="0.1.0")

app.include_router(pipeline_router)


@app.get("/health")
async def health():
    return {"status": "ok"}
