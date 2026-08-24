from __future__ import annotations


class NotFoundError(Exception):
    """Raised when a get-by-id lookup finds no entity."""

    def __init__(self, resource: str, resource_id: str):
        self.resource = resource
        self.resource_id = resource_id
        self.message = f"{resource} not found"
        super().__init__(self.message)
