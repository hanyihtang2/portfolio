---
title: "BlindBite"
description: "A gamified blind potluck coordinator and dinner party generator that secretly distributes meal courses, prevents duplicate dishes, and suggests curated cuisine themes and recipe prompts."
publishDate: 2026-10-21
tags: ["TypeScript", "Next.js", "React 19", "Tailwind CSS", "WebSockets", "Social Dining"]
featured: false
status: "Concept"
role: "Product & Systems Architect"
timeline: "Concept Stage (Planned)"
metrics:
  - label: "Course Secrecy"
    value: "100% Blind"
    description: "Confidential category allocation until table reveal"
  - label: "Duplicate Clashes"
    value: "0 Duplicates"
    description: "Private semantic redirection on duplicate recipes"
  - label: "Allergen Verification"
    value: "100% Safe"
    description: "Automated matrix check against guest restrictions"
  - label: "Live Reveal Sync"
    value: "< 150ms"
    description: "WebSocket presentation view synchronized across phones"
techStack:
  languages: ["TypeScript", "SQL"]
  frameworks: ["Next.js", "React 19", "Tailwind CSS", "Framer Motion"]
  infrastructure: ["Supabase (PostgreSQL & Realtime)", "Edge Workers", "WebSockets / SSE"]
  tools: ["Zod", "LLM Prompting (Theme Generator)", "QR Code Auth", "Canvas Confetti"]
roadmap:
  - phase: "Phase 1"
    title: "Event Model, RSVP Links & Blind Course Allocation"
    status: "Planned"
    targetQuarter: "Q1 2027"
    summary: "Establish dinner party event creation, lightweight guest join flows via PIN/QR code, and the fair, confidential course allocation algorithm."
    deliverables:
      - "Event generation with date, headcount, course slot requirements (Appetizer, Main, Side, Dessert, Drink)"
      - "Zero-friction guest onboarding with short alphanumeric room codes and dietary intake"
      - "Confidential assignment engine allocating courses secretly to attendees"
      - "PostgreSQL event and participant schemas with RLS rules protecting guest dish identity"
  - phase: "Phase 2"
    title: "Dinner Party Theme Inspiration & Creative Recipe Prompts"
    status: "Planned"
    targetQuarter: "Q2 2027"
    summary: "Create a curated cuisine theme library and AI prompt assistant that gives hosts dinner concepts and guests tailored recipe sparks."
    deliverables:
      - "Curated theme library (e.g., 'Oaxacan Street Food', 'Tapas Roulette', '1970s Retro Diner', 'Mediterranean Sunset')"
      - "Theme inspiration engine with Spotify playlist links, dress code ideas, and ambiance suggestions"
      - "AI recipe prompt generator providing guests with 3 category-specific dish ideas tailored to the host's theme"
      - "Custom theme builder for hosts with specific culinary concepts or region-specific menus"
  - phase: "Phase 3"
    title: "Secret Dish Lockbox, Allergen Matrix & Duplicate Prevention"
    status: "Planned"
    targetQuarter: "Q3 2027"
    summary: "Build the guest dish submission lockbox with automated duplicate detection and aggregate dietary safety validation without spoiling surprises."
    deliverables:
      - "Private dish submission vault with ingredient listings and allergen tagging"
      - "Duplicate detection guard (e.g. alerting a guest if two people plan on baking sourdough or bringing tiramisu)"
      - "Dietary compliance engine cross-referencing guest restrictions against dish declarations"
      - "Real-time host progress tracker showing course submission status without revealing dish names"
  - phase: "Phase 4"
    title: "Live Party Course Reveal Screen & Post-Event Recipe Book"
    status: "Planned"
    targetQuarter: "Q4 2027"
    summary: "Deliver an engaging real-time party mode for uncovering dishes course-by-course during dinner, followed by an exported souvenir digital recipe zine."
    deliverables:
      - "Live party presentation view optimized for iPad, laptop, or TV casting with celebratory reveal animations"
      - "Course-by-course unveiling controls synchronized via Supabase Realtime / WebSockets"
      - "Fun post-dinner anonymous voting categories ('Most Surprising Twist', 'Crowd Favorite', 'Best Presentation')"
      - "Auto-generated digital event cookbook with guest recipes, photos, and group memories"
---

## 1. Summary & Objectives

### Product Concept & Problem Statement
Hosting or attending a group potluck is one of the best ways to bring friends together, but the coordination process is notoriously flawed:

1. **The Duplicate & Imbalance Trap:** Without coordination, groups end up with five bags of tortilla chips, four tubs of hummus, and zero main dishes.
2. **The Spreadsheet Spoiler:** When hosts try to fix this with a shared Google Sheet, everyone reads what others are bringing weeks in advance, completely spoiling the fun, curiosity, and surprise of a communal meal.
3. **Inspiration Gridlock:** Friends often want to do something more exciting than standard potluck fare, but nobody knows what theme to choose or what recipes fit into a cohesive dinner party menu.
4. **Allergen Uncertainty:** Accommodating gluten-free, vegetarian, or nut-allergic friends can create friction when ingredients aren't tracked systematically.

**BlindBite** is a gamified blind potluck coordinator and dinner party generator currently in the **Concept** stage. It preserves the magic of surprise by secretly delegating broad meal categories to guests, ensuring meal balance and dietary safety without revealing who is bringing what until the food hits the table.

### Core Objectives
1. **Confidential Course Allocation:** Secretly assign each guest a balanced category (e.g., Starter / Canapé, Hearty Main, Fresh Salad / Side, Showstopper Dessert, Signature Drink) so no attendee knows what others are bringing.
2. **Theme & Cuisine Inspiration Engine:** Allow hosts to specify their own culinary concept (e.g., *"Neapolitan Summer"*, *"Tokyo Alleyway Comfort"*) or spin a curated theme generator that supplies mood music, decor tips, and 3 creative dish prompts per category.
3. **Secret Dish Lockbox & Duplicate Guard:** Guests privately register their planned dish in an encrypted lockbox. The system checks for course duplication (e.g., *"Another guest is already bringing chocolate cake—try another dessert style!"*) and verifies allergen coverage without leaking dish names to other guests.
4. **Interactive Dinner Reveal Mode:** A shared, animated TV/tablet presentation view that dramatically unveils each course in real time as the dinner party progresses from appetizers to dessert.

---

## 2. Design Process

### Social Dining & Verification Architecture
The BlindBite platform coordinates asynchronous party planning and synchronous real-time celebration:

```
[ Host Dashboard ] ─── (Configures Event, Headcount, Allergies & Theme)
         │
         ├──► [ Theme Inspiration Engine (Curated Decks + LLM Prompts) ]
         │
         ▼
[ Guest Client (PIN / QR Code Join) ]
  ├── Confidential Category Assignment (Secret Roll)
  ├── AI Recipe Spark Prompts (Theme-matched ideas)
  └── Private Dish Lockbox 
               │
               ▼  (Secure Submission)
[ Duplicate Guard & Allergen Validation Engine ]
  ├── Flags category duplicate clashes privately to the guest
  └── Validates dietary restrictions against ingredient tags
               │
               ▼  (Party Night: WebSockets / Supabase Realtime)
[ Live Dinner Party Reveal Screen (iPad / Laptop / Cast to TV) ]
  └── Course 1: Appetizers ──► Course 2: Mains ──► Course 3: Desserts
```

### Key Architectural Decisions (Planned)
- **Zero-Friction Guest Join Flows:** Guests should never be forced to download an app or create a permanent password to attend a dinner party. BlindBite uses ephemeral short room codes (e.g., `DINNER-77`) and authenticated session tokens stored in local cookies.
- **Zero-Knowledge Duplicate Detection:** When Guest A submits *"Tiramisu"* and Guest B submits *"Espresso Tiramisu"*, an internal semantic grouping layer flags the conflict directly to Guest B with constructive redirection (*"Another dessert with coffee notes is already claimed! How about a lemon tart or panna cotta?"*), preserving the secret from the rest of the group.
- **Dietary & Allergen Verification Matrix:** During RSVP, guests flag restrictions (e.g., Peanut Allergy, Celiac, Vegan). When dishes are locked into the vault, the platform ensures that for every course, at least one dish safely meets each guest's dietary needs before green-lighting the menu.
- **Real-Time Presentation Mode:** On dinner party night, hosts can launch a full-screen reveal view on an iPad or cast it to a television. Guests unlock their dishes on their phones to trigger animations (powered by Framer Motion and canvas confetti) that reveal the chef, dish title, and secret ingredients.

---

## 3. Key Capabilities

| Capability Area | Potluck Pain Point | Planned BlindBite Solution | Target Outcome |
| :--- | :--- | :--- | :--- |
| **Mystery & Anticipation** | Public spreadsheets ruin the surprise before dinner even starts | Confidential course assignment & locked private submissions | **100% blind anticipation until the meal is served** |
| **Course Balance** | Three people bring hummus, nobody brings a warm main dish | Deterministic course slot allocation based on guest count | **Guaranteed balanced spread across courses** |
| **Theme Cohesion** | Uncoordinated dishes that clash awkwardly | Curated dinner party theme decks with tailored recipe prompts | **Harmonious flavors & cohesive party atmosphere** |
| **Dietary Confidence** | Cross-contamination fears and last-minute dietary scrambles | Automated allergen safety validator across all locked dishes | **Zero awkward dining moments for guests with restrictions** |

---

## 4. Technical Details

### 1. Zero-Knowledge Semantic Duplicate Redirection
To prevent duplicate dishes (e.g., three guests bringing hummus) without spoiling the surprise of the menu, dish submissions are processed through a private semantic conflict engine. When a guest registers a dish that overlaps with an already-locked recipe, an edge function flags the conflict *only* to the incoming guest with helpful alternatives (*"Another coffee-infused dessert is already claimed—how about a citrus tart?"*) while keeping the rest of the meal completely secret.

### 2. Real-Time Presentation View via Supabase Realtime
During the party, a shared big-screen view (cast to a TV or tablet) must stay perfectly synchronized with guests' mobile devices. Supabase Realtime over WebSockets broadcasts dish unveils with sub-150ms latency, triggering synchronized reveal animations (powered by Framer Motion) as each course is served.

### 3. Automated Allergen & Course Balance Matrix
Potlucks often create anxiety around dietary restrictions. When dishes are locked into the vault, an automated matrix validator cross-references registered guest allergens (Celiac, nut allergies, vegan) against dish ingredient tags. The engine ensures that every course includes at least one verified safe option for each attendee before greenlighting the dinner party menu.

---

## 5. Status & Roadmap

**Current Stage:** `Concept` (Ideation & Social Mechanics Designed)

BlindBite is planned across 4 progressive engineering phases covering event generation and blind assignments, theme inspiration tools, dish lockbox security, and live reveal party mode.

