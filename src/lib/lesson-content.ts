export type ModuleReading = {
  order: number
  title: string
  video: string
  videoTitle: string
  reading: string
}

export const MODULE_READINGS: ModuleReading[] = [
  {
    order: 1,
    title: "1. Papel do Cuidador",
    video: "https://www.youtube.com/embed/Y0woaElMsXA",
    videoTitle: "Vídeo de referência — postura e técnica no cuidado",
    reading: `<h2>O papel do cuidador</h2>
<p>O cuidador da Bene Curati Cuidados atua no domicílio com responsabilidade, ética e respeito à dignidade da pessoa cuidada. Seu trabalho é de apoio às atividades de vida diária, observação de sinais de alerta e comunicação com a família e a equipe de saúde.</p>
<h3>O que o cuidador faz</h3>
<ul><li>Higiene, alimentação assistida, mobilização e conforto.</li><li>Acompanhamento de rotina e registro no diário de bordo.</li><li>Comunicação clara de mudanças no estado geral.</li></ul>
<h3>O que o cuidador não faz</h3>
<ul><li>Não diagnostica, não prescreve e não altera prescrição.</li><li>Não realiza procedimentos invasivos privativos de enfermagem sem orientação e competência legal.</li></ul>
<p><strong>Limite de ouro:</strong> na dúvida, registre e acione a família ou o profissional responsável.</p>`,
  },
  {
    order: 2,
    title: "2. Ética e Humanização",
    video: "https://www.youtube.com/embed/9BEwb30x4RQ",
    videoTitle: "Vídeo de referência — sigilo e ética profissional",
    reading: `<h2>Ética e humanização</h2>
<p>Cuidar é um ato ético. Humanizar é tratar a pessoa, não a doença. Sigilo, privacidade e consentimento orientam cada ação no home care.</p>
<h3>Princípios</h3>
<ul><li>Respeito à autonomia e à história de vida.</li><li>Sigilo de informações de saúde e de família.</li><li>Postura profissional: pontualidade, apresentação e linguagem adequada.</li></ul>
<p>Fotos, áudios e dados do paciente não saem do serviço sem autorização. A Bene Curati Cuidados exige discrição absoluta.</p>`,
  },
  {
    order: 3,
    title: "3. Anatomia e Fisiologia",
    video: "https://www.youtube.com/embed/6EFG_u41LpE",
    videoTitle: "Vídeo de referência — corpo humano e higiene das mãos",
    reading: `<h2>Anatomia e fisiologia para o cuidador</h2>
<p>Conhecer o corpo ajuda a observar alterações e a posicionar o paciente com segurança. Foque em pele, sistema cardiovascular, respiratório, digestório, urinário e nervoso.</p>
<h3>Pontos práticos</h3>
<ul><li>Pele do idoso é mais frágil: risco de lesão por pressão.</li><li>Coração e pulmão: observe cor, respiração e inchaço.</li><li>Sistema nervoso: confusão, fraqueza súbita e fala alterada são alerta.</li></ul>`,
  },
  {
    order: 4,
    title: "4. Envelhecimento e Doenças",
    video: "https://www.youtube.com/embed/3hl92GPFIN0",
    videoTitle: "Vídeo de referência — cuidados com a pessoa idosa",
    reading: `<h2>Envelhecimento e doenças mais comuns</h2>
<p>O envelhecimento é heterogêneo. Nem todo idoso é doente, mas a prevalência de hipertensão, diabetes, artrose, demências e quedas aumenta.</p>
<ul><li>Observe mudanças de humor, apetite, sono e marcha.</li><li>Desidratação e infecção urinária podem simular “confusão”.</li><li>Comunique piora súbita imediatamente.</li></ul>`,
  },
  {
    order: 5,
    title: "5. Biossegurança",
    video: "https://www.youtube.com/embed/6EFG_u41LpE",
    videoTitle: "Vídeo de referência — lavagem das mãos",
    reading: `<h2>Biossegurança no domicílio</h2>
<p>A principal medida é a higienização das mãos. Use luvas quando houver risco de contato com fluidos. Descarte correto de materiais e ambiente limpo protegem paciente e cuidador.</p>
<h3>Cinco momentos das mãos</h3>
<ol><li>Antes de tocar o paciente.</li><li>Antes de procedimento limpo.</li><li>Após risco de fluido.</li><li>Após tocar o paciente.</li><li>Após tocar o entorno.</li></ol>`,
  },
  {
    order: 6,
    title: "6. Sinais Vitais",
    video: "https://www.youtube.com/embed/3hl92GPFIN0",
    videoTitle: "Vídeo de referência — observação clínica",
    reading: `<h2>Sinais vitais</h2>
<p>Temperatura, pulso, respiração, pressão arterial e dor são a “linguagem” do corpo. O cuidador observa, registra e comunica. Não interpreta diagnóstico.</p>
<ul><li>Anote horário, valor e como a pessoa estava.</li><li>Dor é o 5º sinal: use escala simples de 0 a 10.</li><li>Valores muito alterados: acione ajuda e não deixe o paciente sozinho.</li></ul>`,
  },
  {
    order: 7,
    title: "7. Higiene e Banho no Leito",
    video: "https://www.youtube.com/embed/Y0woaElMsXA",
    videoTitle: "Vídeo de referência — banho no leito",
    reading: `<h2>Higiene e banho no leito</h2>
<p>Higiene preserva pele, autoestima e previne infecção. Prepare material, aqueça o ambiente, explique o que vai fazer e proteja a intimidade.</p>
<ol><li>Lave as mãos e organize bacias, toalhas e roupa limpa.</li><li>Comece pelo rosto e termine pela região íntima, com panos diferentes.</li><li>Seque bem dobras. Hidrate pele íntegra.</li><li>Troque roupa de cama sem arrastar o paciente.</li></ol>`,
  },
  {
    order: 8,
    title: "8. Decúbito e Prevenção de LPP",
    video: "https://www.youtube.com/embed/Y0woaElMsXA",
    videoTitle: "Vídeo de referência — mudança de decúbito",
    reading: `<h2>Decúbito e lesão por pressão</h2>
<p>Pessoas acamadas precisam de mudança de posição a cada 2 horas, salvo orientação contrária. Alívie proeminências ósseas (sacral, calcanhares, trocânteres).</p>
<ul><li>Não arraste: levante ou role com ajuda.</li><li>Lençóis secos e sem pregas.</li><li>Pele vermelha que não embranquece ao toque é alerta.</li></ul>`,
  },
  {
    order: 9,
    title: "9. Nutrição, Hidratação e Disfagia",
    video: "https://www.youtube.com/embed/3hl92GPFIN0",
    videoTitle: "Vídeo de referência — segurança no cuidado",
    reading: `<h2>Alimentação, hidratação e disfagia</h2>
<p>Disfagia é dificuldade de engolir. Risco: engasgo e pneumonia. Siga a consistência orientada pela equipe (líquido, nectar, pudim, pastoso).</p>
<ul><li>Posição sentada ou Fowler. Nunca deite para oferecer líquido.</li><li>Ofereça devagar. Observe tosse, voz molhada e escape de alimento.</li><li>Hidratação: pequenos volumes frequentes, se autorizado.</li></ul>`,
  },
  {
    order: 10,
    title: "10. Medicamentos – Limites",
    video: "https://www.youtube.com/embed/9BEwb30x4RQ",
    videoTitle: "Vídeo de referência — responsabilidade profissional",
    reading: `<h2>Medicamentos: limites do cuidador</h2>
<p>O cuidador auxilia a rotina prescrita. Não decide dose, horário novo ou “dar um comprimido a mais”. Conferência: paciente certo, medicamento certo, dose, via, horário.</p>
<ul><li>Não parta comprimidos sem orientação.</li><li>Reações (urticária, falta de ar, sonolência extrema): interrompa, registre e acione ajuda.</li></ul>`,
  },
  {
    order: 11,
    title: "11. Sondas e Ostomias",
    video: "https://www.youtube.com/embed/Y0woaElMsXA",
    videoTitle: "Vídeo de referência — técnica e cuidado seguro",
    reading: `<h2>Sondas e ostomias</h2>
<p>Sonda nasoenteral, vesical e ostomias exigem técnica e limites claros. O cuidador observa vazamento, odor, cor, fixação e sinais de infecção. Trocas e irrigacões específicas seguem a enfermagem.</p>
<ul><li>Não tracionar sonda.</li><li>Manter cabeceira elevada na dieta por sonda.</li><li>Bolsa de ostomia: esvaziar, observar pele periestomal.</li></ul>`,
  },
  {
    order: 12,
    title: "12. Curativos e Pele",
    video: "https://www.youtube.com/embed/6EFG_u41LpE",
    videoTitle: "Vídeo de referência — higiene e proteção da pele",
    reading: `<h2>Pele e curativos simples</h2>
<p>Pele íntegra se protege com higiene, hidratação e alívio de pressão. Curativos complexos são da enfermagem. O cuidador pode proteger ferida simples conforme orientação e registrar aspecto (cor, odor, secreção).</p>`,
  },
  {
    order: 13,
    title: "13. Mobilização e Prevenção de Quedas",
    video: "https://www.youtube.com/embed/Y0woaElMsXA",
    videoTitle: "Vídeo de referência — transferência segura",
    reading: `<h2>Mobilização e quedas</h2>
<p>Queda é evento grave. Antes de transferir: sapato antiderrapante, óculos, ambiente livre, cama na altura adequada, explique o movimento.</p>
<ul><li>Use a força das pernas, não da coluna.</li><li>Se o paciente desmaiar no meio do movimento, conduza ao chão com controle — não tente “segurar no ar”.</li></ul>`,
  },
  {
    order: 14,
    title: "14. Alzheimer, Parkinson, AVC, DM, HAS",
    video: "https://www.youtube.com/embed/3hl92GPFIN0",
    videoTitle: "Vídeo de referência — urgências no idoso",
    reading: `<h2>Condições frequentes no home care</h2>
<p><strong>Alzheimer:</strong> rotina, frases curtas, não discutir a realidade delirante com agressividade.</p>
<p><strong>Parkinson:</strong> tempo para mover-se, risco de queda e engasgo.</p>
<p><strong>AVC:</strong> face assimétrica, braço fraco, fala alterada — emergência.</p>
<p><strong>Diabetes e hipertensão:</strong> observe palidez, suor, confusão (hipoglicemia) e queixa de dor no peito.</p>`,
  },
  {
    order: 15,
    title: "15. Primeiros Socorros",
    video: "https://www.youtube.com/embed/3hl92GPFIN0",
    videoTitle: "Vídeo de referência — primeiros socorros",
    reading: `<h2>Primeiros socorros</h2>
<p>Prioridade: segurança da cena, checar responsividade, chamar ajuda (192/193), vias aéreas, respiração e circulação. Não ofereça água ou alimento a quem está inconsciente.</p>
<ul><li>Engasgo consciente: manobra de desobstrução conforme treinamento.</li><li>Convulsão: proteja a cabeça, não coloque objeto na boca.</li><li>Queimadura: água corrente, não use pasta ou gelo direto.</li></ul>`,
  },
  {
    order: 16,
    title: "16. Cuidados Paliativos",
    video: "https://www.youtube.com/embed/9BEwb30x4RQ",
    videoTitle: "Vídeo de referência — dignidade e sigilo",
    reading: `<h2>Cuidados paliativos</h2>
<p>O objetivo é conforto, alívio de sintomas e presença humana. Respeite desejos da pessoa e da família. Higiene, posição, boca úmida e ambiente calmo importam tanto quanto a medicação prescrita.</p>`,
  },
  {
    order: 17,
    title: "17. Comunicação e Família",
    video: "https://www.youtube.com/embed/9BEwb30x4RQ",
    videoTitle: "Vídeo de referência — comunicação ética",
    reading: `<h2>Comunicação com paciente e família</h2>
<p>Fale com clareza, ouça mais do que julgue. Entregue fatos: “hoje recusou o almoço e dormiu mais”. Evite diagnóstico caseiro. Conflitos familiares: mantenha-se profissional e registre.</p>`,
  },
  {
    order: 18,
    title: "18. Diário de Bordo",
    video: "https://www.youtube.com/embed/9BEwb30x4RQ",
    videoTitle: "Vídeo de referência — registro responsável",
    reading: `<h2>Diário de bordo</h2>
<p>O registro é proteção do paciente e do cuidador. Anote data, horário, alimentação, eliminações, banho, medicamentos oferecidos conforme prescrição, intercorrências e quem foi avisado.</p>
<p>Escreva de forma objetiva. Não use gírias. Não apague: corrija com data e rubrica, se o meio for papel.</p>`,
  },
  {
    order: 19,
    title: "19. Autocuidado e Burnout",
    video: "https://www.youtube.com/embed/Y0woaElMsXA",
    videoTitle: "Vídeo de referência — postura e cuidado sustentável",
    reading: `<h2>Autocuidado do cuidador</h2>
<p>Cuidar sem se cuidar gera erro e adoecimento. Pausas, hidratação, sono, limite de jornada e pedir ajuda não são fraqueza. Sinais de burnout: irritação, insônia, choro, isolamento.</p>`,
  },
  {
    order: 20,
    title: "20. Ética e Legislação",
    video: "https://www.youtube.com/embed/9BEwb30x4RQ",
    videoTitle: "Vídeo de referência — ética e legislação",
    reading: `<h2>Ética e legislação</h2>
<p>O cuidador não substitui enfermeiro ou médico. Atua no apoio domiciliar com dever de sigilo e respeito. Estatuto da Pessoa Idosa e normas de direitos humanos orientam a conduta. Maus-tratos devem ser comunicados.</p>
<p>Embasamento formativo da Bene Curati Cuidados: Decreto nº 5.154 e Resolução CNE nº 04/99, no âmbito da educação profissional.</p>`,
  },
  {
    order: 21,
    title: "21. Código de Excelência + Técnicas Avançadas",
    video: "https://www.youtube.com/embed/Y0woaElMsXA",
    videoTitle: "Vídeo de referência — revisão de técnicas",
    reading: `<h2>Código de excelência Bene Curati</h2>
<p>Excelência é consistência: pontualidade, higiene, registro, respeito e pedido de ajuda na hora certa. Revise técnicas de banho, decúbito, alimentação segura e primeiros socorros.</p>
<p><strong>Frase da instituição:</strong> Nossa paixão é cuidar de quem você ama.</p>`,
  },
]
