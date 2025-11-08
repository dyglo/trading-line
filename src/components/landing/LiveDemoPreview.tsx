import { motion } from 'framer-motion';
import { useTradingStore } from '@/store/tradingStore';
import { DollarSign, TrendingUp, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export const LiveDemoPreview = () => {
  const account = useTradingStore((state) => state.account);
  const trades = useTradingStore((state) => state.trades);
  const [animatedBalance, setAnimatedBalance] = useState(account.balance);
  const sphereContainerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene | null;
    camera: THREE.PerspectiveCamera | null;
    renderer: THREE.WebGLRenderer | null;
    composer: EffectComposer | null;
    innerKnot: THREE.Mesh | null;
    animationId: number | null;
  }>({
    scene: null,
    camera: null,
    renderer: null,
    composer: null,
    innerKnot: null,
    animationId: null,
  });

  useEffect(() => {
    const diff = account.balance - animatedBalance;
    if (Math.abs(diff) > 0.01) {
      const duration = 1000;
      const steps = 30;
      const stepValue = diff / steps;
      let currentStep = 0;

      const interval = setInterval(() => {
        currentStep++;
        if (currentStep >= steps) {
          setAnimatedBalance(account.balance);
          clearInterval(interval);
        } else {
          setAnimatedBalance((prev) => prev + stepValue);
        }
      }, duration / steps);

      return () => clearInterval(interval);
    }
  }, [account.balance, animatedBalance]);

  // Initialize 3D Sphere Background
  useEffect(() => {
    if (!sphereContainerRef.current) return;

    // Create gradient texture
    function createGradientTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 1;
      const context = canvas.getContext('2d');
      if (!context) return null;

      const gradient = context.createLinearGradient(0, 0, 256, 0);
      gradient.addColorStop(0, '#fcd34d'); // gold/yellow
      gradient.addColorStop(1, '#000000'); // black
      context.fillStyle = gradient;
      context.fillRect(0, 0, 256, 1);

      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      return texture;
    }

    // Initialize Three.js
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      sphereContainerRef.current.clientWidth / sphereContainerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 4;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(sphereContainerRef.current.clientWidth, sphereContainerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    sphereContainerRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Create gradient texture
    const gradientTexture = createGradientTexture();
    if (!gradientTexture) return;

    // Inner Glowing Knot
    const knotGeometry = new THREE.TorusKnotGeometry(1, 0.2, 200, 32, 2, 3);
    const knotMaterial = new THREE.MeshStandardMaterial({
      map: gradientTexture,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0xffffff,
      emissiveMap: gradientTexture,
      emissiveIntensity: 2.0,
    });
    const innerKnot = new THREE.Mesh(knotGeometry, knotMaterial);
    scene.add(innerKnot);

    // Post-processing
    const renderPass = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(sphereContainerRef.current.clientWidth, sphereContainerRef.current.clientHeight),
      1.2, // strength
      0.3, // radius
      0.8 // threshold
    );

    const composer = new EffectComposer(renderer);
    composer.addPass(renderPass);
    composer.addPass(bloomPass);

    // Store references
    sceneRef.current.scene = scene;
    sceneRef.current.camera = camera;
    sceneRef.current.renderer = renderer;
    sceneRef.current.composer = composer;
    sceneRef.current.innerKnot = innerKnot;

    // Animation loop
    function animate() {
      const animationId = requestAnimationFrame(animate);

      if (sceneRef.current.innerKnot) {
        sceneRef.current.innerKnot.rotation.x += 0.005;
        sceneRef.current.innerKnot.rotation.y += 0.008;
      }

      if (sceneRef.current.composer) {
        sceneRef.current.composer.render();
      }

      sceneRef.current.animationId = animationId;
    }
    animate();

    // Handle resize
    const handleResize = () => {
      if (!sphereContainerRef.current || !sceneRef.current.camera || !sceneRef.current.renderer || !sceneRef.current.composer) return;

      const width = sphereContainerRef.current.clientWidth;
      const height = sphereContainerRef.current.clientHeight;

      sceneRef.current.camera.aspect = width / height;
      sceneRef.current.camera.updateProjectionMatrix();
      sceneRef.current.renderer.setSize(width, height);
      sceneRef.current.composer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (sceneRef.current.animationId) {
        cancelAnimationFrame(sceneRef.current.animationId);
      }
      if (sphereContainerRef.current && sceneRef.current.renderer) {
        try {
          sphereContainerRef.current.removeChild(sceneRef.current.renderer.domElement);
        } catch (e) {
          // Element already removed
        }
      }
      if (sceneRef.current.renderer) {
        sceneRef.current.renderer.dispose();
      }
      if (sceneRef.current.innerKnot) {
        sceneRef.current.innerKnot.geometry.dispose();
        if (sceneRef.current.innerKnot.material instanceof THREE.Material) {
          sceneRef.current.innerKnot.material.dispose();
        }
      }
    };
  }, []);

  const recentTrades = trades
    .filter((t) => t.closedAt)
    .slice(-3)
    .reverse();

  const totalPnL = trades
    .filter((t) => t.closedAt)
    .reduce((sum, t) => sum + t.pnl, 0);

  return (
    <section className="py-20 sm:py-24 lg:py-32 bg-background relative overflow-hidden">
      {/* 3D Sphere Background */}
      <div
        ref={sphereContainerRef}
        className="absolute inset-0 w-full h-full pointer-events-none opacity-30"
        style={{ zIndex: 0 }}
      />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center mb-12"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4 text-foreground">
            See It In Action
          </h2>
          <p className="text-lg text-foreground/80">
            Get a preview of the live trading dashboard with real-time updates.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto max-w-4xl relative z-10"
        >
          {/* Transparent Card with Backdrop Blur */}
          <div className="rounded-2xl border border-primary/30 bg-card/20 backdrop-blur-md p-6 sm:p-8 shadow-2xl">
            <div className="grid gap-4 sm:grid-cols-3 mb-8">
              <div className="rounded-xl border border-primary/20 bg-card/30 backdrop-blur-sm p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-foreground/60">Balance</p>
                    <p className="text-xl font-bold tracking-tight text-foreground">
                      ${animatedBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-primary/20 bg-card/30 backdrop-blur-sm p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-foreground/60">Equity</p>
                    <p className="text-xl font-bold tracking-tight text-foreground">
                      ${account.equity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-primary/20 bg-card/30 backdrop-blur-sm p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-foreground/60">Total P&L</p>
                    <p className={`text-xl font-bold tracking-tight ${totalPnL >= 0 ? 'text-long' : 'text-short'}`}>
                      {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {recentTrades.length > 0 && (
              <div className="mb-8">
                <h3 className="mb-4 text-lg font-semibold text-foreground">Recent Trades</h3>
                <div className="space-y-2">
                  {recentTrades.map((trade) => {
                    const isPositive = trade.pnl >= 0;
                    return (
                      <div
                        key={trade.id}
                        className="flex items-center justify-between rounded-lg border border-primary/20 bg-card/30 backdrop-blur-sm p-3"
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant={trade.side === 'LONG' ? 'default' : 'destructive'}>
                            {trade.side}
                          </Badge>
                          <span className="font-medium text-foreground">{trade.symbol}</span>
                          <span className="text-sm text-foreground/60">
                            {trade.sizingMode === 'LOTS'
                              ? `${(trade.lotSize ?? 0).toFixed(2)} lot${(trade.lotSize ?? 0) === 1 ? '' : 's'}`
                              : trade.qty.toLocaleString()}
                            {' '}@ ${trade.avgPrice.toFixed(2)}
                          </span>
                        </div>
                        <span className={`font-semibold ${isPositive ? 'text-long' : 'text-short'}`}>
                          {isPositive ? '+' : ''}${trade.pnl.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mb-8 rounded-xl border border-primary/20 bg-card/30 backdrop-blur-sm p-8 text-center">
              <div className="mx-auto max-w-md">
                <div className="mb-4 h-32 w-full rounded-lg bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border border-primary/20" />
                <p className="text-sm text-foreground/70">
                  Professional TradingView charts with real-time market data
                </p>
              </div>
            </div>

            <div className="text-center">
              <Button asChild size="lg" className="group bg-primary text-primary-foreground hover:bg-primary/90">
                <Link to="/dashboard">
                  Try It Now - Free
                  <TrendingUp className="ml-2 h-4 w-4 transition-transform group-hover:translate-y-[-2px]" />
                </Link>
              </Button>
              <p className="mt-3 text-xs text-foreground/60">
                No credit card required • Instant access • Real-time data
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
