import Link from "next/link";
import Image from "next/image";
import { BookOpen, Award, Users, Shield, CheckCircle, Heart } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
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

      {/* Hero */}
      <section className="bg-gradient-to-b from-wine/5 to-white py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-wine font-medium text-sm uppercase tracking-wider mb-3">
            Formação Profissional
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Curso de Cuidador Profissional
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Prepare-se para atuar com responsabilidade, conhecimento e humanização nos cuidados com pessoas que precisam de assistência. Formação livre de 210 horas (204h teóricas + 6h práticas). O acesso ao curso é gratuito; há apenas a taxa de emissão do certificado ao concluir.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cadastro" className="btn-primary text-base px-8 py-3">
              Começar agora
            </Link>
            <Link href="#conteudo" className="btn-secondary text-base px-8 py-3">
              Conhecer o curso
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-10">
            Por que escolher a Bene Curati?
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: BookOpen, title: "22 Módulos Completos", desc: "Conteúdo atualizado e prático para o dia a dia do cuidador, incluindo o manejo obrigatório." },
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

      {/* Content */}
      <section id="conteudo" className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-4">
            Conteúdo Programático
          </h3>
          <p className="text-center text-gray-600 mb-10 max-w-xl mx-auto">
            22 módulos da formação Bene Curati Cuidados — 210 horas (204h teóricas + 6h práticas).
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

      {/* CTA */}
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

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Heart className="w-5 h-5 text-wine" fill="currentColor" />
            <span className="font-semibold text-white">Bene Curati Cuidados</span>
          </div>
          <p className="text-sm mb-2">Nossa paixão é cuidar de quem você ama!</p>
          <p className="text-xs">© {new Date().getFullYear()} Bene Curati Cuidados. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
