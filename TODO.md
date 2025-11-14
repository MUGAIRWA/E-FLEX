# TODO: Standardize Subjects Across Application

## Overview
Update all hardcoded subject arrays to use the centralized SUBJECTS constant from `src/constants/subjects.js`.

## Tasks
- [x] Create `src/constants/subjects.js` with the standardized subject list
- [x] Update `src/pages/Dashboard/Student/OverviewTab.tsx` - replace hardcoded subjects array
- [x] Update `src/pages/Dashboard/Student/ModulesTab.tsx` - replace hardcoded subjects array
- [x] Update `src/pages/Dashboard/Student/Payment.tsx` - update subjects array to use SUBJECTS constant with additional properties
- [x] Update `src/pages/Dashboard/Parent/ProgressReportTab.jsx` - replace hardcoded subjects array
- [x] Update `src/pages/Dashboard/Parent/PaymentsTab.jsx` - replace hardcoded subjectPayments array
- [x] Update `src/pages/Dashboard/Parent/MessagesSupportTab.jsx` - replace hardcoded subjects in messages array
- [ ] Update `src/pages/Dashboard/Teacher/OverviewTab.tsx` - replace hardcoded subjects in submissions array
- [ ] Update `src/pages/Dashboard/Teacher/GradebookTab.tsx` - replace hardcoded subjects in submissions array
- [ ] Update `src/pages/Dashboard/Student/AssignmentsTab.tsx` - replace hardcoded subjects in assignments array
- [ ] Update `src/pages/Dashboard/Student/CommunityTab.tsx` - replace hardcoded subjects in discussions array
- [ ] Update `src/pages/Dashboard/Admin/UserManagement.jsx` - replace hardcoded subjects in teachers array
- [ ] Update `src/pages/Dashboard/Admin/TeachersOverview.jsx` - replace hardcoded subjects in teachers array
- [ ] Update `src/pages/Dashboard/Admin/TicketsSupport.jsx` - replace hardcoded subjects in tickets array (if applicable)

## Notes
- For files with additional properties (e.g., Payment.tsx), map over SUBJECTS to create objects with required properties
- Ensure all subject names match exactly: Mathematics, English, Kiwahili, Chemistry, Biology, Physics, Geography, History, CRE, Business, Agriculture, Computer, Art, Music, French
