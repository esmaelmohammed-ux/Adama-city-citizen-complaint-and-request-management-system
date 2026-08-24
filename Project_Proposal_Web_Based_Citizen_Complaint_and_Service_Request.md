![Haramaya University logo](scripts/assets/haramaya-university-logo.png)

# NARRATIVE REPORT ON PRACTICAL ATTACHMENT

{center}**COLLEGE OF COMPUTING AND INFORMATICS**

{center}**HARAMAYA UNIVERSITY**

{center}**DEPARTMENT OF INFORMATION SCIENCE**

{center}**NARRATIVE REPORT ON PRACTICAL ATTACHMENT**

{center}**and System Documentation**

{center}Web-Based Citizen Complaint Management System

{center}Adama City Administration Science and Technology Office

{center}*(Host organization / industry partner)*

{center}**Prepared by**

{center}Name: Esmael Mohammed Kedir

{center}ID number: 1160/16

{center}**Summer 2026**

<!-- pagebreak -->

## Cover Page — Organizational Information

This page follows **Appendix B** of the Haramaya University Practical Attachment Report Guideline. Complete the blank fields with values confirmed at the host office.

### Organization Profile (Appendix B)

| Field | Detail |
|-------|--------|
| **Name** | Adama City Administration Science and Technology Office |
| **Region** | Oromia |
| **Zone** | East Shewa (East Shoa) |
| **District / City** | Adama City |
| **Town** | Adama |
| **P.O. Box** | ____________________ |
| **Telephone** | +251-22-110-0000 *(city administration contact published on the citizen portal)* |
| **Email** | info@adama.gov.et |
| **Office hours** | Monday–Friday, 8:30 AM – 5:30 PM |

### Supervisor’s Profile (Appendix B)

| Field | Detail |
|-------|--------|
| **Name** | Mr. Muktar |
| **Profession** | Software Engineer |
| **Telephone** | 0912807372 |

| Field | Detail |
|-------|--------|
| **Project Title** | Web-Based Citizen Complaint Management System |
| **Document Version** | 2.24 |
| **Submission date** | 24 August 2026 |
| **Institution** | Haramaya University — College of Computing and Informatics, Department of Information Science |
| **University advisor** | ____________________ |
| **Host Organization** | Adama City Administration Science and Technology Office |

This **single document** is both the practical attachment narrative (guideline sections) and the system documentation (requirements, design, methodology, and Chapter Four results).

---

## Abstract (Executive Summary)

This document reports the **Summer 2026 practical attachment** at **Adama City Administration Science and Technology Office** and documents the **Web-Based Citizen Complaint Management System** (Adama City Citizen Portal) produced during that attachment.

Municipal complaint handling in Adama City Administration has traditionally relied on paper-based processes and office visits. This approach causes delays, weak record keeping, limited status tracking, and reduced transparency between citizens and responsible departments.

The implemented system digitizes submission, assignment, tracking, and reporting of citizen complaints. It supports three roles: **Citizen**, **Administrator**, and **Department Officer**. Citizens can register, submit categorized complaints (Adama area, optional landmark and photo), edit pending complaints, and track progress using unique reference numbers. Administrators manage users and departments, assign work, update status, and generate reports. Officers process assigned tasks within their department scope and add resolution notes.

The solution is built with the **MERN** stack (MongoDB, Express.js, React, Node.js), using JWT authentication and role-based access control. Optional AI assistance (writing help, triage, resolution drafts, chatbot) runs as a sidecar service. Status history, in-app notifications (marked seen when opened), and email alerts (real mailboxes only) improve accountability and communication. Public and authenticated screens support **English, Amharic, and Afaan Oromo**.

Chapters One to Four specify and evidence the system. Chapters Five to Seven cover the College practical attachment sections (organization profile, tasks done and undone, challenges, career opportunities, and learning). Chapter Eight concludes and recommends.

**Keywords:** practical attachment, citizen complaint, e-governance, Adama City Administration, Science and Technology Office, MERN, role-based access control

### Implementation snapshot (August 2026)

The **delivered application is complaints-only**. A parallel service-request module was removed so citizens, admins, and officers work from one complaint workflow. Location is selected from Adama sub-cities, kebeles 01–18, and landmarks, with an optional extra detail field. Authenticated screens are localized in English, Amharic, and Afaan Oromo. Opening the notifications page marks items as seen automatically. Demo logins (`*@test.com`) do not receive email. The Activity Log stores assignment details with department and officer **names** (not database IDs).

---

## Acknowledgement

First and foremost, I would like to thank **Almighty God** for the strength, guidance, and opportunity to complete this practical attachment and documentation.

I express sincere gratitude to my advisor for continuous guidance, constructive feedback, and encouragement throughout the attachment period, the development of the system, and the preparation of this document.

I also thank the instructors and staff of the **Department of Information Science, College of Computing and Informatics, Haramaya University** for the knowledge and support provided during the course of study.

Special appreciation is extended to **Adama City Administration Science and Technology Office** for hosting the attachment, and to officers and colleagues who explained municipal workflows and reviewed the complaint portal. I also thank classmates and family members who offered advice and moral support.

Finally, I acknowledge all authors, developers, and organizations whose published works, documentation, and open-source tools contributed to the system and this report.

---

## Declaration

I hereby declare that this document, titled **"Narrative Report on Practical Attachment and System Documentation: Web-Based Citizen Complaint Management System for Adama City Administration"**, is my original work. It has been prepared as part of the academic requirements of **Haramaya University, College of Computing and Informatics, Department of Information Science** under the guidance of my advisor, following the College practical attachment guideline.

I further declare that:

- This work has not been submitted, in whole or in part, for any other degree, diploma, or academic award at this or any other institution.
- All sources of information used in this document have been properly acknowledged through citations and references.
- The system design, documentation, and implementation described herein represent work carried out by me, except where otherwise stated.

| | |
|--|--|
| **Name** | Esmael Mohammed Kedir |
| **ID** | 1160/16 |
| **Signature** | ______________________________ |
| **Date** | 24 August 2026 |

---

## Table of contents

Abstract (Executive Summary) ................................................ i
Acknowledgement ............................................................. ii
Declaration ................................................................ iii
List of Acronyms ............................................................ iv
List of Figures ............................................................. v
CHAPTER ONE: INTRODUCTION ................................................... 1
    1.1 Background of the Study ............................................. 1
    1.2 Problem Statement ................................................... 2
    1.3 Objectives .......................................................... 2
        1.3.1 General Objective ............................................. 2
        1.3.2 Specific Objectives ........................................... 2
    1.4 Scope of the Project ................................................ 3
        1.4.1 In Scope ...................................................... 3
        1.4.2 Out of Scope .................................................. 3
        1.4.3 Complaint-only scope .......................................... 3
    1.5 Limitations ......................................................... 4
    1.6 Literature Review and Related Work .................................. 4
    1.7 Purpose of the Practical Attachment ................................. 5
CHAPTER TWO: SYSTEM REQUIREMENTS AND DESIGN ................................. 6
    2.1 Proposed System ..................................................... 5
        2.1.1 Citizens Can .................................................. 5
        2.1.2 Administrators Can ............................................ 5
        2.1.3 Department Officers Can ....................................... 6
    2.2 Actors of the System ................................................ 6
        2.2.1 Citizen ....................................................... 6
        2.2.2 Administrator ................................................. 6
        2.2.3 Department Officer ............................................ 6
    2.3 Functional Requirements ............................................. 7
        2.3.1 Complaint Categories (Predefined) ............................. 7
        2.3.2 Location (Adama) .............................................. 7
        2.3.3 Status Values ................................................. 7
        2.3.4 Status Transition Rules (Implemented) ......................... 8
    2.4 Non-Functional Requirements ......................................... 8
        2.4.1 Security ...................................................... 8
        2.4.2 Performance ................................................... 8
        2.4.3 Reliability ................................................... 9
        2.4.4 Usability ..................................................... 9
        2.4.5 Scalability ................................................... 9
        2.4.6 Maintainability ............................................... 9
    2.5 System Architecture ................................................. 10
    2.6 Use Case Diagram .................................................... 10
    2.7 Entity-Relationship Diagram ......................................... 11
    2.8 Data Flow Diagram (Level 0) ......................................... 12
    2.9 System Workflow ..................................................... 12
    2.10 Technology Stack and Development Tools ............................. 13
    2.11 Database Design .................................................... 13
        2.11.1 Collections Overview ......................................... 13
        2.11.2 Users Collection ............................................. 14
        2.11.3 Departments Collection ....................................... 14
        2.11.4 Complaints Collection ........................................ 14
        2.11.5 Status Histories Collection .................................. 15
        2.11.6 Notifications Collection ..................................... 15
CHAPTER THREE: METHODOLOGY AND PROJECT PLAN ................................. 16
    3.1 Methodology ......................................................... 16
    3.2 Project Timeline .................................................... 17
        3.2.1 Gantt Chart ................................................... 17
    3.3 Testing Strategy .................................................... 18
        3.3.1 Sample Test Cases ............................................. 18
    3.4 Deployment Plan ..................................................... 19
        3.4.1 Environment Setup ............................................. 19
        3.4.2 Deployment Architecture ....................................... 19
        3.4.3 Deployment Steps .............................................. 20
        3.4.4 Minimum Server Requirements ................................... 20
CHAPTER FOUR: RESULTS AND DISCUSSION ........................................ 21
    4.1 Results ............................................................. 21
        4.1.1 Guest UI (Landing, Register, Login) ........................... 21
        4.1.2 Citizen Modules ............................................... 22
        4.1.3 Officer Modules ............................................... 23
        4.1.4 Administrator Modules ......................................... 24
    4.2 Discussion .......................................................... 25
    4.3 Expected Benefits ................................................... 26
        4.3.1 For Citizens .................................................. 26
        4.3.2 For Adama City Administration ................................. 26
    4.4 Expected Outcome .................................................... 27
    4.5 Future Enhancements ................................................. 27
CHAPTER FIVE: ORGANIZATION PROFILE .......................................... 28
    5.1 Mission ............................................................. 28
    5.2 Vision .............................................................. 28
    5.3 Organizational Chart ................................................ 28
    5.4 Core Values ......................................................... 29
    5.5 Product / Services Description ...................................... 29
    5.6 Stakeholders ........................................................ 29
    5.7 Organizational History .............................................. 30
CHAPTER SIX: ACTIVITIES DONE AND UNDONE ..................................... 31
CHAPTER SEVEN: CHALLENGES, CAREER OPPORTUNITIES, AND LEARNING ............... 33
    7.1 Challenges faced in the practical attachment ........................ 33
    7.2 Career opportunities in the organization ............................ 34
    7.3 Significance of learning gained ..................................... 34
CHAPTER EIGHT: CONCLUSION AND RECOMMENDATION ................................ 35
References .................................................................. 36
Document Revision History ................................................... 37

---

## List of Acronyms

| Acronym | Full Form |
|---------|-----------|
| **AM** | Amharic |
| **API** | Application Programming Interface |
| **CORS** | Cross-Origin Resource Sharing |
| **CRUD** | Create, Read, Update, Delete |
| **CSS** | Cascading Style Sheets |
| **DFD** | Data Flow Diagram |
| **EN** | English |
| **ER** | Entity-Relationship |
| **FK** | Foreign Key |
| **FR** | Functional Requirement |
| **GIS** | Geographic Information System |
| **HTML** | HyperText Markup Language |
| **HTTP** | HyperText Transfer Protocol |
| **HTTPS** | HyperText Transfer Protocol Secure |
| **ID** | Identifier |
| **JSON** | JavaScript Object Notation |
| **JWT** | JSON Web Token |
| **MERN** | MongoDB, Express.js, React, Node.js |
| **ODM** | Object Document Mapper |
| **OM** | Afaan Oromo |
| **PK** | Primary Key |
| **RBAC** | Role-Based Access Control |
| **REST** | Representational State Transfer |
| **SLA** | Service Level Agreement |
| **SMS** | Short Message Service |
| **SPA** | Single-Page Application |
| **SSL** | Secure Sockets Layer |
| **STO** | Science and Technology Office |
| **UAT** | User Acceptance Testing |
| **UI** | User Interface |
| **UK** | Unique Key |
| **URL** | Uniform Resource Locator |
| **VPS** | Virtual Private Server |
| **XSS** | Cross-Site Scripting |

---

## List of Figures

**Design diagrams**

| Figure | Description |
|--------|-------------|
| 2.1 | System architecture |
| 2.2 | Use case diagram (Citizen, Administrator, Officer) |
| 2.3 | Entity-relationship diagram |
| 2.4 | Level-0 data flow diagram |
| 2.5 | Complaint workflow |
| 3.1 | Project timeline (Gantt), 7 June–16 August 2026 |
| 3.2 | Deployment architecture |
| 5.1 | Host organizational chart (attachment placement) |

**Result screenshots (Guest UI first)**

| Figure | Screen |
|--------|--------|
| 4.1 | Guest landing page |
| 4.2 | Guest registration |
| 4.3 | Guest sign-in |
| 4.4 | Citizen dashboard |
| 4.5 | Submit complaint |
| 4.6 | My Complaints |
| 4.7 | Citizen notifications |
| 4.8 | Citizen profile |
| 4.9 | Officer dashboard |
| 4.10 | Officer assigned tasks |
| 4.11 | Officer notifications |
| 4.12 | Admin dashboard |
| 4.13 | Manage complaints |
| 4.14 | User management |
| 4.15 | Reports |
| 4.16 | Activity log |

---

## CHAPTER ONE: INTRODUCTION

### 1.1 Background of the Study

Adama (historically also known as Nazareth) is the capital of East Shewa Zone in Oromia and a major transport and industrial hub. Residents, travellers, and businesses depend on municipal services such as roads, water, waste collection, and street lighting. When those services fail, citizens often have little choice but to visit an office or leave a paper complaint with no reliable way to follow what happens next.

Adama City Administration therefore handles a steady volume of complaints on public services — road maintenance, waste management, water supply, street lighting, and related community issues. Currently, many of those complaints are still processed manually through paper files or counter visits. This leads to:

- Delays in service delivery
- Poor record management
- Limited tracking capabilities
- Reduced transparency between citizens and administration

To address these challenges, a **web-based system** is implemented to allow citizens to submit complaints online, track their progress in real time, and receive feedback from responsible departments.

---

### 1.2 Problem Statement

The existing complaint management process faces several challenges:

- Manual handling of complaints and requests
- Difficulty in tracking complaint status
- Delayed response from responsible departments
- Lack of centralized data storage
- Poor communication between citizens and city administration
- Limited reporting and monitoring capabilities
- Inefficient record management
- No audit trail for status changes
- No standardized categories for complaints and service types

---

### 1.3 Objectives

#### 1.3.1 General Objective

To develop a web-based citizen complaint management system for Adama City Administration that improves transparency, efficiency, and accountability in municipal service delivery.

---

#### 1.3.2 Specific Objectives

- To provide online citizen registration and secure authentication (including email password reset)
- To enable citizens to submit complaints electronically with category, Adama location, optional landmark, and optional photo
- To allow citizens to edit pending complaints before they are assigned
- To provide complaint tracking with status history and unique reference IDs
- To provide role-based administrative and department dashboards
- To improve communication through in-app notifications and optional email
- To generate reports and statistics for decision-making
- To maintain centralized, searchable records of complaints
- To support department-based assignment and processing workflows
- To offer optional AI assistance for drafting, triage, and FAQ (suggestions only)

---

### 1.4 Scope of the Project

#### 1.4.1 In Scope

- User registration and login (JWT authentication) with email password reset
- Complaint submission with category, Adama area dropdown, optional landmark, and optional photo
- Citizen edit of **pending** complaints
- Status tracking with history (Pending, In Progress, Resolved, Rejected, Closed)
- Role-based access: Citizen, Administrator, Department Officer
- User management (Administrator: view users, activate/deactivate)
- Department management (Administrator: list and add departments)
- Complaint assignment to departments and optional officers
- Search and filter complaints (admin lists; citizens view their own)
- In-app notifications; opening the notifications page marks them seen
- Role-specific dashboards with summary statistics
- In-app report summaries (counts by status, category, department)
- Activity/audit log for administrative actions
- Multi-language UI (English, Amharic, Afaan Oromo) for public and authenticated screens
- Optional AI assist (citizen writing, admin triage, officer resolution draft, chatbot)
- Email notifications to real mailboxes (demo `@test.com` addresses are skipped)
- Success feedback (submission popup; action toasts)

#### 1.4.2 Out of Scope

- Online payment processing
- Advanced GIS mapping and interactive maps (Adama area list is used instead)
- Live SMS to real phones (Africa’s Talking sandbox is available but off by default)
- Native mobile applications (web-responsive only in this phase)
- Full user/department CRUD (edit/delete), complaint delete, and report export
- JWT refresh tokens, API rate limiting, and list pagination (planned hardening)
- A separate service-request workflow (removed from the implemented system)

#### 1.4.3 Complaint-only scope

Earlier drafts distinguished **complaints** (report a failure) from **service requests** (ask for a new service). The **implemented system records municipal issues as complaints only**, so routing, tracking, and reporting stay on one path. Guest “municipal services” cards on the landing page describe issue categories; they are not a second request form.

---

### 1.5 Limitations

- Requires internet access; citizens without connectivity must still use offline channels
- Initial deployment assumes manual setup of departments and officer accounts by administrators
- File uploads limited to images (including JPEG, PNG, WebP, GIF) up to **2 MB** per attachment
- Demo accounts (`citizen@test.com`, `admin@test.com`, `officer@test.com`) are for login only and do not receive email
- No integration with existing legacy paper records
- Performance targets assume moderate concurrent usage (up to 500 simultaneous users)

---

### 1.6 Literature Review and Related Work

Several municipal and e-governance systems demonstrate the value of digital complaint management:

| System / Study | Approach | Relevance |
|----------------|----------|-----------|
| **FixMyStreet (UK)** | Web-based geo-tagged reporting | Shows citizen-driven reporting improves response times |
| **311 Systems (USA)** | Centralized non-emergency service requests | Model for categorization and department routing |
| **Ethiopian e-Service initiatives** | Government digital transformation | Aligns with national push for digital public services |
| **CRM-based municipal portals** | Role-based dashboards and ticketing | Supports assignment, tracking, and reporting workflows |

**Gap identified:** Adama City Administration lacks a dedicated, centralized web platform that connects citizens, administrators, and department officers with transparent status tracking and reporting. This project fills that gap using a modern MERN stack suitable for rapid development and scalability.

---

### 1.7 Purpose of the Practical Attachment

This work was carried out as a **practical attachment** at **Adama City Administration Science and Technology Office** during **Summer 2026**, in partial fulfilment of the requirements of the Department of Information Science.

The attachment objectives were:

- To understand the structure, mission, and digital-service role of the host office
- To observe how complaints were handled and where information was lost
- To design and implement an online complaint workflow for Citizen, Administrator, and Department Officer roles
- To document both the system (Chapters Two to Four) and the attachment experience (Chapters Five to Seven) in one College-ready report

The student worked as a junior full-stack developer and documenter. Chapter Five follows the guideline organization-profile headings. Chapter Six lists tasks done and undone. Chapter Seven records challenges, career opportunities, and learning gained.

---

## CHAPTER TWO: SYSTEM REQUIREMENTS AND DESIGN

### 2.1 Proposed System

The proposed system is a **web-based application** accessible through modern browsers. It follows a three-tier architecture: React frontend, Node.js/Express API, and MongoDB database.

#### 2.1.1 Citizens Can

- Create accounts and manage profiles (name, phone)
- Log in securely with JWT-based sessions; reset password by email
- Submit complaints with category, Adama location, optional landmark, description, and optional photo
- Use optional AI writing assist and browser voice input on the complaint form
- Edit a complaint while it is still **pending**
- View and track status of their complaints (with reference ID)
- Receive in-app notifications (marked seen when the notifications page is opened)
- View their own complaints from the citizen dashboard

#### 2.1.2 Administrators Can

- View users and activate/deactivate accounts
- Add departments and view department list
- View all complaints (search/filter)
- Assign complaints to departments and optionally to officers
- Use optional AI triage suggestions when routing
- Reject pending complaints; resolve/close in-progress items
- View report summaries and dashboard analytics
- Monitor system activity via audit logs

#### 2.1.3 Department Officers Can

- View personally assigned items and unassigned items in their department queue
- Start work (Pending → In Progress)
- Add resolution notes
- Mark tasks as **Resolved** or **Closed** (officers cannot reject)
- View officer dashboard statistics

---

### 2.2 Actors of the System

#### 2.2.1 Citizen

**Responsibilities:** Register account, log in, submit complaints, edit pending complaints, view status, update profile, receive notifications.

#### 2.2.2 Administrator

**Responsibilities:** View and activate/deactivate users, add departments, assign submissions, update/reject statuses, view report summaries, monitor system activities.

#### 2.2.3 Department Officer

**Responsibilities:** View assigned work and department queue, process complaints, update progress, add notes, mark tasks resolved or closed. Each officer belongs to one department (e.g., Water, Roads, Sanitation). Officers cannot reject submissions.

---

### 2.3 Functional Requirements

| ID | Requirement | Description |
|----|-------------|-------------|
| FR-01 | User registration | Citizens register with full name, email, phone, and password |
| FR-02 | User login | Authenticate with email and password; receive JWT token |
| FR-03 | Profile management | Update name and phone; view account role |
| FR-04 | Complaint submission | Submit with title, description, category, Adama location, optional landmark, optional photo |
| FR-05 | Edit pending complaint | Citizen updates a complaint only while status is pending |
| FR-06 | Status tracking | View current status and full status history timeline |
| FR-07 | Dashboard | Role-specific dashboards with counts and recent items |
| FR-08 | User management | Admin lists users and activates/deactivates accounts |
| FR-09 | Department management | Admin lists and adds departments |
| FR-10 | Assignment | Admin assigns submission to department; optional officer |
| FR-11 | Report summaries | View counts by status, category, and department |
| FR-12 | Search | Admin search/filter by reference ID, keyword, and status |
| FR-13 | Notifications | In-app notifications on assignment and status change |
| FR-14 | Audit log | Record who changed status and when |
| FR-15 | Success feedback | Confirm successful submissions and admin/officer actions |

#### 2.3.1 Complaint Categories (Predefined)

Road Maintenance, Waste Management, Water Supply, Street Lighting, Drainage, Public Safety, Noise Pollution, Other.

#### 2.3.2 Location (Adama)

Required area key from sub-cities (Lugo, Dabe, Bole, Dembela, Aba Geda, Hawas), kebeles 01–18, or landmarks (Medhanialem, Adama Stadium, Central Bus Station, China Avenue, ASTU, Wonji). Optional landmark / street text (max 120 characters) is stored separately.

#### 2.3.3 Status Values

| Status | Description |
|--------|-------------|
| **Pending** | Submitted; awaiting review or sitting in a department queue |
| **In Progress** | Assigned to an officer and being processed |
| **Resolved** | Issue addressed or service fulfilled |
| **Rejected** | Invalid or out of scope (admin only) |
| **Closed** | Closed without further action |

#### 2.3.4 Status Transition Rules (Implemented)

| Role | From | Allowed next statuses |
|------|------|------------------------|
| Officer | Pending | In Progress |
| Officer | In Progress | Resolved, Closed |
| Admin | Pending | Rejected |
| Admin | In Progress | Resolved, Closed, Rejected |
| Admin | Resolved | Closed |

**Assignment note:** Routing to a **department only** keeps status **Pending**. Assigning (or claiming) an **officer** moves the item to **In Progress**.

---

### 2.4 Non-Functional Requirements

#### 2.4.1 Security

- Password hashing with bcrypt (never store plain text)
- JWT authentication with configurable expiration (no refresh tokens in Phase 1)
- Role-based access control (RBAC) on API routes and frontend routes
- HTTPS in production
- Input validation and sanitization (prevent XSS, injection)
- Secure file upload validation (type and size; max 2 MB)
- Rate limiting on login and submission endpoints *(planned hardening)*

#### 2.4.2 Performance

- API response time under 2 seconds for typical requests
- Indexed database queries on status, citizenId, departmentId, createdDate
- List pagination *(planned; Phase 1 returns role-scoped full lists)*

#### 2.4.3 Reliability

- Consistent operation with structured error handling
- Automated MongoDB backups (daily in production)
- Graceful degradation when optional features (e.g., file upload) fail

#### 2.4.4 Usability

- Responsive design for desktop and mobile browsers
- Clear navigation and accessible forms with validation messages
- Consistent UI patterns across citizen, admin, and officer interfaces
- Success popups/toasts after key actions
- Multi-language support on the public guest experience (EN/AM/OM)

#### 2.4.5 Scalability

- Stateless API design for horizontal scaling
- MongoDB Atlas replica sets as user base grows

#### 2.4.6 Maintainability

- Modular code structure (routes, controllers, models, middleware)
- API exercises via HTTP client tools (e.g., Postman / Thunder Client)
- Version control with Git and GitHub

---

### 2.5 System Architecture

![System architecture](scripts/assets/diagrams/fig-2-1-architecture.png)

*Figure 2.1: System architecture — complaint portal with optional AI sidecar*

### 2.6 Use Case Diagram

The system has three actors. Citizens register, submit and edit pending complaints, and track status. Administrators manage users and departments, assign work, and report. Officers process assigned complaints and add resolution notes.

![Use case diagram](scripts/assets/diagrams/fig-2-2-use-case.png)

*Figure 2.2: Use case diagram — citizen, administrator, and officer (complaints only)*

### 2.7 Entity-Relationship Diagram

There is **no SERVICE_REQUEST collection**. Users, departments, and complaints are linked through Mongoose references. Status history, notifications, and the activity log complete the audit trail.

![Entity-relationship diagram](scripts/assets/diagrams/fig-2-3-er.png)

*Figure 2.3: Entity-relationship diagram — users, departments, and complaints*

### 2.8 Data Flow Diagram (Level 0)

![Level-0 data flow diagram](scripts/assets/diagrams/fig-2-4-dfd.png)

*Figure 2.4: Level-0 data flow — complaints, assignment, and status feedback*

---

### 2.9 System Workflow

![Complaint workflow](scripts/assets/diagrams/fig-2-5-workflow.png)

*Figure 2.5: Complaint workflow from submit/edit through assignment and resolution*

**Step-by-step:**

1. Citizen registers an account and logs into the system.
2. Citizen submits a complaint (category, Adama area, optional landmark and photo). While it is **Pending**, the citizen may edit it.
3. System generates a unique reference ID (e.g., `CMP-2026-0001`) and stores the record as **Pending**.
4. Administrator reviews the complaint.
5. Administrator either rejects it, routes it to a department queue (**Pending**), or assigns an officer (**In Progress**).
6. Department officer processes the complaint (start work if still pending) and may add resolution notes.
7. Officer sets **Resolved** or **Closed**; admin may also reject in-progress items.
8. Status history and audit log are recorded; citizen views progress and notifications.

---

### 2.10 Technology Stack and Development Tools

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React.js (Vite), HTML5, CSS3, JavaScript | Single-page user interface |
| **UI / Client** | React Router, native `fetch` | Routing and API communication |
| **Backend** | Node.js, Express.js, Helmet | REST API server |
| **Database** | MongoDB Atlas (or local), Mongoose | Document storage and ODM |
| **Authentication** | JWT, bcrypt | Secure sessions and password hashing |
| **Validation** | express-validator | Request validation |
| **File Upload** | multer | Complaint image attachments |
| **i18n** | Custom language context | English, Amharic, Afaan Oromo (public and authenticated UI) |
| **Email** | Nodemailer SMTP / Resend | Assignment and status emails; `@test.com` skipped |
| **AI** | Optional Express sidecar | Gemini / OpenAI / heuristic suggestions |
| **Development** | Visual Studio Code, Git, GitHub | Coding and version control |

**Note on database choice:** MongoDB supports flexible schemas for complaints. Relational integrity is enforced at the application layer via Mongoose references. PostgreSQL is a viable alternative if strict relational reporting is required later.

---

### 2.11 Database Design

#### 2.11.1 Collections Overview

| Collection | Purpose |
|------------|---------|
| `users` | All system users (citizens, admins, officers) |
| `departments` | Municipal departments |
| `complaints` | Citizen complaint records |
| `statusHistories` | Status change audit trail |
| `notifications` | In-app user notifications |
| `activityLogs` | Administrative action logs |

#### 2.11.2 Users Collection

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Primary key |
| `fullName` | String | User full name |
| `email` | String | Unique email (login) |
| `passwordHash` | String | Bcrypt-hashed password (not plain text) |
| `role` | Enum | `citizen`, `admin`, `officer` |
| `phoneNumber` | String | Contact number |
| `departmentId` | ObjectId | FK to departments (officers only) |
| `isActive` | Boolean | Account enabled/disabled |
| `createdAt` | Date | Registration date |
| `updatedAt` | Date | Last profile update |

**Indexes:** `email` (unique), `role`, `departmentId`

#### 2.11.3 Departments Collection

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Primary key |
| `name` | String | e.g., Water Supply, Roads |
| `description` | String | Department description |
| `isActive` | Boolean | Active flag |
| `createdAt` | Date | Created date |

**Indexes:** `name` (unique)

#### 2.11.4 Complaints Collection

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Primary key |
| `referenceId` | String | Human-readable ID (e.g., CMP-2026-0001) |
| `title` | String | Short title |
| `description` | String | Full description |
| `category` | Enum | Predefined category |
| `location` | String | Adama area key (sub-city, kebele, or landmark) |
| `landmark` | String | Optional street / nearby place |
| `status` | Enum | pending, in_progress, resolved, rejected, closed |
| `citizenId` | ObjectId | FK to users |
| `departmentId` | ObjectId | FK to departments |
| `assignedOfficerId` | ObjectId | FK to users (optional) |
| `photoUrl` | String | Optional photo (data URL or path) |
| `attachmentUrl` | String | Optional uploaded file path |
| `resolutionNote` | String | Officer/admin resolution text |
| `createdAt` | Date | Submission date |
| `updatedAt` | Date | Last update |
| `resolvedAt` | Date | Resolution timestamp |

**Indexes:** `referenceId` (unique), `citizenId`, `departmentId`, `status`, `createdAt`

#### 2.11.5 Status Histories Collection

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Primary key |
| `entityType` | Enum | `complaint` |
| `entityId` | ObjectId | FK to complaint |
| `fromStatus` | String | Previous status |
| `toStatus` | String | New status |
| `note` | String | Optional comment |
| `changedBy` | ObjectId | FK to users |
| `changedAt` | Date | Timestamp |

#### 2.11.6 Notifications Collection

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Primary key |
| `userId` | ObjectId | FK to users |
| `title` | String | Notification title |
| `message` | String | Notification body |
| `relatedEntityType` | String | `complaint` |
| `relatedEntityId` | ObjectId | Related record ID |
| `isRead` | Boolean | Read flag |
| `createdAt` | Date | Created timestamp |

**Indexes:** `userId`, `isRead`, `createdAt`

---

## CHAPTER THREE: METHODOLOGY AND PROJECT PLAN

### 3.1 Methodology

This project follows an **Agile-inspired iterative development** approach suited for a academic/software engineering project:

| Phase | Activities |
|-------|------------|
| **1. Requirements** | Gather requirements, define scope, document actors and use cases |
| **2. Design** | Architecture, ER diagram, API design, UI wireframes |
| **3. Implementation** | Backend API first, then frontend integration, feature by feature |
| **4. Testing** | Unit, integration, and user acceptance testing |
| **5. Deployment** | Deploy to staging, then production server |
| **6. Documentation** | User manual, API docs, final report |

**Development order (recommended):**

1. Project setup and database models
2. Authentication and user management
3. Complaint create/list/update APIs
4. Assignment and status workflow
5. Notifications and audit log
6. Dashboard and reports
7. Testing and deployment

---

### 3.2 Project Timeline

**Actual duration:** 10 weeks (**7 June 2026 – 16 August 2026**)  
**Implementation status (as of 16 August 2026):** Core MERN complaint system delivered (API, role UIs, Atlas DB, photo upload, Adama location dropdown, pending edit, EN/AM/OM i18n, email + password reset, optional AI sidecar). Remaining work focuses on hardening, live SMS, GIS, and production deployment.

| Week | Dates | Phase | Tasks | Deliverables |
|------|-------|-------|-------|--------------|
| 1 | 7–13 June 2026 | Planning | Finalize requirements, proposal, ER diagram | Approved proposal |
| 2 | 14–20 June 2026 | Design | UI wireframes, API specification, DB schema | Design documents |
| 3 | 21–27 June 2026 | Setup | Init React + Node + MongoDB, Git repo, folder structure | Project scaffold |
| 4 | 28 June–4 July 2026 | Backend Core | Auth (JWT), user model, department model | Working login/register API |
| 5 | 5–11 July 2026 | Backend Features | Complaint APIs | Create/list/update endpoints |
| 6 | 12–18 July 2026 | Backend Workflow | Assignment, status history, notifications | Workflow APIs |
| 7 | 19–25 July 2026 | Frontend Core | Login, register, citizen dashboard; start complaint forms | Citizen UI shell |
| 8 | 26 July–1 August 2026 | Frontend Citizen & Admin | Submit/edit/track complaints; start admin dashboard | Citizen features; admin in progress |
| 9 | 2–8 August 2026 | Frontend Admin & Officer | User/dept management, assignment; officer queue | Admin and officer UIs complete |
| 10 | 9–16 August 2026 | Testing, deployment & documentation | Manual/API testing, UAT, bug fixes, documentation, final report | Tested system + report (finished 16 August 2026) |

#### 3.2.1 Gantt Chart

![Project timeline Gantt chart](scripts/assets/diagrams/fig-3-1-gantt.png)

*Figure 3.1: Actual 10-week schedule, 7 June–16 August 2026 (complaint system)*

---

### 3.3 Testing Strategy

| Test Type | Scope | Tools / Method |
|-----------|-------|----------------|
| **Unit Testing** | Models, utilities, validation logic | Manual / planned Jest |
| **API Integration Testing** | REST endpoints, auth, RBAC | HTTP client (Postman / Thunder Client) |
| **Frontend Testing** | Component rendering, form validation | Manual browser testing |
| **Security Testing** | Auth bypass, role escalation, input injection | Manual + API client |
| **User Acceptance Testing (UAT)** | End-to-end citizen, admin, officer flows | Test cases with stakeholders |

#### 3.3.1 Sample Test Cases

| ID | Scenario | Expected Result |
|----|----------|-----------------|
| TC-01 | Citizen registers with valid data | Account created; can log in |
| TC-02 | Citizen submits complaint | Record saved as Pending with reference ID; success popup shown |
| TC-03 | Admin routes complaint to department only | Status stays Pending; appears in department queue |
| TC-04 | Admin assigns complaint to an officer | Status In Progress; officer sees item |
| TC-05 | Officer marks complaint resolved | Status Resolved; citizen notified |
| TC-06 | Officer tries to reject a complaint | Not allowed (admin-only) |
| TC-07 | Officer tries to access admin routes | Redirected / forbidden |
| TC-08 | Admin searches complaint by reference ID | Correct record returned |

---

### 3.4 Deployment Plan

#### 3.4.1 Environment Setup

| Environment | Purpose |
|-------------|---------|
| **Development** | Local machine (localhost) |
| **Staging** | Pre-production testing on cloud VPS |
| **Production** | Live system for Adama City Administration |

#### 3.4.2 Deployment Architecture

![Deployment architecture](scripts/assets/diagrams/fig-3-2-deployment.png)

*Figure 3.2: Deployment architecture*

#### 3.4.3 Deployment Steps

1. Configure environment variables (`.env`): Atlas credentials (`MONGODB_USER`, `MONGODB_PASSWORD`, `MONGODB_CLUSTER`, `MONGODB_DB`) or `MONGODB_URI`, plus `JWT_SECRET`, `PORT`, `CLIENT_ORIGIN`
2. Build React frontend: `npm run build`
3. Deploy API with PM2 or similar process manager
4. Serve frontend static files via Nginx
5. Enable HTTPS with SSL certificate (Let's Encrypt)
6. Configure daily MongoDB backups
7. Seed initial admin account and default departments
8. Whitelist production server IP in MongoDB Atlas Network Access

#### 3.4.4 Minimum Server Requirements

- 2 GB RAM, 2 vCPU VPS (or MongoDB Atlas free tier for development)
- Ubuntu 22.04 LTS or similar
- Node.js 18+ LTS

---


## CHAPTER FOUR: RESULTS AND DISCUSSION

This chapter presents the implemented **Adama City Citizen Portal** and discusses how the results address the problem statement and objectives defined earlier. Screenshots were captured from the working MERN application (React frontend, Express API, MongoDB).

### 4.1 Results

Implemented screens are shown **in user-journey order**, starting with the **Guest UI**, then Citizen, Officer, and Administrator. Captures are from the live portal (18 August 2026; documentation refreshed 22 August 2026). Navigation and forms use **complaint** terminology only (`CMP-YYYY-NNNN`). **AI Help** is available on every screen.

**Order of result images**

1. Guest landing  
2. Guest registration  
3. Guest sign-in  
4. Citizen dashboard → submit complaint → my complaints → notifications → profile  
5. Officer dashboard → assigned tasks → notifications  
6. Admin dashboard → complaints → users → reports → activity log  

#### 4.1.1 Guest UI (Landing, Register, Login)

The public **Guest UI** is the first screen a visitor sees. It introduces the portal in English / Amharic / Afaan Oromo and offers a **Quick Submit** complaint card (login required to send). Registration creates a citizen account. Sign-in supports demo Citizen, Officer, and Admin shortcuts plus email/password and forgot-password.

![Landing page of Adama City Citizen Portal](scripts/assets/results/landing.png)

*Figure 4.1: Guest UI — “Your City. Your Voice.” landing page with Quick Submit complaint*

![Citizen registration page](scripts/assets/results/register.png)

*Figure 4.2: Guest UI — Create Account (register as an Adama City citizen)*

![Login page with demo role shortcuts](scripts/assets/results/login.png)

*Figure 4.3: Guest UI — Sign In (demo Citizen / Officer / Admin and email login)*

#### 4.1.2 Citizen Modules

After login, the citizen sidebar is **Dashboard**, **New Complaint**, **My Complaints**, **Notifications**, and **Profile**. The dashboard summarises complaint counts and links to tracking and alerts. New complaints use an Adama area dropdown, optional landmark, voice (Mic) on title/description, and AI assist. Pending rows on **My Complaints** show **View** and **Edit**. Opening **Notifications** marks items seen automatically (header shows **0 unread**; there is no Mark as read button).

![Citizen dashboard](scripts/assets/results/citizen-dashboard.png)

*Figure 4.4: Citizen dashboard — Hello greeting, complaint totals, My Complaints and Notifications shortcuts*

![Submit complaint form](scripts/assets/results/submit-complaint.png)

*Figure 4.5: Submit Complaint — title, Adama location, landmark, description, Mic, and AI assist*

![My Complaints list](scripts/assets/results/citizen-complaints.png)

*Figure 4.6: My Complaints — CMP- reference IDs, status badges, View, and Edit on pending items*

![Citizen notifications](scripts/assets/results/citizen-notifications.png)

*Figure 4.7: Citizen notifications — status updates for complaint CMP-2026-0015, 0 unread*

![Citizen profile](scripts/assets/results/citizen-profile.png)

*Figure 4.8: My Profile — editable name and phone; email and role are read-only*

#### 4.1.3 Officer Modules

The officer sidebar is **Dashboard**, **Assigned Tasks**, and **Notifications**. The dashboard is scoped to the officer’s department (e.g. Water Supply) with open / pending-queue / in-progress / resolved counts. **Assigned Tasks** lists department-queue and in-progress complaints (`CMP-` IDs) with **View**. Assignment alerts appear as **New assignment** cards and are marked seen when the page opens.

![Officer dashboard](scripts/assets/results/officer-dashboard.png)

*Figure 4.9: Officer dashboard — Water Supply work overview*

![Officer assigned tasks](scripts/assets/results/officer-tasks.png)

*Figure 4.10: Assigned Tasks — pending queue and in-progress complaints*

![Officer notifications](scripts/assets/results/officer-notifications.png)

*Figure 4.11: Officer notifications — new assignments (e.g. CMP-2026-0019), 0 unread*

#### 4.1.4 Administrator Modules

The admin sidebar is **Dashboard**, **Complaints**, **Users**, **Departments**, **Reports**, and **Activity Log**. The dashboard shows city-wide complaint totals and recent pending items. **Manage Complaints** searches and filters by status, then **View** opens assignment and status actions. **User Management** lists Citizen / Officer / Admin rows with department (officers) and Activate / Deactivate. **Reports** summarise totals by status and complaints by category. **Activity Log** records assign and status-update actions using complaint reference IDs plus department and officer names.

![Admin dashboard](scripts/assets/results/admin-dashboard.png)

*Figure 4.12: Admin dashboard — overview of citizen complaints and recent pending cases*

![Manage complaints](scripts/assets/results/admin-complaints.png)

*Figure 4.13: Manage Complaints — search, status filter, CMP- IDs, View*

![User management](scripts/assets/results/admin-users.png)

*Figure 4.14: User Management — name, email, role, department, Active / Deactivate*

![Reports page](scripts/assets/results/admin-reports.png)

*Figure 4.15: Reports — pending, in progress, resolved, rejected, closed, and complaints by category*

![Activity log](scripts/assets/results/admin-activity.png)

*Figure 4.16: Activity Log — audit trail of assignments and status updates (new rows store names; older captured rows may still show IDs)*

### 4.2 Discussion

The implemented results demonstrate that a centralized web portal can replace fragmented, paper-based complaint handling for Adama City Administration.

**Alignment with objectives.** Citizens can register, submit categorized complaints (Adama area, optional landmark, voice, and AI assist), edit pending cases on **My Complaints**, and track progress using `CMP-` reference IDs. Administrators manage complaints, users, departments, reports, and the activity log. Officers work from **Assigned Tasks** in their department. Notifications are marked seen when the Notifications page is opened. Optional **AI Help** is available across roles. These outcomes match the functional requirements defined in Chapter Two.

**Transparency and accountability.** Color-coded status badges (Pending, In Progress, Resolved, Rejected) and the activity log provide a visible audit trail. This directly addresses the earlier problems of weak tracking and limited accountability.

**Role-based design.** Separate dashboards for Citizen, Officer, and Admin enforce RBAC with JWT authentication. Citizens see only their submissions; officers see assigned tasks; admins see city-wide data and user/department controls.

**Reporting for decision-making.** The Reports module aggregates totals by status and category (e.g., Road Maintenance as a frequent complaint type in the sample data). This supports planning and departmental prioritization.

**Remaining gaps.** Some pending items remain unassigned until an administrator routes them (empty Department fields). Live SMS to real phones, GIS maps, and production-scale deployment remain future work. Sample/test titles in development data also indicate the need for continued validation and user training before full rollout.

Overall, the prototype confirms technical feasibility of the MERN-based solution and shows measurable progress toward transparent, trackable municipal service delivery.

---

### 4.3 Expected Benefits

#### 4.3.1 For Citizens

- Easy online complaint submission
- Faster access to municipal services
- Transparency in service delivery
- Real-time status tracking and notifications

#### 4.3.2 For Adama City Administration

- Improved centralized record management
- Better monitoring and departmental accountability
- Faster response to citizens
- Improved service quality through data-driven decisions
- Reports for planning and resource allocation

---

### 4.4 Expected Outcome

The project delivers a **fully functional web-based system** for managing citizen complaints. The system:

- Connects citizens, administrators, and department officers on one platform
- Provides transparent status tracking with audit history
- Generates reports for monitoring and decision-making
- Serves as a foundation for future enhancements (live SMS, mobile app, GIS)

---

### 4.5 Future Enhancements

- Live SMS notifications for status updates (Africa’s Talking scaffold exists)
- Native mobile application (Android / iOS)
- GIS integration for map-based complaint location
- Advanced analytics dashboard with charts, date filters, and export
- Full CRUD for users and departments; complaint delete; report export
- API pagination, rate limiting, and JWT refresh tokens
- Citizen feedback and satisfaction rating after resolution
- SLA tracking and escalation rules
- Integration with existing government systems

---

## CHAPTER FIVE: ORGANIZATION PROFILE

This chapter satisfies the practical attachment guideline (mission, vision, organizational chart, core values, products/services, stakeholders, and history). Supervisor details on the cover page should be confirmed at the host office.

### 5.1 Mission

According to the Adama City Administration public portal, the mission of the **Adama Science and Technology Administration Office** is **making the city convenient for residents**. In the attachment context, this mission was interpreted as using information systems so that residents can reach city services without unnecessary travel, lost paper files, or unclear status.

The complaint portal supports that mission by giving citizens a single online channel to report municipal problems and to follow progress with a unique reference number.

### 5.2 Vision

The same official office profile states the vision as **making the services provided in the city digitalized**. The attachment project was aligned with this vision: moving complaint intake, assignment, status updates, notifications, and summary reports from paper logs onto a web platform.

Digitalization in this sense does not mean replacing officers. It means giving officers a department queue, administrators a city-wide view, and citizens a way to see whether a case is pending, in progress, resolved, or rejected.

### 5.3 Organizational Chart

The host office sits under **Adama City Administration**. Internally it coordinates ICT support, digital / SMART Adama services, and administrative follow-up. During the attachment, the student was placed against the digital-services and ICT-support line of work, building the complaint portal that municipal departments (Water Supply, Roads and Infrastructure, Sanitation, Public Utilities) would later use through role-based accounts.

![Organizational chart of the host office context](scripts/assets/diagrams/fig-attachment-org-chart.png)

*Figure 5.1: Organizational chart — Adama City Administration, Science and Technology Administration Office, and attachment placement*

### 5.4 Core Values

The office profile on the Adama City portal lists the core values as **excellence, teamwork, innovation, and open and continuous communication**. These values shaped how the attachment work was done:

| Core value | How it appeared in the attachment |
|------------|-----------------------------------|
| **Excellence** | Role-based security (JWT, RBAC), status history, and an activity log so actions can be audited |
| **Teamwork** | Separate Citizen, Officer, and Admin workspaces that still share one complaint record |
| **Innovation** | Optional AI assist and a trilingual interface (EN / Amharic / Afaan Oromo) |
| **Open communication** | In-app notifications, email to real mailboxes, and visible `CMP-` reference numbers |

### 5.5 Product / Services Description

The Science and Technology Administration Office does not sell commercial products. Its service is **public digital capability** for the city. From the attachment and the published SMART Adama office description, the relevant services are:

- Information and support for digital / SMART Adama initiatives
- Support to city offices that need ICT tools for day-to-day work
- Promotion of convenient, digital access to municipal services for residents

The **Citizen Portal** developed during the attachment is a concrete service output of that mandate. It provides public guest information and Quick Submit (login required to send); citizen registration, complaint submission, tracking, and profile; officer assigned-task processing; and administrator assignment, user/department management, reports, and activity log.

Municipal issue categories used in the portal include road maintenance, waste management, water supply, street lighting, and related environmental and infrastructure problems. Location is selected from Adama sub-cities, kebeles, and landmarks.

### 5.6 Stakeholders

| Stakeholder | Interest during the attachment |
|-------------|-------------------------------|
| **Adama residents (citizens)** | Easy submission and transparent tracking of complaints |
| **Science and Technology Office** | Digitalization of a high-volume citizen process |
| **City Administration leadership** | Accountability, reports, and reduced paper backlog |
| **Department officers** (e.g. Water Supply) | A clear assigned-task queue and resolution notes |
| **Administrators** | User control, routing, rejection of invalid cases, audit trail |
| **Haramaya University / Department of Information Science** | Supervised professional practice and a graded report |
| **Attachment student** | Workplace learning and a deployable software artefact |

Citizens, administrators, and officers are also the three **system actors** specified in Chapter Two. Host-office staff remain organizational stakeholders even when they are not daily users of a given screen.

### 5.7 Organizational History

Adama (historically also known as Nazareth) is the capital of East Shewa Zone in Oromia and a major transport and industrial hub. City administration is organized into offices that cover service sectors such as roads, water, sanitation, and utilities.

The **Science and Technology Administration Office** is the unit presented on the city portal as the contact for **SMART Adama** and for digitalizing services. Its published mission and vision emphasize resident convenience and digital service delivery. Precise founding dates and historical staffing were not available as a complete public archive during the attachment; the student therefore recorded the official mission, vision, and values from the city portal and confirmed the host name used throughout this document: **Adama City Administration Science and Technology Office**.

Ethiopia’s wider **Digital Ethiopia 2025** agenda provides national context: government services are expected to move online where feasible. The complaint portal is a local, city-level contribution to that direction.

---

## CHAPTER SIX: ACTIVITIES DONE AND UNDONE

Activities are listed **per task**, as required by the guideline. “Done” means completed during the attachment to a demonstrable working state. “Undone” means identified, partly prepared, or left for the host after the attachment. Chapter Four screenshots are the visual evidence for Tasks 4–8.

### 6.1 Tasks completed (done)

**Task 1 — Orientation and process study.**  
The student reviewed how complaints were received through office visits and paper records, and mapped the delay, tracking, and accountability problems that the portal needed to address.

**Task 2 — Requirements and role design.**  
Citizen, Administrator, and Department Officer roles were defined. Status values (Pending, In Progress, Resolved, Rejected, Closed) and transition rules were specified so officers cannot reject cases and citizens can edit only while a case is pending.

**Task 3 — System architecture and data design.**  
A MERN architecture was implemented: React (Vite) frontend, Express API, MongoDB collections for users, departments, complaints, status history, notifications, and activity logs. JWT protects APIs.

**Task 4 — Guest (public) interface.**  
A public landing page was built with city branding, language switcher, Quick Submit (login required), and information sections. This is the first screen a visitor sees (Figure 4.1).

**Task 5 — Authentication and citizen registration.**  
Login, registration, forgot/reset password, and demo role shortcuts were implemented. Demo `@test.com` accounts are login-only and do not receive email (Figures 4.2–4.3).

**Task 6 — Citizen complaint workflow.**  
Citizens can submit a complaint (title, category, Adama location, optional landmark and photo), use optional voice input and AI writing assist, edit pending items, track `CMP-` references, open notifications (marked seen automatically), and update profile name and phone (Figures 4.4–4.8).

**Task 7 — Officer workflow.**  
Officers see a department-scoped dashboard and an Assigned Tasks list, start work, add resolution notes (optional AI draft), and resolve or close cases (Figures 4.9–4.11).

**Task 8 — Administrator workflow.**  
Administrators view city-wide totals, assign complaints to departments and officers, manage users (activate/deactivate) and departments (add), open reports by status and category, and inspect the activity log. New log details store **names**, not database IDs (Figures 4.12–4.16).

**Task 9 — Localization and optional AI.**  
Authenticated and public screens support English, Amharic, and Afaan Oromo. An optional AI sidecar provides writing help, triage suggestions, resolution drafts, and an FAQ chatbot, with heuristic fallback if no API key is set.

**Task 10 — Testing, seeding, and documentation.**  
Demo data was seeded for defence and training. This combined academic report was prepared. Result screenshots were captured from the running application.

### 6.2 Tasks not completed (undone)

| Task | Description | Why it remained undone |
|------|-------------|------------------------|
| Production deployment | HTTPS hosting, backups, and a public city domain | Requires host ICT policy, server budget, and official go-live approval |
| Live SMS | Status SMS to citizens’ phones | Africa’s Talking sandbox exists but is off by default; live SMS needs a paid sender ID |
| GIS map pin | Map click instead of (or with) the Adama area dropdown | Out of scope for the attachment period; list-based location was delivered instead |
| Full user/department CRUD | Edit/delete users and departments; delete complaints; export reports | Admin can add departments and activate/deactivate users; remaining CRUD is future work |
| Native mobile apps | Android / iOS stores | The web app is responsive; native clients were not started |
| Legacy paper migration | Import of old paper complaints | No complete digitized archive was available |
| Government system integration | Link to other city databases | Needs formal interoperability agreements |
| Hardening extras | Pagination, rate limiting, JWT refresh tokens | Noted as remaining engineering work |

The attachment therefore delivered a **working prototype suitable for demonstration and supervised trial**, not a fully production-hardened city-wide rollout.

---

## CHAPTER SEVEN: CHALLENGES, CAREER OPPORTUNITIES, AND LEARNING

### 7.1 Challenges faced in the practical attachment

**Paper-based baseline.** Official complaint files were not available as a complete electronic dataset. Requirements had to be inferred from municipal practice, related e-governance examples, and iterative review rather than from a single written SOP.

**Scope change.** An earlier idea treated **service requests** as a second module. The implemented system is **complaints-only** so that routing and reporting stay on one path. Removing the extra module took time but made the product clearer for officers.

**Workplace versus academic documentation.** The host needed a usable portal; the university needed diagrams, test cases, and guideline sections. Combining both into this single document was the chosen solution.

**Technical integration.** Connecting React, the Express API, MongoDB Atlas, email, and an optional AI service introduced environment-configuration issues (secrets, CORS, demo email that must not bounce). Activity-log details initially stored MongoDB IDs until the code was changed to store department and officer names.

**Language and usability.** Supporting Amharic and Afaan Oromo required keeping translation keys complete so that no screen silently fell back to English.

**Access and time.** Attachment hours, supervisor availability, and the need to keep demo accounts separate from real citizen mailboxes limited live user testing with the general public.

### 7.2 Career opportunities in the organization

The Science and Technology Administration Office, and the wider Adama City Administration ICT function, can absorb graduates of Information Science in several directions:

**ICT / systems support officer.** Maintain networks, user accounts, backups, and first-line support for city offices that use digital tools, including the complaint portal.

**Application or web developer.** Extend the MERN system (new reports, SMS, GIS, integrations) under host supervision.

**Digital services / e-governance officer.** Translate office procedures into online services, train department users, and monitor adoption of SMART Adama tools.

**Data and records officer.** Use reports and the activity log for planning: which categories (for example water supply versus roads) generate the most complaints, and which departments are slow to assign work.

**Information security awareness role.** Help enforce password policy, role separation, and responsible handling of citizen data.

The attachment showed that a student who can analyse a municipal process, implement a secure web workflow, and document it for both the university and the office is employable in city ICT units. Permanent hiring still depends on civil-service rules and vacant posts; the attachment itself is training, not a job offer.

### 7.3 Significance of learning gained during the attachment

The attachment converted course knowledge into a full, role-based information system used in a government-like setting.

**Technical learning.** Practical experience was gained in React, Node/Express, MongoDB, JWT authentication, REST APIs, environment configuration, image upload limits, and optional AI API integration. Debugging real UI and data issues (for example audit-log IDs versus names) was more instructive than textbook exercises.

**Domain learning.** Municipal complaint handling has legal and social weight. Status transitions, who may reject a case, and what citizens may still edit are policy rules, not only database fields.

**Professional learning.** Work had to be explained to non-programmer stakeholders, recorded in academic format, and kept within a time box. Incomplete tasks were listed honestly instead of being hidden.

**Inclusion and language.** Building EN / AM / OM screens showed that e-governance in Oromia is not English-only.

**Ethics and data.** Demo accounts, skipped email to `@test.com`, and role-based views illustrated that citizen data must be limited by need-to-know.

These outcomes match the purpose of practical attachment: competence, professional attitude, and a portfolio artefact (the Citizen Portal) that can be demonstrated to the department and the host.

---

## CHAPTER EIGHT: CONCLUSION AND RECOMMENDATION

### 8.1 Conclusion

This practical attachment at **Adama City Administration Science and Technology Office** designed and implemented a **Web-Based Citizen Complaint Management System** to replace fragmented, paper-based processes with a centralized digital portal.

The system meets the stated objectives by enabling citizens to register, submit categorized complaints, edit pending cases, and track status through unique reference numbers; enabling administrators to manage users and departments, assign work, update status, and generate reports; and enabling department officers to process assigned tasks and record resolution notes. JWT authentication and role-based access control protect resources according to user roles, while status history, in-app notifications, and email to real mailboxes improve transparency and accountability.

Implementation with the MERN stack demonstrated technical feasibility and practical value for municipal service delivery. Remaining limitations—such as live SMS, GIS mapping, and advanced analytics—are documented as undone tasks and future enhancements and do not prevent the current system from delivering the core complaint workflow.

The attachment met its learning purpose: applying Information Science skills in a municipal ICT environment and producing one report that covers both the College guideline and the working system. The portal is a foundation for transparent, trackable citizen–administration interaction in Adama City as the host organization trials and expands it.

### 8.2 Recommendation

**To the host organization**

- Appoint a named system owner for the official file.
- Trial the portal with a small set of real officers (Water Supply and Roads) before city-wide launch.
- Budget for HTTPS hosting, backups, and, if required, a live SMS sender ID.
- Keep demo `@test.com` accounts out of production; use real mailboxes for live users.
- Confirm mission, vision, and the organizational chart with an official stamp so later students inherit an approved profile.

**To the Department of Information Science**

- Continue placing students in city ICT offices; the complaint domain is a strong match for Information Science.
- Accept this **single document** as both the practical attachment narrative (Chapters Five–Seven) and the system specification (Chapters One–Four).

**To future attachment students**

- Complete Appendix B (P.O. Box, supervisor name, title, phone) in the first week.
- Log tasks weekly as done/undone; do not wait until the final report.
- Treat language files (EN/AM/OM) as part of testing, not as an optional extra.

---

## References

1. Adama City Administration. *Adama Science and Technology Administration Office* (mission, vision, core values). https://portal.adamacity.gov.et/officedetails/2
2. Adama City Administration. *Citizen Portal contact details* (telephone, email, office hours used in the implemented guest interface).
3. Haramaya University, College of Computing and Informatics. *Practical Attachment Report Guideline* (front page Appendix A; organization and supervisor profile Appendix B).
4. Ethiopian Ministry of Innovation and Technology. *Digital Ethiopia 2025* (e-governance context).
5. FixMyStreet. *Report, view, or discuss local problems*. mySociety. https://www.fixmystreet.com/
6. IBM. *Entity-Relationship Modeling*. Software Engineering best practices.
7. MongoDB Inc. *MongoDB Documentation*. https://www.mongodb.com/docs/
8. Express.js. *Web framework for Node.js*. https://expressjs.com/
9. React. *A JavaScript library for building user interfaces*. https://react.dev/
10. OWASP. *Authentication Cheat Sheet*. https://cheatsheetseries.owasp.org/
11. JWT.io. *JSON Web Token Introduction*. https://jwt.io/introduction
12. Sommerville, I. *Software Engineering* (10th ed.). Pearson — requirements and testing methodologies.

---

## Document Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Initial | Original PDF proposal |
| 2.0 | June 26, 2025 | Added ER diagram, timeline, literature review, methodology, testing, deployment, expanded DB schema, use cases, architecture, limitations, references; merged duplicate sections; clarified complaint vs service request |
| 2.1 | July 28, 2026 | Aligned docs with implemented system: status transition rules, Atlas env, Vite/`fetch`, photo upload (2 MB), guest i18n, corrected FR/scope/limitations/test cases; removed unimplemented password-reset/Axios claims; updated use case diagram |
| 2.2 | July 28, 2026 | Added Declaration and Acknowledgement sections |
| 2.3 | July 28, 2026 | Expanded Table of Contents to include all subtopics |
| 2.4 | July 28, 2026 | Added List of Acronyms |
| 2.5 | July 28, 2026 | Added page numbers: Roman numerals for preface, Arabic for main body |
| 2.6 | July 28, 2026 | Added Haramaya University cover page; personal details left blank for completion |
| 2.7 | July 28, 2026 | Reorganized body into CHAPTER ONE–SIX with hierarchical section numbering |
| 2.8 | July 28, 2026 | Added CHAPTER SIX: Results and Discussion with implementation screenshots; renumbered benefits to CHAPTER SEVEN |
| 2.9 | July 28, 2026 | Condensed document into four chapters (Introduction; Requirements and Design; Methodology; Results and Discussion) |
| 2.10 | July 28, 2026 | Aligned Table of Contents to academic style (dot leaders, hierarchy indent, Roman/Arabic page markers) |
| 2.11 | July 29, 2026 | Added Abstract (Executive Summary); updated cover host-company / Practical Attachment wording; department name to Information Science |
| 2.12 | July 29, 2026 | Added CHAPTER FIVE: Conclusion; updated Table of Contents |
| 2.13 | August 18, 2026 | Aligned documentation with the implemented complaint-only system: Adama location dropdown, pending edit, EN/AM/OM app i18n, email + password reset, auto-seen notifications, optional AI sidecar; removed service-request workflow from scope and schema |
| 2.14 | August 18, 2026 | Replaced Chapter Four result screenshots with current UI captures (landing Quick Submit, citizen/officer/admin complaint screens); removed leftover service-request result figures |
| 2.15 | August 22, 2026 | Forced a results pass: Chapter Four figures stay on the current UI captures; README now includes the same screenshot gallery; activity log stores department/officer names instead of MongoDB IDs |
| 2.16 | August 22, 2026 | Added rendered use-case, ER, architecture, DFD, workflow, Gantt, and deployment diagrams; ordered Chapter Four result screenshots starting from Guest UI |
| 2.17 | August 22, 2026 | Corrected Chapter Four result images: Figure 4.1 is the real Guest landing (“Your City. Your Voice.” / Quick Submit); remaining screenshots remapped so filenames match the actual screens |
| 2.18 | August 22, 2026 | Merged the practical attachment report into this documentation: Appendix A/B covers, organization profile, tasks done/undone, challenges, career opportunities, learning, and recommendations (Chapters Five–Eight) |
| 2.19 | August 23, 2026 | Distinct Adama identity: portal motto in three languages on the cover, navy-and-gold Word layout matching the Citizen Portal, running header, and a place-bound “signature of this report” |
| 2.20 | August 23, 2026 | Project timeline set to the actual attachment period: started 7 June 2026, finished 16 August 2026 (10 weeks); Gantt chart and Chapter 3.2 table updated |
| 2.21 | August 23, 2026 | Filled student name (Esmael Mohammed Kedir) and ID (1160/16) on the cover and declaration |
| 2.22 | August 24, 2026 | Restored academic cover using the Haramaya University logo; removed decorative banner, motto, gold headers/footers, and signature callout |
| 2.23 | August 24, 2026 | Filled host supervisor profile: Mr. Muktar, Software Engineer, 0912807372 |
| 2.24 | August 24, 2026 | Added submission date 24 August 2026 on the cover and declaration |

---

*End of report*
