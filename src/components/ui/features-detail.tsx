"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const dashboardTabs = [
  {
    id: 1,
    title: "Analytics",
    src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&q=75",
    alt: "Dashboard Analytics Overview",
  },
  {
    id: 2,
    title: "Users Management",
    src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&q=75",
    alt: "Dashboard User Management",
  },
  {
    id: 3,
    title: "Insights & Reports",
    src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&q=75",
    alt: "Dashboard Reports",
  },
  {
    id: 4,
    title: "Activity",
    src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&q=75",
    alt: "Dashboard Activity",
  },
  {
    id: 5,
    title: "Trends",
    src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&q=75",
    alt: "Dashboard Trends",
  }
]

export default function FeaturesDetail() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const headingRef = useRef<HTMLHeadingElement>(null)
  const textRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const sliderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Hero animation
    const tl = gsap.timeline()

    tl.fromTo(
      headingRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
    )
      .fromTo(
        textRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
        "-=0.4"
      )
      .fromTo(
        ctaRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
        "-=0.4"
      )
      .fromTo(
        sliderRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
        "-=0.2"
      )
      .fromTo(
        ".hero-blur",
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 1.2, ease: "power2.out" },
        "-=1"
      )

    // Parallax effect on scroll
    gsap.to(".hero-blur", {
      yPercent: 20,
      ease: "none",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    })

    // Auto-slide interval
    const slideInterval = setInterval(() => {
      nextSlide()
    }, 5000)

    return () => {
      tl.kill()
      clearInterval(slideInterval)
    }
  }, []);

  // Function to go to next slide
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === dashboardTabs.length - 1 ? 0 : prev + 1))
  }

  // Function to go to a specific slide
  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  useEffect(() => {
    // Animate feature items when they come into view
    gsap.fromTo(
      ".feature-item",
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".features-grid",
          start: "top 75%",
        }
      }
    )

    // Animate tab content
    const tabsContent = document.querySelectorAll<HTMLElement>(".tabs-content")
    tabsContent.forEach((content) => {
      gsap.set(content, { opacity: 0, y: 20 })
    })

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [])

  // Handle tab change animations
  const handleTabChange = (value: string) => {
    const tabsContent = document.querySelectorAll<HTMLElement>(".tabs-content")
    gsap.to(tabsContent, {
      opacity: 0,
      y: 20,
      duration: 0.3,
      onComplete: () => {
        const targetContent = document.getElementById(`content-${value}`)
        if (targetContent) {
          gsap.to(targetContent, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            delay: 0.1
          })
        }
      }
    })
  }

  return (
    <div ref={sectionRef} className="py-8 md:py-16 bg-black">
      <div className="mx-auto">
        <div>
          <div className="container mx-auto">
            <h1 ref={headingRef} className="text-4xl text-left font-bold tracking-tight sm:text-5xl text-white">Not everything powerful <br /> has to look complicated</h1>
            <p ref={textRef} className="mt-4 text-lg text-white/80 text-left">Explore the key features that make our platform a game-changer for traders of all levels.</p>
          </div>
          <div
            ref={sliderRef}
            className="relative h-[100vh] overflow-hidden"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              {dashboardTabs.map((tab, index) => {
                const position = index - currentSlide;
                const isActive = position === 0;
                const zIndex = isActive ? 30 : 20 - Math.abs(position);
                const scale = isActive ? 1 : 1 - 0.1;
                const translateX = position * 100;

                return (
                  <div
                    key={tab.id}
                    className={`absolute transition-all duration-500 ease-in-out rounded-2xl border-4 ${isActive ? 'border-primary/50' : 'border-primary/20'} ${isActive ? 'shadow-2xl shadow-primary/20' : 'shadow-md'}`}
                    style={{
                      transform: `translateX(${translateX}%) scale(${scale})`,
                      zIndex
                    }}
                  >
                    <div className="relative aspect-[16/9] w-[70vw] max-w-full rounded-2xl overflow-hidden">
                      <a href="https://ruixen.com/" target="_blank" rel="noopener noreferrer">
                        <img
                          src={tab.src}
                          alt={tab.alt}
                          className="object-cover w-full h-full"
                        />
                        {isActive && (
                          <div className="absolute inset-0 bg-black/5 rounded-2xl"></div>
                        )}
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div ref={ctaRef} className="flex justify-center gap-8">
            {dashboardTabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => goToSlide(index)}
                className={`p-2 text-sm font-medium transition-all ${currentSlide === index
                  ? "text-primary"
                  : "text-white/60 hover:text-white"}`}
              >
                {tab.title}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

