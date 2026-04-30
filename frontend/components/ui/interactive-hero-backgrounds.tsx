"use client";

import React, { useRef, useEffect, useMemo } from "react";
import {
    Clock, PerspectiveCamera, Scene, WebGLRenderer, SRGBColorSpace, MathUtils,
    Vector2, Vector3, MeshPhysicalMaterial, Color, Object3D, InstancedMesh,
    PMREMGenerator, SphereGeometry, AmbientLight, PointLight, ACESFilmicToneMapping,
    Raycaster, Plane,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

class X {
    #config: any;
    #resizeObserver?: ResizeObserver;
    #intersectionObserver?: IntersectionObserver;
    #resizeTimer?: number;
    #animationFrameId: number = 0;
    #clock: Clock = new Clock();
    #animationState = { elapsed: 0, delta: 0 };
    #isAnimating: boolean = false;
    #isVisible: boolean = false;
    canvas: HTMLCanvasElement;
    camera: PerspectiveCamera;
    scene: Scene;
    renderer: WebGLRenderer;
    size: any = { width: 0, height: 0, wWidth: 0, wHeight: 0, ratio: 0, pixelRatio: 0 };
    onBeforeRender: (state: { elapsed: number; delta: number }) => void = () => {};
    onAfterResize: (size: any) => void = () => {};

    constructor(config: any) {
        this.#config = config;
        this.canvas = this.#config.canvas;
        this.camera = new PerspectiveCamera(50, 1, 0.1, 100);
        this.scene = new Scene();
        this.renderer = new WebGLRenderer({
            canvas: this.canvas,
            powerPreference: "high-performance",
            alpha: true,
            antialias: true,
            ...this.#config.rendererOptions,
        });
        this.renderer.outputColorSpace = SRGBColorSpace;
        this.canvas.style.display = "block";
        this.#initObservers();
        this.resize();
    }
    #initObservers() {
        const parentEl = this.#config.size === "parent" ? this.canvas.parentNode as Element : null;
        if(parentEl) {
            this.#resizeObserver = new ResizeObserver(this.#onResize.bind(this));
            this.#resizeObserver.observe(parentEl);
        } else {
            window.addEventListener("resize", this.#onResize.bind(this));
        }
        this.#intersectionObserver = new IntersectionObserver(this.#onIntersection.bind(this), { threshold: 0 });
        this.#intersectionObserver.observe(this.canvas);
        document.addEventListener("visibilitychange", this.#onVisibilityChange.bind(this));
    }
    #onResize() { if (this.#resizeTimer) clearTimeout(this.#resizeTimer); this.#resizeTimer = window.setTimeout(this.resize.bind(this), 100); }
    resize() {
        const parentEl = this.#config.size === "parent" ? this.canvas.parentNode as HTMLElement : null;
        const w = parentEl ? parentEl.offsetWidth : window.innerWidth;
        const h = parentEl ? parentEl.offsetHeight : window.innerHeight;
        this.size.width = w; this.size.height = h; this.size.ratio = w / h;
        this.camera.aspect = this.size.ratio; this.camera.updateProjectionMatrix();
        const fovRad = (this.camera.fov * Math.PI) / 180;
        this.size.wHeight = 2 * Math.tan(fovRad / 2) * this.camera.position.z; this.size.wWidth = this.size.wHeight * this.camera.aspect;
        this.renderer.setSize(w, h); this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.onAfterResize(this.size);
    }
    #onIntersection(e: any) { this.#isAnimating = e[0].isIntersecting; this.#isAnimating ? this.#startAnimation() : this.#stopAnimation(); }
    #onVisibilityChange() { if (this.#isAnimating) document.hidden ? this.#stopAnimation() : this.#startAnimation(); }
    #startAnimation() { if (this.#isVisible) return; this.#isVisible = true; this.#clock.start(); const f = () => { this.#animationFrameId = requestAnimationFrame(f); this.#animationState.delta = this.#clock.getDelta(); this.#animationState.elapsed += this.#animationState.delta; this.onBeforeRender(this.#animationState); this.renderer.render(this.scene, this.camera); }; f(); }
    #stopAnimation() { if (this.#isVisible) { cancelAnimationFrame(this.#animationFrameId); this.#isVisible = false; this.#clock.stop(); } }
    dispose() { this.#stopAnimation(); this.#resizeObserver?.disconnect(); this.#intersectionObserver?.disconnect(); window.removeEventListener("resize", this.#onResize.bind(this)); document.removeEventListener("visibilitychange", this.#onVisibilityChange.bind(this)); this.scene.clear(); this.renderer.dispose(); }
}

class W {
    config: any;
    positionData: Float32Array;
    velocityData: Float32Array;
    sizeData: Float32Array;
    center: Vector3 = new Vector3();

    constructor(config: any) {
        this.config = config;
        this.positionData = new Float32Array(3 * config.count);
        this.velocityData = new Float32Array(3 * config.count);
        this.sizeData = new Float32Array(config.count);
        this.#initializePositions(); this.setSizes();
    }
    #initializePositions() { const { count, maxX, maxY, maxZ } = this.config; this.center.toArray(this.positionData, 0); for (let i = 1; i < count; i++) { const idx = 3 * i; this.positionData[idx] = MathUtils.randFloatSpread(2 * maxX); this.positionData[idx + 1] = MathUtils.randFloatSpread(2 * maxY); this.positionData[idx + 2] = MathUtils.randFloatSpread(2 * maxZ); } }
    setSizes() { const { count, size0, minSize, maxSize } = this.config; this.sizeData[0] = size0; for (let i = 1; i < count; i++) this.sizeData[i] = MathUtils.randFloat(minSize, maxSize); }
    update(deltaInfo: { delta: number }) {
        const { config, center, positionData, sizeData, velocityData } = this;
        const startIdx = config.controlSphere0 ? 1 : 0;
        if (config.controlSphere0) { new Vector3().fromArray(positionData, 0).lerp(center, 0.1).toArray(positionData, 0); new Vector3(0, 0, 0).toArray(velocityData, 0); }
        for (let i = startIdx; i < config.count; i++) {
            const base = 3 * i;
            const pos = new Vector3().fromArray(positionData, base); const vel = new Vector3().fromArray(velocityData, base);
            vel.y -= deltaInfo.delta * config.gravity * sizeData[i]; vel.multiplyScalar(config.friction); vel.clampLength(0, config.maxVelocity); pos.add(vel);
            for (let j = i + 1; j < config.count; j++) { const otherBase = 3 * j; const otherPos = new Vector3().fromArray(positionData, otherBase); const diff = new Vector3().subVectors(otherPos, pos); const dist = diff.length(); const sumRadius = sizeData[i] + sizeData[j]; if (dist < sumRadius) { const overlap = (sumRadius - dist) * 0.5; diff.normalize(); pos.addScaledVector(diff, -overlap); otherPos.addScaledVector(diff, overlap); pos.toArray(positionData, base); otherPos.toArray(positionData, otherBase); } }
            if (Math.abs(pos.x) + sizeData[i] > config.maxX) { pos.x = Math.sign(pos.x) * (config.maxX - sizeData[i]); vel.x *= -config.wallBounce; }
            if (pos.y - sizeData[i] < -config.maxY) { pos.y = -config.maxY + sizeData[i]; vel.y *= -config.wallBounce; }
            if (Math.abs(pos.z) + sizeData[i] > config.maxZ) { pos.z = Math.sign(pos.z) * (config.maxZ - sizeData[i]); vel.z *= -config.wallBounce; }
            pos.toArray(positionData, base); vel.toArray(velocityData, base);
        }
    }
}

const U = new Object3D();
class Z extends InstancedMesh {
    config: any;
    physics: W;
    ambientLight: AmbientLight;
    light: PointLight;
    constructor(renderer: WebGLRenderer, params: any) {
        const pmrem = new PMREMGenerator(renderer); const envTexture = pmrem.fromScene(new RoomEnvironment()).texture; pmrem.dispose();
        const geometry = new SphereGeometry(1, 24, 24);
        const material = new MeshPhysicalMaterial({ envMap: envTexture, ...params.materialParams });
        super(geometry, material, params.count);
        this.config = params; this.physics = new W(this.config);
        this.ambientLight = new AmbientLight(0xffffff, params.ambientIntensity); this.add(this.ambientLight);
        this.light = new PointLight(0xffffff, params.lightIntensity, 100, 1); this.add(this.light);
        this.setColors(this.config.colors);
    }
    setColors(colors: (string | Color)[]) {
        if (!Array.isArray(colors) || !colors.length) return;
        const colorObjs = colors.map(c => c instanceof Color ? c : new Color(c));
        for (let i = 0; i < this.count; i++) this.setColorAt(i, colorObjs[i % colorObjs.length]);
        if (this.instanceColor) this.instanceColor.needsUpdate = true;
    }
    update(deltaInfo: { delta: number }) {
        this.physics.update(deltaInfo);
        for (let i = 0; i < this.count; i++) {
            U.position.fromArray(this.physics.positionData, 3 * i);
            U.scale.setScalar(this.physics.sizeData[i]);
            U.updateMatrix();
            this.setMatrixAt(i, U.matrix);
        }
        this.instanceMatrix.needsUpdate = true;
        if (this.config.controlSphere0) this.light.position.fromArray(this.physics.positionData, 0);
    }
}

const pointer = new Vector2();
function onPointerMove(e: PointerEvent) {
    pointer.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
}

const defaultBallpitConfig = {
    count: 150,
    materialParams: { metalness: 0.7, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.2 },
    minSize: 0.3, maxSize: 0.8, size0: 1.0,
    gravity: 0.4, friction: 0.995, wallBounce: 0.2, maxVelocity: 0.1,
    maxX: 10, maxY: 10, maxZ: 10,
    controlSphere0: true, followCursor: true,
    lightIntensity: 4, ambientIntensity: 1.5,
};

const lightColors = ["#001F3F", "#003366", "#004080"]; // Darker Blue colors
const darkColors = ["#000814", "#001233", "#001d3d"]; // Deep Night Blue colors

type BallpitProps = Partial<typeof defaultBallpitConfig & { colors: (string | Color)[] }>;

interface InteractiveHeroProps {
    heroTitle?: string;
    heroDescription?: string;
    className?: string;
    ballpitConfig?: BallpitProps;
    children?: React.ReactNode;
}

export const InteractiveHero: React.FC<InteractiveHeroProps> = ({
    heroTitle = "Innovation Meets Simplicity",
    heroDescription = "Discover cutting-edge solutions designed for the modern digital landscape.",
    className,
    ballpitConfig = {},
    children,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { theme } = useTheme();

    const config = useMemo(() => ({
        ...defaultBallpitConfig,
        ...ballpitConfig,
        colors: theme === 'dark' ? darkColors : lightColors,
    }), [ballpitConfig, theme]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const three = new X({ canvas, size: "parent" });
        three.renderer.toneMapping = ACESFilmicToneMapping;
        three.camera.position.set(0, 0, 20);

        const spheres = new Z(three.renderer, config);
        three.scene.add(spheres);

        const raycaster = new Raycaster();
        const plane = new Plane(new Vector3(0, 0, 1), 0);
        const intersectionPoint = new Vector3();

        if (config.followCursor) {
            window.addEventListener("pointermove", onPointerMove);
        }

        three.onBeforeRender = (deltaInfo) => {
            if (config.followCursor) {
                raycaster.setFromCamera(pointer, three.camera);
                if (raycaster.ray.intersectPlane(plane, intersectionPoint)) {
                    spheres.physics.center.copy(intersectionPoint);
                }
            }
            spheres.update(deltaInfo);
        };
        
        three.onAfterResize = (size) => {
            spheres.physics.config.maxX = size.wWidth / 2;
            spheres.physics.config.maxY = size.wHeight / 2;
            spheres.physics.config.maxZ = size.wWidth / 4;
        };

        return () => {
            if (config.followCursor) {
                window.removeEventListener("pointermove", onPointerMove);
            }
            three.dispose();
        };
    }, [config]);

    return (
        <div className={cn("relative w-full h-[100svh] overflow-hidden", className)}>
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-10" />
            
            {children ? (
                <div className="absolute inset-0 z-20 pointer-events-none">
                    {children}
                </div>
            ) : (
                <main className="absolute inset-0 z-20 flex h-full items-center justify-center text-center px-4 pointer-events-none">
                    <div className="max-w-4xl mx-auto flex flex-col items-center pointer-events-auto">
                        <h1 className="text-4xl sm:text-5xl md:text-7xl text-[#111] dark:text-white font-bold tracking-tighter leading-tight drop-shadow-sm">
                            {heroTitle}
                        </h1>
                        <p className="mt-6 text-lg md:text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto drop-shadow-sm">
                            {heroDescription}
                        </p>
                    </div>
                </main>
            )}
        </div>
    );
};
