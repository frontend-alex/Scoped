from pathlib import Path
from uuid import uuid4
import shutil

from fastapi import UploadFile

from src.dal.interface.dashboard_interface import IDashboardRepository
from src.services.dashboard_analyzer import analyze_dashboard_real


BACKEND_DIR = Path(__file__).resolve().parents[3]
UPLOAD_DIR = BACKEND_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg"}


class DashboardService:
    def __init__(self, dashboard_repository: IDashboardRepository):
        self.dashboard_repository = dashboard_repository

    def analyze_dashboard(self, file: UploadFile, user_id: str | None):
        self._validate_file(file)

        stored_filename = self._generate_stored_filename(file.filename)
        file_path = UPLOAD_DIR / stored_filename

        self._save_file(file, file_path)

        public_file_path = str(file_path.relative_to(BACKEND_DIR)).replace("\\", "/")

        analysis = self.dashboard_repository.create_analysis({
            "user_id": user_id,
            "original_filename": file.filename,
            "stored_filename": stored_filename,
            "file_path": public_file_path,
            "file_type": file.content_type or "unknown",
            "file_size": file_path.stat().st_size,
            "status": "processing",
        })

        try:
            analyzer_result = analyze_dashboard_real(str(file_path))

            return self.dashboard_repository.update_analysis(
                analysis_id=analysis.id,
                update_data={
                    "status": "completed",
                    "overall_result": analyzer_result["overall_result"],
                    "overall_score": analyzer_result["overall_score"],
                    "confidence": analyzer_result["confidence"],
                    "summary": analyzer_result["summary"],
                    "feedback_json": analyzer_result["feedback_json"],
                    "annotated_image_path": analyzer_result["annotated_image_path"],
                    "detections_json": analyzer_result["detections_json"],
                    "error_message": None,
                }
            )

        except Exception as exc:
            return self.dashboard_repository.update_analysis(
                analysis_id=analysis.id,
                update_data={
                    "status": "failed",
                    "error_message": str(exc),
                }
            )

    def get_history(self, user_id: str):
        return self.dashboard_repository.get_user_history(user_id)

    def get_analysis_by_id(self, analysis_id: int):
        return self.dashboard_repository.get_analysis_by_id(analysis_id)

    def _validate_file(self, file: UploadFile):
        if not file.filename:
            raise ValueError("No file was uploaded.")

        extension = Path(file.filename).suffix.lower()

        if extension not in ALLOWED_EXTENSIONS:
            raise ValueError("Only PNG, JPG, and JPEG files are supported.")

    def _generate_stored_filename(self, original_filename: str) -> str:
        extension = Path(original_filename).suffix.lower()
        return f"{uuid4()}{extension}"

    def _save_file(self, file: UploadFile, file_path: Path):
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)