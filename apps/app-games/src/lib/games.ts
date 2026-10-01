export type GameCategory =
  "Letras e palavras" | "Atenção e memória" | "Números e cores";
export const games = [
  {
    id: "caca-letras",
    title: "Caça letras",
    description: "Uma letra se esconde por aqui. Vamos encontrar?",
    category: "Letras e palavras",
    color: "peach",
    icon: "letters",
    skill: "Reconhecimento de letras",
    duration: "3–5 min",
    tag: "Para começar",
  },
  {
    id: "junta-silabas",
    title: "Junta sílabas",
    description: "Junte pedacinhos e descubra uma nova palavra!",
    category: "Letras e palavras",
    color: "mint",
    icon: "syllables",
    skill: "Consciência silábica",
    duration: "3–5 min",
    tag: "Descoberta",
  },
  {
    id: "caca-palavras",
    title: "Caça palavras",
    description: "Explore as letras e encontre palavras escondidas.",
    category: "Letras e palavras",
    color: "lavender",
    icon: "words",
    skill: "Leitura e atenção",
    duration: "5–8 min",
    tag: "Um novo desafio",
  },
  {
    id: "desenhe-a-letra",
    title: "Desenhe a letra",
    description: "Siga o caminho e dê vida às letras com seu traço.",
    category: "Letras e palavras",
    color: "sky",
    icon: "draw",
    skill: "Coordenação e escrita",
    duration: "3–5 min",
    tag: "Mãos à obra",
  },
  {
    id: "quiz-emojis",
    title: "Quiz de emojis",
    description: "Uma imagem, uma descoberta. Qual é a palavra?",
    category: "Letras e palavras",
    color: "yellow",
    icon: "emoji",
    skill: "Vocabulário e associação",
    duration: "3–5 min",
    tag: "Queridinho",
  },
  {
    id: "memoria",
    title: "Memória divertida",
    description: "Encontre os pares de amigos que combinam.",
    category: "Atenção e memória",
    color: "rose",
    icon: "memory",
    skill: "Memória visual",
    duration: "3–5 min",
    tag: "Vamos lembrar",
  },
  {
    id: "numeros",
    title: "Conta comigo",
    description: "Conte os objetos e faça amizade com os números.",
    category: "Números e cores",
    color: "sky",
    icon: "numbers",
    skill: "Contagem e quantidade",
    duration: "3–5 min",
    tag: "Primeiras contas",
  },
  {
    id: "cores",
    title: "Mundo das cores",
    description: "Um arco-íris de possibilidades para explorar!",
    category: "Números e cores",
    color: "mint",
    icon: "colors",
    skill: "Reconhecimento de cores",
    duration: "3–5 min",
    tag: "Bem colorido",
  },
] as const satisfies readonly {
  id: string;
  title: string;
  description: string;
  category: GameCategory;
  color: string;
  icon: string;
  skill: string;
  duration: string;
  tag: string;
}[];
export type Game = (typeof games)[number];
export type GameId = Game["id"];
export const categories: GameCategory[] = [
  "Letras e palavras",
  "Atenção e memória",
  "Números e cores",
];
