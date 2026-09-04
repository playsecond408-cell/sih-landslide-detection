@echo off
title Landslide ML Backend Server
echo ===================================================
echo Starting FastAPI Machine Learning Backend...
echo ===================================================
cd backend
set OPENBLAS_NUM_THREADS=1
set OMP_NUM_THREADS=1
uvicorn main:app --reload --host 0.0.0.0 --port 8000
pause
