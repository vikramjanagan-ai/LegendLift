# CallBack Workflow Documentation

## Overview
The callback system allows admins to create service tickets that technicians can self-assign and manage. This document explains the complete workflow from creation to completion.

---

## Workflow Steps

### 1. **Admin Creates CallBack**
**Location:** Admin Dashboard → CallBacks → Create CallBack (+)

**Admin provides:**
- Customer (must have active AMC)
- Scheduled Date & Time
- Description (required)
- Notes (optional)
- Priority (Low, Medium, High, Urgent) - **Important for technician visibility**
- Status (only shown when editing existing callbacks)

**What happens:**
- CallBack is created in `PENDING` status
- **NO technicians are assigned**
- CallBack appears in "Available Jobs" for ALL technicians
- Callbacks are sorted by priority (Urgent → High → Medium → Low)

**Success message:**
"CallBack created successfully. Technicians can now pick this job."

---

### 2. **Technician Views Available Jobs**
**Location:** Technician App → Callbacks Tab → Available Jobs

**Technician sees:**
- All unassigned callbacks sorted by priority
- Priority badge (color-coded):
  - 🔴 **Urgent** (Red)
  - 🟠 **High** (Orange)
  - 🟡 **Medium** (Amber)
  - 🟢 **Low** (Green)
- Customer name
- Job number
- Description
- Scheduled date/time
- Issue type

**Display order:**
Urgent jobs appear first, followed by High, Medium, and Low priority

---

### 3. **Technician Picks/Claims CallBack**
**Location:** Available Jobs → Select CallBack → "Pick This Job" ✋

**What happens:**
- Technician is assigned to the callback
- CallBack moves from "Available Jobs" to "My Callbacks" tab
- Other technicians can no longer see this callback in Available Jobs
- Callback status can be updated by technician

**Confirmation:**
"Callback claimed successfully!"

---

### 4. **Technician Updates Status**
**Location:** My Callbacks → Select CallBack → Action Buttons

**Status progression:**
1. **Open** → Click "Start Work" → **In Progress**
2. **In Progress** → Click "Mark Resolved" → **Resolved**
3. **Resolved/Closed** → No further actions available

**Available actions:**
- **Start Work:** Changes status from Open to In Progress
- **Mark Resolved:** Changes status from In Progress to Resolved
- View customer details, phone, location
- See priority and issue type

---

### 5. **Admin Monitors Progress**
**Location:** Admin Dashboard → CallBacks

**Admin can:**
- View all callbacks with current status
- See which technician(s) claimed each callback
- Filter by status (All, Pending, In Progress, Completed, Cancelled)
- Search by customer name, job number, or description
- Edit callback details (description, notes, priority, status)
- Delete callbacks if needed
- View callbacks sorted by priority

**Display info:**
- Customer name with priority badge
- Job number
- Scheduled date/time
- Status badge (color-coded)
- Description
- Number of assigned technicians
- Admin who created it

---

## Key Features

### Priority-Based Display
- Both admin and technician screens show callbacks sorted by priority
- Urgent callbacks always appear first
- Helps technicians focus on critical issues

### Self-Assignment Model
- Technicians choose which jobs to pick
- No admin assignment needed
- Promotes technician autonomy and accountability
- Admin can still monitor all activity

### Multi-Technician Support
- System supports multiple technicians claiming different callbacks
- Each callback shows number of assigned technicians
- Prevents duplicate work

### Status Tracking
- Clear status progression: Pending → In Progress → Completed/Resolved
- Status updates visible to both admin and technician
- Historical tracking of callback lifecycle

---

## API Endpoints Used

### Admin:
- `GET /api/v1/callbacks/` - List all callbacks
- `POST /api/v1/callbacks/` - Create new callback
- `PUT /api/v1/callbacks/{id}` - Update callback
- `DELETE /api/v1/callbacks/{id}` - Delete callback
- `GET /api/v1/customers/active-amc/` - Get customers with active AMC

### Technician:
- `GET /api/v1/complaints/available` - Get unassigned callbacks
- `GET /api/v1/complaints/my-callbacks` - Get assigned callbacks
- `POST /api/v1/complaints/{id}/claim` - Claim a callback
- `PUT /api/v1/complaints/{id}` - Update callback status

---

## Best Practices

### For Admins:
1. Always set appropriate priority based on urgency
2. Provide clear, detailed descriptions
3. Use notes field for additional context
4. Monitor callback progress regularly
5. Let technicians self-assign unless urgent reassignment needed

### For Technicians:
1. Check Available Jobs regularly, especially urgent ones
2. Pick jobs based on priority and your availability
3. Update status promptly as work progresses
4. Complete resolved callbacks quickly
5. Don't claim more jobs than you can handle

---

## Troubleshooting

**Q: Callback not appearing in Available Jobs?**
- Check if another technician already claimed it
- Verify callback status is PENDING
- Refresh the list

**Q: Can't claim a callback?**
- May have already been claimed by another technician
- Check "My Callbacks" to see if you already claimed it
- Contact admin if issue persists

**Q: How to unclaim a callback?**
- Currently not supported via app
- Contact admin for reassignment if needed

---

## Summary
1. **Admin creates** callback with priority (no technician assignment)
2. **Callback appears** in Available Jobs for all technicians (sorted by priority)
3. **Technician picks** the job they want to work on
4. **Callback moves** to technician's "My Callbacks"
5. **Technician updates** status as work progresses
6. **Admin monitors** all activity from dashboard

This workflow ensures efficient job distribution, technician autonomy, and proper priority handling.
