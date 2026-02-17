"use client";

export default function GhostOverlay() {
    return (
        <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center">
            {/* 
          BUG: Ghost Click Area
          The Parent is pointer-events-none (good).
          But this child is pointer-events-auto and INVISIBLE (bad).
          It sits right in the middle of the screen.
       */}
            <div
                className="w-64 h-64 bg-red-500/0 pointer-events-auto cursor-help"
                title="I am a invisible ghost blocking your clicks"
                onClick={() => console.log("Ghost clicked!")}
            >
                {/* Maybe put a very subtle hint? */}
            </div>
        </div>
    );
}
