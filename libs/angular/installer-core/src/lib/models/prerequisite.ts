export interface Prerequisite {
    name: string;
    runAsAdmin: boolean;
    installPhase: 'before' | 'after';
    size: number;
}
