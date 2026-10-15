# TAVYN Frontend Implementation Plan

Based on the TAVYN Frontend Design Specification, this document outlines the technical roadmap for building the React frontend.

## 1. Core Principles & UX Strategy
* **Mobile-First & Action-First**: Design for thumbs. Use Bottom Sheets for mobile forms, large touch targets, and action-oriented labels (e.g., "Collect Rent" instead of "Create Transaction").
* **Optimistic UI & Fast Feedback**: Use React Query for server state. Show toasts on success, and leverage the WebSockets we built for real-time dashboard updates.
* **Component-Driven**: Avoid dense ERP tables. Use visual cards (`TenantCard`, `RoomCard`) for spatial data representation.
* **Color System**: Deep Blue/Indigo (Primary), Green (Success), Amber (Warning), Red (Critical).

---

## 2. Technical Architecture (`client/src/`)
We will strictly follow the architecture outlined on Page 19 of the PRD:

### Directory Structure
```text
client/src/
├── components/          # Reusable UI (Buttons, Modals, StatusBadges, BottomSheets)
├── pages/               # Page-level components
│   ├── Login/
│   ├── Dashboard/
│   ├── Tenants/
│   ├── Rooms/
│   ├── Rent/
│   ├── Electricity/
│   ├── Payments/
│   ├── Expenses/
│   └── Assistant/
├── layouts/             # DesktopLayout (Sidebar) & MobileLayout (Bottom Nav)
├── services/            # Axios API wrappers (authApi.js, tenantApi.js, etc.)
├── hooks/               # Custom React hooks (e.g., useSocket, useAuth)
├── context/             # Global Auth & Role context
└── utils/               # Formatting (currency, dates)
```

### State Management Strategy
* **Server State**: `TanStack React Query` for caching, pagination, and real-time syncing.
* **Local State**: Standard `useState` for short-lived form interactions.
* **Global State**: React Context *only* for Auth/Role session data.

---

## 3. Development Phases (Matching PRD Priority)

### Phase 1: Foundation & Layouts (Priority 1)
* Set up standard UI components (Tailwind + Shadcn converted to JS).
* Implement the responsive app shell:
  * **Desktop**: Sidebar navigation (8-9 top level items).
  * **Mobile**: Bottom navigation (Home | Rooms | + | Payments | More).
* Connect `authApi.js` and implement the Login screen.

### Phase 2: The Dashboard Control Center (Priority 1)
* Build the `Dashboard` answering 4 questions: Occupancy, Pending Money, Today's Attention, Quick Actions.
* Integrate `socket.io-client` to listen for `dashboard_update` events from the backend to flash real-time alerts.

### Phase 3: Spatial Management - Rooms & Beds (Priority 2)
* Build the visual `RoomCard` grid.
* Implement the "Vacancy View" (Quickly answer "Which beds are free?").
* Implement the Room Transfer workflow.

### Phase 4: Tenant Workflows (Priority 2)
* Implement the 3-step "Add Tenant" workflow (Basic -> Room -> Docs).
* Build the `TenantDetail` page with tabs (Overview, Payments, Electricity, Documents, History).
* Build the safe "Checkout" design (calculating final settlement before confirming).

### Phase 5: The Commercial Heart - Rent & Payments (Priority 3)
* Build the Rent collection Action Sheet (outstanding due -> amount -> method -> confirm).
* Implement the "Payment Recorded" success state and simple printable Receipt view.
* Implement Cancel/Reverse workflows instead of hard-deletes.

### Phase 6: Operational Speed - Electricity & Expenses (Priority 4)
* Build the `Bulk meter mode` for rapid floor-by-floor reading entry.
* Add logical validation (Current reading cannot be lower than Previous).
* Build the quick-pick `Add Expense` form.

### Phase 7: Onboarding & The AI Assistant (Priority 5 & 6)
* Build the First-Time Setup wizard (Hostel Info -> Structure -> Billing rules).
* Implement the floating `TAVYN Assistant` interface.
* Connect natural language prompts to backend structured intents with confirmation steps (e.g., "Move Rahul to Room 203").
