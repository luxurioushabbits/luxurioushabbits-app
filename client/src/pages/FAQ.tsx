/**
 * FAQ — Luxurious Habbits
 * Accordion FAQ with accurate hemp/shipping legal info + SEO-optimized THCA content
 */
import { useState, useEffect, useRef } from "react";
import { Plus, Minus } from "lucide-react";
import { Link } from "wouter";
import SEO from "@/components/SEO";

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const fallback = setTimeout(() => setVisible(true), 800);
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); clearTimeout(fallback); } }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => { obs.disconnect(); clearTimeout(fallback); };
  }, []);
  return { ref, visible };
}

const faqCategories = [
  {
    category: "THCA Flower — The Basics",
    items: [
      {
        q: "What is THCA flower?",
        a: "THCA (tetrahydrocannabinolic acid) flower is raw hemp flower that is naturally high in THCA — the non-intoxicating acidic precursor to THC. In its raw form, THCA is non-psychoactive. When heated through smoking, vaping, or cooking (a process called decarboxylation), THCA converts to THC. THCA flower is grown from hemp genetics and must contain 0.3% or less Δ9-THC on a dry weight basis to be federally legal under the 2018 Farm Bill. At Luxurious Habbits, every THCA flower product is third-party lab tested to verify compliance.",
      },
      {
        q: "What is the difference between THCA and THC?",
        a: "THCA and THC are closely related compounds but have an important chemical difference. THCA (tetrahydrocannabinolic acid) is the raw, unheated form found in the live hemp plant. It is non-intoxicating in its natural state. THC (tetrahydrocannabinol) is what THCA becomes when heat is applied — through smoking, vaping, or cooking. This conversion process is called decarboxylation. So while THCA flower is federally legal hemp, it behaves similarly to traditional cannabis flower when consumed through heat. This is why THCA flower has become the preferred choice for hemp connoisseurs.",
      },
      {
        q: "Is THCA flower legal?",
        a: "Yes — THCA flower is federally legal under the 2018 Agriculture Improvement Act (Farm Bill) as long as the plant contains 0.3% or less Δ9-THC on a dry weight basis. THCA itself is not a controlled substance under federal law. However, state laws vary. Some states have enacted restrictions on THCA products specifically. It is your responsibility to verify that THCA flower is legal in your state before ordering. We do not ship to states where THCA or hemp flower is prohibited.",
      },
      {
        q: "Is THCA flower the same as marijuana?",
        a: "No. THCA flower is legally classified as hemp — not marijuana. The legal distinction is based entirely on Δ9-THC content. Hemp must contain 0.3% or less Δ9-THC on a dry weight basis. Marijuana contains higher levels of Δ9-THC and remains a Schedule I controlled substance under federal law. THCA flower from Luxurious Habbits is grown from hemp genetics, tested to confirm legal Δ9-THC levels, and is fully compliant with the 2018 Farm Bill.",
      },
      {
        q: "What does THCA percentage mean on a product?",
        a: "The THCA percentage on a product label indicates the concentration of THCA in the flower by dry weight. A product showing 25% THCA means that 25% of the flower's dry weight is THCA. This is a potency indicator — higher THCA percentages generally indicate more potent flower. When you apply heat (smoke or vaporize), most of that THCA converts to THC. A rough conversion formula: multiply THCA% by 0.877 to estimate the potential THC%. All THCA percentages at Luxurious Habbits are verified by third-party lab testing.",
      },
    ],
  },
  {
    category: "Indica, Sativa & Hybrid",
    items: [
      {
        q: "What is the difference between Indica and Sativa?",
        a: "Indica and Sativa are the two primary classifications of cannabis and hemp strains, each associated with different effects and growth characteristics. Indica strains are traditionally associated with relaxing, body-focused effects — often described as calming, sedating, or physically soothing. They tend to be shorter plants with broader leaves. Sativa strains are traditionally associated with uplifting, cerebral effects — often described as energizing, creative, or mood-elevating. They tend to be taller plants with narrower leaves. It's worth noting that modern research suggests the Indica/Sativa distinction is more about terpene profiles than genetics alone — but these categories remain a useful guide for consumers.",
      },
      {
        q: "What is a Hybrid strain?",
        a: "Hybrid strains are cannabis and hemp varieties bred from both Indica and Sativa genetics. The goal is to combine desirable traits from both — for example, the relaxing body effects of an Indica with the uplifting mental clarity of a Sativa. Hybrids can lean Indica-dominant, Sativa-dominant, or be balanced 50/50. Most modern strains are technically hybrids. At Luxurious Habbits, our hybrid THCA flower selections are curated for balanced, well-rounded experiences.",
      },
      {
        q: "Which strain type is right for me?",
        a: "The right strain depends on your desired experience and the time of day. Indica-dominant strains are typically best for evening use, relaxation, unwinding after work, or sleep support. Sativa-dominant strains are typically better for daytime use, creative activities, socializing, or when you need to stay functional. Hybrids offer a middle ground and are versatile for any time of day. If you're new to THCA flower, starting with a balanced hybrid is often a good approach. Our team is happy to make a personalized recommendation — reach out through our contact page.",
      },
    ],
  },
  {
    category: "About the Products",
    items: [
      {
        q: "What is hemp and how is it different from marijuana?",
        a: "Hemp and marijuana are both varieties of the Cannabis sativa plant, but they are legally and chemically distinct. Hemp is defined by federal law as cannabis containing 0.3% or less Δ9-THC on a dry weight basis. Marijuana contains higher levels of THC and remains a controlled substance under federal law. All Luxurious Habbits products are hemp-derived and fully compliant with this definition.",
      },
      {
        q: "Are your products legal?",
        a: "Yes — federally. All of our products are compliant with the 2018 Agriculture Improvement Act (Farm Bill), which legalized hemp and hemp-derived products at the federal level. However, individual state laws vary. It is your responsibility to verify that hemp products are legal in your state before placing an order. We do not ship to states where hemp products are prohibited.",
      },
      {
        q: "What does '2018 Farm Bill compliant' mean?",
        a: "The Agriculture Improvement Act of 2018 (commonly called the Farm Bill) federally legalized hemp as an agricultural commodity and removed it from the Controlled Substances Act, provided it contains no more than 0.3% Δ9-THC on a dry weight basis. All Luxurious Habbits products meet this requirement, verified by third-party lab testing.",
      },
      {
        q: "What is the difference between flower and extracts?",
        a: "Hemp flower is the raw, dried bud of the hemp plant — smoked or vaporized as-is. Our extracts are solventless hash rosin, made exclusively with heat and pressure — no solvents, no chemicals, no shortcuts. Hash rosin is widely regarded as the cleanest and most premium form of cannabis concentrate available. Both categories at Luxurious Habbits are held to the same uncompromising standard.",
      },
    ],
  },
  {
    category: "Quality & Safety",
    items: [
      {
        q: "Where are your products sourced from?",
        a: "We source exclusively from cultivators and producers who operate at the highest tier of the industry. Every partner is vetted for growing practices, extraction methods, and compliance standards. If a product doesn't meet our personal standard — the same standard we hold for ourselves — it doesn't make our lineup.",
      },
      {
        q: "Are your products third-party lab tested?",
        a: "Yes, without exception. Every product sold by Luxurious Habbits undergoes full-panel third-party testing by an independent, accredited laboratory. We do not self-certify. Full-panel testing covers: cannabinoid profile, residual pesticides, heavy metals (lead, arsenic, cadmium, mercury), microbials, residual solvents, and mycotoxins. If it doesn't pass every panel, it doesn't ship. Period.",
      },
      {
        q: "Where can I find the Certificate of Analysis (COA) for my product?",
        a: "All available COA documents are published on our COA page. Each report is linked to its corresponding product and batch number. If you cannot locate a specific COA, please contact us directly and we will provide it promptly.",
      },
      {
        q: "How do I read a Certificate of Analysis (COA)?",
        a: "A Certificate of Analysis (COA) is a document from an independent lab that verifies the contents and safety of a hemp product. Here's what to look for: Cannabinoid Profile — shows the THCA%, CBD%, and Δ9-THC% (must be 0.3% or less for legal hemp). Pesticides — should show 'ND' (not detected) or values below action limits. Heavy Metals — look for ND or values well below limits for lead, arsenic, cadmium, and mercury. Microbials — should show ND for harmful bacteria and mold. Residual Solvents — relevant for extracts; should show ND. Always verify the COA is from an accredited third-party lab, not self-reported by the brand.",
      },
      {
        q: "Are your products organic or pesticide-free?",
        a: "We prioritize sourcing from cultivators who use clean, responsible growing practices. Every product is screened for pesticide residues through full-panel third-party lab testing — including herbicides, fungicides, and insecticides. While not all products carry a formal USDA Organic certification, our rigorous testing protocol ensures they meet the strictest purity standards. If pesticide residues are detected above acceptable limits, the product is rejected.",
      },
    ],
  },
  {
    category: "Ordering & Shipping",
    items: [
      {
        q: "Do you ship to all 50 states?",
        a: "No. While hemp is federally legal under the 2018 Farm Bill, certain states have enacted their own restrictions on hemp and hemp-derived products. We do not ship to states where such products are prohibited or heavily restricted. It is the customer's responsibility to confirm that hemp products are legal in their state prior to ordering. We reserve the right to cancel and refund any order destined for a restricted jurisdiction.",
      },
      {
        q: "How long does shipping take?",
        a: "Orders are processed and shipped from the USA. Standard shipping typically takes 3–7 business days depending on your location. Expedited options may be available at checkout. You will receive a tracking number once your order ships.",
      },
      {
        q: "What is your return and refund policy?",
        a: "Due to the nature of our products, we are unable to accept returns on opened items. If your order arrives damaged, incorrect, or defective, please contact us within 7 days of delivery and we will make it right. Customer satisfaction is important to us — reach out through our contact form and we will respond promptly.",
      },
      {
        q: "How is my order packaged — is it discreet?",
        a: "Yes. All orders ship in plain, unmarked packaging with zero external branding or product descriptions visible. We take smell control seriously — every order is vacuum-sealed and packaged with odor-barrier materials to ensure complete discretion from our door to yours. All shipments are UPS compliant and require an adult signature upon delivery. Your privacy is protected at every step.",
      },
    ],
  },
  {
    category: "The Habbits Box",
    items: [
      {
        q: "What is The Habbits Box?",
        a: "The Habbits Box is our premium surprise subscription service. Each month (or on your chosen frequency), we curate a mystery selection of our finest THCA flower and hemp products and ship it directly to you. You choose your tier — Baby Lungs, Stoner, or Connoisseur — and we handle the rest. Every box is a surprise, hand-selected based on what's in stock and at its peak. Subscribers receive 10% off and free shipping on every box.",
      },
      {
        q: "What's inside The Habbits Box?",
        a: "That's the beauty of it — it's a surprise. We curate every box based on what's performing best in our catalog at the time of shipment. You'll always receive premium, lab-tested THCA flower and hemp products selected to match your tier level. Higher tiers receive larger quantities, more variety, and access to our most exclusive strains. No two boxes are identical.",
      },
      {
        q: "Can I skip or cancel my subscription?",
        a: "Yes. You can skip a month, pause your subscription, or cancel at any time through your account portal. We believe in earning your loyalty every month — not locking you in. There are no cancellation fees.",
      },
      {
        q: "What is the Smoke Shop tier?",
        a: "The Smoke Shop tier is our wholesale subscription for retail shops and bulk buyers. Submit a custom monthly budget of $1,000 or more and we'll curate a premium selection at scale for your store. This tier is handled personally — submit your inquiry and our team will reach out to build a custom plan for your business.",
      },
    ],
  },
  {
    category: "Age & Legal",
    items: [
      {
        q: "What is the minimum age to purchase?",
        a: "You must be 21 years of age or older to purchase from Luxurious Habbits. By accessing our site and placing an order, you confirm that you meet this age requirement. We take age compliance seriously and reserve the right to cancel orders where age cannot be verified.",
      },
      {
        q: "Is hemp legal in my state?",
        a: "Hemp is federally legal under the 2018 Farm Bill, but state laws vary significantly. Some states have enacted restrictions or outright bans on certain hemp-derived products. We strongly encourage you to research your state's current hemp laws before ordering. We are not responsible for orders placed in violation of local regulations.",
      },
    ],
  },
  {
    category: "General",
    items: [
      {
        q: "How do I contact customer support?",
        a: "You can reach us through the Contact page on our website. We aim to respond to all inquiries within 1–2 business days. We're a small, dedicated team and we take every message seriously.",
      },
      {
        q: "Do you have a loyalty or rewards program?",
        a: "Yes — our Loyalty Rewards Program is live now! Every purchase earns you points you can redeem for discounts on future orders. Create an account and start earning today. An Affiliate Program is also coming soon — sign up for our newsletter to be the first to know when it launches.",
      },
    ],
  },
];

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="rgb-hover"
      style={{
        borderBottom: "1px solid oklch(1 0 0 / 6%)",
        animationDelay: `${index * 40}ms`,
        transition: "filter 200ms ease",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "1.5rem",
          padding: "1.5rem 0",
          background: "none",
          border: "none",
          textAlign: "left",
          cursor: "pointer",
          transition: "color 200ms ease",
        }}
      >
        <span style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "0.85rem",
          color: open ? "oklch(0.96 0 0)" : "oklch(0.70 0 0)",
          lineHeight: 1.5,
          fontWeight: open ? 500 : 400,
          letterSpacing: "0.02em",
          transition: "color 200ms ease",
          flex: 1,
        }}>
          {q}
        </span>
        <span style={{ color: "#bf5fff", flexShrink: 0, marginTop: "2px" }}>
          {open ? <Minus size={16} /> : <Plus size={16} />}
        </span>
      </button>
      {open && (
        <div className="animate-fade-up" style={{ paddingBottom: "1.5rem" }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: "oklch(0.48 0 0)", lineHeight: 1.9, fontWeight: 300, maxWidth: "720px" }}>
            {a}
          </p>
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  const [glitch, setGlitch] = useState(false);
  const contentSection = useInView();

  useEffect(() => {
    const t = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 350);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ background: "oklch(0.04 0 0)", minHeight: "100vh", paddingTop: "72px" }}>
      <SEO
        title="FAQ — THCA Flower, Hemp & The Habbits Box"
        description="Frequently asked questions about THCA flower, Farm Bill compliance, Indica vs Sativa, lab testing, COA verification, discreet shipping, and The Habbits Box subscription. Everything you need to know about Luxurious Habbits."
        keywords="what is THCA flower, is THCA legal, THCA vs THC, indica vs sativa, farm bill hemp FAQ, hemp flower questions, how to read a COA, hemp shipping, habbits box subscription"
        canonical="/faq"
      />

      {/* FAQ JSON-LD Schema for Google rich results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqCategories.flatMap(cat =>
              cat.items.map(item => ({
                "@type": "Question",
                "name": item.q,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": item.a,
                },
              }))
            ),
          }),
        }}
      />

      {/* ── HEADER ── */}
      <section className="glitch-tear" style={{ padding: "6rem 0 5rem", position: "relative", overflow: "hidden", borderBottom: "1px solid oklch(1 0 0 / 6%)" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(oklch(1 0 0 / 3%) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 3%) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          <div style={{ position: "absolute", left: 0, width: "100%", height: "1px", background: "linear-gradient(90deg, transparent, #ff00e5, transparent)", opacity: 0.15, animation: "scan-line 15s linear infinite" }} />
        </div>
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="section-label animate-fade-up" style={{ marginBottom: "1rem" }}>FAQ</div>
          <h1 className="animate-fade-up-1 glitch glitch-intense" data-text="FREQUENTLY" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2.5rem, 9vw, 6.5rem)", letterSpacing: "0.05em", color: "oklch(0.96 0 0)", lineHeight: 1 }}>
            FREQUENTLY
          </h1>
          <h1 className="animate-fade-up-2" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2.5rem, 9vw, 6.5rem)", letterSpacing: "0.05em", color: "#bf5fff", lineHeight: 1, marginBottom: "2rem" }}>
            ASKED.
          </h1>
          <p className="animate-fade-up-3" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "clamp(1rem, 2.5vw, 1.3rem)", color: "oklch(0.55 0 0)", maxWidth: "560px", lineHeight: 1.8, fontWeight: 300 }}>
            Everything you need to know about THCA flower, hemp, and Luxurious Habbits.
          </p>
        </div>
      </section>

      {/* ── FAQ CONTENT ── */}
      <section ref={contentSection.ref} className="glitch-tear" style={{ padding: "6rem 0" }}>
        <div className="container" style={{ maxWidth: "900px", margin: "0 auto" }}>
          {faqCategories.map((cat, ci) => (
            <div
              key={cat.category}
              style={{
                marginBottom: "4rem",
                opacity: contentSection.visible ? 1 : 0,
                transform: contentSection.visible ? "translateY(0)" : "translateY(20px)",
                transition: `opacity 0.6s ease ${ci * 0.1}s, transform 0.6s ease ${ci * 0.1}s`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                <div className="section-label">{cat.category}</div>
                <div style={{ flex: 1, height: "1px", background: "oklch(1 0 0 / 6%)" }} />
              </div>
              {cat.items.map((item, ii) => (
                <FAQItem key={item.q} q={item.q} a={item.a} index={ii} />
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "5rem 0", background: "oklch(0.06 0 0)", borderTop: "1px solid oklch(1 0 0 / 6%)", textAlign: "center" }}>
        <div className="container">
          <div className="section-label" style={{ marginBottom: "1rem" }}>Still Have Questions?</div>
          <h2 className="glitch glitch-slow" data-text="WE'RE HERE TO HELP." style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.5rem, 4vw, 3rem)", letterSpacing: "0.05em", color: "oklch(0.96 0 0)", marginBottom: "2.5rem", lineHeight: 1 }}>
            WE'RE HERE TO <span className="text-holo">HELP.</span>
          </h2>
          <Link href="/contact">
            <button className="btn-gold"><span>Contact Us</span></button>
          </Link>
        </div>
      </section>

    </div>
  );
}
