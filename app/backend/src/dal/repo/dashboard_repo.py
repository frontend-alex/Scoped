from sqlalchemy.orm import Session

from src.dal.interface.dashboard_interface import IDashboardRepository
from src.ml.model.model import DashboardAnalysis


class DashboardRepository(IDashboardRepository):
    def __init__(self, db: Session):
        self.db = db

    def create_analysis(self, analysis_data: dict):
        analysis = DashboardAnalysis(**analysis_data)

        self.db.add(analysis)
        self.db.commit()
        self.db.refresh(analysis)

        return analysis

    def update_analysis(self, analysis_id: int, update_data: dict):
        analysis = self.get_analysis_by_id(analysis_id)

        if not analysis:
            return None

        for key, value in update_data.items():
            setattr(analysis, key, value)

        self.db.commit()
        self.db.refresh(analysis)

        return analysis

    def get_analysis_by_id(self, analysis_id: int):
        return (
            self.db.query(DashboardAnalysis)
            .filter(DashboardAnalysis.id == analysis_id)
            .first()
        )

    def get_user_history(self, user_id: str):
        return (
            self.db.query(DashboardAnalysis)
            .filter(DashboardAnalysis.user_id == user_id)
            .order_by(DashboardAnalysis.created_at.desc())
            .all()
        )