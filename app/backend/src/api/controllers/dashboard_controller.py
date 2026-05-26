from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy.orm import Session

from src.config.db import get_db
from src.core.services.dashboard_service import DashboardService
from src.dal.repo.dashboard_repo import DashboardRepository
from src.api.middlewares.auth import get_optional_current_user_id, get_current_user_id

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.post("/analyze")
def analyze_dashboard(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user_id: str | None = Depends(get_optional_current_user_id),
):
    try:
        repo = DashboardRepository(db)
        service = DashboardService(repo)

        result = service.analyze_dashboard(file=file, user_id=user_id)
        return result

    except ValueError as ex:
        raise HTTPException(status_code=400, detail=str(ex))
    except Exception as ex:
        print("DASHBOARD ANALYSIS ERROR:", repr(ex))
        raise HTTPException(status_code=500, detail=str(ex))


@router.get("/history")
def get_dashboard_history(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    repo = DashboardRepository(db)
    service = DashboardService(repo)
    return service.get_history(user_id=user_id)


@router.get("/{analysis_id}")
def get_dashboard_analysis(
    analysis_id: int,
    db: Session = Depends(get_db),
):
    repo = DashboardRepository(db)
    service = DashboardService(repo)
    result = service.get_analysis_by_id(analysis_id)

    if not result:
        raise HTTPException(status_code=404, detail="Dashboard analysis not found.")

    return result