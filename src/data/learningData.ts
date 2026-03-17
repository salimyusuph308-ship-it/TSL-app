export interface Lesson {
  id: string;
  title: string;
  titleSwahili: string;
  category: 'greetings' | 'numbers' | 'family' | 'health' | 'school';
  signs: LearningSign[];
}

export interface LearningSign {
  id: string;
  word: string;
  wordSwahili: string;
  description: string;
  descriptionSwahili: string;
  facialExpression?: string;
  facialExpressionSwahili?: string;
  imageUrl: string;
  videoUrl?: string; // For slow motion demonstration
}

export const LEARNING_DATA: Lesson[] = [
  {
    id: 'l1',
    title: 'Greetings',
    titleSwahili: 'Salamu',
    category: 'greetings',
    signs: [
      {
        id: 's1',
        word: 'Hello',
        wordSwahili: 'Habari',
        description: 'A simple wave of the hand near the forehead.',
        descriptionSwahili: 'Wimbi rahisi la mkono karibu na paji la uso.',
        facialExpression: 'Wear a friendly, welcoming smile.',
        facialExpressionSwahili: 'Kuwa na tabasamu la kirafiki na la kukaribisha.',
        imageUrl: 'https://picsum.photos/seed/hello/400/400'
      },
      {
        id: 's2',
        word: 'Good morning',
        wordSwahili: 'Habari za asubuhi',
        description: 'Sign "Good" (hand from chin) then "Morning" (arm rising like sun).',
        descriptionSwahili: 'Weka ishara ya "Nzuri" (mkono kutoka kidevu) kisha "Asubuhi" (mkono ukipanda kama jua).',
        facialExpression: 'Bright eyes and a gentle smile to show a fresh start.',
        facialExpressionSwahili: 'Macho angavu na tabasamu la upole kuonyesha mwanzo mpya.',
        imageUrl: 'https://picsum.photos/seed/goodmorning/400/400'
      },
      {
        id: 's3',
        word: 'Thank you',
        wordSwahili: 'Asante',
        description: 'Move your flat hand from your chin towards the person.',
        descriptionSwahili: 'Sogeza mkono wako bapa kutoka kwenye kidevu chako kuelekea kwa mtu huyo.',
        facialExpression: 'A sincere smile and a slight nod of the head.',
        facialExpressionSwahili: 'Tabasamu la dhati na kutikisa kichwa kidogo.',
        imageUrl: 'https://picsum.photos/seed/thanks/400/400'
      }
    ]
  },
  {
    id: 'l2',
    title: 'Numbers',
    titleSwahili: 'Namba',
    category: 'numbers',
    signs: [
      {
        id: 'n1',
        word: 'One',
        wordSwahili: 'Moja',
        description: 'Hold up your index finger.',
        descriptionSwahili: 'Inua kidole chako cha shahada.',
        imageUrl: 'https://picsum.photos/seed/one/400/400'
      },
      {
        id: 'n2',
        word: 'Two',
        wordSwahili: 'Mbili',
        description: 'Hold up your index and middle fingers.',
        descriptionSwahili: 'Inua vidole vyako vya shahada na vya kati.',
        imageUrl: 'https://picsum.photos/seed/two/400/400'
      },
      {
        id: 'n3',
        word: 'Three',
        wordSwahili: 'Tatu',
        description: 'Hold up your thumb, index, and middle fingers.',
        descriptionSwahili: 'Inua kidole gumba, cha shahada, na cha kati.',
        imageUrl: 'https://picsum.photos/seed/three/400/400'
      }
    ]
  },
  {
    id: 'l3',
    title: 'Family',
    titleSwahili: 'Familia',
    category: 'family',
    signs: [
      {
        id: 'f1',
        word: 'Mother',
        wordSwahili: 'Mama',
        description: 'Tap your thumb against your chin with an open hand.',
        descriptionSwahili: 'Gonga kidole gumba chako dhidi ya kidevu chako kwa mkono wazi.',
        imageUrl: 'https://picsum.photos/seed/mother/400/400'
      },
      {
        id: 'f2',
        word: 'Father',
        wordSwahili: 'Baba',
        description: 'Tap your thumb against your forehead with an open hand.',
        descriptionSwahili: 'Gonga kidole gumba chako dhidi ya paji la uso wako kwa mkono wazi.',
        imageUrl: 'https://picsum.photos/seed/father/400/400'
      }
    ]
  },
  {
    id: 'l4',
    title: 'School',
    titleSwahili: 'Shule',
    category: 'school',
    signs: [
      {
        id: 'sc1',
        word: 'Teacher',
        wordSwahili: 'Mwalimu',
        description: 'Mime taking information from your head and giving it out, then sign "Person".',
        descriptionSwahili: 'Igiza kuchukua habari kutoka kichwani mwako na kuitoa, kisha weka ishara ya "Mtu".',
        imageUrl: 'https://picsum.photos/seed/teacher/400/400'
      },
      {
        id: 'sc2',
        word: 'Book',
        wordSwahili: 'Kitabu',
        description: 'Open and close your hands like a book.',
        descriptionSwahili: 'Fungua na ufunge mikono yako kama kitabu.',
        imageUrl: 'https://picsum.photos/seed/book/400/400'
      }
    ]
  },
  {
    id: 'l5',
    title: 'Health',
    titleSwahili: 'Afya',
    category: 'health',
    signs: [
      {
        id: 'h1',
        word: 'Doctor',
        wordSwahili: 'Daktari',
        description: 'Tap your wrist with two fingers (like checking a pulse).',
        descriptionSwahili: 'Gonga mkono wako kwa vidole viwili (kama unakagua mapigo ya moyo).',
        facialExpression: 'Maintain a calm and attentive expression.',
        facialExpressionSwahili: 'Weka usemi wa utulivu na usikivu.',
        imageUrl: 'https://picsum.photos/seed/doctor/400/400'
      },
      {
        id: 'h2',
        word: 'Medicine',
        wordSwahili: 'Dawa',
        description: 'Mime taking a pill or drinking liquid medicine.',
        descriptionSwahili: 'Igiza kumeza kidonge au kunywa dawa ya maji.',
        facialExpression: 'Neutral expression, or a slight grimace if the medicine is "bitter".',
        facialExpressionSwahili: 'Usemi wa upande wowote, au kukunja uso kidogo ikiwa dawa ni "chungu".',
        imageUrl: 'https://picsum.photos/seed/medicine/400/400'
      }
    ]
  },
  {
    id: 'l6',
    title: 'Emotions',
    titleSwahili: 'Hisia',
    category: 'health',
    signs: [
      {
        id: 'e1',
        word: 'Happy',
        wordSwahili: 'Furaha',
        description: 'Move your flat hands in circles near your chest.',
        descriptionSwahili: 'Sogeza mikono yako bapa kwa duara karibu na kifua chako.',
        facialExpression: 'Wide smile, bright eyes, and raised eyebrows.',
        facialExpressionSwahili: 'Tabasamu pana, macho angavu, na nyusi zilizoinuliwa.',
        imageUrl: 'https://picsum.photos/seed/happy/400/400'
      },
      {
        id: 'e2',
        word: 'Sad',
        wordSwahili: 'Huzuni',
        description: 'Move your hand down your face with fingers spread.',
        descriptionSwahili: 'Sogeza mkono wako chini ya uso wako huku vidole vikiwa vimechanuliwa.',
        facialExpression: 'Downcast eyes, drooping mouth, and a heavy expression.',
        facialExpressionSwahili: 'Macho yaliyoinama, mdomo uliolamaa, na usemi mzito.',
        imageUrl: 'https://picsum.photos/seed/sad/400/400'
      },
      {
        id: 'e3',
        word: 'Pain',
        wordSwahili: 'Maumivu',
        description: 'Twist your index fingers towards each other near the area that hurts.',
        descriptionSwahili: 'Zungusha vidole vyako vya shahada kuelekeana karibu na eneo linalouma.',
        facialExpression: 'Grimace, squinted eyes, and tensed facial muscles to show discomfort.',
        facialExpressionSwahili: 'Kukunja uso, macho yaliyofinywa, na misuli ya uso iliyokaza kuonyesha usumbufu.',
        imageUrl: 'https://picsum.photos/seed/pain/400/400'
      }
    ]
  }
];
