# Deployment Guide

This document centralises deployment guidance for `linear-algebra-pro-server`. It covers Docker-based workflows, container registry publishing, Docker Compose orchestration, Kubernetes deployments, and CI/CD automation.

## Table of Contents
- [Docker Quickstart](#docker-quickstart)
  - [Prerequisites](#prerequisites)
  - [Build the Image](#build-the-image)
  - [Run the Container](#run-the-container)
  - [Manage the Container](#manage-the-container)
  - [Test the API](#test-the-api)
  - [Environment Variables](#environment-variables)
  - [Troubleshooting](#troubleshooting)
- [Publishing to Container Registries](#publishing-to-container-registries)
  - [Docker Hub](#docker-hub)
  - [Google Container Registry (GCR)](#google-container-registry-gcr)
  - [Amazon Elastic Container Registry (ECR)](#amazon-elastic-container-registry-ecr)
  - [Tagging Strategy for Registries](#tagging-strategy-for-registries)
- [Docker Compose](#docker-compose)
  - [Quick Start](#quick-start)
  - [Configuration Files](#configuration-files)
  - [Environment Variables](#environment-variables-1)
  - [Using Docker Hub Images](#using-docker-hub-images)
  - [Commands Reference](#commands-reference)
- [Kubernetes Deployment](#kubernetes-deployment)
  - [Prerequisites](#prerequisites-1)
  - [Manifest Files](#manifest-files)
  - [Quick Deployment](#quick-deployment)
  - [Configuration](#configuration)
  - [Scaling](#scaling)
  - [Accessing the Application](#accessing-the-application)
  - [Updates and Rollouts](#updates-and-rollouts)
  - [Cleanup](#cleanup)
- [CI/CD Automation](#cicd-automation)
  - [Prerequisites](#prerequisites-2)
  - [GitHub Actions Workflow](#github-actions-workflow)
  - [Setup Secrets](#setup-secrets)
  - [Workflow Triggers](#workflow-triggers)
  - [Manual Workflow Dispatch](#manual-workflow-dispatch)
  - [Customization](#customization)
  - [Local Testing](#local-testing)
- [Next Steps](#next-steps)

## Docker Quickstart

### Prerequisites
- Docker Desktop (Windows/macOS) or Docker Engine (Linux) installed and running.
- Terminal access (PowerShell, bash, etc.).

### Build the Image
Run from the project root:

```powershell
# Build with both :latest and versioned tag (recommended)
docker build -t linear-algebra-pro-server:latest -t linear-algebra-pro-server:v1.0 .

# Or build with just a version tag
docker build -t linear-algebra-pro-server:v1.0 .
```

> **Tagging Strategy**: 
> - Use `:latest` for the most recent stable build (enables `docker run linear-algebra-pro-server` without specifying a tag)
> - Use semantic versioning tags (e.g., `v1.0`, `v1.1`, `v2.0`) for version tracking
> - Building both tags allows flexibility: use `:latest` for development and specific versions for production deployments

### Run the Container
By default, the API listens on port `3001` and expects front-ends from `http://localhost:3000`.

```powershell
# Clean up any existing container with the same name
docker rm -f linear-algebra-pro-server 2>$null

# Run in detached mode, exposing port 3001
docker run -d -p 3001:3001 --name linear-algebra-pro-server linear-algebra-pro-server:v1.0
```

- API base URL: `http://localhost:3001`
- Swagger UI: `http://localhost:3001/api`

Need to expose a different port? Map a new host port to `3001`:

```powershell
# Expose API on http://localhost:8080 while the container still listens on 3001
docker run -d -p 8080:3001 --name linear-algebra-pro-server linear-algebra-pro-server:v1.0
```

### Manage the Container
Common lifecycle commands:

```powershell
# List running containers
docker ps

# View logs (Ctrl + C to stop following)
docker logs -f linear-algebra-pro-server

# Stop / start / restart
docker stop linear-algebra-pro-server
docker start linear-algebra-pro-server
docker restart linear-algebra-pro-server

# Remove when you are done
docker rm -f linear-algebra-pro-server
```

### Test the API
Use PowerShell’s `Invoke-WebRequest` (alias `iwr`) or curl to hit a sample endpoint:

```powershell
Invoke-WebRequest -Uri http://localhost:3001/matrix/create/identity/3 -Method POST -ContentType "application/json"
```

With curl on Windows:

```powershell
curl.exe -X POST http://localhost:3001/matrix/create/identity/3 -H "Content-Type: application/json"
```

Successful responses return JSON payloads (HTTP `201` for the example above).

### Environment Variables
The Dockerfile reads runtime configuration from environment variables. Define them inline, via `--env-file`, or through Docker Desktop UI.

| Variable        | Default                | Description                                      |
|-----------------|------------------------|--------------------------------------------------|
| `PORT`          | `3001`                 | Port exposed by NestJS inside the container.     |
| `CLIENT_ORIGIN` | `http://localhost:3000` | Comma-separated list of origins allowed by CORS. |

Examples:

```powershell
# Override CLIENT_ORIGIN without .env
docker run -d -p 3001:3001 -e CLIENT_ORIGIN="http://localhost:5173" --name linear-algebra-pro-server linear-algebra-pro-server:v1.0

# Load all vars from an env file
docker run -d -p 3001:3001 --env-file .env --name linear-algebra-pro-server linear-algebra-pro-server:v1.0
```

Remember: `PORT` must match the inner NestJS port (default 3001). Adjust the host mapping (`-p host:container`) to expose a different external port.

### Troubleshooting
- **Docker Desktop not running**: Start Docker Desktop and retry; the CLI needs the daemon.
- **Port already in use**: Choose another host port (e.g., `-p 3002:3001`).
- **Cannot reach the API**: Check `docker logs -f linear-algebra-pro-server` for startup errors or validation issues.
- **CORS blocked**: Ensure `CLIENT_ORIGIN` includes the calling front-end origin.
- **Image does not exist**: Verify the tag with `docker images`; retag if necessary: `docker tag <IMAGE_ID> linear-algebra-pro-server:v1.0`.

## Publishing to Container Registries

Once your image is built and tested locally, publish it to a container registry for distribution and deployment to other environments.

### Docker Hub

#### Prerequisites
- Docker Hub account created at [hub.docker.com](https://hub.docker.com)
- Logged in via CLI: `docker login`

#### Publishing Steps

```powershell
# Tag your image with your Docker Hub username
docker tag linear-algebra-pro-server:latest curiosityr0ver/linear-algebra-pro-server:latest
docker tag linear-algebra-pro-server:v1.0 curiosityr0ver/linear-algebra-pro-server:v1.0

# Push both tags
docker push curiosityr0ver/linear-algebra-pro-server:latest
docker push curiosityr0ver/linear-algebra-pro-server:v1.0
```

#### Pulling and Running from Docker Hub

```powershell
# Pull the image
docker pull curiosityr0ver/linear-algebra-pro-server:latest

# Run from Docker Hub
docker run -d -p 3001:3001 --name linear-algebra-pro-server curiosityr0ver/linear-algebra-pro-server:latest
```

### Google Container Registry (GCR)

#### Prerequisites
- Google Cloud Project with Container Registry API enabled
- `gcloud` CLI installed and authenticated: `gcloud auth login`
- Docker configured for GCR: `gcloud auth configure-docker`

#### Publishing Steps

```powershell
# Tag for GCR (replace PROJECT_ID with your GCP project ID)
docker tag linear-algebra-pro-server:latest gcr.io/<PROJECT_ID>/linear-algebra-pro-server:latest
docker tag linear-algebra-pro-server:v1.0 gcr.io/<PROJECT_ID>/linear-algebra-pro-server:v1.0

# Push to GCR
docker push gcr.io/<PROJECT_ID>/linear-algebra-pro-server:latest
docker push gcr.io/<PROJECT_ID>/linear-algebra-pro-server:v1.0
```

### Amazon Elastic Container Registry (ECR)

#### Prerequisites
- AWS CLI installed and configured: `aws configure`
- ECR repository created: `aws ecr create-repository --repository-name linear-algebra-pro-server`

#### Publishing Steps

```powershell
# Get ECR login token
aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <account-id>.dkr.ecr.<region>.amazonaws.com

# Tag for ECR (replace <account-id> and <region>)
docker tag linear-algebra-pro-server:latest <account-id>.dkr.ecr.<region>.amazonaws.com/linear-algebra-pro-server:latest
docker tag linear-algebra-pro-server:v1.0 <account-id>.dkr.ecr.<region>.amazonaws.com/linear-algebra-pro-server:v1.0

# Push to ECR
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/linear-algebra-pro-server:latest
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/linear-algebra-pro-server:v1.0
```

### Tagging Strategy for Registries

- **Latest**: Always push `:latest` for convenience and automated deployments
- **Versioned**: Push semantic version tags (`v1.0`, `v1.1`) for production stability
- **Git commits**: Optionally tag with commit SHA for traceability: `docker tag ... :git-<sha>`

## Docker Compose

Docker Compose simplifies running and managing the application with predefined configurations. Use it for local development, testing, and production deployments.

### Prerequisites
- Docker Compose installed (included with Docker Desktop)

### Quick Start

```powershell
# Start the service
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the service
docker-compose down
```

### Configuration Files

#### `docker-compose.yml` (Development)
Basic configuration for local development and testing:

```yaml
version: '3.8'

services:
  linear-algebra-pro-server:
    image: curiosityr0ver/linear-algebra-pro-server:latest
    container_name: linear-algebra-pro-server
    ports:
      - "3001:3001"
    environment:
      - PORT=3001
      - CLIENT_ORIGIN=http://localhost:3000
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - linear-algebra-network

networks:
  linear-algebra-network:
    driver: bridge
```

#### `docker-compose.prod.yml` (Production)
Production-ready configuration with resource limits and logging:

```powershell
# Use production configuration
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables
Override environment variables by editing `docker-compose.yml` or using variable substitution:

```powershell
# docker-compose automatically reads .env file in the same directory for variable substitution
# Create .env file with:
# CLIENT_ORIGIN=http://your-domain.com

# Then run (variables in .env will be substituted in docker-compose.yml)
docker-compose up -d

# Or edit docker-compose.yml directly to change environment values
```

### Using Docker Hub Images

The `docker-compose.yml` files are already configured to use the Docker Hub image:

```yaml
services:
  linear-algebra-pro-server:
    image: curiosityr0ver/linear-algebra-pro-server:latest
    # ... rest of config
```

To use a different image or tag, update the `image` field in the compose files.

### Commands Reference

```powershell
# Start services in detached mode
docker-compose up -d

# Start with production config
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose logs -f linear-algebra-pro-server

# Restart service
docker-compose restart linear-algebra-pro-server

# Stop and remove containers
docker-compose down

# Rebuild and start
docker-compose up -d --build

# Scale service (if needed in future)
docker-compose up -d --scale linear-algebra-pro-server=3
```

## Kubernetes Deployment

Deploy the application to a Kubernetes cluster for production-grade orchestration, scaling, and high availability.

### Prerequisites
- Kubernetes cluster (local: Minikube/k3s, cloud: GKE/EKS/AKS)
- `kubectl` configured to access your cluster
- Docker image pushed to a container registry

### Manifest Files

All Kubernetes manifests are located in the `k8s/` directory:

- `deployment.yaml` - Deployment with replicas, resource limits, and probes
- `service.yaml` - Service for internal/external access
- `configmap.yaml` - Environment configuration
- `ingress.yaml` - External access with optional TLS (requires Ingress controller)

### Quick Deployment

```powershell
# Apply all manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get pods
kubectl get services
kubectl get deployments

# View logs
kubectl logs -f deployment/linear-algebra-pro-server

# Access the service
kubectl port-forward service/linear-algebra-pro-server 3001:80
```

### Configuration

#### Update Image Reference
The `k8s/deployment.yaml` is configured to use the Docker Hub image:

```yaml
spec:
  template:
    spec:
      containers:
      - name: linear-algebra-pro-server
        image: curiosityr0ver/linear-algebra-pro-server:latest
        # Or use other registries:
        # image: gcr.io/<PROJECT_ID>/linear-algebra-pro-server:latest
        # image: <account-id>.dkr.ecr.<region>.amazonaws.com/linear-algebra-pro-server:latest
```

Edit the file to use a different image or tag if needed.

#### Environment Variables
Update `k8s/configmap.yaml` for PORT and CLIENT_ORIGIN:

```yaml
data:
  PORT: "3001"
  CLIENT_ORIGIN: "http://localhost:3000,https://your-domain.com"
```

Apply the ConfigMap:
```powershell
kubectl apply -f k8s/configmap.yaml
kubectl rollout restart deployment/linear-algebra-pro-server
```

### Scaling

```powershell
# Scale to 3 replicas
kubectl scale deployment linear-algebra-pro-server --replicas=3

# Or edit deployment
kubectl edit deployment linear-algebra-pro-server
```

### Accessing the Application

#### ClusterIP (Internal)
Service is accessible within the cluster. Use port-forwarding for local access:

```powershell
kubectl port-forward service/linear-algebra-pro-server 3001:80
# Access at http://localhost:3001
```

#### LoadBalancer (External)
If your cluster supports LoadBalancer services, the service will get an external IP:

```powershell
kubectl get service linear-algebra-pro-server
# Use EXTERNAL-IP from output
```

#### Ingress (External with Domain)
Configure `k8s/ingress.yaml` with your domain and apply:

```powershell
kubectl apply -f k8s/ingress.yaml
kubectl get ingress
```

### Updates and Rollouts

```powershell
# Update image
kubectl set image deployment/linear-algebra-pro-server linear-algebra-pro-server=<new-image>:<new-tag>

# Check rollout status
kubectl rollout status deployment/linear-algebra-pro-server

# Rollback if needed
kubectl rollout undo deployment/linear-algebra-pro-server
```

### Cleanup

```powershell
# Remove all resources
kubectl delete -f k8s/

# Or remove individually
kubectl delete deployment linear-algebra-pro-server
kubectl delete service linear-algebra-pro-server
kubectl delete configmap linear-algebra-pro-server-config
```

## CI/CD Automation

Automate Docker image builds and deployments using GitHub Actions.

### Prerequisites
- GitHub repository
- Docker Hub (or other registry) account
- GitHub Secrets configured (see below)

### GitHub Actions Workflow

The workflow file `.github/workflows/docker-build.yml` automatically:
- Builds Docker image on push to main/master
- Tags with version and `:latest`
- Pushes to container registry
- Optional: Deploys to Kubernetes on version tags

### Setup Secrets

Configure GitHub Secrets in your repository settings:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add the following secrets:
   - `DOCKER_HUB_USERNAME` - Your Docker Hub username (e.g., `curiosityr0ver`)
   - `DOCKER_HUB_TOKEN` - Docker Hub access token (create at [hub.docker.com/settings/security](https://hub.docker.com/settings/security))

> **Note**: The workflow will push to `curiosityr0ver/linear-algebra-pro-server` when the `DOCKER_HUB_USERNAME` secret is set to `curiosityr0ver`.

### Workflow Triggers

- **On push to main/master**: Builds and pushes `:latest` tag
- **On version tags** (e.g., `v1.0.0`): Builds and pushes versioned tag + `:latest`
- **On pull requests**: Builds image for validation but does not push (requires secrets to be configured)

> **Note**: PRs from forks cannot access repository secrets for security reasons. The workflow will build but not push images for fork PRs, which is expected behavior.

### Manual Workflow Dispatch

Trigger workflows manually from GitHub Actions tab for testing.

### Customization

Edit `.github/workflows/docker-build.yml` to:
- Change registry (GCR, ECR, GitHub Container Registry)
- Add deployment steps (Kubernetes, cloud platforms)
- Modify build triggers
- Add additional test steps

### Local Testing

Test workflow locally using [act](https://github.com/nektos/act):

```powershell
# Install act (requires Docker)
# Then run workflow
act push
```

## Next Steps
- Explore cloud platform deployments (AWS ECS, Google Cloud Run, Azure Container Apps)
- Set up monitoring and logging (Prometheus, Grafana, ELK)
- Implement blue-green or canary deployment strategies
- Add automated testing in CI/CD pipeline

Contributions and proposals are welcome—open an issue or PR with deployment scenarios to document.

