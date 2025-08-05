# MindCare App

**MindCare** is a simple Flask-based web application designed to help users track and manage their mental health. This app runs inside a Docker container for easy deployment.

## Features

* User-friendly interface for mental health check-ins
* RESTful API powered by Flask
* Runs inside a Docker container for easy portability

## Getting Started

### Prerequisites

* Docker installed on your machine
* Basic understanding of Docker commands

### Running the app locally with Docker

1. Clone the repository:

   ```bash
   git clone https://github.com/Aurore5-U/playing_with_API.git
   cd playing_with_API
   ```

2. Build the Docker image:

   ```bash
   docker build -t mindcare-app .
   ```

3. Run the container (maps container port 8080 to host port 5000):

   ```bash
   docker run -d -p 5000:8080 --name mindcare-container mindcare-app
   ```

4. Open your browser and go to:

   ```
   http://localhost:5000
   ```

## Stopping the app

```bash
docker stop mindcare-container
docker rm mindcare-container
```

## Troubleshooting

* If you get errors about the container name already in use, run:

  ```bash
  docker rm -f mindcare-container
  ```
* Ensure Docker daemon is running.
## creator's note
i wanted to create a user friednly which had a front-end and a backend but the time have not been my friend i may call this as my prototype but promise you to implement my idea in the times to come and i wish you to consider the thought and the work and evrything 
Thank you
## License

This project is open source and available under the MIT License.

---

