---
sidebar_position: 1
---

# How to config Redis in Windows?


### Step 1: Download and Install Docker

1. Go to the Docker website (https://www.docker.com/products/docker-desktop) and download Docker Desktop for Windows.
2. Run the downloaded installer and follow the installation instructions.
3. Once installed, Docker Desktop will start automatically.

### Step 2: Pull the Redis Image

1. Open Command Prompt or PowerShell.
2. To pull the official Redis image from Docker Hub, run the following command:
   ```
   docker pull redis
   ```
   This will download the latest Redis image from Docker Hub to your local machine.

### Step 3: Run the Redis Container

1. After the image is downloaded, you can run a Redis container using the following command:
   ```
   docker run --name my-redis -d -p 6379:6379 redis
   ```
   - `--name my-redis`: Specifies a name for the container (you can choose any name).
   - `-d`: Runs the container in detached mode (in the background).
   - `-p 6379:6379`: Maps port 6379 of the host machine to port 6379 of the container.
   - `redis`: Specifies the name of the image to use for creating the container.

### Step 4: Open Command Prompt for Redis

1. Open another Command Prompt window.
2. To open a command prompt inside the Redis container, run the following command:
   ```
   docker exec -it my-redis redis-cli
   ```
   - `-it`: Allocates a pseudo-TTY and keeps STDIN open, allowing you to interact with the container.
   - `my-redis`: The name of the Redis container you created earlier.
   - `redis-cli`: The command-line interface for Redis.

### Step 5: Interact with Redis

1. You should now be inside the Redis container's command-line interface.
2. You can run Redis commands directly in this command prompt. For example:
   - Set a key-value pair:
     ```
     set mykey "Hello, Redis!"
     ```
   - Retrieve the value by key:
     ```
     get mykey
     ```

That's it! You have now downloaded Docker, pulled the Redis image, run a Redis container, and opened a command prompt to interact with Redis running inside the container.