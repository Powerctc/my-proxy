FROM python:3.9-slim
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt
# ဒီနေရာမှာ 8000 ပြောင်းပေးပါ
EXPOSE 8000
CMD ["python", "app.py"]
