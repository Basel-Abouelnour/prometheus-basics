# Prometheus Basics

A hands-on demo repository covering core Prometheus concepts, from running it in a container to dynamic EC2 service discovery on AWS.

---

## What's Covered

| # | Topic | Description |
|---|-------|-------------|
| 1 | **Container Setup** | Run Prometheus via Docker Compose with a persistent volume |
| 2 | **Basic Configuration** | Static scrape targets with custom intervals (`prometheus.yml`) |
| 3 | **Python App Monitoring** | Flask app instrumented with `prometheus_client` (Counter metric) |
| 4 | **Java App Monitoring** | Spring Boot app with Micrometer + Actuator exposing `/actuator/prometheus` |
| 5 | **AWS EC2 Service Discovery** | Dynamic target discovery using `ec2_sd_configs` with IAM credentials |
---

## Repository Structure

```
prometheus-basics/
├── compose.yaml           # Docker Compose for running Prometheus
├── prometheus.yml         # Scrape config (static + EC2 service discovery)
├── python/
│   ├── app.py             # Flask app exposing /metrics endpoint
│   └── requirements.txt   # Python dependencies
├── java/
│   ├── Dockerfile         # eclipse-temurin:17-jre image
│   ├── pom.xml            # Spring Boot + Micrometer dependencies
│   └── src/               # Spring Boot source code
└── iam_readonly_user      # IAM policy for EC2 read-only access
```

---

## Quick Start

### 1. Run Prometheus
We'll need to create an IAM user for the use of this demo with read only access to our ec2 instances so we will use the following commands:
```bash
aws iam create-user --user-name prom-user

aws iam attach-user-policy \
              --policy-arn arn:aws:iam::aws:policy/AmazonEC2ReadOnlyAccess \
              --user-name prom-user

 aws iam create-access-key \
              --user-name prom-user
```

Create an `aws_credentials.env` file with your AWS credentials (required for EC2 service discovery):

```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

Then start Prometheus:

```bash
docker compose up -d
```

Prometheus will be available at **http://localhost:9090**

---

### 2. Run the Python App

```bash
cd python
pip install -r requirements.txt
python app.py
```

The app exposes:
- `GET /` — increments the `app_requests_total` counter
- `GET /metrics` — Prometheus-formatted metrics endpoint

---

### 3. Run the Java App

```bash
cd java
docker build -t spring-prometheus-demo .
docker run -p 6666:6666 spring-prometheus-demo
```

The app exposes:
- `GET /` — returns a test response
- `GET /actuator/prometheus` — Prometheus metrics endpoint (via Micrometer)

---

## Scrape Configuration Overview

| Job | Target | Path | Interval |
|-----|--------|------|----------|
| `prometheus` | `localhost:9090` | `/metrics` | 15s (global) |
| `python_app` | `192.168.56.123:5000` | `/metrics` | 5s |
| `java_app` | `192.168.56.123:6666` | `/actuator/prometheus` | 5s |
| `aws_ec2` | EC2 instances (us-east-1, port 9100) | `/metrics` | 40s |

> **Note:** The EC2 job uses `ec2_sd_configs` for dynamic discovery. AWS credentials are passed via environment file — acceptable for testing, not recommended for production.

---

## AWS EC2 Service Discovery

Prometheus discovers EC2 instances automatically using the public IP metadata label (`__meta_ec2_public_ip`) relabeled to scrape Node Exporter on port `9100`.

The IAM user requires read-only EC2 permissions. See `iam_readonly_user` for the required policy.

---


## Final Results

![target healthy dashboard](image.png)

---

## Prerequisites

- Docker & Docker Compose
- Python 3.x
- Java 17+ / Maven (for building the Java app locally)
- Node Exporter running on target EC2 instances (port 9100)