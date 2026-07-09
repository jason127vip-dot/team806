# Use a small official Python image as the base runtime for the Django backend.
FROM python:3.12-slim

# Prevent Python from writing .pyc cache files.
ENV PYTHONDONTWRITEBYTECODE=1

# Force Python logs to print immediately instead of being buffered.
ENV PYTHONUNBUFFERED=1

# Set the working directory inside the container.
WORKDIR /app

# Copy the dependency list first so Docker can cache the install layer.
COPY requirements.txt .

# Install Python dependencies from requirements.txt.
RUN pip install --no-cache-dir -r requirements.txt

# Copy the Django project source code into the container.
COPY . .

# Document that the Django app listens on port 8000.
EXPOSE 8000

# Apply database migrations, then start the Django app with Gunicorn.
CMD ["sh", "-c", "python manage.py migrate && gunicorn tasksphere.wsgi:application --bind 0.0.0.0:8000"]
