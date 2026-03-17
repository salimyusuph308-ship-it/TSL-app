export interface DictionaryEntry {
  id: string;
  word: string;
  wordSwahili: string;
  category: 'health' | 'school' | 'farming' | 'market' | 'general' | 'emergency' | 'legal' | 'alphabet';
  description: string;
  descriptionSwahili: string;
  facialExpression?: string;
  facialExpressionSwahili?: string;
  imageUrl: string;
  priorityLevel?: 'low' | 'medium' | 'high' | 'critical';
  videoUrlLocal?: string;
  videoUrlCdn?: string;
  relatedSigns?: string[];
  chavitaVerified?: boolean;
  dateVerified?: string;
}

export const DICTIONARY_DATA: DictionaryEntry[] = [
  // Emergency
  {
    id: 'TSL_MED_004',
    word: 'Chest Pain',
    wordSwahili: 'Chest Pain',
    category: 'emergency',
    priorityLevel: 'critical',
    description: 'Press your flat hand firmly against the center of your chest with a pained facial expression.',
    descriptionSwahili: 'Bonyeza mkono wako bapa kwa nguvu katikati ya kifua chako huku ukiwa na usemi wa maumivu usoni.',
    videoUrlLocal: 'videos/tsl_chest_pain_360p.webm',
    videoUrlCdn: 'https://cdn.nishauri.tz/videos/tsl_chest_pain_720p.mp4',
    relatedSigns: ['heart_attack', 'short_breath', 'sweating'],
    chavitaVerified: true,
    dateVerified: '2026-03-01',
    imageUrl: 'https://picsum.photos/seed/chest-pain/400/400'
  },
  {
    id: 'e1',
    word: 'Help',
    wordSwahili: 'Msaada',
    category: 'emergency',
    description: 'Place your closed fist (thumb up) on your other flat palm and move both up together.',
    descriptionSwahili: 'Weka ngumi yako iliyofungwa (kidole gumba juu) kwenye kiganja chako kingine bapa na usogeze vyote juu pamoja.',
    imageUrl: 'https://picsum.photos/seed/help/400/400'
  },
  {
    id: 'e2',
    word: 'Police',
    wordSwahili: 'Polisi',
    category: 'emergency',
    description: 'Tap your chest twice with a "C" hand shape, like a badge.',
    descriptionSwahili: 'Gonga kifua chako mara mbili kwa umbo la mkono wa "C", kama beji.',
    imageUrl: 'https://picsum.photos/seed/police/400/400'
  },
  {
    id: 'e3',
    word: 'Hospital',
    wordSwahili: 'Hospitali',
    category: 'emergency',
    description: 'Draw a cross on your upper arm with your index and middle fingers.',
    descriptionSwahili: 'Chora msalaba kwenye mkono wako wa juu kwa vidole vyako vya shahada na vya kati.',
    imageUrl: 'https://picsum.photos/seed/hospital/400/400'
  },
  {
    id: 'e4',
    word: 'Danger',
    wordSwahili: 'Hatari',
    category: 'emergency',
    description: 'Thumb of "A" hand taps the back of the other hand twice, moving upwards.',
    descriptionSwahili: 'Kidole gumba cha mkono wa "A" kinagonga nyuma ya mkono mwingine mara mbili, kikisogea juu.',
    imageUrl: 'https://picsum.photos/seed/danger/400/400'
  },
  // Legal
  {
    id: 'l1',
    word: 'Lawyer',
    wordSwahili: 'Wakili',
    category: 'legal',
    description: 'Move an "L" hand shape down your other flat palm, then add the "person" sign.',
    descriptionSwahili: 'Sogeza umbo la mkono wa "L" chini ya kiganja chako kingine bapa, kisha ongeza ishara ya "mtu".',
    imageUrl: 'https://picsum.photos/seed/lawyer/400/400'
  },
  {
    id: 'l2',
    word: 'Court',
    wordSwahili: 'Mahakama',
    category: 'legal',
    description: 'Move both "F" hand shapes up and down alternately, like scales of justice.',
    descriptionSwahili: 'Sogeza maumbo yote mawili ya mkono wa "F" juu na chini kwa kupokezana, kama mizani ya haki.',
    imageUrl: 'https://picsum.photos/seed/court/400/400'
  },
  {
    id: 'l3',
    word: 'Witness',
    wordSwahili: 'Shahidi',
    category: 'legal',
    description: 'Point to your eye, then point forward.',
    descriptionSwahili: 'Elekeza kwenye jicho lako, kisha elekeza mbele.',
    imageUrl: 'https://picsum.photos/seed/witness/400/400'
  },
  {
    id: 'l4',
    word: 'Contract',
    wordSwahili: 'Mkataba',
    category: 'legal',
    description: 'Touch your index finger to your palm, then move it as if signing a paper.',
    descriptionSwahili: 'Gusa kidole chako cha shahada kwenye kiganja chako, kisha ukisogeze kana kwamba unasaini karatasi.',
    imageUrl: 'https://picsum.photos/seed/contract/400/400'
  },
  // Health
  {
    id: 'h1',
    word: 'Doctor',
    wordSwahili: 'Daktari',
    category: 'health',
    description: 'Tap your wrist with two fingers, like checking a pulse.',
    descriptionSwahili: 'Gonga mkono wako kwa vidole viwili, kama unakagua mapigo ya moyo.',
    imageUrl: 'https://picsum.photos/seed/doctor/400/400'
  },
  {
    id: 'h2',
    word: 'Medicine',
    wordSwahili: 'Dawa',
    category: 'health',
    description: 'Circle your middle finger over your palm.',
    descriptionSwahili: 'Zungusha kidole chako cha kati juu ya kiganja chako.',
    imageUrl: 'https://picsum.photos/seed/medicine/400/400'
  },
  {
    id: 'h3',
    word: 'Pain',
    wordSwahili: 'Maumivu',
    category: 'health',
    description: 'Twist your index fingers towards each other near the area that hurts.',
    descriptionSwahili: 'Zungusha vidole vyako vya shahada kuelekeana karibu na eneo linalouma.',
    imageUrl: 'https://picsum.photos/seed/pain/400/400'
  },
  // School
  {
    id: 's1',
    word: 'Book',
    wordSwahili: 'Kitabu',
    category: 'school',
    description: 'Open your hands like opening a book.',
    descriptionSwahili: 'Fungua mikono yako kama unafungua kitabu.',
    imageUrl: 'https://picsum.photos/seed/book/400/400'
  },
  {
    id: 's2',
    word: 'Teacher',
    wordSwahili: 'Mwalimu',
    category: 'school',
    description: 'Flattened O-hands move from forehead forward, then flat hands move down for "person".',
    descriptionSwahili: 'Mikono iliyonyooka ya O inasogea kutoka kwenye paji la uso kwenda mbele, kisha mikono bapa inasogea chini kwa ajili ya "mtu".',
    imageUrl: 'https://picsum.photos/seed/teacher/400/400'
  },
  // Farming
  {
    id: 'f1',
    word: 'Water',
    wordSwahili: 'Maji',
    category: 'farming',
    description: 'Tap your chin with your index finger of a "W" hand shape.',
    descriptionSwahili: 'Gonga kidevu chako kwa kidole cha shahada cha umbo la mkono wa "W".',
    imageUrl: 'https://picsum.photos/seed/water/400/400'
  },
  {
    id: 'f2',
    word: 'Plant',
    wordSwahili: 'Mmea',
    category: 'farming',
    description: 'Move your hand up through your other hand, opening fingers like a growing sprout.',
    descriptionSwahili: 'Sogeza mkono wako juu kupitia mkono wako mwingine, ukifungua vidole kama chipukizi linalokua.',
    imageUrl: 'https://picsum.photos/seed/plant/400/400'
  },
  // Market
  {
    id: 'm1',
    word: 'Buy',
    wordSwahili: 'Nunua',
    category: 'market',
    description: 'Hand moves forward from palm as if giving money.',
    descriptionSwahili: 'Mkono unasogea mbele kutoka kwenye kiganja kana kwamba unatoa pesa.',
    imageUrl: 'https://picsum.photos/seed/buy/400/400'
  },
  {
    id: 'm2',
    word: 'Price',
    wordSwahili: 'Bei',
    category: 'market',
    description: 'Flick your index finger against your thumb.',
    descriptionSwahili: 'Piga kidole chako cha shahada dhidi ya kidole gumba chako.',
    imageUrl: 'https://picsum.photos/seed/price/400/400'
  },
  // Alphabet & Vowels
  {
    id: 'a1',
    word: 'A',
    wordSwahili: 'A',
    category: 'alphabet',
    description: 'Make a fist with the thumb resting against the side of the index finger.',
    descriptionSwahili: 'Kunja ngumi huku kidole gumba kikiwa kimeegemea upande wa kidole cha shahada.',
    facialExpression: 'Neutral expression.',
    facialExpressionSwahili: 'Usemi wa kawaida.',
    imageUrl: 'https://picsum.photos/seed/sign-a/400/400'
  },
  {
    id: 'a2',
    word: 'B',
    wordSwahili: 'B',
    category: 'alphabet',
    description: 'Hold up all four fingers together with the thumb tucked across the palm.',
    descriptionSwahili: 'Inua vidole vyote vinne pamoja huku kidole gumba kikiwa kimeingizwa kwenye kiganja.',
    imageUrl: 'https://picsum.photos/seed/sign-b/400/400'
  },
  {
    id: 'a3',
    word: 'C',
    wordSwahili: 'C',
    category: 'alphabet',
    description: 'Curve all fingers and the thumb into a "C" shape.',
    descriptionSwahili: 'Kunja vidole vyote na kidole gumba kuwa umbo la "C".',
    imageUrl: 'https://picsum.photos/seed/sign-c/400/400'
  },
  {
    id: 'a4',
    word: 'D',
    wordSwahili: 'D',
    category: 'alphabet',
    description: 'Hold up the index finger while the other fingers and thumb form a circle.',
    descriptionSwahili: 'Inua kidole cha shahada huku vidole vingine na kidole gumba vikitengeneza duara.',
    imageUrl: 'https://picsum.photos/seed/sign-d/400/400'
  },
  {
    id: 'a5',
    word: 'E',
    wordSwahili: 'E',
    category: 'alphabet',
    description: 'Curl all fingers in, with the thumb tucked under the fingers.',
    descriptionSwahili: 'Kunja vidole vyote ndani, huku kidole gumba kikiwa kimeingizwa chini ya vidole.',
    imageUrl: 'https://picsum.photos/seed/sign-e/400/400'
  },
  {
    id: 'a6',
    word: 'F',
    wordSwahili: 'F',
    category: 'alphabet',
    description: 'Touch the tip of your index finger to the tip of your thumb, while keeping the other three fingers upright.',
    descriptionSwahili: 'Gusa ncha ya kidole chako cha shahada kwenye ncha ya kidole gumba chako, huku ukiweka vidole vingine vitatu wima.',
    imageUrl: 'https://picsum.photos/seed/sign-f/400/400'
  },
  {
    id: 'a7',
    word: 'G',
    wordSwahili: 'G',
    category: 'alphabet',
    description: 'Extend the index finger and thumb parallel to each other, like you are measuring something small.',
    descriptionSwahili: 'Nyoosha kidole cha shahada na kidole gumba sambamba, kama unapima kitu kidogo.',
    imageUrl: 'https://picsum.photos/seed/sign-g/400/400'
  },
  {
    id: 'a8',
    word: 'H',
    wordSwahili: 'H',
    category: 'alphabet',
    description: 'Extend the index and middle fingers together horizontally.',
    descriptionSwahili: 'Nyoosha vidole vya shahada na vya kati pamoja kwa mlalo.',
    imageUrl: 'https://picsum.photos/seed/sign-h/400/400'
  },
  {
    id: 'a9',
    word: 'I',
    wordSwahili: 'I',
    category: 'alphabet',
    description: 'Hold up only the pinky finger.',
    descriptionSwahili: 'Inua kidole kidogo pekee.',
    imageUrl: 'https://picsum.photos/seed/sign-i/400/400'
  },
  {
    id: 'a10',
    word: 'J',
    wordSwahili: 'J',
    category: 'alphabet',
    description: 'Hold up the pinky finger and draw a "J" shape in the air.',
    descriptionSwahili: 'Inua kidole kidogo na uchore umbo la "J" hewani.',
    imageUrl: 'https://picsum.photos/seed/sign-j/400/400'
  },
  {
    id: 'a11',
    word: 'K',
    wordSwahili: 'K',
    category: 'alphabet',
    description: 'Extend the index and middle fingers up, with the thumb touching the middle of the middle finger.',
    descriptionSwahili: 'Nyoosha vidole vya shahada na vya kati juu, huku kidole gumba kikigusa katikati ya kidole cha kati.',
    imageUrl: 'https://picsum.photos/seed/sign-k/400/400'
  },
  {
    id: 'a12',
    word: 'L',
    wordSwahili: 'L',
    category: 'alphabet',
    description: 'Extend the index finger up and the thumb out to form an "L" shape.',
    descriptionSwahili: 'Nyoosha kidole cha shahada juu na kidole gumba nje ili kutengeneza umbo la "L".',
    imageUrl: 'https://picsum.photos/seed/sign-l/400/400'
  },
  {
    id: 'a13',
    word: 'M',
    wordSwahili: 'M',
    category: 'alphabet',
    description: 'Tuck the thumb under the first three fingers.',
    descriptionSwahili: 'Ingiza kidole gumba chini ya vidole vitatu vya kwanza.',
    imageUrl: 'https://picsum.photos/seed/sign-m/400/400'
  },
  {
    id: 'a14',
    word: 'N',
    wordSwahili: 'N',
    category: 'alphabet',
    description: 'Tuck the thumb under the first two fingers.',
    descriptionSwahili: 'Ingiza kidole gumba chini ya vidole viwili vya kwanza.',
    imageUrl: 'https://picsum.photos/seed/sign-n/400/400'
  },
  {
    id: 'a15',
    word: 'O',
    wordSwahili: 'O',
    category: 'alphabet',
    description: 'Form a circle with all fingers and the thumb.',
    descriptionSwahili: 'Tengeneza duara kwa vidole vyote na kidole gumba.',
    imageUrl: 'https://picsum.photos/seed/sign-o/400/400'
  },
  {
    id: 'a16',
    word: 'P',
    wordSwahili: 'P',
    category: 'alphabet',
    description: 'Like the "K" sign but pointing downwards.',
    descriptionSwahili: 'Kama ishara ya "K" lakini inayoelekea chini.',
    imageUrl: 'https://picsum.photos/seed/sign-p/400/400'
  },
  {
    id: 'a17',
    word: 'Q',
    wordSwahili: 'Q',
    category: 'alphabet',
    description: 'Like the "G" sign but pointing downwards.',
    descriptionSwahili: 'Kama ishara ya "G" lakini inayoelekea chini.',
    imageUrl: 'https://picsum.photos/seed/sign-q/400/400'
  },
  {
    id: 'a18',
    word: 'R',
    wordSwahili: 'R',
    category: 'alphabet',
    description: 'Cross the index and middle fingers.',
    descriptionSwahili: 'Vuka vidole vya shahada na vya kati.',
    imageUrl: 'https://picsum.photos/seed/sign-r/400/400'
  },
  {
    id: 'a19',
    word: 'S',
    wordSwahili: 'S',
    category: 'alphabet',
    description: 'Make a fist with the thumb resting across the front of the fingers.',
    descriptionSwahili: 'Kunja ngumi huku kidole gumba kikiwa kimeegemea mbele ya vidole.',
    imageUrl: 'https://picsum.photos/seed/sign-s/400/400'
  },
  {
    id: 'a20',
    word: 'T',
    wordSwahili: 'T',
    category: 'alphabet',
    description: 'Tuck the thumb under the index finger only.',
    descriptionSwahili: 'Ingiza kidole gumba chini ya kidole cha shahada pekee.',
    imageUrl: 'https://picsum.photos/seed/sign-t/400/400'
  },
  {
    id: 'a21',
    word: 'U',
    wordSwahili: 'U',
    category: 'alphabet',
    description: 'Hold up the index and middle fingers together.',
    descriptionSwahili: 'Inua vidole vya shahada na vya kati pamoja.',
    imageUrl: 'https://picsum.photos/seed/sign-u/400/400'
  },
  {
    id: 'a22',
    word: 'V',
    wordSwahili: 'V',
    category: 'alphabet',
    description: 'Hold up the index and middle fingers spread apart.',
    descriptionSwahili: 'Inua vidole vya shahada na vya kati vikiwa vimeachana.',
    imageUrl: 'https://picsum.photos/seed/sign-v/400/400'
  },
  {
    id: 'a23',
    word: 'W',
    wordSwahili: 'W',
    category: 'alphabet',
    description: 'Hold up the index, middle, and ring fingers spread apart.',
    descriptionSwahili: 'Inua vidole vya shahada, vya kati, na vya pete vikiwa vimeachana.',
    imageUrl: 'https://picsum.photos/seed/sign-w/400/400'
  },
  {
    id: 'a24',
    word: 'X',
    wordSwahili: 'X',
    category: 'alphabet',
    description: 'Hook the index finger.',
    descriptionSwahili: 'Kunja kidole cha shahada kama ndoano.',
    imageUrl: 'https://picsum.photos/seed/sign-x/400/400'
  },
  {
    id: 'a25',
    word: 'Y',
    wordSwahili: 'Y',
    category: 'alphabet',
    description: 'Extend the thumb and pinky finger.',
    descriptionSwahili: 'Nyoosha kidole gumba na kidole kidogo.',
    imageUrl: 'https://picsum.photos/seed/sign-y/400/400'
  },
  {
    id: 'a26',
    word: 'Z',
    wordSwahili: 'Z',
    category: 'alphabet',
    description: 'Draw a "Z" shape in the air with the index finger.',
    descriptionSwahili: 'Chora umbo la "Z" hewani kwa kidole cha shahada.',
    imageUrl: 'https://picsum.photos/seed/sign-z/400/400'
  },
  // Additional Health Signs
  {
    id: 'h4',
    word: 'Cough',
    wordSwahili: 'Kikohozi',
    category: 'health',
    description: 'Place your fist in front of your mouth and move it forward slightly twice, like coughing.',
    descriptionSwahili: 'Weka ngumi yako mbele ya mdomo wako na uisogeze mbele kidogo mara mbili, kama unakohoa.',
    imageUrl: 'https://picsum.photos/seed/cough/400/400'
  },
  {
    id: 'h5',
    word: 'Fever',
    wordSwahili: 'Homa',
    category: 'health',
    description: 'Place the back of your hand on your forehead.',
    descriptionSwahili: 'Weka nyuma ya mkono wako kwenye paji la uso wako.',
    imageUrl: 'https://picsum.photos/seed/fever/400/400'
  },
  {
    id: 'h6',
    word: 'Headache',
    wordSwahili: 'Kuumwa Kichwa',
    category: 'health',
    description: 'Point both index fingers at your temples and move them in small circles.',
    descriptionSwahili: 'Elekeza vidole vyote viwili vya shahada kwenye mapaji yako na uvisogeze katika miduara midogo.',
    imageUrl: 'https://picsum.photos/seed/headache/400/400'
  },
  {
    id: 'h7',
    word: 'Stomachache',
    wordSwahili: 'Kuumwa Tumbo',
    category: 'health',
    description: 'Place your hands on your stomach and move them in a circular motion with a pained expression.',
    descriptionSwahili: 'Weka mikono yako kwenye tumbo lako na uisogeze kwa mwendo wa duara huku ukiwa na usemi wa maumivu.',
    imageUrl: 'https://picsum.photos/seed/stomachache/400/400'
  },
  {
    id: 'h8',
    word: 'Dizzy',
    wordSwahili: 'Kizunguzungu',
    category: 'health',
    description: 'Move your hand in a spiral motion in front of your face, and tilt your head slightly.',
    descriptionSwahili: 'Sogeza mkono wako kwa mwendo wa mzunguko mbele ya uso wako, na uinamishe kichwa chako kidogo.',
    imageUrl: 'https://picsum.photos/seed/dizzy/400/400'
  },
  {
    id: 'h9',
    word: 'Bleeding',
    wordSwahili: 'Kutoka Damu',
    category: 'health',
    description: 'Touch your index finger to your lips (red), then move your hand down while wiggling fingers (flowing).',
    descriptionSwahili: 'Gusa kidole chako cha shahada kwenye midomo yako (nyekundu), kisha sogeza mkono wako chini huku ukitikisa vidole (kutiririka).',
    imageUrl: 'https://picsum.photos/seed/bleeding/400/400'
  },
  {
    id: 'h10',
    word: 'Breathing',
    wordSwahili: 'Kupumua',
    category: 'health',
    description: 'Place both flat hands on your chest and move them in and out in sync with your breath.',
    descriptionSwahili: 'Weka mikono yote miwili bapa kwenye kifua chako na uisogeze ndani na nje kwa upatanifu na pumzi yako.',
    imageUrl: 'https://picsum.photos/seed/breathing/400/400'
  },
  {
    id: 'h11',
    word: 'Nurse',
    wordSwahili: 'Muuguzi',
    category: 'health',
    description: 'Tap your wrist with two fingers (like doctor), then draw a small cross on your forehead or hat area.',
    descriptionSwahili: 'Gonga mkono wako kwa vidole viwili (kama daktari), kisha uchore msalaba mdogo kwenye paji la uso wako au eneo la kofia.',
    imageUrl: 'https://picsum.photos/seed/nurse/400/400'
  }
];
