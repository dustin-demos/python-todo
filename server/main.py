"""
FastAPI Todo application with Tortoise ORM.

This module contains a simple Todo API with CRUD operations using FastAPI
and Tortoise ORM. Provides endpoints for creating, reading, updating, and deleting Todo items.
"""

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from tortoise.contrib.fastapi import register_tortoise

from config import TORTOISE_ORM
from features.health.health_router import router as health_router
from features.todo.todo_router import router as todo_router

app = FastAPI(title='Python Todo API', version='0.1.0')

if not os.getenv('TESTING'):
  register_tortoise(
    app,
    config=TORTOISE_ORM,
    # The demo runs on SQLite with no migration step, so create the tables on startup.
    generate_schemas=True,
    add_exception_handlers=True,
  )


def get_cors_origins():
  """Get CORS origins based on environment (Fly.io or local)."""

  if os.getenv('FLY_APP_NAME'):
    return ['https://python-todo.fly.dev']

  return [
    'http://localhost:5001',
    'http://127.0.0.1:5001',
    'http://localhost:8000',
    'http://127.0.0.1:8000',
  ]


app.add_middleware(
  CORSMiddleware,
  allow_origins=get_cors_origins(),
  allow_credentials=True,
  allow_methods=['*'],
  allow_headers=['*'],
)

app.include_router(health_router, prefix='/health')
app.include_router(todo_router, prefix='/todo')

app.mount('/', StaticFiles(directory='dist', html=True), name='static')
