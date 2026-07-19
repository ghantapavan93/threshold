"""Architecture fitness tests (Efficast-inspired): enforce invariants as code.

The domain engine MUST stay pure — no LLM clients, no HTTP, no DB, no web
framework, no dependency on the app's persistence/routing layers. If someone
later tries to put an LLM in the hot path, this test fails the build.
"""
import ast
import pathlib

DOMAIN = pathlib.Path(__file__).resolve().parent.parent / "app" / "domain"

# top-level modules the pure engine must never import
FORBIDDEN_TOPLEVEL = {
    "openai", "anthropic", "cohere", "langchain", "langgraph", "llama_index",
    "httpx", "requests", "urllib", "aiohttp",         # no network / no serving-path calls
    "fastapi", "starlette", "uvicorn",                # no web framework in the engine
    "sqlalchemy", "psycopg", "sqlite3",               # no persistence in the engine
}
# relative imports into the effectful shell the engine must not depend on
FORBIDDEN_RELATIVE = {"db", "models", "routers", "main", "config"}


def _imports(path: pathlib.Path) -> tuple[set[str], set[str]]:
    tree = ast.parse(path.read_text())
    top, rel = set(), set()
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for n in node.names:
                top.add(n.name.split(".")[0])
        elif isinstance(node, ast.ImportFrom):
            if node.level and node.module:  # relative import
                rel.add(node.module.split(".")[0])
            elif node.module:
                top.add(node.module.split(".")[0])
    return top, rel


def test_domain_engine_is_pure():
    offenders: dict[str, set[str]] = {}
    for f in sorted(DOMAIN.glob("*.py")):
        top, rel = _imports(f)
        bad = (top & FORBIDDEN_TOPLEVEL) | (rel & FORBIDDEN_RELATIVE)
        if bad:
            offenders[f.name] = bad
    assert not offenders, f"domain engine must stay pure (no AI/HTTP/DB/web/persistence): {offenders}"
