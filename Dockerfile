FROM python:3.12-slim

WORKDIR /app

RUN groupadd -r sentinel && useradd -r -g sentinel sentinel

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY --chown=sentinel:sentinel app/ ./app

USER sentinel

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
