import Link from "next/link";
import Image from "next/image";
import { BookOpen, Award, Users, Shield, CheckCircle, Heart } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-100 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-bene-curati-v2.png"
              alt="Bene Curati Cuidados"
              width={52}
              height={52}
              className="object-contain"
              priority
            />
            <div>
              <h1 className="font-bold text-wine text-lg leading-tight">Bene Curati Cuidados</h1>
              <p className="text-xs text-gray-500">Nossa paixão é cuidar de quem você ama!</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-outline text-sm hidden sm:inline-flex">
              Entrar
            </Link>
            <Link href="/cadastro" className="btn-primary text-sm">
              Criar minha conta
            </Link>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-b from-wine/5 to-white py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-wine font-medium text-sm uppercase tracking-wider mb-3 text-center">
            Uma conta. Dois cursos.
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-10 leading-tight text-center">
            Escolha o seu curso
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card border border-wine/20 text-left">
              <p className="text-wine font-medium text-sm uppercase tracking-wider mb-2">Formação profissional</p>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Curso de Cuidador Profissional</h3>
              <p className="text-gray-600 text-sm mb-4">
                22 módulos, 210 horas. Para quem vai cuidar de pessoas. Certificado próprio. A taxa de emissão é a mesma dos dois cursos.
              </p>
              <Link href="/cadastro" className="btn-primary text-sm">Quero este curso</Link>
            </div>
            <div className="card border border-wine/20 text-left">
              <p className="text-wine font-medium text-sm uppercase tracking-wider mb-2">Público geral</p>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Primeiros Socorros e Prevenção de Acidentes</h3>
              <p className="text-gray-600 text-sm mb-4">
                26 aulas, 40 horas. Casa, rua, escola e trabalho. Não substitui o curso de cuidador. Certificado próprio. A taxa de emissão é a mesma dos dois cursos.
              </p>
              <Link href="/cadastro?curso=socorros" className="btn-primary text-sm">Quero este curso</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-10">
            Por que escolher a Bene Curati?
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: BookOpen, title: "Módulos Completos", desc: "Conteúdo atualizado e prático para o dia a dia do cuidador, incluindo o manejo obrigatório." },
              { icon: Award, title: "Certificado Digital", desc: "A formação é gratuita. Ao concluir, emite-se o certificado mediante taxa única, com código de autenticidade e QR Code." },
              { icon: Users, title: "Humanização", desc: "Formação focada em ética, empatia e cuidado centrado na pessoa." },
              { icon: Shield, title: "Segurança e Biossegurança", desc: "Módulos específicos sobre prevenção de infecções e emergências." },
              { icon: CheckCircle, title: "Avaliações Práticas", desc: "Testes por módulo e avaliação final para consolidar o aprendizado." },
              { icon: Heart, title: "Acesso Livre e Flexível", desc: "Estude no seu ritmo, pelo celular, tablet ou computador, sem mensalidade para cursar." },
            ].map((item, i) => (
              <div key={i} className="card hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-wine/10 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-wine" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="conteudo" className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Curso de Cuidador Profissional
          </h3>
          <p className="text-center text-gray-600 mb-10 max-w-xl mx-auto">
            22 módulos — 210 horas. Esta lista é só deste curso.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              "Papel do Cuidador",
              "Ética e Humanização",
              "Anatomia e Fisiologia",
              "Envelhecimento e Doenças",
              "Biossegurança",
              "Sinais Vitais",
              "Higiene e Banho no Leito",
              "Decúbito e Prevenção de LPP",
              "Nutrição, Hidratação e Disfagia",
              "Medicamentos - Limites",
              "Sondas e Ostomias",
              "Curativos e Pele",
              "Mobilização e Prevenção de Quedas",
              "Alzheimer, Parkinson, AVC, DM, HAS",
              "Primeiros Socorros",
              "Cuidados Paliativos",
              "Comunicação e Família",
              "Diário de Bordo",
              "Autocuidado e Burnout",
              "Ética e Legislação",
              "Código de Excelência + Prova Final",
              "Manejo prático obrigatório",
            ].map((title, i) => (
              <div key={i} className="flex items-start gap-3 bg-white p-3 rounded-lg border border-gray-100">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-wine text-white text-xs font-bold flex items-center justify-center">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-sm text-gray-700">{title}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Primeiros Socorros e Prevenção de Acidentes
          </h3>
          <p className="text-center text-gray-600 mb-10 max-w-xl mx-auto">
            Outro curso, 26 aulas — 40 horas. Público geral. Não faz parte do cuidador.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              "Princípios do atendimento", "Desmaio", "Crises convulsivas",
              "Sangramentos", "Queimaduras", "AVC", "Engasgo", "PCR e suporte básico",
              "Quedas", "Fraturas", "Intoxicações", "Animais peçonhentos",
              "Afogamento", "Extremos térmicos", "Saúde mental", "Gestação",
              "Prevenção", "Como acionar o 192", "Kit de emergência",
              "Bebês e crianças", "DEA para qualquer pessoa", "Rua e trânsito",
              "Escola, trabalho e eventos", "Cena com várias pessoas",
              "Esporte, praia e lazer", "Avaliação final",
            ].map((title, i) => (
              <div key={i} className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-wine text-white text-xs font-bold flex items-center justify-center">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-sm text-gray-700">{title}</span>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/cadastro?curso=socorros" className="btn-primary text-sm">Quero este curso</Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-wine text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Pronto para transformar sua carreira?
          </h3>
          <p className="text-wine-light mb-8 opacity-90">
            Cadastre-se e inicie a formação. O curso é livre e sem custo; a taxa refere-se somente à emissão do certificado.
          </p>
          <Link href="/cadastro" className="inline-block bg-white text-wine font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition">
            Criar minha conta
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Heart className="w-5 h-5 text-wine" fill="currentColor" />
            <span className="font-semibold text-white">Bene Curati Cuidados</span>
          </div>
          <p className="text-sm mb-2">Nossa paixão é cuidar de quem você ama!</p>
          <p className="text-xs mb-2">
            Contato:{" "}
            <a href="mailto:contato@benecurati.com.br" className="text-white hover:underline">
              contato@benecurati.com.br
            </a>
          </p>
          <p className="text-xs">© {new Date().getFullYear()} Bene Curati Cuidados. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
                }
