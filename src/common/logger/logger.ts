export interface Logger {
  readonly alert: (message: string, context?: any) => void;
  readonly critical: (message: string, context?: any) => void;
  readonly debug: (message: string, context?: any) => void;
  readonly emergency: (message: string, context?: any) => void;
  readonly error: (message: string, context?: any) => void;
  readonly info: (message: string, context?: any) => void;
  readonly notice: (message: string, context?: any) => void;
  readonly warning: (message: string, context?: any) => void;
}
