---
name: quality-check
description: >
  Runs a quality check after completing any coding task. Use this skill whenever
  you finish making code changes to verify the project builds successfully,
  contains no deprecated Tailwind v4 class names (e.g. flex-shrink-0, flex-grow),
  and follows the mobile-first design system (no hover-only interactions, no
  Tailwind named colors — use project color tokens instead).
  Invoke automatically at the end of every task without being asked.
allowed-tools: shell
---

## When to use

Run this skill **automatically after every task** that involves editing `.ts`,
`.tsx`, `.js`, or `.jsx` files — no need to wait for the user to ask.

## Steps

1. Run the `check-quality.ps1` script located in this skill's directory:

   ```
   pwsh .github/skills/quality-check/check-quality.ps1
   ```

2. Read the output carefully:

   - **Deprecated Tailwind classes** — fix each one by replacing the old class
     with the suggested modern equivalent (e.g. `flex-shrink-0` → `shrink-0`).
   - **Arbitrary px values** — replace with Tailwind scale equivalents.
   - **Mobile-first violations** — fix hover-only interactions by adding a matching
     `active:` class; replace Tailwind named colors with project color tokens.
   - **Build failure** — read the compiler errors and fix them before marking
     the task as done.

3. If any issues were found and fixed, re-run the script to confirm everything
   passes before reporting back to the user.

4. Report the result to the user:
   - ✅ "Build passed, no deprecated classes found." — task is complete.
   - ❌ List what was found and what was fixed.

## Deprecated Tailwind v4 classes reference

| Old class            | Use instead            |
|----------------------|------------------------|
| `flex-shrink-0`      | `shrink-0`             |
| `flex-shrink`        | `shrink`               |
| `flex-grow-0`        | `grow-0`               |
| `flex-grow`          | `grow`                 |
| `overflow-ellipsis`  | `text-ellipsis`        |
| `decoration-slice`   | `box-decoration-slice` |
| `decoration-clone`   | `box-decoration-clone` |

## Arbitrary px values

Tailwind v4 uses a 4px base unit. Arbitrary `[Xpx]` values where `X` is
divisible by 2 can be replaced with a scale value:

- `h-[62px]` → `h-15.5` (62 / 4 = 15.5)
- `h-[48px]` → `h-12`   (48 / 4 = 12)
- `p-[8px]`  → `p-2`    (8 / 4 = 2)
- `w-[1px]`  → `w-px`   (special case)

Fix all reported instances by replacing the arbitrary value with the suggested class.

## Mobile-first design system

From `copilot-instructions.md` — enforced automatically:

- **No hover-only interactions** — every `hover:` class must have a matching `active:` on
  the same element for touch support. Example: `hover:opacity-80 active:opacity-80`.
- **No Tailwind named colors** — use exact project color tokens:

| Purpose          | Token             |
|------------------|-------------------|
| Background       | `#F2F2F7`         |
| Cards            | `bg-white`        |
| Primary action   | `#007AFF`         |
| Success          | `#34C759`         |
| Destructive      | `#FF3B30`         |
| Warning/score    | `#FF9500`         |
| Secondary text   | `#6C6C70`         |
| Touch feedback   | `active:opacity-80 transition-opacity` |

- **Touch targets** — interactive elements must be at least 44px tall (`min-h-11` or `h-11`).
- **Small screen first** — base styles target ≤390px; use `sm:` / `md:` only to enhance larger screens.
