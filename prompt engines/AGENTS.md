# AGENTS.md - HALQIL AGENT DEVELOPMENT INSTRUCTIONS AND PROTOCOLS

## Core Directives

1.  **Strict Prompt Engine Adherence**:
    You MUST read and follow `/STRICT_RULES.txt` and `/CONTEXT_CHECKPOINT.md` at the start of every session. All development on this repository must strictly adhere to the HalQIl universal prompt engine.

2.  **Stateful Development Algorithm**:
    -   Never execute multiple development phases as a monolith.
    -   You MUST break down every task into small, atomic **Steps** (Qadamlar).
    -   At each step, write clean code, call `lint_applet` and `compile_applet`, resolve any warnings or errors immediately, and secure 100% stability.
    -   Never proceed to a subsequent step until the current step is completely bug-free.

3.  **Token Saving via Context Checkpoints**:
    -   Maintain `/CONTEXT_CHECKPOINT.md` at the root directory of the application.
    -   Every time you finish a turn or complete a step, update this file with the current phase, completed files with their API structures, current bug status, and the next step on the roster.
    -   Always consult this file FIRST to avoid reloading large source files unnecessarily, preserving token usage.

4.  **No Unrequested App Code**:
    -   Do not build general dashboards, navigation sidebars, mockup views, or generic screens unless explicitly instructed by the user.
    -   Focus completely on the specific, request-bound logic as specified in the current phase/step.
    -   Keep interfaces minimal, modular, and extremely performant.

5.  **Professional Execution and Communications**:
    -   Write descriptions of completed work clearly, objectively, and without flowery, self-praising words ("perfect", "flawless", "awesome", etc.).
    -   Provide clear visual state trackers in your final response showing completed steps, compile check statuses, and the plan ahead.
