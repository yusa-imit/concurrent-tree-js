import Iterator from "./lib/Iterator";

const iterable = new Iterator<String>([])
console.log(iterable[Symbol.iterator]);