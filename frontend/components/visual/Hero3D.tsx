"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/* The Gate — the living hero centerpiece, and the first real Three.js scene.

   A luminous threshold ring with a stream of transaction pulses flowing through
   it. Most pass clean and teal; roughly one in four is a "widened" decision that
   the gate catches — it stops at the ring plane and burns crimson instead of
   passing. It is the whole Threshold thesis as one continuous object: the
   Transaction Moment is a gate, and a policy change is what tries to slip through.

   Restraint on purpose (Stripe/Linear, not a screensaver): dark, slow, few
   elements, emissive glow rather than heavy post-processing. Rendered client-only
   and lazily (see Hero), gated off for reduced-motion / no-WebGL, where the static
   SVG motif stands in. */

const TEAL = "#22e6c8";
const CRIMSON = "#ff4d63";
const TRACK = 8; // pulses travel from z=+4 to z=-4 and loop

function Gate() {
  const ring = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (ring.current) ring.current.rotation.z += dt * 0.12;
    if (halo.current) halo.current.rotation.z -= dt * 0.05;
  });
  return (
    <group>
      {/* the threshold itself */}
      <mesh ref={ring}>
        <torusGeometry args={[1.55, 0.05, 24, 140]} />
        <meshStandardMaterial color={TEAL} emissive={TEAL} emissiveIntensity={1.7} roughness={0.25} metalness={0.5} />
      </mesh>
      {/* a fainter outer halo ring for depth */}
      <mesh ref={halo}>
        <torusGeometry args={[1.85, 0.012, 16, 140]} />
        <meshStandardMaterial color="#5b8cff" emissive="#5b8cff" emissiveIntensity={0.9} roughness={0.4} />
      </mesh>
      {/* the decision plane — a whisper of a disc inside the ring */}
      <mesh>
        <circleGeometry args={[1.5, 64]} />
        <meshBasicMaterial color={TEAL} transparent opacity={0.04} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

type Pulse = { speed: number; offset: number; widened: boolean; wobble: number };

function Pulses() {
  const pulses = useMemo<Pulse[]>(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        speed: 0.55 + (i % 3) * 0.16,
        offset: (i / 10) * TRACK,
        widened: i % 4 === 0, // ~1 in 4 is caught at the gate
        wobble: (i % 5) * 0.18 - 0.36,
      })),
    [],
  );
  const refs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    for (let i = 0; i < pulses.length; i++) {
      const p = pulses[i]!;
      const m = refs.current[i];
      if (!m) continue;
      let z = 4 - ((t * p.speed + p.offset) % TRACK);
      const mat = m.material as THREE.MeshStandardMaterial;
      if (p.widened && z <= 0.12) {
        // caught: hold at the gate plane and burn crimson, then let it loop away
        z = 0.12;
        mat.color.set(CRIMSON);
        mat.emissive.set(CRIMSON);
      } else {
        mat.color.set(TEAL);
        mat.emissive.set(TEAL);
      }
      m.position.set(p.wobble, p.wobble * 0.5, z);
      // brighten as it nears the gate
      const near = Math.max(0, 1 - Math.abs(z) / 4);
      mat.emissiveIntensity = 1.1 + near * 2.2;
      const s = 0.9 + near * 0.5;
      m.scale.setScalar(s);
    }
  });

  return (
    <group>
      {pulses.map((p, i) => (
        <mesh key={i} ref={(el) => { refs.current[i] = el; }} position={[p.wobble, p.wobble * 0.5, 4]}>
          <sphereGeometry args={[0.075, 18, 18]} />
          <meshStandardMaterial color={TEAL} emissive={TEAL} emissiveIntensity={2} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

export default function Hero3D() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [2.4, 1.15, 4.4], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
      aria-hidden
    >
      <ambientLight intensity={0.45} />
      <pointLight position={[3, 3, 4]} intensity={45} color="#5b8cff" />
      <pointLight position={[-3, -2, 2]} intensity={26} color={TEAL} />
      <group rotation={[0.32, -0.5, 0.04]}>
        <Gate />
        <Pulses />
      </group>
    </Canvas>
  );
}
