---
allowed-tools: Bash(npx tsc:*), Bash(npx eslint:*), Bash(npx next build:*), Bash(npx vitest:*), Bash(git diff:*), Bash(git status:*), Bash(git log:*), Bash(git rev-parse:*), Bash(npm run dev:*), Bash(lsof -i:*), Bash(kill:*), Read, Glob, Grep, mcp__claude-in-chrome__tabs_context_mcp, mcp__claude-in-chrome__tabs_create_mcp, mcp__claude-in-chrome__navigate, mcp__claude-in-chrome__computer, mcp__claude-in-chrome__read_page, mcp__claude-in-chrome__find, mcp__claude-in-chrome__javascript_tool, mcp__claude-in-chrome__read_console_messages, mcp__claude-in-chrome__read_network_requests, mcp__claude-in-chrome__get_page_text
description: Run QA, game design, and UI/UX testing with visual browser verification
---

## Pre-flight

- Current branch: !`git branch --show-current`
- Git status: !`git status --short`
- Changed files vs main: !`git diff --name-only main...HEAD 2>/dev/null || git diff --name-only HEAD~5`
- Recent commits on branch: !`git log --oneline main..HEAD 2>/dev/null || git log --oneline -5`
- Dev server running: !`lsof -i :3000 -t 2>/dev/null | head -1 || echo "not running"`

User arguments: $ARGUMENTS

## Your role

You are a senior QA engineer, game designer, and UI/UX expert reviewing changes to a 3D village builder game built with Next.js, React Three Fiber, and Three.js. You test with the rigor of someone who ships AAA games and the eye of a design-obsessed front-end engineer.

## Your task

Run ALL phases in order. Collect findings into a final report. Use the Chrome browser to visually verify any UI or visual changes.

---

### Phase 1: Automated checks

Run these in sequence. If any fail, note them as FAIL in the report but continue testing.

**1a. Type check:**
```
npx tsc --noEmit
```

**1b. Lint:**
```
npx eslint src/ --max-warnings 0 --no-fix
```

Note: Do NOT use `--fix`. QA is read-only — never modify source files.

**1c. Build:**
```
npx next build
```

**1d. Tests (if they exist):**
```
npx vitest run 2>/dev/null || echo "no tests configured"
```

Record pass/fail for each.

---

### Phase 2: Code-level QA review

Read ALL changed files from the pre-flight diff. For each file, review for:

**Functional correctness:**
- Logic errors, off-by-one, wrong comparisons
- Null/undefined access without guards
- Missing cleanup (useEffect returns, event listener removal)
- Race conditions in async code
- Incorrect Three.js usage (wrong geometry args, mismatched types)

**React & Three Fiber specific:**
- Refs used correctly (null checks before access in useFrame)
- useFrame callbacks are lightweight (no allocations, no state updates)
- Materials mutated in useFrame should not trigger re-renders
- No unnecessary re-renders from inline objects/arrays in JSX
- Proper `key` props on mapped elements

**Performance:**
- useFrame running at 60fps (no heavy computation per frame)
- Object creation inside render loops (new THREE.Vector3() etc.)
- Large arrays recreated every render
- Missing useMemo/useCallback where needed for expensive operations

**Security:**
- No exposed secrets, API keys, or credentials
- Proper input validation on API routes
- SQL injection / XSS vectors

Classify each finding as: 🔴 Critical | 🟡 Warning | 🔵 Info

---

### Phase 3: Game design review

Analyze changes through a game designer's lens:

**Animation & feel:**
- Are animation speeds/amplitudes appropriate? (too fast = jittery, too slow = lifeless)
- Do animations feel physically plausible? (a boat bobs differently than a flag waves)
- Are animation frequencies varied enough to avoid synchronized/robotic feel?
- Do idle animations add atmosphere without being distracting?

**Progression & reward:**
- Do new features enhance the reward loop of completing focus sessions?
- Are visual rewards proportional to effort (higher-tier buildings should feel more special)?
- Do changes maintain the sense of village "coming alive" as more buildings unlock?

**Consistency:**
- Do new buildings match the existing art style (low-poly, warm palette)?
- Are scale proportions consistent across buildings?
- Do particle effects / animations match the cozy village aesthetic?

**Game balance:**
- Are building unlock tiers still appropriately paced?
- Do new features create any unfair advantages or skippable content?
- Are creature spawn rates balanced for the village size?

Classify each finding as: 🔴 Critical | 🟡 Warning | 🔵 Info

---

### Phase 4: UI/UX review

Review any UI changes (HUD, modals, pages, controls):

**Visual design:**
- Consistent spacing, typography, and color usage
- Proper dark theme adherence (no jarring bright elements)
- Responsive layout (does it work at different viewport sizes?)
- Visual hierarchy guides the eye correctly

**Interaction design:**
- Clear affordances (buttons look clickable, inputs look editable)
- Feedback on actions (hover states, loading states, success/error)
- Keyboard accessibility
- Touch target sizes (minimum 44px)

**Information architecture:**
- Stats and progress are easy to read at a glance
- Building picker modal is intuitive
- Timer controls are discoverable and clear

**3D viewport UX:**
- Camera controls are intuitive
- Buildings are distinguishable from each other
- Animations don't obscure important visual information
- Performance stays smooth (no jank or frame drops)

Classify each finding as: 🔴 Critical | 🟡 Warning | 🔵 Info

---

### Phase 5: Visual browser verification

**Only run this phase if the changes include UI components, 3D buildings, animations, visual effects, styles, or layout changes.** Skip if changes are purely backend/API/data.

**5a. Setup:**
- Check if dev server is running on port 3000 (from pre-flight)
- If not running, start it: `npm run dev` (run in background)
- Wait for it to be ready
- Get browser tab context, create a new tab

**5b. Navigate and verify:**
- Navigate to `http://localhost:3000/focus`
- Take a screenshot of the initial village view
- Wait 3 seconds for animations to be visible

**5c. Animation verification (if animations changed):**
- Take a screenshot after waiting to capture animation mid-frame
- Check the browser console for any Three.js warnings or errors using `read_console_messages` with pattern `error|warn|THREE`
- Check for WebGL errors or performance warnings
- Take another screenshot 2 seconds later to compare animation states visually

**5d. UI verification (if UI changed):**
- Check the HUD overlay is visible and correctly positioned
- Verify stats display shows correct information
- Check for visual regressions (clipping, overflow, z-index issues)
- Take screenshots of any modals or interactive elements

**5e. Console & network health:**
- Read console for errors: `read_console_messages` with pattern `error|Error|fail|exception`
- Check network requests for failures: `read_network_requests`
- Flag any 4xx/5xx responses or failed fetches

**IMPORTANT: Do NOT record GIFs or trigger any file downloads. QA is fully hands-off — no save dialogs should ever appear.**

---

### Phase 6: Final report

Generate a structured report:

```
# QA Test Report
**Branch:** <branch name>
**Date:** <current date>
**Changes reviewed:** <count> files

## Automated Checks
| Check      | Result |
|------------|--------|
| TypeScript | ✅/❌   |
| ESLint     | ✅/❌   |
| Build      | ✅/❌   |
| Tests      | ✅/❌/⏭️ |

## Code QA
<list of findings with severity>

## Game Design
<list of findings with severity>

## UI/UX
<list of findings with severity>

## Visual Verification
<screenshots taken, console errors, network issues>
<GIF filename if recorded>

## Summary
- 🔴 Critical: <count>
- 🟡 Warning: <count>
- 🔵 Info: <count>
- **Verdict:** PASS / PASS WITH WARNINGS / FAIL

## Recommendations
<numbered list of suggested fixes, ordered by priority>
```

If there are 🔴 Critical findings, verdict is FAIL.
If there are only 🟡 Warnings and 🔵 Info, verdict is PASS WITH WARNINGS.
If no issues, verdict is PASS.
