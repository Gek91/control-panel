import { Exercise } from './exercise';

export interface Record {
    id: string;
    date: Date;
    exercise: Exercise;
    weight: number;
    percentage: number;
    max_value?: number | null

  }

  export interface PercentageValue {
    percentage : number;
    value : number
  }