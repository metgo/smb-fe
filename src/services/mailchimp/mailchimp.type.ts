export interface sendEmail {
    to: string;
    templatedId: string;
    mergeVars: any;
    text?: string;
}
