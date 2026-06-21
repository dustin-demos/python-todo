FROM python:3.12-slim-bookworm
EXPOSE 8000

WORKDIR /app

# Install uv using pip
RUN pip install uv

# Copy your server code (not everything)
COPY server/ .

# Install dependencies
RUN uv sync

# Run the FastAPI server
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
