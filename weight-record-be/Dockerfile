# ---- build ----
FROM python:3.12-slim-bookworm AS build

#copy uv image
COPY --from=ghcr.io/astral-sh/uv:0.6.14 /uv /uvx /bin/

WORKDIR /build

#compilation improvements
ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PYTHON_DOWNLOADS=never

COPY pyproject.toml uv.lock ./
COPY app ./app
COPY resources ./resources
COPY run.py ./

RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-install-project --no-dev

# ---- runtime ----
FROM python:3.12-slim-bookworm
WORKDIR /app

RUN groupadd --system app && useradd --system --gid app app

COPY --from=build /build/.venv ./.venv
COPY --from=build /build/app ./app
COPY --from=build /build/resources ./resources
COPY --from=build /build/run.py ./run.py
COPY --from=build /build/pyproject.toml ./pyproject.toml

ENV PATH="/app/.venv/bin:$PATH" \
    PYTHONUNBUFFERED=1

USER app
EXPOSE 8080

ENTRYPOINT ["python", "run.py"]
