from starlette.middleware import cors
from fastapi import FastAPI, HTTPException, Request, Response
import requests
from starlette import status
import traceback
from .logging import get_logger
from starlette.routing import Match
from starlette_context import context
from .database import get_local_session
from .configs import Configs

logger = get_logger()

async def handle_generic_exception(request: Request, configs: Configs, call_next):
  try:

    with get_local_session(configs.database_url).begin() as session:
      request.state.db_session = session #setup database session in request context
      response = await call_next(request)
  
  except requests.exceptions.HTTPError as e:
    response = e.response
  except Exception as e:
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    logger.exception(f"{request.method} {request.url} {status_code} : {repr(e)}", exc_info=False, stack_info=False)
    logger.debug({traceback.format_exc()})
    response = Response(content="A generic problem occured", status_code=500)
  
  return response
  
async def get_user_from_request(request: Request, call_next):
    #TODO: implement user id extraction from request headers and set it to context

    user_id = None
    #get user_id from JWT token

    context["user_id"] = user_id


    return await call_next(request)


async def log_before_request(request: Request, call_next):
  
    routes = request.app.router.routes
    params = ""
    for route in routes:
        match, scope = route.matches(request)
        if match == Match.FULL:
            params = " - ".join([f"{name}: {value}" for name, value in scope["path_params"].items()])

    if 'health' not in str(request.url): #exclude health check logs
        logger.debug(
        #f"###### {request.method} {request.url}{f' by user {user_id}' if user_id else ''}{f' with params: {params}' if params else ''}")
        f"###### {request.method} {request.url}{f' with params: {params}' if params else ''}")

    return await call_next(request)


async def filter_options_requests(request: Request, call_next):

  http_method = request.method
  if http_method == "OPTIONS":
    return cors.CORSMiddleware.preflight_response(request_headers=request.headers)
  return await call_next(request)  # Pass through other methods