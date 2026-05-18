# 🧪 TESTING GUIDE - Advanced Features

## Setup for Testing

**Prerequisites:**
- Backend running on `localhost:5000`
- Frontend running on `localhost:5173`
- MongoDB connected with test data

---

## Test Case 1: Limited Seats System ✅

### Setup:
1. Create event with `maxSeats: 2` (Admin or Organizer)
2. Have 3 test students ready to register

### Test Steps:
1. **Student 1**: Register for event
   - ✓ Should succeed
   - ✓ Registered count shows "1 / 2"
   - ✓ Register button still enabled

2. **Student 2**: Register for event
   - ✓ Should succeed
   - ✓ Registered count shows "2 / 2"
   - ✓ Register button becomes DISABLED
   - ✓ Button text shows "Fully Booked"

3. **Student 3**: Try to register
   - ✓ Should get error: "Event is full"
   - ✓ Button remains disabled

### Verify in MyRegistrations:
- ✓ Show "2 / 2 Registered" for the event
- ✓ Shows event details with seat info

---

## Test Case 2: Duplicate Registration Prevention ✅

### Test Steps:
1. **Student registers** for Event A
   - ✓ First registration succeeds

2. **Same Student** tries to register again
   - ✓ Shows error toast: "Already registered"
   - ✓ No duplicate created in database

3. **Check in OrganizerDashboard**:
   - ✓ Only 1 registration shown for that student

### Database Verification:
```javascript
// Should return 0 (no duplicates)
db.registrations.find({ 
  userId: "student-id", 
  eventId: "event-id" 
}).count()
```

---

## Test Case 3: Certificate Generation 🧾

### Setup:
1. Create event and set status to **Approved** (by Admin)
2. Register student with status **Pending**
3. Approve student registration (Organizer)

### Test Steps:

**Step 1: Check Eligibility (Not Yet Eligible)**
- Student views "My Registrations"
- ✓ Certificate button shows "locked" with lock icon
- ✓ Text shows: "Event not yet completed"

**Step 2: Mark Event as Completed**
- Organizer goes to "Organizer Dashboard"
- ✓ Sees blue "Complete" button next to event
- ✓ Clicks "Complete Event"
- ✓ Gets confirmation dialog
- ✓ Clicks confirm

**Step 3: Check Eligibility (Now Eligible)**
- Student refreshes "My Registrations"
- ✓ Certificate button now shows "Download Certificate"
- ✓ Button is blue with Award icon
- ✓ Is clickable

**Step 4: Download Certificate**
- Student clicks "Download Certificate"
- ✓ PDF file downloads
- ✓ Filename: `Certificate_[StudentName]_[EventName].pdf`

**Step 5: Verify PDF Content**
- Open downloaded PDF
- ✓ Contains student name
- ✓ Contains event name and venue
- ✓ Contains date
- ✓ Contains certificate ID
- ✓ Professional design with borders

---

## Test Case 4: Status Badges 🏷️

### Test Events.jsx Page:
1. View event listing page
2. ✓ Each event card shows status badge:
   - 🟡 Yellow badge = "pending"
   - 🟢 Green badge = "approved"
   - 🔴 Red badge = "rejected"
   - 🔵 Blue badge = "completed"

### Test MyRegistrations.jsx Page:
1. View registrations page
2. Each registration card shows TWO badges:
   - **Left Badge**: Registration status (yellow/green/red)
   - **Right Badge**: Event status (yellow/green/red/blue)

### Test OrganizerDashboard.jsx:
1. Organizer views their events
2. ✓ Each event shows appropriate status badge
3. ✓ Color matches the status

---

## Test Case 5: Event Completion Workflow 🔄

### Setup:
- Create event with 2 approved registrations
- Event status is "Approved"

### Test Steps:

**Before Completion:**
1. ✓ Event shows "approved" status (green badge)
2. ✓ Students cannot download certificates
3. ✓ Certificate buttons are locked

**Mark as Completed:**
1. Organizer goes to OrganizerDashboard
2. ✓ Sees "Complete" button next to event
3. ✓ Clicks button
4. ✓ Gets confirmation dialog
5. ✓ Confirms action

**After Completion:**
1. ✓ Event status changes to "completed" (blue badge)
2. ✓ "Complete" button disappears
3. ✓ All approved students can download certificates
4. ✓ Toast shows: "Event marked as completed!"

---

## Test Case 6: Full Student Journey 🚀

### Step 1: Browse Events
- Go to **Events** page
- ✓ See list of approved events
- ✓ See seat availability "X / Y Registered"
- ✓ See event status badges

### Step 2: Register
- Click "Register" on an event
- ✓ Fill registration form
- ✓ Submit
- ✓ Get success toast

### Step 3: View My Registrations
- Go to **My Registrations** page
- ✓ See registered event card
- ✓ See registration status (pending)
- ✓ See event status (approved)
- ✓ See "Certificate locked" button
- ✓ See QR code

### Step 4: Wait for Approval
- Organizer approves registration
- ✓ Student refreshes page
- ✓ Registration status changes to "approved"
- ✓ Still see "Certificate locked"

### Step 5: Event Completes
- Organizer marks event as completed
- ✓ Student refreshes page
- ✓ Event status changes to "completed"
- ✓ Certificate button now shows "Download Certificate"

### Step 6: Download Certificate
- Student clicks "Download Certificate"
- ✓ PDF downloads with proper naming
- ✓ PDF contains all certificate details

---

## Test Case 7: Authorization & Permissions ✅

### Organizer Permissions:
- ✓ Can view their own event registrations
- ✓ Can approve/reject registrations for own events
- ✗ Cannot approve registrations for other organizers' events
- ✓ Can mark own events as completed
- ✗ Cannot mark other organizers' events as completed

### Admin Permissions:
- ✓ Can see ALL registrations table
- ✓ Can approve/reject any registration
- ✓ Can complete any event

### Student Permissions:
- ✓ Can register for approved events
- ✓ Can view own registrations
- ✓ Can download own certificates (when eligible)
- ✗ Cannot see other students' registrations
- ✗ Cannot approve registrations

---

## Common Issues & Fixes

### Issue: Certificate button not showing
**Solution:**
1. Verify event status is "completed"
2. Verify registration status is "approved"
3. Hard refresh browser (Ctrl+Shift+R)
4. Check console for errors

### Issue: "Already registered" shows when student can register again
**Solution:**
1. Check if student registered for SAME event
2. MongoDB query: `db.registrations.findOne({userId, eventId})`
3. If found, that's a duplicate - shouldn't be possible

### Issue: Certificate PDF not generating
**Solution:**
1. Check backend logs for PDFKit errors
2. Verify event title is not empty
3. Check if registration was actually approved
4. Ensure event status is "completed"

### Issue: Seat limit not enforcing
**Solution:**
1. Restart backend (clear cache)
2. Verify event document has `maxSeats` field
3. Check `registeredCount` is accurate
4. Review registration validation in controller

---

## Database Cleanup for Re-testing

### Reset registrations for an event:
```javascript
db.registrations.deleteMany({ eventId: ObjectId("...") })
```

### Reset event seats:
```javascript
db.events.updateOne(
  { _id: ObjectId("...") },
  { $set: { registeredCount: 0, status: "approved" } }
)
```

### View event with all registrations:
```javascript
db.events.findOne({ _id: ObjectId("...") })
db.registrations.find({ eventId: ObjectId("...") })
```

---

## Performance Notes

- Certificate PDF generation: ~500-1000ms
- Large events (1000+ registrations): May need pagination
- Seat checking: Real-time, no caching issues

---

**Testing Complete When:**
- ✅ All 7 test cases pass
- ✅ No errors in browser console
- ✅ No errors in backend logs
- ✅ PDFs download correctly
- ✅ Status badges display properly
