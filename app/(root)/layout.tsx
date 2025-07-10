import Footer from "@/components/ui/footer";
import Header from "@/components/ui/shared/header";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen flex-col">
      ROOT - LAYOUT<Header></Header>
      <main className="flex-1 wrapper">{children}</main>
      <Footer></Footer>
    </div>
  );
}
