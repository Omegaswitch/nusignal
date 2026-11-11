import { AetherRibbonMesh } from "@/components/ui/aether-ribbon-mesh";

export default function AetherRibbonMeshDemo() {
  return (
    <div className="relative h-[480px] w-full overflow-hidden rounded-lg bg-void">
      <AetherRibbonMesh />
      <p className="pointer-events-none absolute bottom-4 left-4 font-mono text-xs text-mute">move / click</p>
    </div>
  );
}
