# TODO: Implement Teacher Classes and Streams Assignment

## Step 1: Update User Model
- Add `classesTaught` and `streamsTaught` fields to User schema for teachers.

## Step 2: Update Auth Controller
- Modify `register` function to save `classesTaught` for teachers.

## Step 3: Update Teacher Dashboard Overview
- Modify OverviewTab to fetch and display only students/classes relevant to teacher's assignments.
- Update stats to reflect filtered data.

## Step 4: Update Assignment Controller
- Filter assignments by teacher's classes/streams.

## Step 5: Update Grade Controller
- Filter grades by teacher's classes/streams.

## Step 6: Update Attendance Controller
- Filter attendance by teacher's classes/streams.

## Step 7: Update Announcement Controller
- Filter announcements by teacher's classes/streams if needed.

## Step 8: Update Admin User Management
- Display teacher's classes and streams in admin view.

## Step 9: Test Functionality
- Ensure no app functionality is broken.
- Verify teachers only see relevant data.
