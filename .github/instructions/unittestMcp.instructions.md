---
applyTo: '**'
---
- Unified unit test workflow (applies only when the Unit Tests MCP server is available via VS Code extension; includes fast path & triggers):
    1. Auto-trigger conditions: **IMMEDIATELY** use the Unit Tests MCP server workflow when ANY of these conditions are met:
        - User explicitly requests to create, generate, add, write, improve, enhance, update, fix, or run tests (action verbs)
        - User request contains "test" or "testing" AND includes action indicators like "should", "need", "want", "let's", "please", "can you", "run"
        - Active file IS a test file (contains `.test.` / `.spec.` or is in `__tests__` or `tests/test_*.py` or ends with `Tests.cs`) AND request includes action keywords: improve, enhance, coverage, assertions, edge cases, fix, run, execute
        - Active file is a source file (TS/TSX/JS/JSX/PY/CS) AND request explicitly asks for test creation/generation
        - **User explicitly mentions a specific file to test in their request**
        - DO NOT trigger for: questions about test location, viewing tests, understanding tests, asking if tests exist
    2. **CRITICAL FIRST ACTION: Determine the intent (Run vs. Create/Improve):**
        - **IF USER WANTS TO RUN/EXECUTE TESTS:**
            - **IMMEDIATELY call the MCP `run_tests` tool.**
            - Do NOT call `generate_test`.
            - Follow "Test Execution Rules" (Section 6) for parameters.
        - **IF USER WANTS TO CREATE, IMPROVE, OR FIX TESTS:**
            - **DO NOT read the test file first** (unless checking for Python repo structure)
            - **DO NOT analyze the code manually first**
            - **IMMEDIATELY call the MCP `generate_test` tool as your very first action**
            - *Exception:* For Python projects, you may use `file_search` briefly to determine if tests are in a `tests/` folder or colocated before calling `generate_test`.
    3. **Test Creation Path (when active file is a source file, NOT a test):**
        - **JavaScript/TypeScript**: Call MCP `generate_test` immediately.
            - Choose `framework` by inspecting the nearest `package.json`:
                - If the `test` script (or deps) indicate **Vitest** (`vitest`), pass `framework=vitest`.
                - If the `test` script (or deps) indicate **Jest** (`jest`), pass `framework=jest`.
                - If the `test` script indicates a different runner (e.g. `karma`, `mocha`, `ava`, `tap`, `tape`, `node --test`), pass `framework=custom`.
            - Use the repo’s existing test location conventions (e.g. `__tests__`, `tests/`, or colocated), rather than forcing `__tests__`.
        - **Python**: Check repo structure (centralized `tests/` vs colocated) then call MCP `generate_test`. Pass `framework=pytest`, `language=python`.
        - **.NET (C#)**: Call MCP `generate_test` immediately. Use `tests/<ProjectName>.Tests/<ClassName>Tests.cs` or similar; pass `framework=dotnet`, `language=csharp`.
        - IMPORTANT: `generate_test` returns GUIDANCE / STRUCTURE. After this call the agent MUST:
            - **Do NOT paste the `generate_test` tool output back to the user** as the final result; it is a prompt/context bundle.
            - **Read the source file** to understand the logic, inputs, and expected outputs.
            - Synthesize concrete test code implementing the returned guidance.
            - If the target test file does not exist, create it. If it exists, apply additive edits only.
            - Only then run tests.
    4. **Test Improvement Path (when active file IS already a test file):**
        - **FIRST ACTION**: Call MCP `generate_test` tool immediately with both `source_file_path` and `test_file_path`.
        - **DO NOT read the test file before calling generate_test**
        - Analyze the returned guidance for gaps or missing edge cases.
        - Apply additive improvements (preserve existing assertions).
    5. Path heuristics:
        - Creation: derive test path by examining existing test structure in repo.
        - Improvement: derive source by removing `.test.` / `.spec.` or moving out of `__tests__` (JS/TS) or `tests/` (Python) or removing `Tests` suffix (C#).
        - Always pass `test_type=unit`.
    6. **Test Execution Rules (Applies to ALL run_tests calls):**
        - **CRITICAL: Use MCP server tools to run tests - DO NOT use terminal commands.**
        - **Root Directory Selection**:
            - **Definition:**
                - `root_dir` is the directory you would `cd` into and run the test command manually.
                - Prefer an **absolute path** (especially on Windows). If the repo is a monorepo, this is often a **package subfolder**, not the repo root.
            - **Jest**: Use the folder containing `package.json`. **Verify** that this `package.json` contains the test scripts/configuration before running.
            - **Vitest**: Use the folder containing `package.json`. **Verify** that this `package.json` contains the test scripts/configuration before running.
            - **.NET**: Use the directory containing the solution file (`.sln`). If no solution exists, use the directory containing the test project file (`.csproj`).
            - **Python**: Use the directory containing the test configuration file (`pytest.ini`, `pyproject.toml`, `tox.ini`, or `setup.cfg`).
        - **Timeouts (recommended)**:
            - For potentially long runs (coverage, large repos, slow CI-like projects), pass `timeout_ms` to `run_tests`.
            - If the timeout is exceeded, the server terminates the test process best-effort and returns a failure (commonly `exitCode=124`) with a message like `Timed out after <N>ms`.
            - Suggested starting points: `timeout_ms=600000` (10 minutes) for coverage runs; adjust as needed.
        - **Framework Parameters**:
            - For **Jest (JS/TS)**: Pass `framework=jest` (only when the package’s test script/config indicates Jest)
            - For **Vitest (JS/TS)**: Pass `framework=vitest` (only when the package’s test script/config indicates Vitest)
            - For **pytest (Python)**: Pass `framework=pytest`, `language=python`
            - For **.NET (C#)**: Pass `framework=dotnet`, `language=csharp`
            - For **Custom / unsupported frameworks** (e.g. Karma+Jasmine, Mocha, AVA, Node’s built-in runner):
                - Pass `framework=custom` and configure the runner via VS Code setting `unittestMcp.customCommand` (or env `UNITTEST_MCP_CUSTOM_COMMAND`).
                - Prefer setting the custom command to something that respects `root_dir` (e.g. `npm test` from the package folder).
                - Also available for scripts: `UNITTEST_MCP_ROOT_DIR`, `UNITTEST_MCP_INCLUDE_COVERAGE`, `UNITTEST_MCP_WATCH_MODE`, `UNITTEST_MCP_UPDATE_SNAPSHOTS`.
    7. Post-generation cycle:
        - **Quality gates (mandatory):** Generated/updated tests MUST compile and MUST pass the repo's lint rules (e.g., ESLint + TypeScript).
        - Run `get_errors`. If any ESLint/TypeScript/lint errors exist, iteratively fix **all** of them until `get_errors` reports none. Do this **before outputting the final test code**.
        - Run tests using the rules defined in Section 6.
        - **Coverage measurement:**
            - Use MCP `run_tests` tool with `include_coverage=true`.
            - Require >=80% line & branch coverage for changed/added files.
            - Iterate targeting uncovered branches until coverage requirement is met.
    8. Failure handling:
        - If 3 consecutive run failures, fall back to full discovery (read config, retry once).
        - If source path inference fails, ask user.
    9. Narration kept minimal: Generate -> Run -> Coverage (-> Improvement if needed).
    10. Preserve existing assertions; only add or refine.
    11. **Extension availability**: If tools are unavailable, suggest reloading VS Code or checking extension status.
