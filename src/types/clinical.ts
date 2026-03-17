export type BodySystem = 'CNS' | 'CVS' | 'Respiratory' | 'GU' | 'MSK' | 'Skin';

export interface SocratesData {
  site: string;
  onset: string;
  character: string;
  radiation: string;
  associations: string[];
  time: string;
  exacerbating: string;
  severity: number;
}

export interface PediatricHistory {
  birthWeight?: string;
  immunizationStatus?: string;
  milestones?: string;
}

export interface VitalSigns {
  temperature?: number;
  heartRate?: number;
  respiratoryRate?: number;
  bloodPressure?: string;
  spo2?: number;
}

export interface ClinicalState {
  age: number;
  gender?: 'Male' | 'Female' | 'Other';
  allergies?: string;
  medications?: string;
  system: BodySystem | null;
  symptoms: string[];
  vitals?: VitalSigns;
  socrates?: SocratesData;
  pediatric?: PediatricHistory;
  exam: {
    donpara: Record<string, boolean>;
    systemSpecific: Record<string, any>;
  };
  step: number;
}

export const DONPARA_LABELS = {
  D: 'Dehydration',
  O: 'Oedema',
  N: 'Nutrition',
  P: 'Pallor',
  A: 'Appetite/Alertness',
  R: 'Respiration',
  A2: 'Anemia/Jaundice'
};

export const DONPARA_SW = {
  D: 'Upungufu wa maji',
  O: 'Kuvimba (Oedema)',
  N: 'Lishe',
  P: 'Ufubao (Pallor)',
  A: 'Uchangamfu',
  R: 'Upumuaji',
  A2: 'Upungufu wa damu/Njano'
};
