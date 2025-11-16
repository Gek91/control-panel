from fastapi import FastAPI, Request
from .core.configs import get_configs
from fastapi_swagger2 import FastAPISwagger2
from starlette.middleware.cors import CORSMiddleware
from .core.logging import get_logger
from .core.middleware import handle_generic_exception, log_before_request, filter_options_requests
from contextlib import asynccontextmanager
from .api.routers import healthz, exercises
from .core.database import get_engine
from sqlalchemy import text

@asynccontextmanager
async def lifespan(app: FastAPI):
    
    logger = get_logger()
    configs = get_configs()

    logger.debug('Application is starting up.')

    if configs.env == 'local':
        #init local database
        engine = get_engine(configs.database_url, echo=True)
        with engine.connect() as connection:
            with open('resources/schema.sql') as file:
                query = text(file.read())
                connection.execute(query)
            with open('resources/local_data.sql') as file:
                query = text(file.read())
                connection.execute(query)
            connection.commit()

    yield
    logger.debug("Application is shutting down.")


def _swagger_setup(app, config):
    app.open_api_url = config.open_api_url
    app.redoc_url = config.redoc_url
    app.docs_url = config.docs_url

    FastAPISwagger2(app, swagger2_tags=[{"App":"CopywrAIter"}])

#Execution order inverse to the order of declaration
def _middleware_setup(app, configs):

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"]
    )

    @app.middleware("http")
    async def handle_exceptions(request: Request, call_next):
        return await handle_generic_exception(request=request, configs=configs, call_next=call_next)
    
    @app.middleware("http")
    async def log_middleware(request: Request, call_next):
        return await log_before_request(request=request, call_next=call_next)
    
    @app.middleware("http")
    async def exclude_options(request: Request, call_next):
        return await filter_options_requests(request=request, call_next=call_next)

def main():

    configs = get_configs()

    local_execution = configs.env == 'local'

    #Logging
    app_logger = get_logger()

    app = FastAPI(
        title=configs.service_name, 
        description=f"{configs.env}-{configs.description}", 
        version=configs.version,
        openapi_tags=configs.openapi_tags,
        debug=local_execution,
        lifespan=lifespan
    )

    #Swagger 
    if local_execution:
        _swagger_setup(app, configs)

    #Middleware
    _middleware_setup(app, configs)
    
    #Router
    app.include_router(healthz.router)
    app.include_router(exercises.router)

    app_logger.debug('App Initialized.')

    return app

app = main()
