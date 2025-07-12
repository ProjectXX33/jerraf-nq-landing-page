export enum Gender {
  MALE = 'ذكر',
  FEMALE = 'أنثى',
}

export enum AgeUnit {
    MONTHS = 'شهور',
    YEARS = 'سنوات',
}

export interface ChildData {
  name: string;
  gender: Gender;
  age: number;
  ageUnit: AgeUnit;
  weight: number;
  height: number;
}

export interface FormData {
  name: string;
  gender: Gender;
  age: string;
  ageUnit: AgeUnit;
  weight: string;
  height: string;
}

export type WeightStatus = 'نحافة' | 'وزن مثالي' | 'وزن زائد';
export type HeightStatus = 'قصير القامة' | 'طول طبيعي' | 'طويل القامة';

export interface ReportData {
  weightStatus: WeightStatus;
  heightStatus: HeightStatus;
  summary: string;
  recommendations: string[];
  disclaimer: string;
} 