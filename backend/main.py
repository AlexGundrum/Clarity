from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers.pipeline_new import router as pipeline_new_router
from backend.routers.video_router import router as video_router
from backend.routers.audio_router import router as audio_router
from backend.routers.camouflage_router import router as camouflage_router

app = FastAPI(title="Clarity", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(pipeline_new_router, prefix="/api")
app.include_router(video_router, prefix="/api")
app.include_router(audio_router, prefix="/api")
app.include_router(camouflage_router, prefix="/api")


@app.get("/api/health")
async def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=False)
