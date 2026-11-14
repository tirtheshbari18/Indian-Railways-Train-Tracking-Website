from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Body
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.train import Train
from app.models.station import Station
from app.models.data_source import DataSource
from app.models.audit_log import AuditLog
from app.models.live_update import TrainRunningUpdate
from app.models.search_history import SearchHistory
from app.schemas.admin import AdminStatsOut, AuditLogOut, CSVImportResult
from app.schemas.system import DataSourceOut, DataSourceUpdate
from app.services.data_provider import DataProviderService
from app.api.deps import require_admin_user

router = APIRouter(prefix="/admin", tags=["Admin Portal"])

@router.get("/stats", response_model=AdminStatsOut)
def get_admin_stats(admin: User = Depends(require_admin_user), db: Session = Depends(get_db)):
    return AdminStatsOut(
        total_trains=db.query(Train).count(),
        total_stations=db.query(Station).count(),
        total_users=db.query(User).count(),
        total_running_updates=db.query(TrainRunningUpdate).count(),
        data_sources_count=db.query(DataSource).count(),
        recent_searches_count=db.query(SearchHistory).count()
    )

@router.get("/audit-logs", response_model=List[AuditLogOut])
def get_audit_logs(
    limit: int = 50,
    admin: User = Depends(require_admin_user),
    db: Session = Depends(get_db)
):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()
    results = []
    for l in logs:
        results.append(AuditLogOut(
            id=l.id,
            user_id=l.user_id,
            user_email=l.user.email if l.user else "System",
            action=l.action,
            entity_type=l.entity_type,
            entity_id=l.entity_id,
            details=l.details,
            ip_address=l.ip_address,
            created_at=l.created_at
        ))
    return results

@router.post("/import-csv", response_model=CSVImportResult)
async def import_csv_data(
    file: UploadFile = File(...),
    admin: User = Depends(require_admin_user),
    db: Session = Depends(get_db)
):
    content = await file.read()
    try:
        csv_text = content.decode("utf-8")
    except UnicodeDecodeError:
        csv_text = content.decode("latin-1")

    imported, errors = DataProviderService.import_trains_csv(db, csv_text, user_id=admin.id)
    return CSVImportResult(
        imported_count=imported,
        errors=errors,
        message=f"Successfully processed {imported} trains from CSV."
    )

@router.put("/data-sources/{source_id}", response_model=DataSourceOut)
def update_data_source(
    source_id: int,
    update_data: DataSourceUpdate,
    admin: User = Depends(require_admin_user),
    db: Session = Depends(get_db)
):
    ds = db.query(DataSource).filter(DataSource.id == source_id).first()
    if not ds:
        raise HTTPException(status_code=404, detail="Data source not found")

    if update_data.name is not None:
        ds.name = update_data.name
    if update_data.endpoint_url is not None:
        ds.endpoint_url = update_data.endpoint_url
    if update_data.is_active is not None:
        ds.is_active = update_data.is_active
    if update_data.is_live_verified is not None:
        ds.is_live_verified = update_data.is_live_verified
    if update_data.sync_interval_seconds is not None:
        ds.sync_interval_seconds = update_data.sync_interval_seconds
    if update_data.status is not None:
        ds.status = update_data.status

    db.commit()
    db.refresh(ds)

    # Log audit
    log = AuditLog(
        user_id=admin.id,
        action="UPDATE_DATA_SOURCE",
        entity_type="DATA_SOURCE",
        entity_id=str(ds.id),
        details=f"Updated data source {ds.name}: live_verified={ds.is_live_verified}, active={ds.is_active}",
        ip_address="127.0.0.1"
    )
    db.add(log)
    db.commit()

    return ds
