import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const TEXTOS: Record<number, { title: string; html: string }> = {
  1: { title: "Leitura da aula", html: `<h2>Princípios do atendimento</h2><p>Antes de agir, olhe a cena. Só se aproxime se estiver seguro para você e para a vítima. Proteja-se: luvas se houver sangue, e afaste perigos como fogo, fio elétrico ou trânsito.</p><h3>O que fazer</h3><ul><li>Verifique se a pessoa responde e se respira.</li><li>Peça ajuda e ligue 192. Se houver mais gente, peça que alguém ligue enquanto você atende.</li><li>Não mova a vítima sem necessidade, principalmente se houver queda ou suspeita de trauma.</li><li>Fique com a pessoa até o socorro chegar.</li></ul><p>Este curso ensina o básico. Não substitui atendimento médico nem o SAMU.</p>` },
  2: { title: "Leitura da aula", html: `<h2>Desmaio</h2><p>Desmaio é a perda breve da consciência por queda da pressão ou do fluxo de sangue no cérebro. A pessoa pode ficar pálida, suar e cair.</p><h3>O que fazer</h3><ul><li>Deite a pessoa e eleve as pernas, se não houver trauma.</li><li>Afrouxe roupas apertadas e garanta ar fresco.</li><li>Não dê água nem comida enquanto estiver inconsciente.</li><li>Se não acordar em poucos minutos, ou se for idoso, gestante ou criança, ligue 192.</li></ul><p>Depois que acordar, sente-a devagar. Se o desmaio se repetir, procure avaliação médica.</p>` },
  3: { title: "Leitura da aula", html: `<h2>Crises convulsivas</h2><p>Na convulsão a pessoa pode cair, ter movimentos involuntários, ranger os dentes e não responder. A crise costuma durar poucos minutos.</p><h3>O que fazer</h3><ul><li>Afaste objetos que possam machucar. Proteja a cabeça com algo macio.</li><li>Não segure a pessoa, não coloque nada na boca e não dê água.</li><li>Deite de lado depois da crise, para a saliva sair.</li><li>Ligue 192 se for a primeira crise, durar mais de 5 minutos, repetir, ou se a pessoa não acordar.</li></ul><p>Anote a hora de início. Isso ajuda o socorro.</p>` },
  4: { title: "Leitura da aula", html: `<h2>Sangramentos</h2><p>Sangramento visível se controla com pressão direta. Use pano limpo ou gaze e aperte o local.</p><h3>O que fazer</h3><ul><li>Use luva ou saco plástico para se proteger.</li><li>Mantenha a pressão. Não retire o pano se encharcar: coloque outro por cima.</li><li>Eleve o membro se não houver fratura.</li><li>Ligue 192 se o sangue jorrar, não parar, ou a pessoa ficar pálida e tonta.</li></ul><p>Não use torniquete sem treinamento, salvo orientação do socorro.</p>` },
  5: { title: "Leitura da aula", html: `<h2>Queimaduras</h2><p>Resfrie a queimadura com água corrente em temperatura ambiente por vários minutos. Não use gelo, pasta de dente, manteiga ou clara de ovo.</p><h3>O que fazer</h3><ul><li>Retire joias e roupas soltas da área, sem arrancar o que estiver grudado.</li><li>Cubra com pano limpo e úmido.</li><li>Não estoure bolhas.</li><li>Ligue 192 em queimadura grande, no rosto, mãos, genitais, vias aéreas, ou em criança e idoso.</li></ul><p>Queimadura elétrica ou química também exige 192.</p>` },
  6: { title: "Leitura da aula", html: `<h2>AVC</h2><p>AVC é urgência. O tempo conta. Sinais comuns: boca torta, fala enrolada, fraqueza de um lado do corpo.</p><h3>Teste rápido</h3><ul><li>Peça um sorriso: um lado não sobe.</li><li>Peça para levantar os dois braços: um cai.</li><li>Peça para falar uma frase: a fala sai estranha.</li></ul><p>Se qualquer sinal aparecer, ligue 192 na hora. Anote a hora em que começou. Não dê remédio, água ou comida.</p>` },
  7: { title: "Leitura da aula", html: `<h2>Engasgo</h2><p>Se a pessoa consegue tossir e falar, incentive a tosse. Não dê tapas.</p><h3>Se não respira nem fala</h3><ul><li>Em adulto e criança maior: manobra de Heimlich, compressões no abdome, de pé, por trás.</li><li>Em bebê: alterne tapas nas costas e compressões no peito, com a cabeça mais baixa.</li><li>Se perder a consciência, inicie a reanimação e ligue 192.</li></ul><p>Não faça varredura às cegas na boca. Só retire o objeto se estiver visível.</p>` },
  8: { title: "Leitura da aula", html: `<h2>PCR e suporte básico</h2><p>Parada cardiorrespiratória: a pessoa não responde e não respira normalmente. Cada minuto sem compressão reduz a chance.</p><h3>O que fazer</h3><ul><li>Ligue 192 ou peça que alguém ligue. Peça um DEA se houver.</li><li>Compressões no centro do peito, fortes e rápidas, cerca de 100 a 120 por minuto, deixando o tórax voltar.</li><li>Se souber, alterne 30 compressões e 2 ventilações. Se não souber ventilar, faça só compressões.</li><li>Não pare até o socorro chegar, a pessoa responder, ou você não aguentar mais.</li></ul><p>DEA: ligue, cole as pás e siga a voz do aparelho. Não toque a pessoa durante o choque.</p>` },
  9: { title: "Leitura da aula", html: `<h2>Quedas</h2><p>Em queda, suspeite de lesão na coluna, quadril ou cabeça, sobretudo em idoso.</p><h3>O que fazer</h3><ul><li>Não levante a pessoa se houver dor no pescoço, costas, quadril, ou se não conseguir mover.</li><li>Imobilize como está e ligue 192.</li><li>Se bater a cabeça e vomitar, ficar confusa ou sonolenta, é urgência.</li><li>Observe também cortes e deformidades.</li></ul><p>Prevenção: tapetes fixos, boa luz, corrimão e calçado firme.</p>` },
  10: { title: "Leitura da aula", html: `<h2>Fraturas</h2><p>Fratura pode ter dor intensa, inchaço, deformidade e impossibilidade de usar o membro.</p><h3>O que fazer</h3><ul><li>Não tente colocar o osso no lugar.</li><li>Imobilize como está, incluindo a articulação acima e abaixo, se souber.</li><li>Aplique frio enrolado em pano, não direto na pele.</li><li>Ligue 192 se houver deformidade, osso exposto, ou a pessoa não puder se mover.</li></ul><p>Fratura exposta: cubra com pano limpo e não empurre o osso para dentro.</p>` },
  11: { title: "Leitura da aula", html: `<h2>Intoxicações</h2><p>Pode ser remédio, produto de limpeza, planta, alimento ou gás. Guarde a embalagem para mostrar ao socorro.</p><h3>O que fazer</h3><ul><li>Ligue 192. No Brasil, o CIATox também orienta intoxicações.</li><li>Não provoque vômito, a menos que um serviço de saúde mande.</li><li>Se for gás, leve a pessoa para ar livre, sem se expor.</li><li>Se o produto estiver na pele ou no olho, lave com muita água.</li></ul><p>Mantenha produtos e remédios fora do alcance de crianças.</p>` },
  12: { title: "Leitura da aula", html: `<h2>Animais peçonhentos</h2><p>Cobras, escorpiões, aranhas e lagartas podem causar acidentes graves. O tempo até o soro importa.</p><h3>O que fazer</h3><ul><li>Acalme a pessoa e mantenha o membro em repouso.</li><li>Lave com água e sabão. Não corte, não chupe, não faça torniquete e não ponha pó de café.</li><li>Ligue 192. Se possível e seguro, fotografe o animal, sem capturá-lo.</li><li>Leve ao hospital que tenha soro.</li></ul><p>Dor intensa, suor, vômito ou dificuldade para respirar são sinais de urgência.</p>` },
  13: { title: "Leitura da aula", html: `<h2>Afogamento</h2><p>Afogamento é falta de oxigênio por submersão. Pode acontecer em piscina rasa, banheira e praia.</p><h3>O que fazer</h3><ul><li>Não entre na água se não souber salvar sem se afogar. Use boia, corda ou galho.</li><li>Retire da água e ligue 192.</li><li>Se não responder e não respirar, inicie compressões.</li><li>Mesmo quem melhorou deve ser avaliado: pode piorar depois.</li></ul><p>Criança precisa de supervisão o tempo todo perto da água.</p>` },
  14: { title: "Leitura da aula", html: `<h2>Extremos térmicos</h2><p>Calor: pele quente, confusão, náusea e falta de suor podem ser intermação. Frio: tremor, fala arrastada e sonolência podem ser hipotermia.</p><h3>O que fazer</h3><ul><li>No calor, leve à sombra, afrouxe roupas, dê água se estiver consciente e resfrie com pano úmido.</li><li>No frio, tire roupas molhadas, cubra e aqueça aos poucos.</li><li>Não dê álcool.</li><li>Ligue 192 se houver confusão, desmaio ou piora.</li></ul>` },
  15: { title: "Leitura da aula", html: `<h2>Saúde mental em emergência</h2><p>Crise de pânico, agitação ou ideia de se machucar também é emergência. Fale com calma, sem julgamento.</p><h3>O que fazer</h3><ul><li>Afaste objetos perigosos e não deixe a pessoa sozinha.</li><li>Ouça. Não discuta nem minimize.</li><li>Ligue 192 ou 188 (CVV) se houver risco de suicídio.</li><li>Não contenha fisicamente se não for necessário para a segurança.</li></ul><p>Sua função é proteger e acionar ajuda, não tratar.</p>` },
  16: { title: "Leitura da aula", html: `<h2>Gestação</h2><p>Sangramento, dor forte, desmaio, convulsão ou trabalho de parto inesperado exigem 192.</p><h3>O que fazer</h3><ul><li>Deite a gestante de lado esquerdo, se não houver trauma.</li><li>Não dê remédio por conta própria.</li><li>Se o parto acontecer, apoie o bebê, seque, cubra e mantenha pele a pele se estiver bem.</li><li>Não corte o cordão. Não puxe a placenta.</li></ul><p>Esta aula não capacita para parto. O objetivo é não piorar até o socorro.</p>` },
  17: { title: "Leitura da aula", html: `<h2>Prevenção</h2><p>A maioria dos acidentes domésticos pode ser evitada.</p><h3>Em casa</h3><ul><li>Remédios e produtos de limpeza no alto e trancados.</li><li>Tomadas protegidas, fios organizados, fogão com cabo para dentro.</li><li>Antiderrapante no banheiro e boa iluminação.</li><li>Kit básico: gazes, luvas, soro, termômetro e lista de telefones.</li></ul><p>Ensine crianças a ligar 192 e a não abrir a porta para desconhecidos.</p>` },
  18: { title: "Leitura da aula", html: `<h2>Como acionar o 192</h2><p>O SAMU é o 192. Fale devagar e responda o que perguntarem.</p><h3>Informe</h3><ul><li>O que aconteceu e quantas pessoas.</li><li>O endereço completo e um ponto de referência.</li><li>Se a pessoa responde, respira e está sangrando.</li><li>Seu nome e telefone. Não desligue antes.</li></ul><p>Bombeiros: 193. Polícia: 190. Use o que a situação pedir. Em dúvida de saúde, 192.</p>` },
  19: { title: "Leitura da aula", html: `<h2>Kit de emergência</h2><p>Tenha um kit em casa e outro no carro. Revise a validade a cada poucos meses.</p><h3>Itens úteis</h3><ul><li>Luvas, gazes, ataduras, esparadrapo e soro fisiológico.</li><li>Termômetro, tesoura de ponta romba e lanterna.</li><li>Lista de alergias, remédios de uso contínuo e contatos.</li><li>Máscara e álcool em gel.</li></ul><p>Não inclua remédio para dar a outras pessoas sem orientação.</p>` },
  20: { title: "Leitura da aula", html: `<h2>Bebês e crianças</h2><p>Criança descompensa rápido. Febre alta, falta de ar, sonolência e recusa de líquidos pedem avaliação.</p><h3>O que fazer</h3><ul><li>Em engasgo de bebê, use tapas nas costas e compressões no peito.</li><li>Não dê mel a menor de 1 ano, nem remédio sem orientação.</li><li>Em convulsão febril, proteja, não segure e ligue 192 se for a primeira ou durar.</li><li>Nunca deixe bebê sozinho na banheira ou no trocador.</li></ul>` },
  21: { title: "Leitura da aula", html: `<h2>DEA para qualquer pessoa</h2><p>O desfibrilador externo automático orienta por voz. Pode ser usado por leigo.</p><h3>Passos</h3><ul><li>Ligue o aparelho e siga as instruções.</li><li>Cole as pás no peito nu, como o desenho mostra.</li><li>Não toque a pessoa enquanto analisa ou aplica o choque.</li><li>Retome as compressões assim que mandar.</li></ul><p>DEA não substitui as compressões. Elas continuam sendo o mais importante.</p>` },
  22: { title: "Leitura da aula", html: `<h2>Rua e trânsito</h2><p>Em acidente, sua segurança vem primeiro. Pare em local seguro, sinalize e ligue 192 e 193 se houver preso ou fogo.</p><h3>O que fazer</h3><ul><li>Não retire o capacete de motociclista.</li><li>Não mova a vítima, salvo risco imediato de fogo ou explosão.</li><li>Desligue o motor se for seguro.</li><li>Controle sangramento visível com pressão.</li></ul><p>Não vire curiosidade em risco. Afaste os que não estão ajudando.</p>` },
  23: { title: "Leitura da aula", html: `<h2>Escola, trabalho e eventos</h2><p>Saiba onde fica o kit, o DEA e a saída. Em evento, identifique quem coordena.</p><h3>O que fazer</h3><ul><li>Em mal-estar, leve a um local calmo e arejado.</li><li>Não dê o remédio de outra pessoa.</li><li>Se houver muitas vítimas, atenda primeiro quem não responde ou não respira.</li><li>Registre o que fez e a hora, para passar ao socorro.</li></ul>` },
  24: { title: "Leitura da aula", html: `<h2>Cena com várias pessoas</h2><p>Quando há mais de uma vítima, escolha por gravidade, não por quem grita mais.</p><h3>Prioridade</h3><ul><li>Primeiro: quem não responde e não respira.</li><li>Depois: sangramento intenso, falta de ar, confusão.</li><li>Por último: quem anda e fala, mesmo com dor.</li><li>Peça ajuda de outras pessoas para ligar e buscar o kit.</li></ul><p>Não abandone uma reanimação para atender um ferido leve.</p>` },
  25: { title: "Leitura da aula", html: `<h2>Esporte, praia e lazer</h2><p>Leve água, proteção solar e o telefone com carga. Combine um ponto de encontro.</p><h3>O que fazer</h3><ul><li>Cãibra: pare, alongue e hidrate.</li><li>Torção: gelo enrolado, elevação e não force.</li><li>Animais marinhos: lave com água do mar ou soro, não com água doce em alguns casos de água-viva; retire tentáculos com cuidado e procure socorro se houver falta de ar.</li><li>Em praia, respeite a bandeira e não entre para salvar se não souber.</li></ul>` },
  26: { title: "Como fazer a prova", html: `<h2>Avaliação final</h2><p>Você concluiu as aulas. A prova tem 20 questões de verdadeiro ou falso, sobre o que foi estudado.</p><h3>Para ser aprovado</h3><ul><li>Nota mínima: 70%.</li><li>Leia cada frase com calma.</li><li>A prova fica no menu Avaliações, depois do login.</li><li>Este curso é livre e não substitui formação em saúde nem o SAMU.</li></ul><p>Depois da aprovação, o certificado é emitido mediante a taxa de manutenção do aplicativo.</p>` },
}

const QUESTOES: { text: string; correct: boolean; explanation: string }[] = [
  { text: "Antes de atender, devo verificar se a cena está segura para mim.", correct: true, explanation: "A segurança de quem socorre vem primeiro." },
  { text: "Em suspeita de trauma, devo mover a vítima para uma posição mais confortável.", correct: false, explanation: "Não mova sem necessidade, pelo risco de lesão na coluna." },
  { text: "O número do SAMU é 192.", correct: true, explanation: "192 é o SAMU. Bombeiros 193, polícia 190." },
  { text: "Pessoa desmaiada deve receber água imediatamente.", correct: false, explanation: "Não dê líquido a quem está inconsciente." },
  { text: "Na convulsão, não se deve colocar objeto na boca.", correct: true, explanation: "Nada na boca. Proteja a cabeça e afaste objetos." },
  { text: "Sangramento se controla primeiro com pressão direta no local.", correct: true, explanation: "Pano limpo e pressão. Não retire o pano encharcado." },
  { text: "Queimadura deve ser tratada com pasta de dente ou manteiga.", correct: false, explanation: "Só água corrente. Nada de pasta, gelo ou gordura." },
  { text: "Boca torta, fala enrolada e fraqueza de um lado sugerem AVC e exigem 192.", correct: true, explanation: "AVC é tempo. Ligue na hora e anote o início." },
  { text: "Se a pessoa engasgada consegue tossir e falar, devo fazer Heimlich logo.", correct: false, explanation: "Se tosse e fala, incentive a tosse." },
  { text: "Em parada, as compressões devem ser no centro do peito, fortes e rápidas.", correct: true, explanation: "Cerca de 100 a 120 por minuto, deixando o tórax voltar." },
  { text: "Posso retirar o capacete de um motociclista acidentado.", correct: false, explanation: "Não retire. Imobilize e acione o socorro." },
  { text: "Em intoxicação, devo provocar vômito sempre.", correct: false, explanation: "Não provoque vômito, salvo orientação de um serviço de saúde." },
  { text: "Em picada de animal peçonhento, não se faz torniquete nem se chupa o local.", correct: true, explanation: "Lave, mantenha em repouso e vá ao serviço com soro." },
  { text: "Quem se afogou e melhorou não precisa de avaliação.", correct: false, explanation: "Pode piorar depois. Deve ser avaliado." },
  { text: "O DEA pode ser usado por pessoa leiga, seguindo a voz do aparelho.", correct: true, explanation: "Ligue, cole as pás e não toque durante o choque." },
  { text: "Em cena com várias vítimas, atendo primeiro quem grita mais alto.", correct: false, explanation: "Prioridade é quem não responde ou não respira." },
  { text: "Gestante com sangramento ou convulsão deve acionar o 192.", correct: true, explanation: "São sinais de urgência." },
  { text: "Este curso autoriza o aluno a aplicar medicamento injetável.", correct: false, explanation: "O curso é de primeiros socorros básicos, não de procedimentos de saúde." },
  { text: "Ao ligar 192, devo informar o que houve, o endereço e se a pessoa respira.", correct: true, explanation: "Esses dados orientam o envio do socorro." },
  { text: "A nota mínima da avaliação final é 70%.", correct: true, explanation: "Aprovação com 70%, como informado no curso." },
]

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key")
  if (key !== "bene-curati-setup-2026") {
    return NextResponse.json({ error: "Chave inválida" }, { status: 401 })
  }

  let leituras = 0
  for (const [ordem, texto] of Object.entries(TEXTOS)) {
    const lessonId = `soc-lesson-${ordem}`
    await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        description: Number(ordem) === 26
          ? "Leia o texto e faça a avaliação final no menu Avaliações."
          : "Leia o texto da aula, assista ao vídeo e marque como concluída.",
      },
    })
    const existing = await prisma.material.findFirst({
      where: { lessonId, type: "text" },
    })
    if (existing) {
      await prisma.material.update({
        where: { id: existing.id },
        data: { title: texto.title, content: texto.html },
      })
    } else {
      await prisma.material.create({
        data: { lessonId, title: texto.title, type: "text", content: texto.html },
      })
    }
    leituras++
  }

  let quiz = await prisma.quiz.findFirst({
    where: { courseId: "curso-socorros-01", isFinal: true },
  })
  if (!quiz) {
    quiz = await prisma.quiz.create({
      data: {
        courseId: "curso-socorros-01",
        title: "Avaliação final — Primeiros Socorros",
        description: "20 questões. Aprovação com 70%.",
        minScore: 7,
        maxAttempts: 3,
        isFinal: true,
        order: 99,
      },
    })
  }

  const jaTem = await prisma.question.count({ where: { quizId: quiz.id } })
  if (jaTem === 0) {
    for (let i = 0; i < QUESTOES.length; i++) {
      const q = QUESTOES[i]
      await prisma.question.create({
        data: {
          quizId: quiz.id,
          text: q.text,
          type: "true_false",
          explanation: q.explanation,
          order: i + 1,
          options: {
            create: [
              { text: "Verdadeiro", isCorrect: q.correct, order: 1 },
              { text: "Falso", isCorrect: !q.correct, order: 2 },
            ],
          },
        },
      })
    }
  }

  return NextResponse.json({ ok: true, leituras, questoes: QUESTOES.length })
  }
