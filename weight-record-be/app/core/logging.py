
from logging import Logger
from .configs import get_configs, Configs
import logging
import sys


def get_logger() -> Logger:

    _configs: Configs = get_configs()

    app_logger = logging.getLogger(_configs.service_name)

    if not app_logger.handlers:

        format_message = '%(levelname)-8s- %(funcName)20s():%(lineno)4s- %(message)s'
        formatter = logging.Formatter(format_message)
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(formatter)

        app_logger.handlers = []
        app_logger.addHandler(handler) 
        handler.setLevel(logging._nameToLevel[_configs.logging_level])
        app_logger.setLevel(logging._nameToLevel[_configs.logging_level])

    return app_logger
