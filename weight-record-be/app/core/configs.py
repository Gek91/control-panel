from pydantic_settings import BaseSettings
from functools import lru_cache
from pydantic import Field
import os
import toml
from pathlib import Path
from typing import Optional


def _load_toml_data():
  pyproject_toml_file = Path(__file__).parent.parent.parent / "pyproject.toml"
  if pyproject_toml_file.exists() and pyproject_toml_file.is_file():
    return toml.load(pyproject_toml_file)
  
def _get_version() :
  data = _load_toml_data()
  if "project" in data and "version" in data["project"]:
      return data["project"]["version"]
  return ""

def _get_description() : 
  data = _load_toml_data()
  if "project" in data and "description" in data["project"]:
      return data["project"]["description"]
  return ""

def _get_service_name():
  data = _load_toml_data()
  if "project" in data and "name" in data["project"]:
      return data["project"]["name"]
  return ""

def open_api_tags() -> list[dict[str, str]]:
  return []

class Configs(BaseSettings):
    env: str = Field(os.environ.get("ENVIRONMENT", "local"))
    port: int = os.environ.get('PORT', 8080)
    service_name: str = _get_service_name()
    description: str = _get_description()             
    version: str = _get_version()
    openapi_tags: list[dict[str, str]] = open_api_tags()
    docs_url: str = '/public/docs'
    redoc_url: str = '/public/redoc'
    open_api_url: str = '/openapi.yaml'
    logging_level: Optional[str] = os.environ.get('LOGGING_LEVEL', 'DEBUG')
    database_url: str = os.environ.get('DATABASE_URL', 'sqlite:///./test.db')



@lru_cache()
def get_configs() -> Configs:
  return Configs()
