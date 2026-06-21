"""
Tortoise ORM configuration for Aerich migrations.
"""

import os
from typing import Any

TORTOISE_ORM: dict[str, Any] = {
  'connections': {
    'default': os.getenv('DATABASE_URL', 'sqlite://db.sqlite3')
  },
  'apps': {
    'models': {
      'models': ['models', 'aerich.models'],
      'default_connection': 'default',
    },
  },
}
