from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

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

# Serve pipeline output audio files for frontend playback
_pipeline_output_dir = Path(__file__).resolve().parent / "tests" / "full_pipeline_output"
_pipeline_output_dir.mkdir(parents=True, exist_ok=True)
app.mount("/files/pipeline-output", StaticFiles(directory=str(_pipeline_output_dir)), name="pipeline_output")


@app.get("/api/health")
async def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=False)
