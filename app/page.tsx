import SignalLoss from "@/components/sections/signal-loss";
import Info from "@/components/sections/info";
import Footer from "@/components/sections/footer";

export default function Home() {
  return (
    <main>
      {/* the hero lives inside SignalLoss: its logo is the one that loses signal */}
      <SignalLoss />
      <Info />
      <Footer />
    </main>
  );
}
