export function CompareTo(s1: string, s2: string): number {
  if (s1 === s2) return 0;
  if (s1.length === 0 || s2.length === 0) return s1.length - s2.length;
  let c = 0;
  while (c < s1.length && c < s2.length) {
    if (s1[c] !== s2[c]) break;
    c++;
  }
  if (c + 1 === s1.length || c + 1 === s2.length) {
    return s1.length - s2.length;
  } else {
    return s1.charCodeAt(c) - s2.charCodeAt(c);
  }
}
