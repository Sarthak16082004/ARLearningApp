export type AlphabetItem = {
  letter: string;
  word: string;
  image: any;
};

// NOTE: Add your images inside assets/alphabets/ folder.
// For letters without a dedicated image, we use a placeholder (null).
// The AlphabetOverlay gracefully handles null images.
export const ALPHABETS: AlphabetItem[] = [
  { letter: 'A', word: 'Apple', image: require('../../assets/apple.png') },
  { letter: 'B', word: 'Ball', image: require('../../assets/ball.png') },
  { letter: 'C', word: 'Cat', image: null },
  { letter: 'D', word: 'Dog', image: null },
  { letter: 'E', word: 'Elephant', image: null },
  { letter: 'F', word: 'Fish', image: null },
  { letter: 'G', word: 'Grapes', image: null },
  { letter: 'H', word: 'Hat', image: null },
  { letter: 'I', word: 'Ice Cream', image: null },
  { letter: 'J', word: 'Jar', image: null },
  { letter: 'K', word: 'Kite', image: null },
  { letter: 'L', word: 'Lion', image: null },
  { letter: 'M', word: 'Moon', image: null },
  { letter: 'N', word: 'Nest', image: null },
  { letter: 'O', word: 'Orange', image: null },
  { letter: 'P', word: 'Parrot', image: null },
  { letter: 'Q', word: 'Queen', image: null },
  { letter: 'R', word: 'Rabbit', image: null },
  { letter: 'S', word: 'Sun', image: null },
  { letter: 'T', word: 'Tiger', image: null },
  { letter: 'U', word: 'Umbrella', image: null },
  { letter: 'V', word: 'Violin', image: null },
  { letter: 'W', word: 'Whale', image: null },
  { letter: 'X', word: 'Xylophone', image: null },
  { letter: 'Y', word: 'Yak', image: null },
  { letter: 'Z', word: 'Zebra', image: null },
];
