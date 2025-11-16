from sqlalchemy.orm import Session
from ..models.exercise import Exercise

class ExerciseRepository:
    
   def __init__(self, session: Session):
        self.session = session


   def get_by_id(self, exercise_id: int):
      return (
         self.session
         .query(Exercise)
         .filter(Exercise.id == exercise_id)
         .first()
      )
   
   def list_all(self, limit: int = 100, offset: int = 0):
      return (
         self.session
         .query(Exercise)
         .offset(offset)
         .limit(limit)
         .all()
      )

