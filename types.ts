export interface FileData {
  name: string;
  content: string;
}

export enum EditorStatus {
  IDLE = 'PRONTO',
  SAVING = 'SALVANDO...',
  LOADING = 'CARREGANDO...',
  AI_THINKING = 'IA PENSANDO...',
  ERROR = 'ERRO'
}
