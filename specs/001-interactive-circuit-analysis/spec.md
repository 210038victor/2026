# Feature Specification: 響應式互動學習電路分析 (Responsive Interactive Learning Circuit Analysis)

**Feature Branch**: `001-interactive-circuit-analysis`  
**Created**: 2026-03-13  
**Status**: Draft  
**Input**: User description: "響應式互動學習 電路分析"

## Overview

A responsive, interactive learning platform module that enables students to explore and understand circuit analysis concepts through hands-on simulation, immediate feedback, and guided exercises accessible across all device types — desktop, tablet, and mobile.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Build and Simulate a Circuit (Priority: P1)

A student opens the circuit analysis learning module on any device, assembles a circuit by placing components (resistors, voltage sources, capacitors, etc.) on an interactive canvas, and immediately sees calculated values such as voltage, current, and power at each node and branch. The student can adjust component values and observe real-time changes to the circuit behavior without reloading or leaving the page.

**Why this priority**: This is the core value proposition — hands-on interaction with circuits teaches analysis concepts far more effectively than passive reading. Without simulation, the feature has no value.

**Independent Test**: Can be fully tested by opening the module in a browser, placing a resistor and a voltage source on the canvas, connecting them, and verifying that current and voltage values are displayed correctly in real time.

**Acceptance Scenarios**:

1. **Given** a student is on the circuit canvas, **When** they add a resistor (10 Ω) and a 5 V voltage source and connect them, **Then** the system displays a current of 0.5 A and power of 2.5 W immediately without any manual calculation step.
2. **Given** an existing circuit on the canvas, **When** the student changes a resistor's value from 10 Ω to 20 Ω, **Then** all calculated values (current, power) update in under 1 second.
3. **Given** a student on a mobile device, **When** they open the circuit canvas, **Then** all controls, labels, and the canvas are fully usable with touch interaction and fit within the screen without horizontal scrolling.

---

### User Story 2 - Follow a Guided Circuit Analysis Lesson (Priority: P2)

A student selects a structured lesson (e.g., "Kirchhoff's Voltage Law") from a lesson catalog. The lesson presents a pre-built circuit with step-by-step instructions that guide the student to apply the analysis method. At each step, the student performs an action (e.g., labels a node, writes a loop equation) and receives immediate feedback on whether the answer is correct.

**Why this priority**: Guided lessons contextualise the simulation and ensure students develop systematic problem-solving skills, not just trial-and-error intuition.

**Independent Test**: Can be tested by selecting the KVL lesson, following all steps, submitting at least one correct and one incorrect answer, and verifying that feedback is shown and the lesson can be completed end-to-end.

**Acceptance Scenarios**:

1. **Given** a student has opened a guided lesson, **When** they complete each step in order, **Then** the system records their progress and shows a completion indicator when all steps are done.
2. **Given** a student submits an incorrect answer at a lesson step, **When** the system evaluates the submission, **Then** it shows a specific, non-revealing hint that guides correction without giving away the answer directly.
3. **Given** a student partially completes a lesson and navigates away, **When** they return to the same lesson later, **Then** their progress is preserved and they can resume from the last completed step.

---

### User Story 3 - Review Learning History and Progress (Priority: P3)

A student views a personal progress dashboard showing which lessons have been completed, quiz scores, and which circuit analysis topics have been practiced. The student uses this to identify areas needing further study.

**Why this priority**: Progress tracking motivates continued engagement and helps students self-direct their learning, but the core simulation and lessons remain valuable without it.

**Independent Test**: Can be tested by completing two lessons and then navigating to the progress dashboard to verify that both lessons are listed with their scores.

**Acceptance Scenarios**:

1. **Given** a student has completed at least one lesson, **When** they visit the progress dashboard, **Then** they see a list of completed lessons with scores and completion dates.
2. **Given** a student has not yet started any lessons, **When** they visit the progress dashboard, **Then** the system shows an onboarding prompt directing them to the lesson catalog.
3. **Given** a student views the progress dashboard on a mobile device, **When** the page loads, **Then** all data is readable without zooming and layout adapts to the screen width.

---

### User Story 4 - Practice with Circuit Analysis Exercises (Priority: P4)

A student selects a circuit analysis exercise (e.g., "Find the equivalent resistance of the following network"), works through the problem using the interactive canvas, enters their answer, and receives a scored result with an explanation of the correct solution.

**Why this priority**: Unguided practice exercises consolidate learning after guided lessons and assess student understanding independently.

**Independent Test**: Can be tested by opening an exercise, entering a known correct answer, verifying the score is recorded, then re-trying with a wrong answer to verify feedback is appropriate.

**Acceptance Scenarios**:

1. **Given** a student is on an exercise page, **When** they submit a numerically correct answer within a ±2% tolerance, **Then** the system marks it correct and shows the solution walkthrough.
2. **Given** a student submits an incorrect answer, **When** the system evaluates it, **Then** it shows the correct answer and a step-by-step explanation after a configurable number of attempts (default: 3).
3. **Given** a student uses the interactive canvas during an exercise, **When** they annotate nodes or draw current paths, **Then** the annotations are visible throughout the exercise session.

---

### Edge Cases

- What happens when a student connects components in a way that creates a short circuit (zero-resistance loop)? The system must display a clear warning and prevent display of infinite values.
- What happens when a student loses network connectivity mid-lesson? The system must preserve work locally and sync when connection is restored, or indicate that progress could not be saved.
- What happens if a student tries to place more components than the canvas can reasonably display? The system must enforce a maximum component limit with a user-friendly message.
- How does the system handle very large or very small component values (e.g., 1 TΩ or 1 pF)? Values must be displayed in appropriate SI prefixes (T, G, M, k, m, µ, n, p).
- What happens on extremely small screens (below 320 px wide)? The system must display a notice that the minimum supported screen width has been reached.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Users MUST be able to place circuit components (resistors, capacitors, inductors, voltage sources, current sources, ground nodes) onto an interactive canvas by drag-and-drop or tap-to-place.
- **FR-002**: Users MUST be able to draw wires between component terminals to create a circuit topology.
- **FR-003**: System MUST calculate and display DC circuit values (node voltages, branch currents, component power) in real time whenever the circuit topology or any component value changes.
- **FR-004**: System MUST prevent display of undefined or infinite values (e.g., short circuits) and instead show a descriptive error message on the canvas.
- **FR-005**: Users MUST be able to select, move, rotate, and delete any component already placed on the canvas.
- **FR-006**: System MUST support undo and redo of all canvas editing actions, with a minimum history depth of 20 actions.
- **FR-007**: Users MUST be able to browse a catalog of guided lessons organized by circuit analysis topic (e.g., Ohm's Law, KVL, KCL, Thévenin's theorem, nodal analysis).
- **FR-008**: System MUST present each lesson step sequentially and prevent advancing to the next step until the current step is completed correctly or the student explicitly skips it.
- **FR-009**: System MUST provide immediate, specific feedback for each submitted lesson step answer — indicating correct, incorrect, or partially correct — within 2 seconds of submission.
- **FR-010**: System MUST persist each student's lesson progress (completed steps, scores, timestamps) across sessions without data loss.
- **FR-011**: System MUST display a progress dashboard showing all lessons attempted, scores achieved, and completion status.
- **FR-012**: Users MUST be able to take practice exercises independently of lessons, with scored results and solution explanations.
- **FR-013**: System MUST render the full interface responsively across screen widths from 320 px to 2560 px without loss of functionality.
- **FR-014**: All interactive canvas elements MUST be fully operable via touch input on mobile and tablet devices.
- **FR-015**: System MUST display component values using appropriate SI unit prefixes (p, n, µ, m, k, M, G, T).
- **FR-016**: System MUST support at least the following analysis types: DC operating point, series/parallel resistance simplification, and superposition.

### Key Entities

- **Circuit**: A collection of components and wires arranged on a canvas; has a name, creation date, and owner; belongs to either a lesson, an exercise, or a student's personal workspace.
- **Component**: A circuit element (resistor, capacitor, inductor, voltage source, current source, or ground); has a type, a value with unit, a position on the canvas, and connection terminals.
- **Wire**: A connection between two component terminals; defines circuit topology.
- **Lesson**: A structured learning unit covering a specific circuit analysis topic; contains an ordered list of steps, a difficulty level, and estimated duration.
- **Lesson Step**: A single interactive task within a lesson; has an instruction, an expected answer, a hint, and an explanation.
- **Exercise**: An unguided problem with a fixed circuit and a question; has a correct answer, tolerance, and a solution walkthrough.
- **Student Progress Record**: A record linking a student to a lesson or exercise, capturing score, completion status, and timestamps for each step attempted.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new student can successfully simulate their first circuit (place components, connect wires, and view calculated values) within 5 minutes of first opening the module with no prior instruction.
- **SC-002**: Circuit values update within 1 second of any component value change or topology modification on a standard consumer device.
- **SC-003**: 90% of students who start a guided lesson complete it in a single session without abandoning.
- **SC-004**: The interface is fully functional and readable on any screen width between 320 px and 2560 px, verified across at least 5 representative device profiles.
- **SC-005**: Students who complete at least 3 guided lessons demonstrate a measurable improvement in circuit analysis exercise scores compared to their first exercise attempt (target: ≥ 20% score improvement).
- **SC-006**: Lesson progress is preserved with 100% accuracy across normal session interruptions (browser refresh, tab close, device sleep).
- **SC-007**: The system handles short-circuit and open-circuit edge cases without displaying undefined values, infinite numbers, or application errors — verified across all analysis types.

## Assumptions

- Students access the module through a standard web browser; no native app installation is required.
- Authentication and account management are handled by an existing system outside the scope of this feature; this feature assumes a logged-in student identity is available.
- Initial release covers DC circuit analysis only; AC analysis (phasors, impedance) is a future enhancement.
- The lesson content (instructions, hints, explanations) is authored by subject matter experts and provided as structured data; authoring tools are out of scope for this feature.
- A minimum of 10 guided lessons will be available at launch covering foundational topics: Ohm's Law, KVL, KCL, series circuits, parallel circuits, Thévenin equivalent, Norton equivalent, nodal analysis, mesh analysis, and superposition.
- Student progress data retention follows standard educational platform practices (retained for the duration of the student's enrollment or account lifetime).

## Out of Scope

- AC circuit analysis (sinusoidal steady state, phasors, frequency response)
- Circuit schematic export/import (e.g., SPICE netlist, image export)
- Collaborative or real-time shared circuit editing between multiple users
- Instructor-facing tools for creating or managing lesson content
- Integration with external grading or LMS systems in this phase
