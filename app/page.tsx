import Hero from "@/components/sections/hero";
import SignalLoss from "@/components/sections/signal-loss";
import Info from "@/components/sections/info";
import Footer from "@/components/sections/footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <SignalLoss />
      <Info />
      <Footer />
    </main>
  );
}
