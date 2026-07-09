export interface EmojiEntry {
  char: string
  fluent: string
  keywords: string
}

export interface EmojiGroup {
  name: string
  emojis: EmojiEntry[]
}

export const EMOJI_GROUPS: EmojiGroup[] = [
  {
    name: "Educação",
    emojis: [
      { char: "📚", fluent: "Books", keywords: "livros educacao estudo biblioteca leitura" },
      { char: "📖", fluent: "Open book", keywords: "livro aberto leitura estudo" },
      { char: "🎓", fluent: "Graduation cap", keywords: "formatura graduacao diploma faculdade capelo" },
      { char: "✏️", fluent: "Pencil", keywords: "lapis escrever escola" },
      { char: "🖊️", fluent: "Pen", keywords: "caneta escrever" },
      { char: "📝", fluent: "Memo", keywords: "anotacao nota prova escrever memo" },
      { char: "📒", fluent: "Ledger", keywords: "caderno anotacoes" },
      { char: "🏫", fluent: "School", keywords: "escola colegio predio" },
      { char: "🧮", fluent: "Abacus", keywords: "abaco matematica calculo conta" },
      { char: "📐", fluent: "Triangular ruler", keywords: "regua esquadro geometria" },
      { char: "🗂️", fluent: "Card index dividers", keywords: "arquivos organizacao pastas" },
      { char: "🎒", fluent: "Backpack", keywords: "mochila escola aluno" },
    ],
  },
  {
    name: "Ciência e Tecnologia",
    emojis: [
      { char: "🔬", fluent: "Microscope", keywords: "microscopio ciencia laboratorio biologia" },
      { char: "🧪", fluent: "Test tube", keywords: "quimica tubo experimento laboratorio" },
      { char: "🧬", fluent: "Dna", keywords: "dna genetica biologia" },
      { char: "🔭", fluent: "Telescope", keywords: "telescopio astronomia espaco" },
      { char: "🧠", fluent: "Brain", keywords: "cerebro mente psicologia neuro saude mental" },
      { char: "💡", fluent: "Light bulb", keywords: "ideia lampada inovacao" },
      { char: "💻", fluent: "Laptop", keywords: "computador notebook tecnologia programacao" },
      { char: "🖥️", fluent: "Desktop computer", keywords: "computador desktop monitor" },
      { char: "⌨️", fluent: "Keyboard", keywords: "teclado digitar" },
      { char: "📱", fluent: "Mobile phone", keywords: "celular smartphone app mobile" },
      { char: "🤖", fluent: "Robot", keywords: "robo inteligencia artificial ia automacao" },
      { char: "⚙️", fluent: "Gear", keywords: "engrenagem configuracao mecanica" },
      { char: "🔋", fluent: "Battery", keywords: "bateria energia" },
      { char: "🛰️", fluent: "Satellite", keywords: "satelite espaco comunicacao" },
      { char: "🚀", fluent: "Rocket", keywords: "foguete lancamento espaco startup" },
    ],
  },
  {
    name: "Arte e Criatividade",
    emojis: [
      { char: "🎨", fluent: "Artist palette", keywords: "arte pintura paleta desenho design" },
      { char: "🖌️", fluent: "Paintbrush", keywords: "pincel pintura arte" },
      { char: "🖍️", fluent: "Crayon", keywords: "giz cera colorir" },
      { char: "🎭", fluent: "Performing arts", keywords: "teatro drama artes cenicas" },
      { char: "🎬", fluent: "Clapper board", keywords: "cinema filme video producao" },
      { char: "🎥", fluent: "Movie camera", keywords: "camera filme video" },
      { char: "📷", fluent: "Camera", keywords: "camera foto fotografia" },
      { char: "🎼", fluent: "Musical score", keywords: "musica partitura" },
      { char: "🎵", fluent: "Musical note", keywords: "musica nota som" },
      { char: "🎸", fluent: "Guitar", keywords: "violao guitarra musica instrumento" },
      { char: "🎹", fluent: "Musical keyboard", keywords: "piano teclado musica" },
      { char: "🎤", fluent: "Microphone", keywords: "microfone canto podcast" },
      { char: "✂️", fluent: "Scissors", keywords: "tesoura recorte artesanato" },
      { char: "🧵", fluent: "Thread", keywords: "linha costura artesanato" },
      { char: "🖼️", fluent: "Framed picture", keywords: "quadro moldura arte galeria" },
    ],
  },
  {
    name: "Saúde e Bem-estar",
    emojis: [
      { char: "❤️", fluent: "Red heart", keywords: "coracao amor saude curtir favorito" },
      { char: "🩺", fluent: "Stethoscope", keywords: "estetoscopio medicina saude medico" },
      { char: "💊", fluent: "Pill", keywords: "remedio pilula farmacia" },
      { char: "🥗", fluent: "Green salad", keywords: "salada nutricao alimentacao saudavel" },
      { char: "🍎", fluent: "Red apple", keywords: "maca fruta nutricao alimentacao" },
      { char: "🦷", fluent: "Tooth", keywords: "dente odontologia dentista" },
      { char: "🤝", fluent: "Handshake", keywords: "aperto de maos acordo apoio parceria" },
      { char: "🌱", fluent: "Seedling", keywords: "broto crescimento desenvolvimento planta" },
      { char: "☀️", fluent: "Sun", keywords: "sol energia bem estar clima" },
    ],
  },
  {
    name: "Negócios e Finanças",
    emojis: [
      { char: "💼", fluent: "Briefcase", keywords: "maleta trabalho negocios carreira" },
      { char: "📊", fluent: "Bar chart", keywords: "grafico dados relatorio estatistica" },
      { char: "📈", fluent: "Chart increasing", keywords: "grafico crescimento alta lucro" },
      { char: "📉", fluent: "Chart decreasing", keywords: "grafico queda baixa" },
      { char: "💰", fluent: "Money bag", keywords: "dinheiro saco financas grana" },
      { char: "💵", fluent: "Dollar banknote", keywords: "dinheiro nota dolar financas" },
      { char: "🏦", fluent: "Bank", keywords: "banco financas instituicao" },
      { char: "🎯", fluent: "Bullseye", keywords: "alvo meta objetivo foco" },
      { char: "📅", fluent: "Calendar", keywords: "calendario agenda data planejamento" },
      { char: "⏰", fluent: "Alarm clock", keywords: "relogio tempo prazo despertador" },
      { char: "🏆", fluent: "Trophy", keywords: "trofeu premio conquista vencedor" },
      { char: "🥇", fluent: "1st place medal", keywords: "medalha ouro primeiro premio" },
      { char: "📎", fluent: "Paperclip", keywords: "clipe anexo documento" },
      { char: "🗃️", fluent: "Card file box", keywords: "arquivo caixa documentos" },
    ],
  },
  {
    name: "Comunicação",
    emojis: [
      { char: "💬", fluent: "Speech balloon", keywords: "balao conversa chat comentario mensagem" },
      { char: "🗣️", fluent: "Speaking head", keywords: "falar comunicacao oratoria voz" },
      { char: "📣", fluent: "Megaphone", keywords: "megafone anuncio divulgacao marketing" },
      { char: "📢", fluent: "Loudspeaker", keywords: "alto falante anuncio aviso" },
      { char: "✉️", fluent: "Envelope", keywords: "envelope email carta mensagem" },
      { char: "🔔", fluent: "Bell", keywords: "sino notificacao aviso" },
      { char: "🌐", fluent: "Globe with meridians", keywords: "globo internet web idioma mundo" },
      { char: "🔗", fluent: "Link", keywords: "link corrente url" },
      { char: "👥", fluent: "Busts in silhouette", keywords: "pessoas grupo equipe comunidade" },
      { char: "📞", fluent: "Telephone receiver", keywords: "telefone ligacao contato" },
    ],
  },
  {
    name: "Natureza",
    emojis: [
      { char: "🌍", fluent: "Globe showing europe-africa", keywords: "planeta terra mundo geografia meio ambiente" },
      { char: "🌳", fluent: "Deciduous tree", keywords: "arvore natureza ecologia" },
      { char: "🍃", fluent: "Leaf fluttering in wind", keywords: "folhas natureza vento" },
      { char: "🌸", fluent: "Cherry blossom", keywords: "flor primavera natureza" },
      { char: "🐶", fluent: "Dog face", keywords: "cachorro animal pet" },
      { char: "🐱", fluent: "Cat face", keywords: "gato animal pet" },
      { char: "🦋", fluent: "Butterfly", keywords: "borboleta transformacao natureza" },
      { char: "🐝", fluent: "Honeybee", keywords: "abelha natureza inseto" },
      { char: "🌊", fluent: "Water wave", keywords: "onda mar agua oceano" },
      { char: "🔥", fluent: "Fire", keywords: "fogo chama energia destaque em alta popular" },
      { char: "⭐", fluent: "Star", keywords: "estrela destaque favorito avaliacao" },
      { char: "🌈", fluent: "Rainbow", keywords: "arco iris diversidade cores" },
    ],
  },
  {
    name: "Atividades",
    emojis: [
      { char: "⚽", fluent: "Soccer ball", keywords: "futebol bola esporte" },
      { char: "🏀", fluent: "Basketball", keywords: "basquete bola esporte" },
      { char: "🎾", fluent: "Tennis", keywords: "tenis bola esporte" },
      { char: "🎮", fluent: "Video game", keywords: "videogame jogo controle games" },
      { char: "🎲", fluent: "Game die", keywords: "dado jogo sorte" },
      { char: "🧩", fluent: "Puzzle piece", keywords: "quebra cabeca puzzle logica" },
      { char: "🎪", fluent: "Circus tent", keywords: "circo evento espetaculo" },
      { char: "🎉", fluent: "Party popper", keywords: "festa comemoracao evento celebracao" },
      { char: "🎁", fluent: "Wrapped gift", keywords: "presente gift brinde" },
    ],
  },
  {
    name: "Símbolos",
    emojis: [
      { char: "✅", fluent: "Check mark button", keywords: "check certo concluido aprovado" },
      { char: "⚡", fluent: "High voltage", keywords: "raio energia rapido" },
      { char: "💯", fluent: "Hundred points", keywords: "cem nota maxima perfeito" },
      { char: "🚩", fluent: "Triangular flag", keywords: "bandeira marcador destaque" },
      { char: "🔖", fluent: "Bookmark", keywords: "marcador salvar favorito tag" },
      { char: "🏷️", fluent: "Label", keywords: "etiqueta tag categoria preco" },
      { char: "🔑", fluent: "Key", keywords: "chave acesso senha fundamental" },
      { char: "🧭", fluent: "Compass", keywords: "bussola direcao orientacao guia" },
      { char: "🛠️", fluent: "Hammer and wrench", keywords: "ferramentas manutencao pratico" },
      { char: "📌", fluent: "Pushpin", keywords: "alfinete fixar destaque local" },
      { char: "♻️", fluent: "Recycling symbol", keywords: "reciclagem sustentabilidade meio ambiente" },
      { char: "⚖️", fluent: "Balance scale", keywords: "balanca justica direito equilibrio" },
      { char: "🔍", fluent: "Magnifying glass tilted left", keywords: "lupa buscar pesquisa analise" },
    ],
  },
]

export const fluentEmojiUrl = (fluent: string): string => {
  const folder = encodeURIComponent(fluent)
  const file = fluent.toLowerCase().replace(/[’']/g, "").replace(/ /g, "_")
  return `https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji/assets/${folder}/3D/${file}_3d.png`
}

export const CHAR_TO_FLUENT: Record<string, string> = Object.fromEntries(
  EMOJI_GROUPS.flatMap((group) => group.emojis.map((emoji) => [emoji.char, emoji.fluent]))
)
