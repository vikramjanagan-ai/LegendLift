"""
Advanced Reports API Endpoints
- Customer AMC Period Report
- Technician Monthly Performance Report
- Materials Consumption Report
- Revenue Report
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, extract
from typing import Optional, List
from datetime import datetime, date, timedelta
import json
from decimal import Decimal

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models import (
    User, Customer, ServiceSchedule, ServiceReport, CallBack, Repair,
    Payment, MaterialUsage, AMCContract, ServiceStatus, ServiceType
)

router = APIRouter()


def decimal_to_float(obj):
    """Convert Decimal to float for JSON serialization"""
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError


@router.get("/customer-amc-period/{customer_id}")
async def get_customer_amc_period_report(
    customer_id: str,
    amc_start_date: Optional[date] = None,
    amc_end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate comprehensive Customer AMC Period Report

    Returns all services, callbacks, repairs, materials, and payments
    for a customer's AMC period (365-day cycle)
    """

    # Get customer
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # Auto-detect AMC period from customer's amc_valid_from/to if not provided
    if not amc_start_date or not amc_end_date:
        if customer.amc_valid_from and customer.amc_valid_to:
            amc_start_date = customer.amc_valid_from
            amc_end_date = customer.amc_valid_to
        else:
            # Fallback to active contract
            contract = db.query(AMCContract).filter(
                AMCContract.customer_id == customer_id,
                AMCContract.contract_type == "Active"
            ).first()
            if contract:
                amc_start_date = contract.start_date.date()
                amc_end_date = contract.end_date.date()
            else:
                raise HTTPException(status_code=400, detail="No active AMC contract found for this customer")

    # Calculate period metrics
    total_days = (amc_end_date - amc_start_date).days
    days_elapsed = (date.today() - amc_start_date).days if date.today() > amc_start_date else 0
    days_remaining = (amc_end_date - date.today()).days if date.today() < amc_end_date else 0
    period_completion = (days_elapsed / total_days * 100) if total_days > 0 else 0

    # Fetch all services in AMC period
    services = db.query(ServiceSchedule).filter(
        ServiceSchedule.customer_id == customer_id,
        ServiceSchedule.scheduled_date >= datetime.combine(amc_start_date, datetime.min.time()),
        ServiceSchedule.scheduled_date <= datetime.combine(amc_end_date, datetime.max.time())
    ).order_by(ServiceSchedule.scheduled_date).all()

    # Fetch all callbacks in AMC period
    callbacks = db.query(CallBack).filter(
        CallBack.customer_id == customer_id,
        CallBack.scheduled_date >= datetime.combine(amc_start_date, datetime.min.time()),
        CallBack.scheduled_date <= datetime.combine(amc_end_date, datetime.max.time())
    ).order_by(CallBack.scheduled_date).all()

    # Fetch all repairs in AMC period
    repairs = db.query(Repair).filter(
        Repair.customer_id == customer_id,
        Repair.created_at >= datetime.combine(amc_start_date, datetime.min.time()),
        Repair.created_at <= datetime.combine(amc_end_date, datetime.max.time())
    ).order_by(Repair.created_at).all()

    # Fetch all payments in AMC period
    payments = db.query(Payment).filter(
        Payment.customer_id == customer_id,
        or_(
            and_(Payment.due_date >= datetime.combine(amc_start_date, datetime.min.time()),
                 Payment.due_date <= datetime.combine(amc_end_date, datetime.max.time())),
            and_(Payment.paid_date >= datetime.combine(amc_start_date, datetime.min.time()),
                 Payment.paid_date <= datetime.combine(amc_end_date, datetime.max.time()))
        )
    ).order_by(Payment.due_date).all()

    # Fetch materials used in AMC period
    materials = db.query(MaterialUsage).filter(
        MaterialUsage.customer_id == customer_id,
        MaterialUsage.used_date >= datetime.combine(amc_start_date, datetime.min.time()),
        MaterialUsage.used_date <= datetime.combine(amc_end_date, datetime.max.time())
    ).order_by(MaterialUsage.used_date).all()

    # Calculate services summary
    services_scheduled = len(services)
    services_completed = len([s for s in services if s.status == ServiceStatus.COMPLETED])
    services_pending = len([s for s in services if s.status in [ServiceStatus.PENDING, ServiceStatus.SCHEDULED]])
    services_overdue = len([s for s in services if s.status == ServiceStatus.OVERDUE])
    completion_rate = (services_completed / services_scheduled * 100) if services_scheduled > 0 else 0

    # Calculate callbacks summary
    callbacks_total = len(callbacks)
    callbacks_completed = len([c for c in callbacks if c.status == "COMPLETED"])
    callbacks_pending = len([c for c in callbacks if c.status != "COMPLETED"])

    # Calculate repairs summary
    repairs_total = len(repairs)
    repairs_completed = len([r for r in repairs if r.status == "COMPLETED"])
    repairs_pending = len([r for r in repairs if r.status != "COMPLETED"])

    # Calculate materials cost
    total_materials_cost = sum([float(m.total_cost) for m in materials])

    # Calculate average service time
    service_times = []
    avg_service_time_minutes = 0
    for service in services:
        if service.status == ServiceStatus.COMPLETED:
            report = db.query(ServiceReport).filter(ServiceReport.service_id == service.id).first()
            if report and report.check_in_time and report.check_out_time:
                duration = (report.check_out_time - report.check_in_time).total_seconds() / 60
                service_times.append(duration)
    if service_times:
        avg_service_time_minutes = sum(service_times) / len(service_times)

    # Calculate average callback response time
    callback_response_times = []
    avg_response_minutes = 0
    for callback in callbacks:
        if callback.picked_at and callback.created_at:
            response_time = (callback.picked_at - callback.created_at).total_seconds() / 60
            callback_response_times.append(response_time)
    if callback_response_times:
        avg_response_minutes = sum(callback_response_times) / len(callback_response_times)

    # Calculate customer satisfaction
    ratings = []
    for service in services:
        if service.status == ServiceStatus.COMPLETED:
            report = db.query(ServiceReport).filter(ServiceReport.service_id == service.id).first()
            if report and report.rating:
                ratings.append(report.rating)
    avg_rating = sum(ratings) / len(ratings) if ratings else 0

    # Format services details
    services_detail = []
    for idx, service in enumerate(services, 1):
        report = db.query(ServiceReport).filter(ServiceReport.service_id == service.id).first()
        tech1 = db.query(User).filter(User.id == service.technician_id).first() if service.technician_id else None
        tech2 = db.query(User).filter(User.id == service.technician2_id).first() if service.technician2_id else None
        tech3 = db.query(User).filter(User.id == service.technician3_id).first() if service.technician3_id else None

        # Parse parts replaced from JSON
        parts_text = "-"
        if report and report.parts_replaced:
            try:
                parts = json.loads(report.parts_replaced) if isinstance(report.parts_replaced, str) else report.parts_replaced
                if isinstance(parts, list):
                    parts_text = ", ".join(parts)
            except:
                parts_text = str(report.parts_replaced)

        service_time = None
        if report and report.check_in_time and report.check_out_time:
            duration_minutes = (report.check_out_time - report.check_in_time).total_seconds() / 60
            hours = int(duration_minutes // 60)
            minutes = int(duration_minutes % 60)
            service_time = f"{hours}h {minutes}m"

        services_detail.append({
            "sr_no": idx,
            "service_id": service.service_id,
            "scheduled_date": service.scheduled_date.strftime("%b %d, %Y") if service.scheduled_date else "-",
            "actual_date": service.actual_date.strftime("%b %d, %Y") if service.actual_date else "-",
            "service_type": service.service_type.value if service.service_type else "SERVICE",
            "status": service.status.value,
            "days_overdue": service.overdue_days if service.overdue_days and service.overdue_days > 0 else 0,
            "technician_1": tech1.name if tech1 else "-",
            "technician_2": tech2.name if tech2 else "-",
            "technician_3": tech3.name if tech3 else "-",
            "check_in_time": report.check_in_time.strftime("%I:%M %p") if report and report.check_in_time else "-",
            "check_out_time": report.check_out_time.strftime("%I:%M %p") if report and report.check_out_time else "-",
            "time_spent": service_time or "-",
            "work_done": report.work_done if report else "-",
            "parts_replaced": parts_text,
            "customer_rating": f"{'⭐' * report.rating} ({report.rating}/5)" if report and report.rating else "-",
            "customer_feedback": report.customer_feedback if report and report.customer_feedback else "-",
            "notes": service.notes or "-"
        })

    # Format callbacks details
    callbacks_detail = []
    for idx, callback in enumerate(callbacks, 1):
        techs_list = []
        if callback.technicians:
            tech_ids = json.loads(callback.technicians) if isinstance(callback.technicians, str) else callback.technicians
            for tech_id in tech_ids:
                tech = db.query(User).filter(User.id == tech_id).first()
                if tech:
                    techs_list.append(tech.name)

        response_time = "-"
        if callback.picked_at and callback.created_at:
            delta = callback.picked_at - callback.created_at
            minutes = int(delta.total_seconds() / 60)
            hours = minutes // 60
            mins = minutes % 60
            response_time = f"{hours}h {mins}m" if hours > 0 else f"{mins}m"

        resolution_time = "-"
        if callback.completed_at and callback.created_at:
            delta = callback.completed_at - callback.created_at
            minutes = int(delta.total_seconds() / 60)
            hours = minutes // 60
            mins = minutes % 60
            resolution_time = f"{hours}h {mins}m"

        materials_text = "-"
        if callback.materials_changed:
            try:
                mats = json.loads(callback.materials_changed) if isinstance(callback.materials_changed, str) else callback.materials_changed
                if isinstance(mats, list):
                    materials_text = ", ".join([f"{m.get('name', '')} ({m.get('quantity', '')})" for m in mats])
            except:
                materials_text = str(callback.materials_changed)

        callbacks_detail.append({
            "sr_no": idx,
            "callback_id": callback.id[:12],
            "date": callback.scheduled_date.strftime("%b %d, %Y"),
            "issue": callback.description or "-",
            "reported_by": callback.customer_reporting_person or "-",
            "status": callback.status.value,
            "technicians": ", ".join(techs_list) if techs_list else "-",
            "response_time": response_time,
            "resolution_time": resolution_time,
            "issue_faced": callback.issue_faced or "-",
            "problem_solved": callback.problem_solved or "-",
            "materials_changed": materials_text,
            "lift_status": callback.lift_status_on_closure.value if callback.lift_status_on_closure else "-",
            "requires_followup": "Yes" if callback.requires_followup == "true" else "No"
        })

    # Format repairs details
    repairs_detail = []
    for idx, repair in enumerate(repairs, 1):
        techs_list = []
        if repair.technicians:
            tech_ids = json.loads(repair.technicians) if isinstance(repair.technicians, str) else repair.technicians
            for tech_id in tech_ids:
                tech = db.query(User).filter(User.id == tech_id).first()
                if tech:
                    techs_list.append(tech.name)

        duration = "-"
        if repair.completed_at and repair.started_at:
            delta = repair.completed_at - repair.started_at
            days = delta.days
            duration = f"{days} day{'s' if days != 1 else ''}"

        repairs_detail.append({
            "sr_no": idx,
            "repair_id": repair.id[:12],
            "date": repair.created_at.strftime("%b %d, %Y"),
            "type": repair.repair_type or "General Repair",
            "description": repair.description or "-",
            "status": repair.status.value,
            "technicians": ", ".join(techs_list) if techs_list else "-",
            "duration": duration,
            "materials_cost": f"₹{float(repair.materials_cost):,.2f}" if repair.materials_cost else "₹0",
            "labor_cost": f"₹{float(repair.labor_cost):,.2f}" if repair.labor_cost else "₹0",
            "total_cost": f"₹{float(repair.total_cost):,.2f}" if repair.total_cost else "₹0"
        })

    # Consolidate materials by name
    materials_consolidated = {}
    for material in materials:
        mat_name = material.material_name
        if mat_name not in materials_consolidated:
            materials_consolidated[mat_name] = {
                "material_name": mat_name,
                "total_quantity": 0,
                "unit": material.unit or "units",
                "total_cost": 0,
                "service_count": 0,
                "callback_count": 0,
                "repair_count": 0,
                "dates": []
            }

        materials_consolidated[mat_name]["total_quantity"] += material.quantity
        materials_consolidated[mat_name]["total_cost"] += float(material.total_cost)
        materials_consolidated[mat_name]["dates"].append(material.used_date)

        if material.service_id:
            materials_consolidated[mat_name]["service_count"] += 1
        if material.callback_id:
            materials_consolidated[mat_name]["callback_count"] += 1
        if material.repair_id:
            materials_consolidated[mat_name]["repair_count"] += 1

    # Format materials list
    materials_list = []
    for idx, (mat_name, mat_data) in enumerate(sorted(materials_consolidated.items(), key=lambda x: x[1]["total_cost"], reverse=True), 1):
        materials_list.append({
            "sr_no": idx,
            "material_name": mat_name,
            "quantity": mat_data["total_quantity"],
            "unit": mat_data["unit"],
            "total_cost": f"₹{mat_data['total_cost']:,.2f}",
            "used_in_services": mat_data["service_count"],
            "used_in_callbacks": mat_data["callback_count"],
            "used_in_repairs": mat_data["repair_count"],
            "first_used": min(mat_data["dates"]).strftime("%b %d, %Y"),
            "last_used": max(mat_data["dates"]).strftime("%b %d, %Y")
        })

    # Format payments details
    payments_detail = []
    total_paid = 0
    total_pending = 0
    for idx, payment in enumerate(payments, 1):
        is_overdue = payment.status == "overdue" or (payment.status == "pending" and payment.due_date < datetime.now())
        days_overdue = (datetime.now() - payment.due_date).days if is_overdue else 0

        if payment.status == "paid":
            total_paid += float(payment.amount)
        else:
            total_pending += float(payment.amount)

        payments_detail.append({
            "sr_no": idx,
            "payment_id": payment.id[:12],
            "amount": f"₹{float(payment.amount):,.2f}",
            "due_date": payment.due_date.strftime("%b %d, %Y"),
            "paid_date": payment.paid_date.strftime("%b %d, %Y") if payment.paid_date else "-",
            "status": payment.status.value,
            "days_overdue": days_overdue if days_overdue > 0 else 0,
            "payment_method": payment.payment_method or "-",
            "transaction_id": payment.transaction_id or "-"
        })

    # Build complete report
    report = {
        "report_metadata": {
            "report_id": f"RPT-{datetime.now().strftime('%Y%m%d')}-{customer_id[:6]}",
            "generated_date": datetime.now().strftime("%B %d, %Y %I:%M %p"),
            "generated_by": current_user.name,
            "report_type": "Customer AMC Period Report"
        },

        "customer_info": {
            "job_number": customer.job_number,
            "customer_name": customer.name,
            "site_name": customer.site_name or "-",
            "area": customer.area,
            "address": customer.address,
            "contact_person": customer.contact_person,
            "phone": customer.phone,
            "email": customer.email or "-",
            "route": f"Route {customer.route}"
        },

        "amc_details": {
            "start_date": amc_start_date.strftime("%B %d, %Y"),
            "end_date": amc_end_date.strftime("%B %d, %Y"),
            "total_days": total_days,
            "days_elapsed": days_elapsed,
            "days_remaining": days_remaining,
            "period_completion_pct": round(period_completion, 1),
            "services_per_year": customer.services_per_year or 12,
            "amc_type": customer.amc_type or "Comprehensive",
            "door_type": customer.door_type or "-",
            "controller_type": customer.controller_type or "-",
            "number_of_floors": customer.number_of_floors or "-",
            "amc_amount": f"₹{float(customer.amc_amount):,.2f}" if customer.amc_amount else "₹0",
            "amount_received": f"₹{float(customer.amc_amount_received):,.2f}" if customer.amc_amount_received else "₹0",
            "amount_pending": f"₹{float(customer.amc_amount or 0) - float(customer.amc_amount_received or 0):,.2f}",
            "amc_status": customer.amc_status.value if customer.amc_status else "ACTIVE"
        },

        "summary": {
            "services_scheduled": services_scheduled,
            "services_completed": services_completed,
            "services_pending": services_pending,
            "services_overdue": services_overdue,
            "completion_rate": round(completion_rate, 1),
            "callbacks_total": callbacks_total,
            "callbacks_completed": callbacks_completed,
            "callbacks_pending": callbacks_pending,
            "repairs_total": repairs_total,
            "repairs_completed": repairs_completed,
            "repairs_pending": repairs_pending,
            "total_materials_cost": f"₹{total_materials_cost:,.2f}",
            "avg_service_time": f"{int(avg_service_time_minutes // 60)}h {int(avg_service_time_minutes % 60)}m" if avg_service_time_minutes > 0 else "-",
            "avg_callback_response": f"{int(avg_response_minutes // 60)}h {int(avg_response_minutes % 60)}m" if avg_response_minutes > 0 else "-",
            "customer_rating_avg": round(avg_rating, 1),
            "total_ratings": len(ratings)
        },

        "services": services_detail,
        "callbacks": callbacks_detail,
        "repairs": repairs_detail,
        "materials": materials_list,
        "payments": payments_detail,

        "performance_metrics": {
            "overall_score": round((completion_rate + (avg_rating * 20)) / 2, 1),
            "service_completion_rate": round(completion_rate, 1),
            "on_time_rate": round((services_completed - services_overdue) / services_scheduled * 100, 1) if services_scheduled > 0 else 0,
            "customer_satisfaction": round(avg_rating, 1),
            "callback_response_rate": round(callbacks_completed / callbacks_total * 100, 1) if callbacks_total > 0 else 100,
            "material_usage_services": len([m for m in materials if m.service_id]),
            "total_technician_visits": services_completed + callbacks_completed + repairs_completed
        }
    }

    return report


@router.get("/technician-performance/{technician_id}")
async def get_technician_monthly_report(
    technician_id: str,
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=2020, le=2030),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate Technician Monthly Performance Report
    """

    # Get technician
    technician = db.query(User).filter(User.id == technician_id).first()
    if not technician:
        raise HTTPException(status_code=404, detail="Technician not found")

    # Calculate period dates
    start_date = datetime(year, month, 1)
    if month == 12:
        end_date = datetime(year + 1, 1, 1) - timedelta(days=1)
    else:
        end_date = datetime(year, month + 1, 1) - timedelta(days=1)

    total_days = (end_date - start_date).days + 1

    # Fetch services assigned to technician
    services = db.query(ServiceSchedule).filter(
        or_(
            ServiceSchedule.technician_id == technician_id,
            ServiceSchedule.technician2_id == technician_id,
            ServiceSchedule.technician3_id == technician_id
        ),
        ServiceSchedule.scheduled_date >= start_date,
        ServiceSchedule.scheduled_date <= end_date
    ).all()

    # Fetch callbacks
    callbacks = db.query(CallBack).filter(
        CallBack.scheduled_date >= start_date,
        CallBack.scheduled_date <= end_date
    ).all()

    # Filter callbacks where technician is assigned
    tech_callbacks = []
    for callback in callbacks:
        if callback.technicians:
            tech_ids = json.loads(callback.technicians) if isinstance(callback.technicians, str) else callback.technicians
            if technician_id in tech_ids:
                tech_callbacks.append(callback)

    # Fetch repairs
    repairs = db.query(Repair).filter(
        Repair.created_at >= start_date,
        Repair.created_at <= end_date
    ).all()

    # Filter repairs where technician is assigned
    tech_repairs = []
    for repair in repairs:
        if repair.technicians:
            tech_ids = json.loads(repair.technicians) if isinstance(repair.technicians, str) else repair.technicians
            if technician_id in tech_ids:
                tech_repairs.append(repair)

    # Calculate summary statistics
    total_assigned = len(services)
    completed = len([s for s in services if s.status == ServiceStatus.COMPLETED])
    pending = len([s for s in services if s.status in [ServiceStatus.PENDING, ServiceStatus.SCHEDULED]])
    completion_rate = (completed / total_assigned * 100) if total_assigned > 0 else 0

    # Calculate ratings
    ratings = []
    for service in services:
        if service.status == ServiceStatus.COMPLETED:
            report = db.query(ServiceReport).filter(ServiceReport.service_id == service.id).first()
            if report and report.rating:
                ratings.append(report.rating)
    avg_rating = sum(ratings) / len(ratings) if ratings else 0

    # Calculate working hours
    total_minutes = 0
    for service in services:
        if service.status == ServiceStatus.COMPLETED:
            report = db.query(ServiceReport).filter(ServiceReport.service_id == service.id).first()
            if report and report.check_in_time and report.check_out_time:
                duration = (report.check_out_time - report.check_in_time).total_seconds() / 60
                total_minutes += duration

    total_hours = total_minutes / 60
    avg_service_time = total_minutes / completed if completed > 0 else 0

    # Calculate on-time performance
    on_time = len([s for s in services if s.status == ServiceStatus.COMPLETED and (not s.overdue_days or s.overdue_days == 0)])
    on_time_pct = (on_time / completed * 100) if completed > 0 else 0

    # Route coverage
    route_coverage = {}
    unique_customers = set()
    for service in services:
        customer = db.query(Customer).filter(Customer.id == service.customer_id).first()
        if customer:
            route_key = f"Route {customer.route}"
            route_coverage[route_key] = route_coverage.get(route_key, 0) + 1
            unique_customers.add(customer.id)

    report = {
        "technician_info": {
            "id": technician.id,
            "name": technician.name,
            "email": technician.email,
            "phone": technician.phone
        },
        "period": {
            "month": start_date.strftime("%B"),
            "year": year,
            "start_date": start_date.strftime("%B %d, %Y"),
            "end_date": end_date.strftime("%B %d, %Y"),
            "total_days": total_days
        },
        "summary": {
            "total_assigned": total_assigned,
            "completed": completed,
            "pending": pending,
            "completion_rate": round(completion_rate, 1),
            "callbacks_attended": len(tech_callbacks),
            "repairs_done": len(tech_repairs),
            "total_working_hours": round(total_hours, 1),
            "avg_service_time": f"{int(avg_service_time // 60)}h {int(avg_service_time % 60)}m",
            "customer_rating": round(avg_rating, 1),
            "five_star_count": len([r for r in ratings if r == 5]),
            "on_time_services": on_time,
            "on_time_percentage": round(on_time_pct, 1)
        },
        "route_coverage": route_coverage,
        "unique_customers_served": len(unique_customers),
        "services_per_day": round(completed / total_days, 1)
    }

    return report


@router.get("/materials-consumption")
async def get_materials_consumption_report(
    start_date: date = Query(...),
    end_date: date = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate Materials Consumption Report for a date range
    """

    materials = db.query(MaterialUsage).filter(
        MaterialUsage.used_date >= datetime.combine(start_date, datetime.min.time()),
        MaterialUsage.used_date <= datetime.combine(end_date, datetime.max.time())
    ).all()

    # Consolidate by material name
    materials_summary = {}
    for material in materials:
        mat_name = material.material_name
        if mat_name not in materials_summary:
            materials_summary[mat_name] = {
                "material_name": mat_name,
                "total_quantity": 0,
                "total_cost": 0,
                "unit": material.unit or "units",
                "customers": set(),
                "technicians": set()
            }

        materials_summary[mat_name]["total_quantity"] += material.quantity
        materials_summary[mat_name]["total_cost"] += float(material.total_cost)
        materials_summary[mat_name]["customers"].add(material.customer_id)
        if material.technician_id:
            materials_summary[mat_name]["technicians"].add(material.technician_id)

    # Format output
    materials_list = []
    total_cost = 0
    for mat_name, data in sorted(materials_summary.items(), key=lambda x: x[1]["total_cost"], reverse=True):
        total_cost += data["total_cost"]
        materials_list.append({
            "material_name": mat_name,
            "quantity": data["total_quantity"],
            "unit": data["unit"],
            "total_cost": f"₹{data['total_cost']:,.2f}",
            "customer_count": len(data["customers"]),
            "technician_count": len(data["technicians"])
        })

    return {
        "period": {
            "start_date": start_date.strftime("%B %d, %Y"),
            "end_date": end_date.strftime("%B %d, %Y")
        },
        "summary": {
            "total_materials": len(materials_list),
            "total_cost": f"₹{total_cost:,.2f}",
            "total_items_used": sum([m.quantity for m in materials])
        },
        "materials": materials_list
    }


@router.get("/revenue")
async def get_revenue_report(
    start_date: date = Query(...),
    end_date: date = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate Revenue Report
    """

    # Get all active customers
    customers = db.query(Customer).filter(Customer.amc_status == "ACTIVE").all()

    total_amc_revenue = sum([float(c.amc_amount or 0) for c in customers])
    total_collected = sum([float(c.amc_amount_received or 0) for c in customers])
    total_pending = total_amc_revenue - total_collected

    # Get payments in date range
    payments = db.query(Payment).filter(
        or_(
            and_(Payment.due_date >= datetime.combine(start_date, datetime.min.time()),
                 Payment.due_date <= datetime.combine(end_date, datetime.max.time())),
            and_(Payment.paid_date >= datetime.combine(start_date, datetime.min.time()),
                 Payment.paid_date <= datetime.combine(end_date, datetime.max.time()))
        )
    ).all()

    period_collected = sum([float(p.amount) for p in payments if p.status == "paid"])
    period_pending = sum([float(p.amount) for p in payments if p.status in ["pending", "overdue"]])

    return {
        "period": {
            "start_date": start_date.strftime("%B %d, %Y"),
            "end_date": end_date.strftime("%B %d, %Y")
        },
        "summary": {
            "total_active_contracts": len(customers),
            "total_amc_revenue": f"₹{total_amc_revenue:,.2f}",
            "total_collected": f"₹{total_collected:,.2f}",
            "total_pending": f"₹{total_pending:,.2f}",
            "collection_rate": round((total_collected / total_amc_revenue * 100), 1) if total_amc_revenue > 0 else 0,
            "period_collected": f"₹{period_collected:,.2f}",
            "period_pending": f"₹{period_pending:,.2f}"
        }
    }
