# Disease Predictor

This project aims to predict disease risk based on DNA sequences using a combination of a Python-based API backend and a JavaScript-based React frontend.

## Key Features & Benefits

*   **DNA-based Risk Prediction:** Predicts disease risks based on input DNA sequences.
*   **User-Friendly Interface:** Provides a clean and intuitive React-based frontend for easy interaction.
*   **Scalable Architecture:** Dockerized application for easy deployment and scalability.
*   **RESTful API:** Offers a well-defined REST API for interacting with the prediction model.

## Prerequisites & Dependencies

Before you begin, ensure you have the following installed:

*   **Docker:**  Required for containerization and deployment.  Download from [Docker](https://www.docker.com/).
*   **Node.js:**  Required for running the frontend. Version 20 or higher is recommended. Download from [Node.js](https://nodejs.org/).
*   **npm:**  Node Package Manager (comes with Node.js).
*   **Python:**  Version 3.13 or higher. Download from [Python](https://www.python.org/).
*   **pip:** Python Package Installer (comes with Python).
*   **Virtualenv (optional):** For creating isolated Python environments.

## Installation & Setup Instructions

Follow these steps to set up the project:

1.  **Clone the Repository:**

    ```bash
    git clone https://github.com/saumy-a/Disease-Predictor-low.git
    cd Disease-Predictor-low
    ```

2.  **Build and Run with Docker (Recommended):**

    ```bash
    docker build -t disease-predictor .
    docker run -p 8080:8080 disease-predictor
    ```

    This command builds the Docker image and runs the container, exposing the application on port 8080.

3.  **Alternatively, set up the Frontend and Backend manually:**

    a.  **Frontend Setup:**

    ```bash
    cd frontend
    npm install
    npm run build
    cd ..
    ```

    b.  **Backend Setup:**

    ```bash
    # Create a virtual environment (optional)
    python -m venv venv
    source venv/bin/activate  # On Linux/macOS
    # venv\Scripts\activate  # On Windows

    pip install -r requirements.txt # if you had any requirements.txt file
    pip install fastapi uvicorn pandas joblib
    ```

    c.  **Run the API:**

    ```bash
    uvicorn api:app --reload --host 0.0.0.0 --port 8080
    ```

## Usage Examples & API Documentation

*   **Accessing the Frontend:**

    Once the application is running, access the frontend in your web browser at `http://localhost:8080`.

*   **API Endpoints:**

    The API provides the following endpoints:

    *   `GET /`:  Serves the static frontend files.
    *   `POST /predict`:  Takes DNA sequence as input and returns the disease risk prediction.

    *Example `POST /predict` request:*

    ```json
    {
      "dna_sequence": "ATGC..."
    }
    ```

## Configuration Options

*   **Port Configuration:**

    The application runs on port 8080 by default. This can be configured by setting the `PORT` environment variable within the Dockerfile or when running the `uvicorn` command.

*   **Model Path:**

    The path to the trained model is defined in `api.py` as `MODEL_PATH`.  You can modify this if your model is stored in a different location.

## Contributing Guidelines

Contributions are welcome!  Here's how you can contribute:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes and commit them with clear, descriptive commit messages.
4.  Submit a pull request to the main branch.

## License Information

No license specified. Copyright belongs to the repository owner, saumy-a. All rights reserved.

## Acknowledgments

*   This project utilizes the [FastAPI](https://fastapi.tiangolo.com/) framework for the backend API.
*   The frontend is built with [React](https://reactjs.org/) and [Vite](https://vitejs.dev/).
