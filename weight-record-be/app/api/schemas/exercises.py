from pydantic import BaseModel, Field


class ExerciseDTO(BaseModel):
    id: str = Field(..., description="Unique identifier for the exercise")
    name: str = Field(..., description="Name of the exercise")

    model_config = {
        "populate_by_name": True,
        
        "from_attributes": True, 
    }