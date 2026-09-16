import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Bene Curati Cuidados | Curso Profissional de Cuidador",
  description: "Formação em Home Care, Cuidados Domiciliares e Assistência ao Paciente. Nossa paixão é cuidar de quem você ama!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
