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
          <div className="mt-10 max-w-2xl mx-auto text-left card border border-wine/20">
            <p className="text-wine font-medium text-sm uppercase tracking-wider mb-2">Outro curso, mesma conta</p>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Primeiros Socorros e Prevenção de Acidentes</h3>
            <p className="text-gray-600 text-sm mb-4">
              Para o público geral: casa, rua, escola e trabalho. 40 horas (34h teóricas + 6h práticas), 26 aulas e prova de 70%. Não substitui o curso de cuidador. Certificado próprio, código BC-PS, taxa de emissão de R$ 50.
            </p>
            <Link href="/cadastro?curso=socorros" className="btn-outline text-sm">Quero este curso</Link>
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
              { icon: BookOpen, title: "22 Módulos Completos", desc: "Conteúdo atualizado e prático para o dia a dia do cuidador, incluindo o manejo obrigatório." },
              { icon: Award, title: "Certificado Digital", desc: "A formação é gratuita. Ao concluir, emite-se o certificado mediante taxa única, com código de autenticidade e QR Code." },
              { icon: Users, title: "Humanização", desc: "Formação focada em ética, empatia e cuidado centrado na pessoa." },
              { icon: Shield, title: "Segurança e Biossegurança", desc: "Módulos específicos sobre prevenção de infecções e emergências." },
              { icon: CheckCircle, title: "Avaliações Práticas", desc: "Testes por módulo e avaliação final para consolidar o aprendizado." },
              { icon: Heart, title: "Acesso Livre e Flexível", desc: "Est
