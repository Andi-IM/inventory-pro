# Camunda 7 Deployment Documentation Using Docker (Without Docker Compose)

This document explains how to deploy **Camunda Platform 7 (CP7)** using manual `docker run` commands without using Docker Compose. This deployment utilizes a Docker Network so that the Camunda container and the PostgreSQL relational database can securely connect to each other.

A brief integration guide with a Python application using the standard HTTP `requests` library is also included at the end of this document.

---

## Camunda Platform 7 Architecture

Unlike Camunda 8, which uses distributed microservices (Zeebe, Elasticsearch, etc.), Camunda Platform 7 features a monolithic architecture that uses an **RDBMS (such as PostgreSQL or MySQL)** as the single storage for runtime execution state as well as workflow history data. This makes it extremely lightweight (~1.5GB RAM) and easy to deploy using Docker.

---

## Deployment Steps

### Option A: Quick / Development Mode (H2 In-Memory Database)
Use the following command to quickly run Camunda 7 for testing. The database used is H2 (data will be deleted automatically if the container is removed).

```bash
docker run -d --name camunda-local -p 8080:8080 camunda/camunda-bpm-platform:run-7.24.0
```

*   **Web Apps Access (Cockpit, Tasklist, Admin):** `http://localhost:8080/camunda`
*   **Default Credentials:** `demo` / `demo`
*   **REST API Endpoint:** `http://localhost:8080/engine-rest`

---

### Option B: Production / Persistent Mode (Using PostgreSQL)
To store data permanently, we run a PostgreSQL database in a separate container and connect it to Camunda 7 within a single Docker Network.

#### Step 1: Create a Docker Network
Create a custom network so that the Camunda and PostgreSQL containers can communicate with each other using the container name as the hostname.
```bash
docker network create camunda-net
```

#### Step 2: Run the PostgreSQL Container
Run the PostgreSQL database container, provide a persistent volume to store data, and connect it to the `camunda-net` network.
```bash
docker run -d \
  --name postgres-db \
  --network camunda-net \
  -p 5432:5432 \
  -e POSTGRES_USER=camunda \
  -e POSTGRES_PASSWORD=camundapass \
  -e POSTGRES_DB=camundadb \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:15-alpine
```

#### Step 3: Run the Camunda Platform 7 Container
Run the Camunda 7 container and direct the database configuration to the `postgres-db` container. The `WAIT_FOR` variable ensures that the Camunda engine waits for the database to be ready to accept connections before starting the application.
```bash
docker run -d \
  --name camunda-app \
  --network camunda-net \
  -p 8080:8080 \
  -e DB_DRIVER=org.postgresql.Driver \
  -e DB_URL=jdbc:postgresql://postgres-db:5432/camundadb \
  -e DB_USERNAME=camunda \
  -e DB_PASSWORD=camundapass \
  -e WAIT_FOR=postgres-db:5432 \
  camunda/camunda-bpm-platform:run-7.24.0
```

---

### Option C: Using Camunda 7 Run (Spring Boot-based)
If you are using the **Camunda BPM Platform Run** variant (a lighter Spring Boot-based standalone distribution), configure it using the following Spring Boot environment variables:

```bash
docker run -d \
  --name camunda-run \
  --network camunda-net \
  -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://postgres-db:5432/camundadb \
  -e SPRING_DATASOURCE_USERNAME=camunda \
  -e SPRING_DATASOURCE_PASSWORD=camundapass \
  -e SPRING_DATASOURCE_DRIVER_CLASS_NAME=org.postgresql.Driver \
  camunda/camunda-bpm-platform:run-latest
```

---

### Option D: Connecting to Neon Serverless PostgreSQL (Cloud Database)
If you want to connect your Camunda 7 container directly to a cloud Neon PostgreSQL database (such as the credentials set in this project's `.env` file), you do not need to run a local PostgreSQL container or use a custom Docker Network for the database.

However, you must include the `sslmode=require` query parameter in the JDBC URL because Neon requires SSL encryption for all external connections.

```bash
docker run -d \
  --name camunda-app \
  -p 8080:8080 \
  -e DB_DRIVER=org.postgresql.Driver \
  -e DB_URL="jdbc:postgresql://ep-lucky-base-apc0016d-pooler.c-7.us-east-1.aws.neon.tech:5432/camundadb?sslmode=require" \
  -e DB_USERNAME=neondb_owner \
  -e DB_PASSWORD=npg_oNdt0iLs6Wag \
  camunda/camunda-bpm-platform:run-7.24.0
```

*   **Important**: Make sure your local host is connected to the internet so that the container can perform DNS resolution and access the Neon database server in the cloud.
*   If using the **Camunda Run (Spring Boot)** variant, you can also use the variables `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, and `SPRING_DATASOURCE_PASSWORD` with the credentials above.

---

## Python Client Integration (Using `requests`)

Since this project uses Python and has been migrated to the Camunda 7 REST API, you can interact directly with the engine using the standard HTTP `requests` library.

### 1. Example BPMN File Deployment
```python
import requests
import os

def deploy_bpmn(bpmn_path):
    url = "http://localhost:8080/engine-rest/deployment/create"
    deployment_name = os.path.splitext(os.path.basename(bpmn_path))[0]
    
    with open(bpmn_path, "rb") as f:
        files = {
            "data": (os.path.basename(bpmn_path), f),
            "deployment-name": (None, deployment_name),
            "enable-duplicate-filtering": (None, "true"),
            "deploy-changed-only": (None, "true")
        }
        response = requests.post(url, files=files)
        
    if response.status_code == 200:
        print("BPMN diagram successfully deployed!")
        return response.json()
    else:
        print(f"Failed to deploy: {response.text}")
```

### 2. Example Starting a Workflow Instance (Start Process Instance)
Variables in Camunda 7 must be sent using the structured format `{"variable_name": {"value": value}}`.
```python
import requests

def start_process(process_id, variables=None):
    url = f"http://localhost:8080/engine-rest/process-definition/key/{process_id}/start"
    
    formatted_variables = {}
    if variables:
        for k, v in variables.items():
            formatted_variables[k] = {"value": v}
            
    payload = {"variables": formatted_variables}
    response = requests.post(url, json=payload, headers={"Content-Type": "application/json"})
    
    if response.status_code == 200:
        instance_id = response.json().get("id")
        print(f"Process instance successfully started with ID: {instance_id}")
        return instance_id
    else:
        print(f"Failed to start process: {response.text}")
```

### 3. Example External Task Worker
In Camunda 7, the Python worker runs using the REST API polling pattern (*Fetch and Lock*).
```python
import requests
import time

def process_worker():
    base_url = "http://localhost:8080/engine-rest"
    worker_id = "python-worker-1"
    
    # Continuously poll for tasks
    while True:
        # Fetch and Lock Task
        payload = {
            "workerId": worker_id,
            "maxTasks": 1,
            "usePriority": True,
            "topics": [
                {
                    "topicName": "proses-persetujuan-worker",
                    "lockDuration": 10000 # 10 seconds
                }
            ]
        }
        response = requests.post(f"{base_url}/external-task/fetchAndLock", json=payload)
        
        if response.status_code == 200 and response.json():
            task = response.json()[0]
            task_id = task.get("id")
            print(f"Processing task with ID: {task_id}")
            
            # Perform business logic here...
            
            # Complete task
            complete_payload = {
                "workerId": worker_id,
                "variables": {
                    "hasil_proses": {"value": "sukses"}
                }
            }
            requests.post(f"{base_url}/external-task/{task_id}/complete", json=complete_payload)
            print(f"Task {task_id} successfully completed.")
            
        time.sleep(2) # Wait 2 seconds before polling again

if __name__ == "__main__":
    process_worker()
```

---

## System Resources Requirements
Because it does not require Elasticsearch and has a centralized architecture, the memory allocation required is extremely friendly for local development machines:
*   **RAM:** 1.5GB - 2GB (Total Camunda and PostgreSQL containers).
*   **CPU:** 1 - 2 Cores.
