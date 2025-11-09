# Deployment Guide

This document centralises deployment guidance for `linear-algebra-pro-server`. It currently focuses on Docker-based workflows and will grow to cover additional targets (Kubernetes, serverless, etc.).

## Table of Contents
- [Docker Quickstart](#docker-quickstart)
  - [Prerequisites](#prerequisites)
  - [Build the Image](#build-the-image)
  - [Run the Container](#run-the-container)
  - [Manage the Container](#manage-the-container)
  - [Test the API](#test-the-api)
  - [Environment Variables](#environment-variables)
  - [Troubleshooting](#troubleshooting)
- [Next Steps](#next-steps)

## Docker Quickstart

### Prerequisites
- Docker Desktop (Windows/macOS) or Docker Engine (Linux) installed and running.
- Terminal access (PowerShell, bash, etc.).

### Build the Image
Run from the project root:

```powershell
# Build using the provided multi-stage Dockerfile
docker build -t linear-algebra-pro-server:v1.0 .
```

> Tip: Use semantic tags (e.g., `v1.0`, `v1.1`) to make upgrades clearer.

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

## Next Steps
Future additions will cover:
- Publishing images to container registries.
- Kubernetes manifests and Helm charts.
- Deployments to platforms like AWS ECS, Google Cloud Run, or Azure Container Apps.
- Automation via CI/CD pipelines.

Contributions and proposals are welcome—open an issue or PR with deployment scenarios to document.

