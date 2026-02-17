"use client";

import HeroSection from "./components/HeroSection";
import GallerySection from "./components/GallerySection";
import CommentsSection from "./components/CommentsSection";
import HeavyScrollComponent from "./components/HeavyScrollComponent";
import ThemeToggle from "./components/ThemeToggle";
import FeatureModal from "./components/FeatureModal";
import AdminPanel from "./components/AdminPanel";
import ComplexState from "./components/ComplexState";
import ModalTrap from "./components/ModalTrap";
import FlickeringTooltip from "./components/FlickeringTooltip";
import GhostOverlay from "./components/GhostOverlay";
import PoltergeistScroll from "./components/PoltergeistScroll";
import TheBlob from "./components/TheBlob";
import RunawayButton from "./components/RunawayButton";
import InputMirror from "./components/InputMirror";
import { AuthProvider } from "./components/AuthContext";

export default function Home() {
  return (
    <AuthProvider>
      <main className="relative w-full overflow-x-hidden">
        {/* Floating Controls */}
        <ThemeToggle />

        {/* Full Screen Scroll Snap Sections */}
        <HeroSection />

        <div className="relative z-10 bg-black">
          <GallerySection />

          <div className="py-10 text-center text-gray-500 font-mono text-xs">
            CAUTION: HEAVY COMPUTATION ZONE AHEAD
          </div>

          <HeavyScrollComponent />

          <CommentsSection />

          <section className="py-20 max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-10 text-red-600 border-b border-red-900 pb-4">
              Nightmare Mode
            </h2>
            <AdminPanel />
            <ComplexState />
          </section>

          <section className="py-20 text-center">
            <h2 className="text-2xl font-bold mb-4">Experimental Features</h2>
            <div className="flex flex-col items-center gap-6">
              <FeatureModal />
              <ModalTrap />
              <FlickeringTooltip />
            </div>
            <TheBlob />
            <div className="w-full max-w-xl space-y-8">
              <RunawayButton />
              <InputMirror />
            </div>
          </section>

          <PoltergeistScroll />
          <GhostOverlay />

          <footer className="py-10 text-center text-gray-600 border-t border-white/10 mt-20">
            <p>&copy; 2024 Advanced Buggy Corp. All bugs reserved.</p>
          </footer>
        </div>
      </main>
    </AuthProvider>
  );
}
