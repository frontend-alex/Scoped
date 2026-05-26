from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB

from src.config.db import Base


class DashboardAnalysis(Base):
    __tablename__ = "dashboard_analyses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)

    original_filename = Column(String, nullable=False)
    stored_filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)

    status = Column(String, nullable=False, default="processing")
    overall_result = Column(String, nullable=True)
    overall_score = Column(Integer, nullable=True)
    confidence = Column(String, nullable=True)
    summary = Column(Text, nullable=True)
    feedback_json = Column(JSONB, nullable=True)
    error_message = Column(Text, nullable=True)

    annotated_image_path = Column(String, nullable=True)
    detections_json = Column(JSONB, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )