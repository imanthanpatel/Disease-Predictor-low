# Disease Predictor

A web application to predict disease risk based on DNA sequences using a machine learning backend and a modern React frontend.

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge&logo=vercel)](https://disease-predictor-low.onrender.com)

## Key Features & Benefits

- **DNA-based Risk Prediction:** Predicts disease risks from input DNA sequence features.
- **User-Friendly Interface:** Clean, intuitive React UI for easy interaction.
- **Scalable Architecture:** Fully dockerized; easily deployable and scalable.
- **RESTful API:** Well-defined endpoints for integration and automation.

## Prerequisites & Dependencies

Ensure you have the following installed:

- **Docker:** For containerization and deployment ([Docker](https://www.docker.com/)).
- **Node.js (v20+):** For frontend development ([Node.js](https://nodejs.org/)).
- **npm:** Node Package Manager.
- **Python (v3.13+):** For backend and model ([Python](https://www.python.org/)).
- **pip:** Python package installer.
- **Virtualenv (optional):** For isolated Python environments.

## Installation & Setup Instructions

### Clone the Repository

```bash
git clone https://github.com/saumy-a/Disease-Predictor-low.git
cd Disease-Predictor-low
```

### Build and Run with Docker (Recommended)

```bash
docker build -t disease-predictor .
docker run -p 8080:8080 disease-predictor
```
Access the application at [http://localhost:8080](http://localhost:8080).

### Manual Setup (Frontend & Backend separately)

#### Frontend

```bash
cd frontend
npm install
npm run build
cd ..
```

#### Backend

```bash
# Create and activate virtual environment (optional)
python -m venv venv
source venv/bin/activate  # On Linux/macOS
# venv\Scripts\activate   # On Windows

pip install -r requirements.txt
pip install fastapi uvicorn pandas joblib
```

#### Run the API

```bash
uvicorn api:app --reload --host 0.0.0.0 --port 8080
```

## Usage Examples & API Documentation

- **Frontend:** Visit [http://localhost:8080](http://localhost:8080).
- **API Endpoints:**
  - `GET /` — Serves frontend.
  - `POST /predict` — Accepts DNA sequence features, returns risk prediction.

Example request to `/predict`:

```json
{
  "GC_Content": 51.2,
  "AT_Content": 48.8,
  "Num_A": 12,
  "Num_T": 15,
  "Num_C": 10,
  "Num_G": 13,
  "kmer_3_freq": 0.167,
  "Mutation_Flag": 1,
  "Class_Label": 2
}
```

## Configuration Options

- **Port:** Default is `8080`, configurable via `PORT` env variable.
- **Model Path:** Defined in `api.py` as `MODEL_PATH`. Change if needed.

## How it Works

- The backend uses a Random Forest classifier trained on curated DNA feature data (`dna.csv`), with preprocessing and categorical mapping.
- The model predicts probabilistic disease risk from input features.
- Features and target are visible via the `/meta` endpoint.

## Contributing Guidelines

1. Fork the repository.
2. Create a feature/bugfix branch.
3. Make changes and commit with descriptive messages.
4. Submit a pull request to `main`.

## License

No license specified. Copyright belongs to the repository owner, saumy-a.

## Acknowledgments

- Built with [FastAPI](https://fastapi.tiangolo.com/) backend.
- Frontend uses [React](https://reactjs.org/) and [Vite](https://vitejs.dev/).
