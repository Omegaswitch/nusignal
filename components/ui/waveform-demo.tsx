import { Waveform } from "@/components/ui/waveform"

export default function WaveformDemo() {
  return (
    <div className="flex min-h-[240px] items-center justify-center bg-background p-8">
      <Waveform label="Audio Signal" bars={28} playing intensity="medium" className="w-80" />
    </div>
  )
}
