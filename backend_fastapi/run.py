import uvicorn

if __name__ == "__main__":
    print("====================================================")
    print("Starting TeamSync FastAPI Server at http://localhost:8000")
    print("Interactive Swagger Docs at http://localhost:8000/docs")
    print("Author: Batchu Mamatha")
    print("====================================================")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
