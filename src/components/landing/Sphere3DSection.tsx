import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { Target, TrendingUp, Zap, Shield } from 'lucide-react';

export const Sphere3DSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
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
    if (!containerRef.current) return;

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
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 4;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    containerRef.current.appendChild(renderer.domElement);

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
      new THREE.Vector2(containerRef.current.clientWidth, containerRef.current.clientHeight),
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
      if (!containerRef.current || !sceneRef.current.camera || !sceneRef.current.renderer || !sceneRef.current.composer) return;

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

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
      if (containerRef.current && sceneRef.current.renderer) {
        containerRef.current.removeChild(sceneRef.current.renderer.domElement);
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

  const goals = [
    {
      icon: Target,
      title: 'Master Trading Strategies',
      description: 'Learn professional trading techniques with our advanced AI-powered indicators that identify market tops and bottoms in real-time.',
    },
    {
      icon: TrendingUp,
      title: 'Multi-Asset Trading',
      description: 'Trade effortlessly across Forex, Cryptocurrencies, Indices, and Stocks with institutional-grade tools at your fingertips.',
    },
    {
      icon: Zap,
      title: 'AI-Powered Insights',
      description: 'Our advanced algorithms adapt to market trends, providing you with intelligent signals that enhance your trading profits.',
    },
    {
      icon: Shield,
      title: 'Risk-Free Learning',
      description: 'Practice with confidence using our demo account. Perfect your strategies before risking real capital.',
    },
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Side - App Goals & Help */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
                Transform Your{' '}
                <span className="text-primary">Trading Journey</span>
              </h2>
              <p className="text-lg sm:text-xl text-foreground/80 leading-relaxed mb-8">
                T-Line empowers traders of all levels with cutting-edge AI indicators and professional-grade tools. 
                Whether you're just starting or refining advanced strategies, we provide the insights you need to succeed.
              </p>
            </div>

            <div className="space-y-6">
              {goals.map((goal, index) => {
                const Icon = goal.icon;
                return (
                  <motion.div
                    key={goal.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex gap-4 p-4 rounded-lg border border-primary/20 bg-card/50 hover:border-primary/50 transition-all"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">{goal.title}</h3>
                      <p className="text-foreground/70 leading-relaxed">{goal.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="pt-6"
            >
              <div className="inline-flex items-center gap-3 px-6 py-4 rounded-lg border border-primary/30 bg-primary/5">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <p className="text-foreground/90 font-medium">
                  Ready to elevate your trading? Start with our free demo account today.
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - 3D Sphere */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative h-[600px] lg:h-[700px]"
          >
            <div
              ref={containerRef}
              className="w-full h-full rounded-lg overflow-hidden"
              style={{ background: 'transparent' }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

