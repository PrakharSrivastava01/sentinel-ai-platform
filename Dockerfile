FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

RUN groupadd -r sentinel && useradd -r -g sentinel sentinel

RUN chown -R sentinel:sentinel /app

USER sentinel

COPY app/ ./app

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
