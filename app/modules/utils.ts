export function random(minRange: number, maxRange: number): number {
    return Math.floor((Math.random() * maxRange-minRange) + minRange);
}