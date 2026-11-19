FROM python:3.12-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends libatomic1 xvfb xauth \
 && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir "scrapling[fetchers]" fastapi "uvicorn[standard]" \
 && scrapling install \
 && python -m patchright install --with-deps chromium
COPY server.py start.sh ./
EXPOSE 9000
CMD ["./start.sh"]
