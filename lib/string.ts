

export function countWordsAndSentences(str: string) {
  let words = str.split(" ");
  let sentences = str.split(/[.!?]+/);
  return {
    words: words.length,
    sentences: sentences.length - 1,
  };
}
