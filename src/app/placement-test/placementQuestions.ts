export const QUESTIONS = [
  {
    id: 1,
    category: "Grammar (Easy)",
    question: "She ________ her breakfast at 7 AM every day.",
    options: [
      { text: "eat", score: 0 },
      { text: "eats", score: 1 },
      { text: "eating", score: 0 },
      { text: "eaten", score: 0 }
    ]
  },
  {
    id: 2,
    category: "Vocabulary (Easy)",
    question: "My father's sister is my ________.",
    options: [
      { text: "Aunt", score: 1 },
      { text: "Uncle", score: 0 },
      { text: "Grandmother", score: 0 },
      { text: "Cousin", score: 0 }
    ]
  },
  {
    id: 3,
    category: "Grammar (Easy)",
    question: "They ________ soccer in the yard right now.",
    options: [
      { text: "plays", score: 0 },
      { text: "are playing", score: 1 },
      { text: "played", score: 0 },
      { text: "is playing", score: 0 }
    ]
  },
  {
    id: 4,
    category: "Reading (Easy)",
    question: "Read and answer: 'Bob is 10 years old. He has a cat named Whiskers.' How old is Bob?",
    options: [
      { text: "8 years old", score: 0 },
      { text: "10 years old", score: 1 },
      { text: "12 years old", score: 0 },
      { text: "5 years old", score: 0 }
    ]
  },
  {
    id: 5,
    category: "Vocabulary (Medium)",
    question: "If you feel extremely tired, you are ________.",
    options: [
      { text: "angry", score: 0 },
      { text: "excited", score: 0 },
      { text: "exhausted", score: 1 },
      { text: "bored", score: 0 }
    ]
  },
  {
    id: 6,
    category: "Grammar (Medium)",
    question: "Where ________ you go for your vacation last year?",
    options: [
      { text: "do", score: 0 },
      { text: "did", score: 1 },
      { text: "have", score: 0 },
      { text: "are", score: 0 }
    ]
  },
  {
    id: 7,
    category: "Grammar (Medium)",
    question: "I have been living in Bobong ________ three years.",
    options: [
      { text: "since", score: 0 },
      { text: "for", score: 1 },
      { text: "during", score: 0 },
      { text: "in", score: 0 }
    ]
  },
  {
    id: 8,
    category: "Vocabulary (Medium)",
    question: "The school library has a wide ________ of books.",
    options: [
      { text: "selection", score: 1 },
      { text: "select", score: 0 },
      { text: "selective", score: 0 },
      { text: "selector", score: 0 }
    ]
  },
  {
    id: 9,
    category: "Reading (Medium)",
    question: "Read and answer: 'Sarah loves reading. She reads a new book every week. Her favorite genre is mystery.' What kind of books does Sarah like most?",
    options: [
      { text: "Comics", score: 0 },
      { text: "Science Fiction", score: 0 },
      { text: "Mystery", score: 1 },
      { text: "History", score: 0 }
    ]
  },
  {
    id: 10,
    category: "Grammar (Hard)",
    question: "If I ________ his phone number, I would have called him yesterday.",
    options: [
      { text: "know", score: 0 },
      { text: "had known", score: 1 },
      { text: "knew", score: 0 },
      { text: "have known", score: 0 }
    ]
  },
  {
    id: 11,
    category: "Grammar (Hard)",
    question: "By the time the teacher arrived, the students ________ the classroom.",
    options: [
      { text: "already clean", score: 0 },
      { text: "had already cleaned", score: 1 },
      { text: "clean", score: 0 },
      { text: "have cleaned", score: 0 }
    ]
  },
  {
    id: 12,
    category: "Vocabulary (Hard)",
    question: "To 'postpone' a meeting means to ________.",
    options: [
      { text: "cancel it", score: 0 },
      { text: "delay or reschedule it", score: 1 },
      { text: "start it on time", score: 0 },
      { text: "shorten it", score: 0 }
    ]
  },
  {
    id: 13,
    category: "Grammar (Hard)",
    question: "He is looking forward to ________ his grandparents next month.",
    options: [
      { text: "visit", score: 0 },
      { text: "visiting", score: 1 },
      { text: "visited", score: 0 },
      { text: "visits", score: 0 }
    ]
  },
  {
    id: 14,
    category: "Vocabulary (Hard)",
    question: "Her explanation was so ________ that everyone understood the complex topic instantly.",
    options: [
      { text: "vague", score: 0 },
      { text: "ambiguous", score: 0 },
      { text: "lucid", score: 1 },
      { text: "intricate", score: 0 }
    ]
  },
  {
    id: 15,
    category: "Reading (Hard)",
    question: "Read and answer: 'Despite the challenging terrain and unpredictable weather, the expedition successfully reached the summit of Mount Taliabu, demonstrating exemplary resilience and teamwork.' What is the main message of the text?",
    options: [
      { text: "The weather was nice on the mountain.", score: 0 },
      { text: "The team failed to reach the summit.", score: 0 },
      { text: "The team succeeded through determination and cooperation.", score: 1 },
      { text: "Mount Taliabu is easy to climb.", score: 0 }
    ]
  },
  {
    id: 16,
    category: "Listening Comprehension",
    question: "Klik tombol putar untuk mendengarkan audio, kemudian pilih jawaban yang tepat untuk pertanyaan: What time does the speaker wake up?",
    isAudio: true,
    audioText: "Every morning, I wake up at half past six, drink a glass of warm water, and do some light stretching before starting my day.",
    options: [
      { text: "6:00 AM", score: 0 },
      { text: "6:30 AM", score: 1 },
      { text: "7:00 AM", score: 0 },
      { text: "7:30 AM", score: 0 }
    ]
  },
  {
    id: 17,
    category: "Listening Comprehension",
    question: "Klik tombol putar untuk mendengarkan audio, kemudian pilih jawaban yang tepat untuk pertanyaan: Where is the speaker planning to go next week?",
    isAudio: true,
    audioText: "I am really looking forward to my trip to Bobong next week. I want to visit the beautiful beaches and practice my English.",
    options: [
      { text: "Jakarta", score: 0 },
      { text: "Taliabu Island (Bobong)", score: 1 },
      { text: "Bali", score: 0 },
      { text: "Makassar", score: 0 }
    ]
  },
];