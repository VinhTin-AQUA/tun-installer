export interface Prerequisite {
    name: string;
    runAsAdmin: boolean;
    installPhase: 'Before' | 'After';
    size: number;
}
