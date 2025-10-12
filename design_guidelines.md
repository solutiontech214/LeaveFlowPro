# Design Guidelines: Online Duty Leave Management System

## Design Approach: Professional Dashboard System

**Selected Approach:** Design System (Utility-Focused)  
**Justification:** This institutional management system prioritizes efficiency, data clarity, and role-based workflows. Users need to quickly process applications, understand statuses, and navigate between different views. A systematic, professional approach ensures consistency across student and faculty interfaces.

**Key Design Principles:**
- **Clarity First:** Information hierarchy guides users through approval workflows and application tracking
- **Professional Trust:** Institute branding with clean, authoritative aesthetics
- **Efficient Workflows:** Minimal clicks from login to action completion
- **Role-Based Consistency:** Unified design language with role-specific color coding

---

## Core Design Elements

### A. Color Palette

**Primary Colors (Institute Theme):**
- Primary Blue: 210 85% 45% (main brand, primary actions, navigation)
- Primary Dark: 210 85% 35% (active states, emphasis)
- Primary Light: 210 85% 95% (backgrounds, subtle highlights)

**Semantic Colors:**
- Success Green: 145 70% 45% (approved applications)
- Warning Amber: 38 92% 50% (pending, requires attention)
- Error Red: 0 72% 55% (rejected applications, validation errors)
- Info Blue: 200 95% 45% (notifications, information badges)

**Neutral Palette:**
- Dark Mode Background: 220 15% 10%
- Dark Mode Surface: 220 12% 15%
- Dark Mode Border: 220 10% 25%
- Text Primary (Dark): 210 10% 95%
- Text Secondary (Dark): 210 8% 70%

**Role-Based Accent Colors:**
- Student Dashboard: 210 85% 45% (primary blue)
- CC Dashboard: 270 60% 50% (purple undertone)
- HOD Dashboard: 30 70% 50% (orange undertone)
- Vice Principal: 340 65% 45% (deep red undertone)

### B. Typography

**Font Families:**
- Primary: Inter (Google Fonts) - headings, UI elements
- Secondary: system-ui, -apple-system - body text, forms

**Type Scale:**
- Display (Dashboard Headers): text-4xl, font-bold (36px)
- H1 (Page Titles): text-3xl, font-semibold (30px)
- H2 (Section Headers): text-2xl, font-semibold (24px)
- H3 (Card Titles): text-xl, font-medium (20px)
- Body Large: text-base, font-normal (16px)
- Body: text-sm, font-normal (14px)
- Small/Labels: text-xs, font-medium (12px)

### C. Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16, 20 for consistent rhythm
- Component padding: p-4, p-6, p-8
- Section margins: mb-6, mb-8, mb-12
- Card gaps: gap-4, gap-6
- Grid spacing: space-y-4, space-y-6

**Container Strategy:**
- Dashboard Layouts: max-w-7xl mx-auto px-4
- Form Containers: max-w-3xl mx-auto
- Modal/Dialog: max-w-2xl
- Sidebar Navigation: w-64 (desktop), full-width (mobile)

**Grid Systems:**
- Dashboard Stats: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6
- Application Lists: Single column with dividers
- Faculty Approval Views: grid grid-cols-1 lg:grid-cols-3 gap-6 (pending, approved, rejected)

### D. Component Library

**Navigation:**
- Top Navbar: Sticky header with institute logo (left), user profile menu (right), role badge
- Sidebar (Faculty): Collapsible navigation with icons, active state indicators
- Student Nav: Horizontal tab-based navigation (Apply, Status, History)

**Dashboard Components:**
- Stat Cards: Elevated cards (shadow-md) with icon, count (large), label, trend indicator
- Status Timeline: Vertical progress stepper showing approval flow (pending → CC → HOD → VP)
- Quick Action Buttons: Floating action button (bottom-right) for "New Application"

**Forms:**
- Input Fields: Labeled inputs with dark mode styling, focus rings (ring-2 ring-blue-500)
- Multi-Student Entry: Dynamic fieldset with "+ Add Student" button, removal icons
- Date Pickers: Calendar dropdown with range selection
- Submit CTA: Full-width primary button (bg-blue-600 hover:bg-blue-700)
- Validation: Inline error messages (text-red-400) below fields

**Data Display:**
- Application Cards: White cards (dark:bg-gray-800) with status badge (top-right), student info, action buttons
- Data Tables: Striped rows (alternate bg), sticky headers, sortable columns
- Status Badges: Rounded-full pills with semantic colors (pending/amber, approved/green, rejected/red)
- Empty States: Centered illustrations with descriptive text and CTA

**Modals & Overlays:**
- Approval Dialog: Centered modal with student details, remarks textarea, approve/reject buttons
- Confirmation Dialogs: Simple yes/no confirmations for critical actions
- Toast Notifications: Top-right corner, auto-dismiss, icon + message

**Email Notification Preview:**
- System emails use clean HTML templates matching brand colors
- Institute letterhead (top), application details in table format, CTA button linking to dashboard

### E. Animations

**Minimal Motion Strategy:**
- Page Transitions: Simple fade (200ms) on route changes
- Card Hover: Subtle scale (scale-102) and shadow lift (shadow-lg)
- Button States: 150ms transition on background color changes
- Loading States: Spinner animation for data fetching, skeleton screens for lists
- Success Feedback: Check icon scale animation (300ms) on approval

**No Animations:**
- Avoid parallax, scroll-triggered effects, or decorative animations
- Focus on instant feedback for user actions

---

## Page-Specific Guidelines

**Student Dashboard:**
- Hero Section: Welcome banner with student name, attendance percentage (large), upcoming leaves count
- Application Status Cards: Color-coded by status, expandable for details
- Quick Stats: Applications (total, pending, approved, rejected) in 4-column grid

**Faculty Dashboard:**
- Role Indicator: Prominent badge showing CC/HOD/VP role
- Three-Column Layout: Pending (left, highlighted), Approved (center), Rejected (right)
- Application Preview Cards: Condensed view with expand button, batch approve option

**Application Form:**
- Single-page form with logical sections (Student Info → Leave Details → Additional Students)
- Attendance Eligibility Check: Real-time validation showing percentage with pass/fail indicator
- Dynamic Multi-Student Fields: Smooth add/remove transitions
- Review Step: Summary view before final submission

**Login/Auth Pages:**
- Centered card layout with institute logo and name
- Role selection (Student/Faculty) as tabs
- Clean form with email/password, remember me checkbox
- Forgot password link, no registration (admin-managed accounts)

---

## Images

**Institute Branding:**
- Logo: SVG institute logo in navbar (h-10), login page (h-20)
- Placeholder: Use a professional education-themed icon or crest

**Empty States:**
- No Applications Illustration: Simple line art showing empty clipboard or calendar
- Success Confirmation: Checkmark icon with subtle background accent

**Faculty Portraits:** Small circular avatars (w-10 h-10) for approver identification in timeline

**No Hero Images:** This is a utility application - prioritize functional dashboard over marketing imagery