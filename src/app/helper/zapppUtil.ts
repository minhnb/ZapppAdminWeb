export class ZapppUtil {
    static trimText(s: string): string {
        if (s) {
            return s.trim().replace(/\s+/g, ' ');
        }
        return s;
    }
}
