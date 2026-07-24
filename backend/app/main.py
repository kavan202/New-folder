import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.database import engine
from app.models.base import Base
from app.routers import auth_router, vehicle_router
from app.routers.testdrive_router import router as testdrive_router
from app.routers.order_router import router as order_router
from app.routers.analytics_router import router as analytics_router

# Ensure tables are created
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
)

# Enable CORS for local React development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static uploads directory
uploads_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/static/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# Main routers under /api
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(vehicle_router, prefix=settings.API_V1_STR)
app.include_router(testdrive_router, prefix=settings.API_V1_STR)
app.include_router(order_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)

# Direct root aliases for prompt compliance e.g. /orders/purchase, /test-drives/book
app.include_router(order_router)
app.include_router(testdrive_router)

@app.get("/")
def read_root():
    return {"message": "Car Dealership Inventory API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

