import SignalLoss from "@/components/sections/signal-loss";
import Info from "@/components/sections/info";
import Footer from "@/components/sections/footer";
import SnapAssist from "@/components/snap-assist";

export default function Home() {
  return (
    <main>
      {/* the hero lives inside SignalLoss: its logo is the one that loses signal */}
      <SignalLoss />
      <Info />
      <Footer />
      <SnapAssist />
    </main>
  );
}
