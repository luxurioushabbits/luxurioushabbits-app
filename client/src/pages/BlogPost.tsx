/**
 * Blog Post — Individual article page
 * Displays a single article with full content.
 * Currently shows a "coming soon" state for articles not yet written.
 */
import { Link, useParams } from "wouter";
import SEO from "@/components/SEO";
import { ArrowLeft, Clock, ShoppingBag, Leaf, FlaskConical, Plus } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useCart } from "@/contexts/CartContext";
import StrainReviewComments from "@/components/StrainReviewComments";

// Article metadata map — owner adds full content here over time
// Terpene data for strain review articles — matches slugs in productTerpenes DB table
interface StrainTerpene {
  slug: string;       // matches terpeneSlug in DB (e.g. "beta-caryophyllene")
  name: string;       // display name
  pct: string;        // typical % range from COA data
  note: string;       // aroma/effect note
}

const ARTICLES: Record<string, {
  title: string;
  category: string;
  categoryColor: string;
  excerpt: string;
  readTime: string;
  publishDate: string;
  tags: string[];
  content?: string; // Full HTML/markdown content — add when writing articles
  // Terpene profile for strain reviews — drives the "Similar Strains" recommendation block
  terpenes?: StrainTerpene[];
  strainType?: "indica" | "sativa" | "hybrid";
}> = {
  "what-is-thca-flower": {
    title: "What Is THCA Flower? The Complete Guide",
    category: "Education",
    categoryColor: "#00e5a0",
    excerpt: "THCA (tetrahydrocannabinolic acid) is the raw, non-psychoactive precursor to THC found naturally in the hemp plant.",
    readTime: "8 min read",
    publishDate: "2026-01-15",
    tags: ["THCA", "Education", "Beginner Guide"],
    content: `
      <h2>What Is THCA?</h2>
      <p>THCA (tetrahydrocannabinolic acid) is the raw, acidic form of THC found in fresh, unheated cannabis and hemp plants. In its natural state, THCA is non-psychoactive — meaning it won't get you high on its own. This is because the THCA molecule has an extra carboxyl group (COOH) that prevents it from binding effectively to the CB1 receptors in your brain.</p>

      <h2>How Does THCA Become THC?</h2>
      <p>Through a process called <strong>decarboxylation</strong>, THCA converts to THC when exposed to heat. This happens when you:</p>
      <ul>
        <li>Smoke hemp flower</li>
        <li>Vaporize it in a dry herb vaporizer</li>
        <li>Bake it into edibles (at temperatures above ~220°F)</li>
        <li>Leave it in direct sunlight for extended periods</li>
      </ul>
      <p>The conversion is nearly complete at smoking temperatures, which is why THCA flower produces the same effects as traditional cannabis when smoked.</p>

      <h2>Is THCA Flower Legal?</h2>
      <p>Under the 2018 Farm Bill, hemp-derived products containing ≤0.3% Δ9-THC on a dry weight basis are federally legal. THCA flower meets this threshold — the THCA itself is not counted as THC for federal compliance purposes.</p>
      <p>However, some states have enacted their own laws that treat THCA differently. Always check your local laws before ordering.</p>

      <h2>Why Choose THCA Flower?</h2>
      <p>THCA flower offers the full experience of premium cannabis — the aroma, the terpene profiles, the potency — while remaining federally compliant. For connoisseurs who want the highest quality hemp experience, THCA flower is the gold standard.</p>
      <p>At Luxurious Habbits, every product we carry is third-party lab tested with a full-panel COA available. We only sell what we'd use ourselves.</p>
    `,
  },
  "thca-vs-thc-difference": {
    title: "THCA vs THC: What's the Difference?",
    category: "Education",
    categoryColor: "#00e5a0",
    excerpt: "Many people confuse THCA with THC, but they are chemically distinct compounds with very different properties.",
    readTime: "6 min read",
    publishDate: "2026-01-22",
    tags: ["THCA", "THC", "Chemistry", "Legal"],
    content: `
      <h2>The Chemistry</h2>
      <p>THCA (tetrahydrocannabinolic acid) and THC (tetrahydrocannabinol) are closely related but chemically distinct. THCA has an extra carboxyl group (COOH) attached to its molecular structure. This small difference has enormous implications for both effects and legality.</p>

      <h2>Psychoactivity</h2>
      <p><strong>THCA:</strong> Non-psychoactive in its raw form. Does not bind effectively to CB1 receptors. Will not produce intoxication when consumed without heat.</p>
      <p><strong>THC:</strong> Psychoactive. Binds strongly to CB1 receptors in the brain and nervous system. Produces the characteristic cannabis "high."</p>

      <h2>Legal Status</h2>
      <p><strong>THCA:</strong> Federally legal when derived from hemp and when the product contains ≤0.3% Δ9-THC on a dry weight basis (2018 Farm Bill). Some states have additional restrictions.</p>
      <p><strong>THC:</strong> Federally controlled under Schedule I. Legal for recreational use in some states, medical use in others, illegal in some states entirely.</p>

      <h2>The Conversion</h2>
      <p>When THCA is heated (smoked, vaped, or cooked), it loses its carboxyl group in a process called decarboxylation and becomes THC. This is why THCA flower produces the same effects as traditional cannabis when smoked — the heat converts the THCA to THC in real time.</p>
    `,
  },
  "is-thca-flower-legal": {
    title: "Is THCA Flower Legal? State-by-State Breakdown",
    category: "Legal",
    categoryColor: "#bf5fff",
    excerpt: "THCA flower occupies a nuanced legal space. Here's what you need to know before ordering.",
    readTime: "10 min read",
    publishDate: "2026-02-01",
    tags: ["Legal", "Farm Bill", "State Laws"],
    content: `
      <h2>The Short Answer</h2>
      <p>THCA flower is <strong>federally legal</strong> under the 2018 Farm Bill — provided it is derived from hemp and contains no more than 0.3% Delta-9 THC on a dry weight basis. However, several states have enacted their own laws that restrict or outright ban THCA hemp products regardless of federal status. Before you order, it pays to know where your state stands.</p>

      <h2>Understanding the Federal Framework</h2>
      <p>The 2018 Farm Bill removed hemp from the Controlled Substances Act and defined it as <em>Cannabis sativa L.</em> with a Delta-9 THC concentration of 0.3% or less on a dry weight basis. THCA (tetrahydrocannabinolic acid) is the non-psychoactive precursor to THC found in raw, unheated cannabis. In its raw form, THCA is not scheduled under federal law.</p>
      <p>The critical distinction: THCA converts to Delta-9 THC only when exposed to heat (a process called decarboxylation). A hemp flower product can be high in THCA and still test below the 0.3% Delta-9 threshold — making it federally compliant as hemp.</p>
      <p><strong>Important:</strong> The DEA has proposed rules that would use a "total THC" calculation (THCA × 0.877 + Delta-9 THC) to determine compliance. If adopted, this would make high-THCA hemp flower federally non-compliant. As of mid-2026, this rule has not been finalized. We monitor this closely and will update our inventory and this guide accordingly.</p>

      <h2>State-by-State Overview</h2>
      <p>Federal legality does not override state law. The following is a general overview as of 2026 — always verify with your state's current statutes before purchasing.</p>

      <h3>States Where THCA Hemp Flower Is Generally Permitted</h3>
      <p>Most states follow federal hemp law and permit the sale and possession of Farm Bill-compliant hemp products, including THCA flower:</p>
      <ul>
        <li>Alabama, Alaska, Arizona, Arkansas, California, Colorado, Connecticut, Delaware, Florida, Georgia, Hawaii, Idaho (limited), Illinois, Indiana, Iowa, Kansas, Kentucky, Louisiana, Maine, Maryland, Massachusetts, Michigan, Minnesota, Missouri, Montana, Nebraska, Nevada, New Hampshire, New Jersey, New Mexico, New York, North Carolina, North Dakota, Ohio, Oklahoma, Oregon, Pennsylvania, Rhode Island, South Carolina, South Dakota, Tennessee, Texas, Utah, Vermont, Virginia, Washington, West Virginia, Wisconsin, Wyoming</li>
      </ul>
      <p>This list is not exhaustive and state laws change frequently. Some states on this list have restrictions on specific cannabinoids or product types — always read your state's hemp statutes directly.</p>

      <h3>States With Significant Restrictions or Bans</h3>
      <p>A handful of states have enacted laws that go beyond federal hemp rules and restrict THCA or use total THC calculations:</p>
      <ul>
        <li><strong>Idaho</strong> — Defines hemp as containing 0% THC (all isomers). THCA flower is effectively prohibited.</li>
        <li><strong>Indiana</strong> — Has pursued enforcement actions against THCA products. Legal status is contested.</li>
        <li><strong>Kansas</strong> — Defines hemp using total THC, which may include THCA. Status is unclear.</li>
        <li><strong>Mississippi</strong> — Has restrictions on smokable hemp products.</li>
        <li><strong>North Dakota</strong> — Has restricted smokable hemp in some contexts.</li>
      </ul>
      <p>We do not ship to states where THCA flower is clearly prohibited. Our checkout process will flag restricted shipping destinations.</p>

      <h2>What "Farm Bill Compliant" Actually Means</h2>
      <p>When a retailer says a product is "Farm Bill compliant," it means:</p>
      <ul>
        <li>The hemp was grown by a licensed cultivator under a state or USDA hemp program</li>
        <li>The product tested at or below 0.3% Delta-9 THC on a dry weight basis at the time of harvest</li>
        <li>A Certificate of Analysis (COA) from an accredited third-party lab confirms compliance</li>
      </ul>
      <p>At Luxurious Habbits, every product we carry comes with a full-panel COA. We do not carry products that lack documentation. If a vendor can't provide a COA, we don't carry their product — full stop.</p>

      <h2>The Age Requirement</h2>
      <p>Regardless of state law, we require all customers to be <strong>21 years of age or older</strong> to purchase from Luxurious Habbits. This is a non-negotiable policy. Adult signature is required on all shipments.</p>

      <h2>Shipping Compliance</h2>
      <p>We ship via UPS in compliance with their hemp shipping policy. All shipments include:</p>
      <ul>
        <li>A copy of the hemp license and COA for the products inside</li>
        <li>Plain, unmarked outer packaging</li>
        <li>Adult signature required on delivery</li>
        <li>Vacuum-sealed, odor-barrier inner packaging</li>
      </ul>

      <h2>Disclaimer</h2>
      <p>This article is for informational purposes only and does not constitute legal advice. Hemp and cannabis laws change frequently at both the state and federal level. Always consult a qualified attorney and verify your state's current statutes before purchasing or possessing THCA hemp products. Luxurious Habbits is not responsible for changes in law that occur after the publication of this article.</p>

      <p>Questions? Email us at <a href="mailto:support@luxurioushabbits.com">support@luxurioushabbits.com</a>.</p>
    `,
  },
  "indica-vs-sativa-thca": {
    title: "Indica vs Sativa THCA Flower: Which Is Right for You?",
    category: "Strain Guide",
    categoryColor: "#f5a623",
    excerpt: "Understanding the indica/sativa distinction to find the right THCA strain for your needs.",
    readTime: "7 min read",
    publishDate: "2026-02-10",
    tags: ["Indica", "Sativa", "Strain Guide", "Effects"],
    content: `
      <h2>The Indica vs Sativa Debate</h2>
      <p>Walk into any smoke shop or browse any hemp retailer and you'll see strains labeled "indica," "sativa," or "hybrid." These terms have been used in the cannabis world for decades — but what do they actually mean, and how do they apply to THCA hemp flower?</p>
      <p>The honest answer: the indica/sativa distinction is <strong>more about effect profile and terpene chemistry than plant genetics</strong>. Modern cannabis research has largely moved away from strict indica/sativa classification, but the terms remain useful as shorthand for the kind of experience you can expect.</p>

      <h2>What Is Indica?</h2>
      <p>Indica strains are traditionally associated with:</p>
      <ul>
        <li><strong>Body-heavy effects</strong> — a relaxing, sinking sensation often described as a "body high"</li>
        <li><strong>Sedating character</strong> — better suited for evening or nighttime use</li>
        <li><strong>Earthy, musky, or sweet aromas</strong> — driven by high myrcene content</li>
        <li><strong>Shorter, bushier plant structure</strong> — broader leaves, denser buds</li>
      </ul>
      <p>Classic indica-leaning THCA strains include <strong>Granddaddy Purple</strong>, <strong>OG Kush</strong>, <strong>Wedding Cake</strong>, and <strong>Zkittlez</strong>. These strains are popular for unwinding after a long day, evening sessions, or simply relaxing without the stimulating edge of a sativa.</p>

      <h2>What Is Sativa?</h2>
      <p>Sativa strains are traditionally associated with:</p>
      <ul>
        <li><strong>Cerebral, uplifting effects</strong> — mental clarity and creative energy</li>
        <li><strong>Daytime-friendly character</strong> — energizing rather than sedating</li>
        <li><strong>Citrus, pine, or floral aromas</strong> — driven by limonene, terpinolene, and pinene</li>
        <li><strong>Taller, leaner plant structure</strong> — narrower leaves, airier buds</li>
      </ul>
      <p>Classic sativa-leaning THCA strains include <strong>Blue Dream</strong>, <strong>Sour Diesel</strong>, <strong>Jack Herer</strong>, and <strong>Durban Poison</strong>. These strains are popular for morning or afternoon use, creative work, social settings, and staying active.</p>

      <h2>Hybrids: The Best of Both</h2>
      <p>Most modern THCA hemp strains are hybrids — crosses between indica and sativa genetics that blend the characteristics of both. Hybrids can lean indica-dominant, sativa-dominant, or sit squarely in the middle.</p>
      <p>Popular hybrid THCA strains include <strong>Gelato</strong>, <strong>Runtz</strong>, <strong>Gorilla Glue #4</strong>, and <strong>Pineapple Express</strong>. Hybrids are often the most versatile choice — they offer a balanced experience that works for a wider range of situations and times of day.</p>

      <h2>The Terpene Factor</h2>
      <p>Here's what the science actually says: the indica/sativa label is a useful starting point, but <strong>terpenes are the real driver of the experience</strong>. Two strains with the same THCA percentage can feel completely different based on their terpene profile.</p>
      <ul>
        <li><strong>Myrcene-dominant strains</strong> (common in indicas) tend to feel heavier and more relaxing</li>
        <li><strong>Limonene-dominant strains</strong> (common in sativas) tend to feel uplifting and mood-elevating</li>
        <li><strong>Caryophyllene-dominant strains</strong> tend to feel grounding and balanced</li>
        <li><strong>Terpinolene-dominant strains</strong> tend to feel energetic and creative</li>
      </ul>
      <p>When you read a COA for a THCA hemp flower, look at the terpene panel — not just the THCA percentage. The terpene profile will tell you more about the experience than the indica/sativa label ever could.</p>

      <h2>Which Should You Choose?</h2>
      <ul>
        <li><strong>Choose indica</strong> if you want to relax, unwind, or use in the evening</li>
        <li><strong>Choose sativa</strong> if you want energy, creativity, or a daytime-friendly experience</li>
        <li><strong>Choose hybrid</strong> if you want balance, or if you're not sure — hybrids are the most forgiving</li>
        <li><strong>Check the terpenes</strong> regardless of which category you choose — they're the real story</li>
      </ul>

      <h2>Our Recommendation</h2>
      <p>At Luxurious Habbits, every product listing includes the full terpene profile from the COA. We encourage you to look beyond the indica/sativa label and explore the terpene data — it's the most accurate predictor of the experience you'll have. If you have questions about a specific strain, reach out at <a href="mailto:support@luxurioushabbits.com">support@luxurioushabbits.com</a>.</p>
    `,
  },
  "how-to-read-coa": {
    title: "How to Read a Certificate of Analysis (COA)",
    category: "Education",
    categoryColor: "#00e5a0",
    excerpt: "A COA is the most important document when buying THCA hemp flower. Here's how to read one.",
    readTime: "9 min read",
    publishDate: "2026-02-18",
    tags: ["COA", "Lab Testing", "Safety", "Education"],
    content: `
      <h2>What Is a COA?</h2>
      <p>A <strong>Certificate of Analysis (COA)</strong> is a document issued by an accredited, independent third-party laboratory that reports the chemical composition of a hemp or cannabis product. It is the single most important piece of documentation when buying THCA flower — and if a vendor can't produce one, that's a hard pass.</p>
      <p>At Luxurious Habbits, every product we carry has a full-panel COA available. No exceptions. Here's exactly how to read one so you know what you're looking at.</p>

      <h2>The Anatomy of a COA</h2>
      <p>A well-structured COA contains several distinct sections. We'll walk through each one.</p>

      <h3>1. Lab & Sample Information</h3>
      <p>At the top of any COA you'll find identifying information:</p>
      <ul>
        <li><strong>Lab name and accreditation number</strong> — The lab should be ISO/IEC 17025 accredited. This is the international standard for testing labs. If you don't see an accreditation number, treat the results with skepticism.</li>
        <li><strong>Sample ID / Batch number</strong> — This ties the COA to a specific batch of product. The batch number on the COA should match the batch number on your product packaging.</li>
        <li><strong>Sample date / Report date</strong> — How old is this test? Cannabinoid profiles can shift over time, especially with improper storage. A COA older than 12 months on a product currently being sold is a yellow flag.</li>
        <li><strong>Sample name</strong> — The strain or product name as submitted by the vendor.</li>
        <li><strong>Matrix</strong> — Should say "hemp flower" or "plant material."</li>
      </ul>

      <h3>2. Cannabinoid Panel</h3>
      <p>This is the section most buyers focus on first, and for good reason. The cannabinoid panel shows the concentration of each cannabinoid in the sample, typically expressed as a percentage of dry weight.</p>
      <p><strong>Key values to look for:</strong></p>
      <ul>
        <li><strong>THCA %</strong> — The primary potency indicator for hemp flower. Premium flower typically tests between 18–28% THCA. This is what converts to THC when heated.</li>
        <li><strong>Delta-9 THC %</strong> — Must be at or below <strong>0.3%</strong> for the product to be Farm Bill compliant. This is the legal compliance number. If it's above 0.3%, the product is federally illegal regardless of THCA content.</li>
        <li><strong>CBD %</strong> — Common in hemp flower. High CBD can contribute to the entourage effect.</li>
        <li><strong>CBG, CBN, CBC</strong> — Minor cannabinoids that contribute to the overall effect profile. Their presence in meaningful amounts is a sign of a well-rounded, full-spectrum product.</li>
        <li><strong>Total THC</strong> — Some labs calculate this as (THCA × 0.877) + Delta-9 THC. This represents the theoretical maximum THC if all THCA were decarboxylated. Some states use this number for compliance, not just Delta-9.</li>
        <li><strong>Total Cannabinoids</strong> — The sum of all detected cannabinoids. A higher number generally indicates a more complex, potent product.</li>
      </ul>

      <h3>3. Terpene Panel</h3>
      <p>Terpenes are the aromatic compounds responsible for a strain's smell, flavor, and — according to the entourage effect hypothesis — its nuanced effects. A full-panel COA will include a terpene breakdown.</p>
      <ul>
        <li><strong>Total terpenes %</strong> — Anything above 1.5% is considered a rich terpene profile. Premium flower often tests at 2–4%+.</li>
        <li><strong>Dominant terpenes</strong> — The top 3–5 terpenes by concentration define the strain's character. For example, high Myrcene = earthy, relaxing; high Limonene = citrus, uplifting; high Caryophyllene = spicy, anti-inflammatory.</li>
      </ul>
      <p>Not all COAs include a terpene panel — it's an optional add-on that costs more. Its presence is a sign the vendor invested in comprehensive testing.</p>

      <h3>4. Residual Solvents</h3>
      <p>Relevant primarily for extracts, concentrates, and vape products — not typically applicable to raw flower. If you're buying an extract, this panel should show non-detectable (ND) or below-limit values for all solvents including butane, propane, ethanol, and acetone.</p>

      <h3>5. Pesticide Panel</h3>
      <p>This panel tests for the presence of agricultural pesticides. All values should be <strong>ND (non-detectable)</strong> or below the action limit set by the testing state. Common pesticides tested include:</p>
      <ul>
        <li>Bifenazate, Bifenthrin, Myclobutanil, Permethrin, Spinosad, and dozens more</li>
      </ul>
      <p>Any detected pesticide above the action limit is a serious red flag. Do not consume that product.</p>

      <h3>6. Heavy Metals Panel</h3>
      <p>Hemp is a bioaccumulator — it absorbs heavy metals from the soil it's grown in. This makes heavy metals testing critical. The panel should test for at minimum:</p>
      <ul>
        <li><strong>Lead (Pb)</strong> — Action limit typically &lt;0.5 ppm</li>
        <li><strong>Arsenic (As)</strong> — Action limit typically &lt;0.2 ppm</li>
        <li><strong>Cadmium (Cd)</strong> — Action limit typically &lt;0.2 ppm</li>
        <li><strong>Mercury (Hg)</strong> — Action limit typically &lt;0.1 ppm</li>
      </ul>
      <p>All results should be ND or well below the action limits. Any detection above the limit means the product should not be sold or consumed.</p>

      <h3>7. Microbials Panel</h3>
      <p>Tests for harmful biological contaminants including:</p>
      <ul>
        <li><strong>Total Yeast &amp; Mold (TYMC)</strong> — Should be below the action limit (typically &lt;10,000 CFU/g for flower)</li>
        <li><strong>Total Aerobic Count (TAMC)</strong> — General bacterial load</li>
        <li><strong>Bile-Tolerant Gram-Negative Bacteria</strong> — Indicator of fecal contamination</li>
        <li><strong>E. coli / Salmonella</strong> — Must be absent / non-detectable</li>
      </ul>
      <p>Mold is a particular concern with improperly cured or stored hemp flower. If you see elevated yeast and mold counts, pass on that product.</p>

      <h2>Red Flags to Watch For</h2>
      <ul>
        <li><strong>No accreditation number</strong> — The lab isn't ISO 17025 certified. Results may not be reliable.</li>
        <li><strong>Missing panels</strong> — A COA that only shows cannabinoids (no pesticides, no heavy metals, no microbials) is not a full-panel COA. It's a partial test that tells you very little about safety.</li>
        <li><strong>Delta-9 THC above 0.3%</strong> — The product is federally non-compliant.</li>
        <li><strong>Sample date doesn't match the batch</strong> — The vendor may be reusing an old COA on a new batch. Always ask for the COA specific to the batch you're purchasing.</li>
        <li><strong>"In-house" testing</strong> — Any lab affiliated with the vendor is not independent. Third-party means no financial relationship between the lab and the vendor.</li>
        <li><strong>Pesticide or heavy metal detections above action limits</strong> — Non-negotiable disqualifier.</li>
      </ul>

      <h2>How to Verify a COA Is Real</h2>
      <p>Most accredited labs publish results on their website with a QR code or report ID that links directly to the lab's database. When in doubt:</p>
      <ul>
        <li>Scan the QR code on the COA — it should take you to the lab's website, not the vendor's</li>
        <li>Search the lab's name + accreditation number on the A2LA or PJLA database</li>
        <li>Cross-reference the batch number on the COA with the batch number on your product</li>
      </ul>

      <h2>Our Standard at Luxurious Habbits</h2>
      <p>Every product we carry is backed by a full-panel COA from an ISO 17025-accredited third-party lab. We test for cannabinoids, terpenes, pesticides, heavy metals, and microbials — no shortcuts. COAs are available on every product page. If you ever have a question about a specific batch, email us at <a href="mailto:support@luxurioushabbits.com">support@luxurioushabbits.com</a> and we'll send it directly.</p>
    `,
  },
  "best-thca-strains-2025": {
    title: "Best THCA Strains of 2026: Our Top Picks",
    category: "Strain Guide",
    categoryColor: "#f5a623",
    excerpt: "The top THCA hemp strains of 2026 broken down by category — relaxation, focus, sleep, and overall.",
    readTime: "12 min read",
    publishDate: "2026-03-01",
    tags: ["Strain Review", "Top Picks", "2026", "Recommendations"],
    content: `
      <h2>The Best THCA Hemp Strains of 2026</h2>
      <p>The THCA hemp flower market has matured significantly over the past two years. Genetics that were once exclusive to licensed dispensaries are now available as federally compliant hemp flower — and the quality has never been higher. We've broken down our top picks for 2026 by category so you can find the right strain for your needs.</p>
      <p><strong>How we evaluate:</strong> Every strain on this list has been assessed on genetics, THCA percentage, terpene profile, cure quality, and COA transparency. We only recommend strains we've personally evaluated from batches with full-panel lab documentation.</p>

      <h2>Best Overall: Gelato #41</h2>
      <p><strong>Type:</strong> Indica-dominant hybrid | <strong>THCA:</strong> 22–27% | <strong>Dominant Terpenes:</strong> Caryophyllene, Limonene, Myrcene</p>
      <p>Gelato #41 is the benchmark strain of 2026. A cross between Sunset Sherbet and Thin Mint GSC, it delivers a dessert-sweet aroma with notes of lavender, citrus, and cream, paired with a balanced effect profile that's relaxing without being sedating. Dense, frosty buds with exceptional bag appeal. The terpene profile is consistently rich — look for batches testing above 2% total terpenes. This is the strain we recommend most often to first-time THCA flower buyers who want to understand what premium looks like.</p>

      <h2>Best Sativa: Sour Diesel</h2>
      <p><strong>Type:</strong> Pure Sativa | <strong>THCA:</strong> 19–24% | <strong>Dominant Terpenes:</strong> Caryophyllene, Myrcene, Limonene</p>
      <p>Sour Diesel has been a top-shelf staple for decades and remains one of the most requested sativa THCA strains in 2026. The aroma is unmistakable — sharp, fuel-forward diesel with a sour citrus edge. Effects are fast-onset, cerebral, and energizing without the anxiety that some sativas can produce. Best for morning or early afternoon use. If you need to stay functional and focused, Sour Diesel is the standard.</p>

      <h2>Best Indica: Granddaddy Purple</h2>
      <p><strong>Type:</strong> Pure Indica | <strong>THCA:</strong> 20–25% | <strong>Dominant Terpenes:</strong> Myrcene, Caryophyllene, Pinene</p>
      <p>Granddaddy Purple (GDP) is the definitive evening indica. A cross between Purple Urkle and Big Bud, GDP produces deep purple buds with a grape and berry aroma that's immediately recognizable. The effects are heavily body-focused — relaxing, sedating, and long-lasting. This is the strain for unwinding after a long day, managing restlessness, or simply sinking into the couch. Not a daytime strain. Best consumed in the evening.</p>

      <h2>Best Hybrid: Wedding Cake</h2>
      <p><strong>Type:</strong> Indica-dominant hybrid | <strong>THCA:</strong> 23–28% | <strong>Dominant Terpenes:</strong> Caryophyllene, Limonene, Myrcene</p>
      <p>Wedding Cake (also known as Pink Cookies) is a cross between Triangle Kush and Animal Mints. It consistently produces some of the highest THCA percentages in the hemp flower market — batches above 25% are common from top-tier cultivators. The aroma is rich and doughy with vanilla and pepper notes. Effects are potent and full-body, with a euphoric onset that settles into deep relaxation. This is a high-tolerance strain — not recommended for beginners. For experienced consumers, it's one of the most satisfying smokes available.</p>

      <h2>Best for Flavor: Runtz</h2>
      <p><strong>Type:</strong> Balanced hybrid | <strong>THCA:</strong> 19–24% | <strong>Dominant Terpenes:</strong> Caryophyllene, Limonene, Linalool</p>
      <p>Runtz is a cross between Zkittlez and Gelato, and it shows. The aroma is candy-sweet with tropical fruit and cream notes that make it one of the most distinctive-smelling strains on the market. Effects are balanced — euphoric and uplifting at onset, settling into a relaxed, happy body state. Runtz is the strain people reach for when they want the full sensory experience: incredible smell, smooth smoke, and a well-rounded effect profile. Look for batches with total terpenes above 2.5% to get the full flavor expression.</p>

      <h2>Best for Beginners: Blue Dream</h2>
      <p><strong>Type:</strong> Pure Sativa | <strong>THCA:</strong> 18–23% | <strong>Dominant Terpenes:</strong> Myrcene, Caryophyllene, Terpinolene</p>
      <p>Blue Dream remains the most approachable premium THCA strain for new consumers. The effects are uplifting and cerebral without being overwhelming, the aroma is sweet and pleasant, and the onset is smooth and gradual. It's forgiving of overconsumption compared to heavier indicas or high-THC hybrids. If you're new to THCA flower and want to start with something that won't knock you sideways, Blue Dream is the answer. <a href="/blog/blue-dream-thca-strain-review">Read our full Blue Dream review here.</a></p>

      <h2>Honorable Mentions</h2>
      <ul>
        <li><strong>OG Kush</strong> — The original. Earthy, piney, fuel-forward. Balanced hybrid with a classic effect profile that never goes out of style.</li>
        <li><strong>Zkittlez</strong> — Fruity, tropical, and relaxing. One of the best indica-dominant strains for flavor-forward consumers.</li>
        <li><strong>Jack Herer</strong> — A legendary sativa named after the cannabis activist. Piney, spicy, and energizing. Great for creative work.</li>
        <li><strong>Pineapple Express</strong> — Tropical, citrus, and uplifting. A crowd-pleasing hybrid that works for almost any occasion.</li>
      </ul>

      <h2>What to Look for in Any Strain</h2>
      <p>Regardless of which strain you choose, these quality indicators apply to every purchase:</p>
      <ul>
        <li><strong>THCA above 18%</strong> for premium-tier potency</li>
        <li><strong>Total terpenes above 1.5%</strong> for a rich flavor and effect profile</li>
        <li><strong>Full-panel COA</strong> covering cannabinoids, terpenes, pesticides, heavy metals, and microbials</li>
        <li><strong>Delta-9 THC at or below 0.3%</strong> for federal compliance</li>
        <li><strong>Proper cure</strong> — slightly sticky, not bone dry, no visible mold or stems</li>
      </ul>

      <p>At Luxurious Habbits, every strain we carry meets these standards. Browse our current inventory at <a href="/products">luxurioushabbits.com/products</a> — we rotate stock as new batches come in, so check back regularly or sign up for restock notifications.</p>
    `,
  },
  "og-kush-thca-strain-review": {
    title: "OG Kush THCA Flower: Full Strain Review",
    category: "Strain Guide",
    categoryColor: "#ff4444",
    excerpt: "OG Kush is the foundation of modern cannabis genetics. As a THCA hemp flower, it delivers the same legendary earthy, piney, fuel-forward profile that defined a generation.",
    readTime: "7 min read",
    publishDate: "2026-04-01",
    tags: ["OG Kush", "Strain Review", "Hybrid", "THCA"],
    strainType: "hybrid",
    terpenes: [
      { slug: "beta-myrcene", name: "Myrcene", pct: "0.35–0.55%", note: "Earthy, musky base — promotes relaxation" },
      { slug: "limonene", name: "Limonene", pct: "0.20–0.40%", note: "Bright citrus and lemon — uplifting" },
      { slug: "beta-caryophyllene", name: "Caryophyllene", pct: "0.18–0.35%", note: "Spicy, peppery fuel note — anti-inflammatory" },
      { slug: "alpha-pinene", name: "Pinene", pct: "0.10–0.20%", note: "Pine and herbal brightness — focus and alertness" },
    ],
    content: `
      <h2>Overview</h2>
      <p>OG Kush is arguably the most influential cannabis strain of the modern era. Its genetics form the foundation of dozens of today's most popular strains — Gelato, Wedding Cake, GSC, and countless others trace their lineage back to OG Kush. As a THCA hemp flower, it delivers the same iconic profile that made it a legend: earthy, piney, and fuel-forward with a complex, multi-layered aroma that connoisseurs have chased for decades.</p>

      <h2>Genetics & Lineage</h2>
      <p><strong>Type:</strong> Indica-dominant hybrid (55% indica / 45% sativa)<br/>
      <strong>Parent Strains:</strong> Chemdawg × Hindu Kush (disputed — origins are legendary and somewhat mysterious)<br/>
      <strong>Origin:</strong> Southern California, early 1990s</p>
      <p>The exact origins of OG Kush are debated in cannabis culture, which only adds to its mystique. What's not debated is its impact — it reshaped West Coast cannabis culture and became the genetic backbone of the modern premium market.</p>

      <h2>Aroma & Flavor Profile</h2>
      <p>OG Kush has one of the most complex and recognizable terpene profiles in cannabis:</p>
      <ul>
        <li><strong>Myrcene</strong> — earthy, musky base; the dominant terpene in most OG Kush phenotypes</li>
        <li><strong>Limonene</strong> — bright citrus and lemon notes cutting through the earthiness</li>
        <li><strong>Caryophyllene</strong> — spicy, peppery depth; adds the characteristic "fuel" note</li>
        <li><strong>Pinene</strong> — pine and herbal brightness on the top end of the aroma</li>
      </ul>
      <p>The result is a complex, layered smell that's simultaneously earthy, piney, citrusy, and fuel-forward. On the inhale, expect a smooth, slightly spicy smoke. The exhale is earthy and pine-forward with a long, clean finish.</p>

      <h2>Effects</h2>
      <p>OG Kush produces a well-balanced effect profile that leans slightly toward the body:</p>
      <ul>
        <li>A euphoric, uplifting onset that elevates mood and promotes sociability</li>
        <li>A gradual body relaxation that builds over the first 20–30 minutes</li>
        <li>A calm, focused mental state — not sedating, but not stimulating either</li>
        <li>Long-lasting effects with a smooth, gradual comedown</li>
      </ul>
      <p>OG Kush is versatile — it works for afternoon or evening use, social settings, or solo relaxation. It's potent enough to satisfy experienced consumers but approachable enough for those with moderate tolerance.</p>

      <h2>What to Look for in OG Kush THCA Flower</h2>
      <ul>
        <li><strong>THCA percentage:</strong> Premium OG Kush typically tests between 20–26% THCA. The genetics support high potency when grown properly.</li>
        <li><strong>Terpene content:</strong> Look for total terpenes above 1.8%. The complex multi-terpene profile is what makes OG Kush special — a flat terpene panel means a flat experience.</li>
        <li><strong>Bud structure:</strong> Dense, medium-sized buds with a heavy coating of trichomes. Should be slightly sticky with visible orange pistils.</li>
        <li><strong>Full-panel COA:</strong> Always verify cannabinoids, terpenes, pesticides, heavy metals, and microbials.</li>
      </ul>

      <h2>OG Kush at Luxurious Habbits</h2>
      <p>When we carry OG Kush, we source only from cultivators who can demonstrate authentic OG genetics with consistent terpene profiles across batches. Full-panel COAs are available on every product page. Check our <a href="/products">product catalog</a> for current availability or sign up for restock notifications.</p>
    `,
  },
  "gelato-thca-strain-review": {
    title: "Gelato THCA Flower: Full Strain Review",
    category: "Strain Guide",
    categoryColor: "#ff4444",
    excerpt: "Gelato is the definitive dessert strain — sweet, creamy, and potent. As a THCA hemp flower, it represents the pinnacle of modern hybrid genetics.",
    readTime: "7 min read",
    publishDate: "2026-04-10",
    tags: ["Gelato", "Strain Review", "Hybrid", "THCA"],
    strainType: "hybrid",
    terpenes: [
      { slug: "beta-caryophyllene", name: "Caryophyllene", pct: "0.40–0.65%", note: "Spicy, peppery depth — grounds the sweetness" },
      { slug: "limonene", name: "Limonene", pct: "0.25–0.45%", note: "Bright citrus and orange — uplifting" },
      { slug: "beta-myrcene", name: "Myrcene", pct: "0.20–0.35%", note: "Earthy, creamy base — relaxing" },
      { slug: "linalool", name: "Linalool", pct: "0.10–0.20%", note: "Floral lavender notes — calming" },
    ],
    content: `
      <h2>Overview</h2>
      <p>Gelato is one of the defining strains of the 2010s and remains a top-shelf staple in 2026. Bred by the Cookie Fam in San Francisco, Gelato is a cross between Sunset Sherbet and Thin Mint GSC — two already-legendary strains — producing offspring that exceeded both parents in aroma, potency, and bag appeal. As a THCA hemp flower, Gelato delivers the same dessert-sweet profile and balanced, potent effects that made it famous.</p>

      <h2>Genetics & Lineage</h2>
      <p><strong>Type:</strong> Indica-dominant hybrid<br/>
      <strong>Parent Strains:</strong> Sunset Sherbet × Thin Mint Girl Scout Cookies<br/>
      <strong>Origin:</strong> San Francisco, California (Cookie Fam Genetics)</p>
      <p>There are multiple Gelato phenotypes — #33 (Larry Bird), #41, #45, and others — each with slightly different terpene expressions. Gelato #41 is widely considered the most potent and aromatic phenotype and is the most commonly available as THCA hemp flower.</p>

      <h2>Aroma & Flavor Profile</h2>
      <p>Gelato's terpene profile is what sets it apart:</p>
      <ul>
        <li><strong>Caryophyllene</strong> — spicy, peppery depth that grounds the sweetness</li>
        <li><strong>Limonene</strong> — bright citrus and orange notes</li>
        <li><strong>Myrcene</strong> — earthy, creamy base that rounds out the profile</li>
        <li><strong>Linalool</strong> — floral, lavender notes that add complexity</li>
      </ul>
      <p>The aroma is unmistakably dessert-forward — sweet, creamy, and fruity with a lavender and citrus edge. The smoke is smooth and rich, with a sweet exhale that lingers. One of the most pleasant-smelling strains in the market.</p>

      <h2>Effects</h2>
      <p>Gelato produces a potent, balanced effect profile:</p>
      <ul>
        <li>A strong, euphoric mental onset — uplifting and mood-elevating</li>
        <li>A warm, relaxing body effect that builds gradually</li>
        <li>Creative and focused mental state without anxiety</li>
        <li>Long-lasting effects — typically 3–4 hours for experienced consumers</li>
      </ul>
      <p>Gelato is versatile enough for afternoon or evening use. It's potent — THCA percentages above 22% are common — so beginners should start with a small amount and wait before consuming more.</p>

      <h2>What to Look for in Gelato THCA Flower</h2>
      <ul>
        <li><strong>THCA percentage:</strong> Premium Gelato typically tests between 22–27% THCA. Anything below 18% is below the standard for this genetics.</li>
        <li><strong>Terpene content:</strong> Look for total terpenes above 2%. The dessert aroma is the signature — if it doesn't smell right, the terpene profile isn't there.</li>
        <li><strong>Bud structure:</strong> Dense, colorful buds with purple hues, orange pistils, and a heavy trichome coating. Gelato buds should look as good as they smell.</li>
        <li><strong>Phenotype:</strong> Ask for Gelato #41 specifically if you want the most potent expression.</li>
      </ul>

      <h2>Gelato at Luxurious Habbits</h2>
      <p>Gelato is one of our most requested strains. When it's in stock, it moves fast. Check our <a href="/products">product catalog</a> for current availability or sign up for restock notifications to be the first to know when a new batch arrives.</p>
    `,
  },
  "wedding-cake-thca-strain-review": {
    title: "Wedding Cake THCA Flower: Full Strain Review",
    category: "Strain Guide",
    categoryColor: "#ff4444",
    excerpt: "Wedding Cake is one of the most potent THCA hemp strains available — dense, frosty, and consistently testing above 25% THCA.",
    readTime: "7 min read",
    publishDate: "2026-04-18",
    tags: ["Wedding Cake", "Strain Review", "Indica", "THCA"],
    strainType: "indica",
    terpenes: [
      { slug: "beta-caryophyllene", name: "Caryophyllene", pct: "0.50–0.80%", note: "Dominant spicy, peppery — defines the \u2018cake\u2019 character" },
      { slug: "limonene", name: "Limonene", pct: "0.25–0.45%", note: "Sweet citrus and vanilla undertones" },
      { slug: "beta-myrcene", name: "Myrcene", pct: "0.15–0.30%", note: "Earthy, creamy base — sedating" },
    ],
    content: `
      <h2>Overview</h2>
      <p>Wedding Cake — also known as Pink Cookies or Triangle Mints #23 — is one of the most potent and visually striking THCA hemp strains on the market. A cross between Triangle Kush and Animal Mints, Wedding Cake consistently produces some of the highest THCA percentages available in the hemp flower space, with top batches regularly testing above 25%. Dense, heavily frosted buds with a rich, doughy aroma make it one of the most sought-after strains for experienced consumers.</p>

      <h2>Genetics & Lineage</h2>
      <p><strong>Type:</strong> Indica-dominant hybrid<br/>
      <strong>Parent Strains:</strong> Triangle Kush × Animal Mints<br/>
      <strong>Origin:</strong> Seed Junky Genetics, California</p>

      <h2>Aroma & Flavor Profile</h2>
      <ul>
        <li><strong>Caryophyllene</strong> — dominant spicy, peppery note that defines the "cake" character</li>
        <li><strong>Limonene</strong> — sweet citrus and vanilla undertones</li>
        <li><strong>Myrcene</strong> — earthy, creamy base</li>
      </ul>
      <p>The aroma is rich and doughy — think vanilla frosting, sweet earth, and a hint of pepper. The smoke is thick and smooth, with a sweet, slightly spicy exhale. The flavor profile lives up to the name.</p>

      <h2>Effects</h2>
      <p>Wedding Cake is a high-potency strain — not for beginners:</p>
      <ul>
        <li>A powerful, euphoric onset that hits quickly</li>
        <li>Deep, full-body relaxation that builds over the first 30 minutes</li>
        <li>A calming, sedating finish — best for evening use</li>
        <li>Long-lasting effects — 3–5 hours for experienced consumers</li>
      </ul>
      <p><strong>Beginner warning:</strong> Wedding Cake's potency can be overwhelming for low-tolerance consumers. Start with one small puff and wait 15–20 minutes before consuming more.</p>

      <h2>What to Look for in Wedding Cake THCA Flower</h2>
      <ul>
        <li><strong>THCA percentage:</strong> Premium Wedding Cake should test above 22% THCA. Top-tier batches regularly exceed 25–28%.</li>
        <li><strong>Terpene content:</strong> Look for total terpenes above 2%. The rich doughy aroma is the signature — if it smells flat, the batch isn't top-shelf.</li>
        <li><strong>Bud structure:</strong> Dense, compact buds absolutely coated in trichomes. Should feel heavy for their size and be slightly sticky.</li>
        <li><strong>Full-panel COA:</strong> Given the potency, always verify the Delta-9 THC is at or below 0.3% on the COA.</li>
      </ul>

      <h2>Wedding Cake at Luxurious Habbits</h2>
      <p>Wedding Cake is one of our flagship strains when available. We source only from cultivators who can consistently hit the potency and terpene benchmarks this genetics demands. Check our <a href="/products">product catalog</a> for current availability.</p>
    `,
  },
  "runtz-thca-strain-review": {
    title: "Runtz THCA Flower: Full Strain Review",
    category: "Strain Guide",
    categoryColor: "#ff4444",
    excerpt: "Runtz is the candy strain — sweet, tropical, and visually stunning. A cross between Zkittlez and Gelato, it delivers one of the most unique flavor profiles in the hemp market.",
    readTime: "7 min read",
    publishDate: "2026-05-05",
    tags: ["Runtz", "Strain Review", "Hybrid", "THCA"],
    strainType: "hybrid",
    terpenes: [
      { slug: "beta-caryophyllene", name: "Caryophyllene", pct: "0.35–0.55%", note: "Spicy depth — balances the candy sweetness" },
      { slug: "limonene", name: "Limonene", pct: "0.30–0.50%", note: "Tropical citrus and candy — uplifting" },
      { slug: "linalool", name: "Linalool", pct: "0.15–0.30%", note: "Floral soft sweetness — calming" },
    ],
    content: `
      <h2>Overview</h2>
      <p>Runtz took the cannabis world by storm when it emerged from the Cookies camp in the late 2010s, and it shows no signs of slowing down in 2026. A cross between Zkittlez and Gelato, Runtz combines the tropical candy sweetness of Zkittlez with the creamy potency of Gelato — producing one of the most distinctive and sought-after flavor profiles in the hemp flower market. Dense, colorful buds, a candy-sweet aroma, and a balanced, euphoric effect profile make it a perennial top seller.</p>

      <h2>Genetics & Lineage</h2>
      <p><strong>Type:</strong> Balanced hybrid (50/50 indica/sativa)<br/>
      <strong>Parent Strains:</strong> Zkittlez × Gelato<br/>
      <strong>Origin:</strong> Cookies, California</p>

      <h2>Aroma & Flavor Profile</h2>
      <ul>
        <li><strong>Caryophyllene</strong> — spicy depth that balances the sweetness</li>
        <li><strong>Limonene</strong> — bright tropical citrus and candy notes</li>
        <li><strong>Linalool</strong> — floral, soft sweetness that rounds out the profile</li>
      </ul>
      <p>The aroma is candy-sweet and tropical — think Skittles and cream with a floral edge. It's one of the most immediately recognizable and pleasant-smelling strains available. The smoke is smooth and sweet, with a long, fruity exhale. If you care about flavor above all else, Runtz is the strain.</p>

      <h2>Effects</h2>
      <p>Runtz produces a well-balanced, euphoric effect profile:</p>
      <ul>
        <li>An uplifting, happy onset that elevates mood without anxiety</li>
        <li>A gradual body relaxation that doesn't become sedating</li>
        <li>A creative, sociable mental state — good for conversation and activity</li>
        <li>Smooth, gradual comedown — not abrupt</li>
      </ul>
      <p>Runtz is one of the most versatile strains available — it works for afternoon or evening use, social settings, creative work, or simply enjoying the flavor. The balanced genetics mean it doesn't skew too heavily toward either sedation or stimulation.</p>

      <h2>What to Look for in Runtz THCA Flower</h2>
      <ul>
        <li><strong>THCA percentage:</strong> Premium Runtz typically tests between 19–24% THCA.</li>
        <li><strong>Terpene content:</strong> Look for total terpenes above 2.5% to get the full candy flavor expression. Runtz with low terpenes is a disappointment — the aroma is the point.</li>
        <li><strong>Bud structure:</strong> Dense, colorful buds with purple and green hues, orange pistils, and a generous trichome coating. Runtz buds are visually striking — if they look plain, question the genetics.</li>
        <li><strong>Authentic genetics:</strong> Runtz is widely counterfeited. Source from vendors who can provide documentation of the cultivar lineage.</li>
      </ul>

      <h2>Runtz at Luxurious Habbits</h2>
      <p>Runtz is consistently one of our most requested strains. When we carry it, we source only from cultivators who can demonstrate authentic genetics and consistent terpene profiles. Check our <a href="/products">product catalog</a> for current availability or sign up for restock notifications.</p>
    `,
  },
  "how-to-store-thca-flower": {
    title: "How to Store THCA Flower: Keep It Fresh Longer",
    category: "Education",
    categoryColor: "#00e5a0",
    excerpt: "Proper storage is the single biggest factor in preserving the potency, aroma, and flavor of your THCA hemp flower after purchase.",
    readTime: "6 min read",
    publishDate: "2026-04-05",
    tags: ["Storage", "Freshness", "THCA", "Tips"],
    content: `
      <h2>Why Storage Matters</h2>
      <p>THCA flower is a living, terpene-rich product. From the moment it's harvested and cured, it begins a slow process of degradation. Exposure to light, heat, air, and humidity all accelerate this process — breaking down terpenes, converting THCA to CBN, and ultimately producing a flat, harsh smoke with diminished effects. Proper storage is the single biggest factor in preserving what you paid for.</p>

      <h2>The Four Enemies of Fresh Flower</h2>
      <p><strong>1. Light</strong> — UV radiation is the fastest way to degrade cannabinoids. Even ambient indoor light causes slow degradation over time. Always store flower in opaque or UV-blocking containers away from windows.</p>
      <p><strong>2. Heat</strong> — High temperatures accelerate terpene evaporation and cannabinoid degradation. The ideal storage temperature is between 60–70°F (15–21°C). Never store flower near heat sources, appliances, or in a car.</p>
      <p><strong>3. Air (Oxygen)</strong> — Oxidation converts THCA and THC into CBN over time, reducing potency and producing a more sedating, less flavorful product. Minimize air exposure by using airtight containers and opening them only when needed.</p>
      <p><strong>4. Humidity</strong> — Both too-dry and too-wet conditions damage flower. Too dry: terpenes evaporate, flower crumbles, smoke becomes harsh. Too wet: mold and mildew risk. The ideal relative humidity (RH) for stored flower is <strong>55–62%</strong>.</p>

      <h2>Best Storage Containers</h2>
      <p><strong>Glass mason jars</strong> are the gold standard for home storage. They are airtight, non-reactive, and easy to find. Use wide-mouth jars sized appropriately for your quantity — too much air space in an oversized jar accelerates oxidation.</p>
      <p><strong>Specialty cannabis storage containers</strong> (such as CVault or Boveda-compatible tins) are excellent options that often include humidity control packs and UV protection built in.</p>
      <p><strong>Avoid:</strong> Plastic bags (static electricity pulls trichomes off the flower), plastic containers (off-gassing can affect flavor), and cardboard (absorbs moisture and terpenes).</p>

      <h2>Using Humidity Control Packs</h2>
      <p>Boveda and Integra Boost humidity control packs are two-way humidity regulators — they add or remove moisture to maintain a target RH level inside your container. For THCA flower storage, use <strong>62% RH packs</strong> for long-term storage or <strong>58% RH packs</strong> if you prefer a slightly drier smoke. Simply drop one in your jar and replace it when it becomes hard (fully saturated).</p>

      <h2>Long-Term Storage Tips</h2>
      <ul>
        <li>Store in a cool, dark location — a drawer, cabinet, or closet away from heat and light</li>
        <li>Avoid the refrigerator (temperature fluctuations cause condensation) unless using a dedicated cannabis humidor</li>
        <li>The freezer can work for very long-term storage (6+ months), but trichomes become brittle when frozen — handle frozen flower gently and let it come to room temperature before opening</li>
        <li>Label your jars with the strain name and purchase date</li>
        <li>Check humidity packs monthly and replace as needed</li>
      </ul>

      <h2>How Long Does THCA Flower Stay Fresh?</h2>
      <p>Properly stored in an airtight glass jar with a humidity pack in a cool, dark location, THCA flower will maintain peak quality for <strong>6–12 months</strong>. After that, potency and terpene content will gradually decline, but the flower remains usable. Improperly stored flower can degrade noticeably within weeks.</p>

      <h2>Our Packaging Standard</h2>
      <p>At Luxurious Habbits, all flower ships in vacuum-sealed, odor-barrier packaging to preserve freshness during transit. Once you receive your order, transfer it to a glass jar with a humidity pack as soon as possible for optimal long-term storage.</p>
    `,
  },
  "thca-terpenes-explained": {
    title: "THCA Flower Terpenes Explained: Aroma, Flavor & the Entourage Effect",
    category: "Education",
    categoryColor: "#00e5a0",
    excerpt: "Terpenes are the aromatic compounds that give each cannabis strain its unique scent and flavor — and they do far more than just smell good.",
    readTime: "9 min read",
    publishDate: "2026-04-20",
    tags: ["Terpenes", "Entourage Effect", "Education", "Aroma"],
    content: `
      <h2>What Are Terpenes?</h2>
      <p>Terpenes are naturally occurring aromatic compounds found in thousands of plants — including hemp. They are responsible for the distinctive scents of lavender, pine, citrus, and cannabis. In hemp and cannabis, terpenes are produced in the same trichomes that produce cannabinoids like THCA and CBD.</p>
      <p>There are over 200 terpenes identified in cannabis, though most strains are dominated by a handful of primary terpenes that define their unique character. Understanding terpenes is key to understanding why two strains with similar THCA percentages can produce very different experiences.</p>

      <h2>The Entourage Effect</h2>
      <p>The entourage effect is the theory — supported by growing research — that cannabinoids and terpenes work synergistically to produce effects greater than any single compound alone. In practical terms: a full-spectrum THCA flower with a rich terpene profile will produce a more nuanced, complex experience than an isolate with the same THCA percentage.</p>
      <p>This is why terpene content matters when evaluating quality. A COA that shows only cannabinoids tells you the potency. A COA that also shows terpenes tells you the full story.</p>

      <h2>The Most Common THCA Flower Terpenes</h2>

      <h3>Myrcene</h3>
      <p><strong>Aroma:</strong> Earthy, musky, herbal — like ripe mangoes or fresh hops.<br/>
      <strong>Found in:</strong> OG Kush, Blue Dream, Granddaddy Purple<br/>
      <strong>Effects:</strong> Myrcene is the most abundant terpene in most cannabis strains. It is associated with relaxing, sedating body effects and is thought to enhance the permeability of cell membranes, potentially increasing cannabinoid absorption.</p>

      <h3>Caryophyllene</h3>
      <p><strong>Aroma:</strong> Spicy, peppery, woody — like black pepper or cloves.<br/>
      <strong>Found in:</strong> GSC (Girl Scout Cookies), Sour Diesel, Chemdawg<br/>
      <strong>Effects:</strong> Uniquely, caryophyllene is the only terpene known to directly activate cannabinoid receptors (specifically CB2 receptors). It has demonstrated anti-inflammatory properties in research and is associated with stress relief.</p>

      <h3>Limonene</h3>
      <p><strong>Aroma:</strong> Bright citrus — lemon, orange, grapefruit.<br/>
      <strong>Found in:</strong> Lemon Haze, Super Lemon Haze, Tangie<br/>
      <strong>Effects:</strong> Limonene is associated with elevated mood, stress relief, and potential antifungal properties. Strains high in limonene tend to produce uplifting, energizing experiences.</p>

      <h3>Pinene</h3>
      <p><strong>Aroma:</strong> Pine needles, fresh forest air.<br/>
      <strong>Found in:</strong> Jack Herer, Blue Dream, Dutch Treat<br/>
      <strong>Effects:</strong> Alpha-pinene is associated with alertness, focus, and memory retention. It may counteract some short-term memory effects of THC. Strains high in pinene tend to produce clear-headed, focused experiences.</p>

      <h3>Linalool</h3>
      <p><strong>Aroma:</strong> Floral, lavender, slightly spicy.<br/>
      <strong>Found in:</strong> Amnesia Haze, Lavender, LA Confidential<br/>
      <strong>Effects:</strong> Linalool is widely used in aromatherapy for its calming properties. In cannabis, it is associated with relaxation, anxiety reduction, and sedation. Strains high in linalool are often recommended for evening use.</p>

      <h3>Terpinolene</h3>
      <p><strong>Aroma:</strong> Fresh, piney, floral, slightly citrus — complex and hard to pin down.<br/>
      <strong>Found in:</strong> Jack Herer, Ghost Train Haze, Durban Poison<br/>
      <strong>Effects:</strong> Terpinolene is associated with uplifting, energizing effects. It is less common than myrcene or caryophyllene but produces some of the most distinctive aromatic profiles in cannabis.</p>

      <h2>How to Evaluate Terpenes on a COA</h2>
      <p>A full-panel COA from an accredited lab will include a terpene panel showing the percentage of each terpene by weight. When evaluating a product:</p>
      <ul>
        <li><strong>Total terpenes above 1.5%</strong> is considered good. Above 2.5% is excellent. Below 1% suggests the flower may be over-dried or improperly cured.</li>
        <li>Look at the dominant terpenes (top 2–3) to predict the flavor and effect profile.</li>
        <li>Cross-reference the terpene profile with the strain's known characteristics to verify authenticity.</li>
      </ul>

      <p>At Luxurious Habbits, every product page includes the terpene data from the COA. We believe informed customers make better choices — and better choices lead to better experiences.</p>
    `,
  },
  "hemp-flower-vs-cbd-flower": {
    title: "Hemp Flower vs CBD Flower vs THCA Flower: What's the Difference?",
    category: "Education",
    categoryColor: "#00e5a0",
    excerpt: "The terms hemp flower, CBD flower, and THCA flower are often used interchangeably — but they describe meaningfully different products.",
    readTime: "7 min read",
    publishDate: "2026-05-01",
    tags: ["Hemp", "CBD", "THCA", "Education", "Comparison"],
    content: `
      <h2>The Terminology Problem</h2>
      <p>Walk into any hemp shop or browse any online retailer and you'll encounter all three terms: hemp flower, CBD flower, and THCA flower. They're often used interchangeably, but they describe meaningfully different products with different cannabinoid profiles, different effects, and different use cases. Understanding the distinction is essential for making an informed purchase.</p>

      <h2>What Is Hemp Flower?</h2>
      <p>Hemp flower is the broadest category. It refers to the dried, cured flower (bud) of the <em>Cannabis sativa L.</em> plant that has been grown and classified as hemp under the 2018 Farm Bill — meaning it contains 0.3% or less Delta-9 THC on a dry weight basis at the time of harvest.</p>
      <p>Hemp flower is the raw material from which CBD flower and THCA flower are both derived. The distinction between them comes down to the specific cannabinoid profile of the plant variety (cultivar) used.</p>

      <h2>What Is CBD Flower?</h2>
      <p>CBD flower is hemp flower bred specifically to be high in cannabidiol (CBD) and low in all forms of THC — including THCA. CBD-dominant cultivars typically contain:</p>
      <ul>
        <li>10–20% CBD</li>
        <li>Very low THCA (often below 1%)</li>
        <li>Low Delta-9 THC (under 0.3%)</li>
      </ul>
      <p>CBD flower produces no psychoactive effects when smoked or vaped. It is used primarily for its potential wellness benefits — relaxation, stress relief, and general wellbeing — without any intoxication. It is the right choice for consumers who want the ritual and sensory experience of smoking flower without any psychoactive effects.</p>

      <h2>What Is THCA Flower?</h2>
      <p>THCA flower is hemp flower bred to be high in THCA (tetrahydrocannabinolic acid) — the raw, acidic precursor to THC. THCA-dominant cultivars typically contain:</p>
      <ul>
        <li>15–30%+ THCA</li>
        <li>Low Delta-9 THC (under 0.3% — federally compliant)</li>
        <li>Moderate CBD (varies by cultivar)</li>
      </ul>
      <p>The critical distinction: when THCA flower is smoked or vaped, the heat converts THCA to Delta-9 THC through decarboxylation. This means THCA flower <strong>produces psychoactive effects</strong> when consumed with heat — the same effects as traditional cannabis. In its raw, unheated form, THCA is non-psychoactive.</p>

      <h2>Side-by-Side Comparison</h2>
      <table style="width:100%; border-collapse: collapse; margin: 1.5rem 0;">
        <thead>
          <tr style="border-bottom: 1px solid #333;">
            <th style="text-align:left; padding: 0.5rem 0.75rem; font-size: 0.72rem; color: #bf5fff; text-transform: uppercase; letter-spacing: 0.1em;">Feature</th>
            <th style="text-align:left; padding: 0.5rem 0.75rem; font-size: 0.72rem; color: #bf5fff; text-transform: uppercase; letter-spacing: 0.1em;">CBD Flower</th>
            <th style="text-align:left; padding: 0.5rem 0.75rem; font-size: 0.72rem; color: #bf5fff; text-transform: uppercase; letter-spacing: 0.1em;">THCA Flower</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid #222;">
            <td style="padding: 0.5rem 0.75rem; font-size: 0.78rem; color: #999;">Primary Cannabinoid</td>
            <td style="padding: 0.5rem 0.75rem; font-size: 0.78rem; color: #ccc;">CBD (10–20%)</td>
            <td style="padding: 0.5rem 0.75rem; font-size: 0.78rem; color: #ccc;">THCA (15–30%+)</td>
          </tr>
          <tr style="border-bottom: 1px solid #222;">
            <td style="padding: 0.5rem 0.75rem; font-size: 0.78rem; color: #999;">Psychoactive when smoked?</td>
            <td style="padding: 0.5rem 0.75rem; font-size: 0.78rem; color: #ccc;">No</td>
            <td style="padding: 0.5rem 0.75rem; font-size: 0.78rem; color: #ccc;">Yes (converts to THC)</td>
          </tr>
          <tr style="border-bottom: 1px solid #222;">
            <td style="padding: 0.5rem 0.75rem; font-size: 0.78rem; color: #999;">Federally Legal?</td>
            <td style="padding: 0.5rem 0.75rem; font-size: 0.78rem; color: #ccc;">Yes (Farm Bill)</td>
            <td style="padding: 0.5rem 0.75rem; font-size: 0.78rem; color: #ccc;">Yes (Farm Bill, when ≤0.3% Δ9)</td>
          </tr>
          <tr style="border-bottom: 1px solid #222;">
            <td style="padding: 0.5rem 0.75rem; font-size: 0.78rem; color: #999;">Best For</td>
            <td style="padding: 0.5rem 0.75rem; font-size: 0.78rem; color: #ccc;">Wellness, no intoxication</td>
            <td style="padding: 0.5rem 0.75rem; font-size: 0.78rem; color: #ccc;">Full cannabis experience</td>
          </tr>
          <tr>
            <td style="padding: 0.5rem 0.75rem; font-size: 0.78rem; color: #999;">Drug Test Risk</td>
            <td style="padding: 0.5rem 0.75rem; font-size: 0.78rem; color: #ccc;">Low (but not zero)</td>
            <td style="padding: 0.5rem 0.75rem; font-size: 0.78rem; color: #ccc;">High — will likely trigger</td>
          </tr>
        </tbody>
      </table>

      <h2>Which Should You Choose?</h2>
      <p><strong>Choose CBD flower if:</strong> You want the ritual of smoking flower, the potential wellness benefits of CBD, and absolutely no psychoactive effects. You are subject to drug testing. You are new to hemp and want a gentle introduction.</p>
      <p><strong>Choose THCA flower if:</strong> You want the full cannabis experience — the potency, the effects, the terpene complexity — in a federally compliant product. You are 21+ and not subject to drug testing. You are an experienced consumer looking for premium quality.</p>

      <h2>A Note on Drug Testing</h2>
      <p>If you are subject to workplace drug testing, <strong>do not use THCA flower</strong>. Standard drug tests screen for THC metabolites, and THCA flower will produce the same metabolites as traditional cannabis when smoked. CBD flower carries a much lower risk, but is not zero — some CBD products contain trace amounts of THC that can accumulate with heavy use. When in doubt, consult with your employer or a medical professional before using any hemp product.</p>

      <p>At Luxurious Habbits, we carry exclusively THCA hemp flower — the highest-tier, most potent hemp experience available. If you have questions about which product is right for you, email us at <a href="mailto:support@luxurioushabbits.com">support@luxurioushabbits.com</a>.</p>
    `,
  },
  "thca-flower-beginners-guide": {
    title: "THCA Flower for Beginners: Everything You Need to Know",
    category: "Education",
    categoryColor: "#00e5a0",
    excerpt: "New to THCA hemp flower? This guide covers everything — what it is, how to use it, what to expect, and how to buy safely.",
    readTime: "10 min read",
    publishDate: "2026-05-15",
    tags: ["Beginner Guide", "THCA", "How To", "Education"],
    content: `
      <h2>Welcome to THCA Flower</h2>
      <p>If you're new to THCA hemp flower, you're in the right place. THCA flower has become one of the most popular hemp products in the country — and for good reason. It offers the full cannabis experience (potency, aroma, effects) in a federally legal format. But it can also be confusing if you're coming from a background in CBD products or traditional cannabis. This guide covers everything you need to know to get started safely and confidently.</p>

      <h2>What Is THCA Flower?</h2>
      <p>THCA (tetrahydrocannabinolic acid) is the raw, non-psychoactive precursor to THC found naturally in the hemp plant. In its unheated form, THCA does not produce psychoactive effects. However, when you smoke or vaporize THCA flower, the heat converts THCA to Delta-9 THC through a process called decarboxylation — producing the same effects as traditional cannabis.</p>
      <p>THCA flower is federally legal under the 2018 Farm Bill because it contains 0.3% or less Delta-9 THC on a dry weight basis. The THCA itself is not counted as THC for federal compliance purposes — only the Delta-9 THC content matters for legality.</p>

      <h2>How Is It Different From Regular Cannabis?</h2>
      <p>In terms of the experience when smoked, THCA flower and traditional cannabis are essentially the same. The difference is legal status and sourcing. THCA flower is grown under hemp licenses, tested to federal standards, and can be shipped across state lines (with some state restrictions). Traditional cannabis is grown under state cannabis programs and cannot legally cross state lines.</p>
      <p>In terms of quality, premium THCA hemp flower from a reputable vendor like Luxurious Habbits is indistinguishable from — and often superior to — dispensary cannabis in terms of genetics, cure quality, and terpene content.</p>

      <h2>How to Use THCA Flower</h2>
      <p><strong>Smoking:</strong> The most common method. Roll it in a paper or use a pipe or bong. The heat from combustion decarboxylates the THCA to THC instantly. Effects onset within minutes.</p>
      <p><strong>Vaporizing:</strong> A dry herb vaporizer heats the flower to a temperature that vaporizes cannabinoids and terpenes without combustion. Generally considered smoother and more flavorful than smoking. Effects onset within minutes.</p>
      <p><strong>Avoid eating raw flower:</strong> Unheated THCA flower will not produce psychoactive effects when eaten, because the THCA hasn't been decarboxylated. If you want to make edibles, you need to decarboxylate the flower first (bake at 240°F for 40 minutes) before infusing it into butter or oil.</p>

      <h2>What to Expect: Effects and Onset</h2>
      <p>For first-time or infrequent users, start with a very small amount — one or two small puffs. Wait 10–15 minutes before consuming more. THCA flower is potent, and overconsumption can produce anxiety or discomfort, especially for those with low tolerance.</p>
      <p>Common effects include:</p>
      <ul>
        <li>Euphoria and mood elevation</li>
        <li>Relaxation (body and mind)</li>
        <li>Heightened sensory perception</li>
        <li>Increased appetite</li>
        <li>Sleepiness (especially with indica-dominant strains)</li>
      </ul>
      <p>Effects typically last 2–4 hours depending on the amount consumed, the strain, and individual tolerance.</p>

      <h2>How to Buy Safely</h2>
      <p>Not all THCA flower vendors are equal. Here's what to look for:</p>
      <ul>
        <li><strong>Full-panel COA from an accredited lab</strong> — This is non-negotiable. The COA should show cannabinoids, terpenes, pesticides, heavy metals, and microbials. If a vendor can't provide it, don't buy.</li>
        <li><strong>Delta-9 THC at or below 0.3%</strong> — Verify this on the COA, not just the vendor's claim.</li>
        <li><strong>Transparent sourcing</strong> — Know where the flower comes from. Reputable vendors can tell you the cultivar, the growing region, and the cultivator.</li>
        <li><strong>Age verification</strong> — Any reputable vendor requires 21+ verification. If a site doesn't ask, that's a red flag.</li>
        <li><strong>Discreet, compliant shipping</strong> — Look for UPS-compliant shipping with adult signature required.</li>
      </ul>

      <h2>Important Disclaimers</h2>
      <ul>
        <li><strong>Drug testing:</strong> THCA flower will likely trigger a positive result on standard drug tests. Do not use if you are subject to workplace drug testing.</li>
        <li><strong>Age requirement:</strong> You must be 21 or older to purchase THCA hemp flower from Luxurious Habbits.</li>
        <li><strong>State laws:</strong> While THCA flower is federally legal, some states have additional restrictions. Check your state's laws before ordering.</li>
        <li><strong>Driving:</strong> Do not drive or operate heavy machinery after consuming THCA flower.</li>
        <li><strong>Medical conditions:</strong> If you have a medical condition or take prescription medications, consult your doctor before using THCA flower.</li>
      </ul>

      <h2>Ready to Start?</h2>
      <p>At Luxurious Habbits, we carry only the finest THCA hemp flower — hand-selected, full-panel tested, and sourced from the highest-tier cultivators. Browse our <a href="/products">product catalog</a> or reach out at <a href="mailto:support@luxurioushabbits.com">support@luxurioushabbits.com</a> if you have any questions. We're here to help you find the right product for your needs.</p>
    `,
  },
  "gmo-thca-strain-review": {
    title: "GMO (Garlic Cookies) THCA Flower: Full Strain Review",
    category: "Strain Guide",
    categoryColor: "#ff4444",
    excerpt: "GMO Cookies is the most pungent, savory strain in the premium hemp market — a garlic-forward, fuel-drenched indica powerhouse with some of the highest THCA percentages available.",
    readTime: "7 min read",
    publishDate: "2026-06-01",
    tags: ["GMO", "Garlic Cookies", "Strain Review", "Indica", "THCA"],
    strainType: "indica",
    terpenes: [
      { slug: "beta-caryophyllene", name: "Caryophyllene", pct: "0.50–0.80%", note: "Spicy, peppery — anti-inflammatory backbone" },
      { slug: "limonene", name: "Limonene", pct: "0.25–0.45%", note: "Uplifting citrus cutting through the funk" },
      { slug: "beta-myrcene", name: "Myrcene", pct: "0.20–0.40%", note: "Earthy, musky base — calming and sedative" },
      { slug: "alpha-humulene", name: "Humulene", pct: "0.10–0.25%", note: "Earthy, hoppy depth — anti-inflammatory" },
    ],
    content: `
      <h2>Overview</h2>
      <p>GMO Cookies — also known as Garlic Cookies or GMO Garlic Cookies — is one of the most polarizing and celebrated strains in the premium cannabis market. Originally bred by Mamiko Seeds as a cross between Girl Scout Cookies and Chemdawg, GMO is not for the faint of heart. Its aroma is aggressively savory, pungent, and fuel-forward — garlic, mushroom, onion, and diesel layered over a deep earthy base. For those who appreciate complex, dank terpene profiles, it is in a class of its own.</p>
      <p>As a THCA hemp flower, GMO consistently delivers some of the highest cannabinoid percentages on the market — regularly testing between 22–34% THCA — combined with a deeply relaxing, full-body indica experience that makes it a go-to for evening use and serious consumers.</p>

      <h2>Genetics & Lineage</h2>
      <p><strong>Type:</strong> Indica-dominant hybrid (90/10)<br/>
      <strong>Parent Strains:</strong> Girl Scout Cookies × Chemdawg<br/>
      <strong>Origin:</strong> Mamiko Seeds<br/>
      <strong>Name:</strong> Often interpreted as "Garlic, Mushroom, and Onion" — a nod to its distinctive savory terpene profile</p>
      <p>The combination of GSC's sweet, dessert genetics with Chemdawg's legendary fuel and chemical profile produces something entirely unique. GMO inherited the potency and structure of both parents while developing an aroma profile that stands apart from everything else in the market.</p>

      <h2>Aroma & Flavor Profile</h2>
      <p>GMO is defined by its terpene profile — one of the most distinctive in cannabis:</p>
      <ul>
        <li><strong>Caryophyllene</strong> — dominant spicy, peppery note that drives the savory character and provides anti-inflammatory effects</li>
        <li><strong>Limonene</strong> — bright citrus that cuts through the heaviness and adds an uplifting dimension</li>
        <li><strong>Myrcene</strong> — earthy, musky base that grounds the profile and contributes to the sedating body effect</li>
        <li><strong>Humulene</strong> — earthy, hoppy depth that reinforces the savory, funky character</li>
      </ul>
      <p>The aroma is unmistakably pungent — garlic, diesel, and spiced earth with a hint of coffee. The smoke is thick and smooth, with a savory, spicy exhale that lingers. This is not a sweet strain. If you're looking for candy flavors, look elsewhere. If you want the most complex, dank terpene experience available, GMO delivers.</p>

      <h2>Effects</h2>
      <p>GMO produces a profoundly relaxing, indica-dominant effect profile:</p>
      <ul>
        <li>A euphoric, mentally uplifting onset that clears stress and elevates mood</li>
        <li>A powerful body high that builds over the first 20–30 minutes, easing pain and muscle tension</li>
        <li>Deep, full-body relaxation that can lead to couch-lock at higher doses</li>
        <li>Long-lasting effects — often 3–5 hours for experienced consumers</li>
        <li>A sedating finish that promotes deep, restful sleep</li>
      </ul>
      <p>GMO is best reserved for evening use. Its potency and sedating character make it unsuitable for daytime activities requiring focus or productivity. For pain relief, insomnia, and deep relaxation, it is one of the most effective strains available.</p>

      <h2>What to Look for in GMO THCA Flower</h2>
      <ul>
        <li><strong>THCA percentage:</strong> Premium GMO regularly tests between 22–34% THCA — one of the highest ranges of any strain. Look for batches above 25% for the full experience.</li>
        <li><strong>Terpene content:</strong> The aroma is the quality indicator. If it doesn't smell aggressively of garlic and diesel, the terpene profile isn't there. Total terpenes above 2% is the standard for premium GMO.</li>
        <li><strong>Bud structure:</strong> Dense, spade-shaped buds with light green coloring, purple accents, and a heavy trichome coating. Orange or amber pistils. Should be sticky and resinous.</li>
        <li><strong>Full-panel COA:</strong> Always verify cannabinoids, terpenes, pesticides, heavy metals, and microbials. GMO's potency makes it a target for misrepresentation.</li>
      </ul>

      <h2>GMO at Luxurious Habbits</h2>
      <p>GMO is one of the most requested strains by experienced consumers in our catalog. When we carry it, we source only from cultivators who can demonstrate authentic genetics and consistent terpene profiles across batches. Full-panel COAs are available on every product page. Check our <a href="/products">product catalog</a> for current availability.</p>
    `,
  },
  "oreoz-thca-strain-review": {
    title: "Oreoz THCA Flower: Full Strain Review",
    category: "Strain Guide",
    categoryColor: "#ff4444",
    excerpt: "Oreoz is the ultimate dessert indica — chocolate, vanilla, and campfire s'mores wrapped in a deeply relaxing, long-lasting high that connoisseurs chase.",
    readTime: "7 min read",
    publishDate: "2026-06-02",
    tags: ["Oreoz", "Strain Review", "Indica", "THCA"],
    strainType: "indica",
    terpenes: [
      { slug: "beta-caryophyllene", name: "Caryophyllene", pct: "0.45–0.70%", note: "Peppery, warm — cocoa edge and calming" },
      { slug: "limonene", name: "Limonene", pct: "0.25–0.45%", note: "Bright citrus — uplifting mental lift" },
      { slug: "beta-myrcene", name: "Myrcene", pct: "0.20–0.40%", note: "Herbal, musky — creamy and sedative" },
      { slug: "linalool", name: "Linalool", pct: "0.10–0.25%", note: "Floral, sweet — confection impression" },
    ],
    content: `
      <h2>Overview</h2>
      <p>Oreoz — also known as Oreo Cookies or Oreos — is a celebrity strain from 3rd Coast Genetics, bred as a cross between Cookies and Cream and Secret Weapon. It has earned its reputation as one of the premier dessert indicas on the market, combining a chocolate-and-vanilla aroma profile with deeply relaxing, long-lasting effects and THCA percentages that regularly reach 24–31%.</p>
      <p>If Gelato is the creamy dessert strain and Wedding Cake is the doughy one, Oreoz is the chocolate one — rich, indulgent, and unmistakably distinct. As a THCA hemp flower, it delivers the same celebrated profile that made it a staple in premium cannabis markets.</p>

      <h2>Genetics & Lineage</h2>
      <p><strong>Type:</strong> Indica-dominant hybrid (70/30)<br/>
      <strong>Parent Strains:</strong> Cookies and Cream × Secret Weapon<br/>
      <strong>Origin:</strong> 3rd Coast Genetics</p>
      <p>The Cookies and Cream parentage brings the dessert sweetness and dense structure, while Secret Weapon contributes the diesel and fuel undertones that give Oreoz its depth. The result is a strain that smells like campfire s'mores with a diesel edge — complex, rich, and immediately recognizable.</p>

      <h2>Aroma & Flavor Profile</h2>
      <p>Oreoz has one of the most distinctive dessert terpene profiles in the market:</p>
      <ul>
        <li><strong>Caryophyllene</strong> — dominant peppery, warm note that creates the cocoa edge and provides calming anti-inflammatory effects</li>
        <li><strong>Limonene</strong> — bright citrus that lifts the profile and adds an uplifting mental dimension</li>
        <li><strong>Myrcene</strong> — herbal, musky base that rounds out the creaminess and contributes to the sedating body effect</li>
        <li><strong>Linalool</strong> — floral, sweet notes that smooth the mid-palate and reinforce the confection impression</li>
      </ul>
      <p>The aroma is campfire s'mores — chocolate, vanilla cookie, diesel, and marshmallow. The smoke is rich and creamy, with a spiced chocolate exhale. One of the most complex and enjoyable flavor profiles in the hemp flower market.</p>

      <h2>Effects</h2>
      <p>Oreoz delivers a long-lasting, deeply relaxing experience:</p>
      <ul>
        <li>An uplifting mental boost that begins with enhanced focus and euphoria</li>
        <li>A smooth transition into deep physical relaxation with calming, tingly sensations</li>
        <li>Appetite stimulation — the munchies are real with Oreoz</li>
        <li>A sedative finish that makes it ideal for evening use and promoting sleep</li>
        <li>Long-lasting effects — often 4+ hours for experienced consumers</li>
      </ul>
      <p>Oreoz is an evening strain. Its deeply relaxing character and sedative finish make it unsuitable for daytime use requiring productivity. For unwinding, stress relief, and sleep, it is one of the best options in the indica category.</p>

      <h2>What to Look for in Oreoz THCA Flower</h2>
      <ul>
        <li><strong>THCA percentage:</strong> Premium Oreoz tests between 24–31% THCA. The genetics support very high potency when grown properly.</li>
        <li><strong>Terpene content:</strong> The chocolate-diesel aroma is the quality indicator. Total terpenes above 2% is the standard for premium Oreoz.</li>
        <li><strong>Bud structure:</strong> Dense, lumpy, triangle-shaped buds with olive green to deep dark hues, thin orange hairs, and a heavy sparkly trichome coating.</li>
      </ul>

      <h2>Oreoz at Luxurious Habbits</h2>
      <p>Oreoz is one of our most sought-after dessert strains. When it's in stock, it moves quickly. Check our <a href="/products">product catalog</a> for current availability or sign up for restock notifications.</p>
    `,
  },
  "mac-thca-strain-review": {
    title: "MAC (Miracle Alien Cookies) THCA Flower: Full Strain Review",
    category: "Strain Guide",
    categoryColor: "#ff4444",
    excerpt: "MAC is the benchmark balanced hybrid — orange creamsicle aroma, creative euphoria, and full-body calm without sedation. Bred by Capulator, it's a modern classic.",
    readTime: "7 min read",
    publishDate: "2026-06-03",
    tags: ["MAC", "Miracle Alien Cookies", "Strain Review", "Hybrid", "THCA"],
    strainType: "hybrid",
    terpenes: [
      { slug: "limonene", name: "Limonene", pct: "0.60–1.40%", note: "Dominant citrus — mood elevation and stress relief" },
      { slug: "beta-caryophyllene", name: "Caryophyllene", pct: "0.40–1.00%", note: "Spicy, peppery — anti-inflammatory" },
      { slug: "alpha-pinene", name: "Pinene", pct: "0.30–0.60%", note: "Fresh evergreen — mental alertness and focus" },
      { slug: "alpha-humulene", name: "Humulene", pct: "0.20–0.30%", note: "Earthy, herbal — appetite suppression" },
    ],
    content: `
      <h2>Overview</h2>
      <p>MAC — Miracle Alien Cookies — is one of the most celebrated hybrid strains of the last decade. Bred by Capulator as a cross between Alien Cookies and a Colombian × Starfighter hybrid, MAC quickly became a benchmark for what a balanced hybrid should be: complex orange creamsicle aroma, creative euphoria without anxiety, and full-body relaxation without sedation. It has inspired numerous crosses — MAC 1, MAC 7, MAC Stomper — and is recognized as a gold standard in premium cannabis genetics.</p>
      <p>As a THCA hemp flower, MAC delivers THCA percentages between 20–30% with a limonene-dominant terpene profile that is immediately recognizable. It is one of the few strains that works equally well for daytime and evening use.</p>

      <h2>Genetics & Lineage</h2>
      <p><strong>Type:</strong> Balanced hybrid (50/50 indica/sativa)<br/>
      <strong>Parent Strains:</strong> Alien Cookies × (Colombian × Starfighter)<br/>
      <strong>Origin:</strong> Bred by Capulator</p>
      <p>MAC's genetics are complex — the Colombian landrace brings the sativa energy and citrus terpenes, Starfighter adds structure and potency, and Alien Cookies provides the dessert sweetness and dense bud formation. The result is a strain that is greater than the sum of its parts.</p>

      <h2>Aroma & Flavor Profile</h2>
      <p>MAC has one of the most distinctive and beloved terpene profiles in the hybrid category:</p>
      <ul>
        <li><strong>Limonene</strong> — dominant citrus note, often described as orange creamsicle or candied orange peels; mood-elevating and stress-relieving</li>
        <li><strong>Caryophyllene</strong> — spicy, peppery depth that grounds the citrus sweetness and provides anti-inflammatory effects</li>
        <li><strong>Pinene</strong> — fresh evergreen note that adds brightness and contributes to mental alertness and focus</li>
        <li><strong>Humulene</strong> — earthy, herbal undertone that adds complexity and depth</li>
      </ul>
      <p>The aroma is complex and immediately appealing — sour citrus, orange creamsicle, spicy diesel, and creamy dough. The smoke is smooth, with a bright citrus onset and a spiced, doughy exhale. One of the most pleasant-smelling strains in the hybrid category.</p>

      <h2>Effects</h2>
      <p>MAC produces a well-balanced, versatile effect profile:</p>
      <ul>
        <li>A gentle onset that builds into rapid cerebral euphoria and enhanced creative focus</li>
        <li>Uplifting happiness and mental clarity without jitters or anxiety</li>
        <li>A soothing, full-body relaxation that is not overly sedating</li>
        <li>Effects typically peak within 1–2 hours and last 3–4 hours with a smooth comedown</li>
      </ul>
      <p>MAC is one of the most versatile strains available — it works for daytime creative work, social settings, afternoon relaxation, and evening unwinding. The balanced 50/50 genetics mean it doesn't lean too heavily toward either stimulation or sedation.</p>

      <h2>What to Look for in MAC THCA Flower</h2>
      <ul>
        <li><strong>THCA percentage:</strong> Premium MAC tests between 20–30% THCA. The genetics support high potency when grown properly.</li>
        <li><strong>Terpene content:</strong> The orange creamsicle aroma is the quality indicator — if it doesn't smell like citrus and cream, the limonene profile isn't there. Total terpenes above 2% is the standard.</li>
        <li><strong>Bud structure:</strong> Dense, medium-sized buds with a heavy trichome coating. MAC buds should look frosted and resinous.</li>
      </ul>

      <h2>MAC at Luxurious Habbits</h2>
      <p>MAC is one of our most requested hybrid strains. Its versatility and distinctive aroma make it a favorite for both new and experienced consumers. Check our <a href="/products">product catalog</a> for current availability.</p>
    `,
  },
  "zoap-thca-strain-review": {
    title: "Zoap THCA Flower: Full Strain Review",
    category: "Strain Guide",
    categoryColor: "#ff4444",
    excerpt: "Zoap is a visually stunning hybrid from Deo Farms — dense purple-tinted buds, a sweet cherry-citrus aroma, and a euphoric, balanced high that won Best Strain at the 2024 Leafly Budtenders' Choice Awards.",
    readTime: "7 min read",
    publishDate: "2026-06-04",
    tags: ["Zoap", "Strain Review", "Hybrid", "THCA"],
    strainType: "hybrid",
    terpenes: [
      { slug: "beta-caryophyllene", name: "Caryophyllene", pct: "0.40–0.70%", note: "Anti-inflammatory — spicy, peppery depth" },
      { slug: "limonene", name: "Limonene", pct: "0.30–0.55%", note: "Mood elevation — sweet citrus and cherry" },
      { slug: "linalool", name: "Linalool", pct: "0.15–0.30%", note: "Calming, anti-anxiety — floral sweetness" },
      { slug: "beta-myrcene", name: "Myrcene", pct: "0.10–0.25%", note: "Sedative, muscle relaxant — earthy base" },
    ],
    content: `
      <h2>Overview</h2>
      <p>Zoap is one of the most visually striking and award-winning strains to emerge in recent years. Bred by Deo Farms as a cross between Pink Guava #16 and Rainbow Sherbet, Zoap won "Best Strain" for Mississippi at the Leafly Budtenders' Choice Awards 2024 — a testament to its broad appeal and exceptional quality. Dense, purple-tinted buds covered in frosty trichomes, a sweet cherry-citrus aroma, and a euphoric balanced high make it one of the most sought-after strains in the premium hemp market.</p>
      <p>As a THCA hemp flower, Zoap regularly tests between 25–33% THCA — among the highest in the hybrid category — while delivering a balanced experience that works for both social and solo use.</p>

      <h2>Genetics & Lineage</h2>
      <p><strong>Type:</strong> Balanced hybrid (50/50)<br/>
      <strong>Parent Strains:</strong> Pink Guava #16 × Rainbow Sherbet<br/>
      <strong>Origin:</strong> Deo Farms</p>
      <p>Pink Guava brings the tropical sweetness and vibrant purple coloration, while Rainbow Sherbet contributes the creamy dessert notes and potency. The combination produces a strain that is both visually stunning and aromatically complex.</p>

      <h2>Aroma & Flavor Profile</h2>
      <p>Zoap has a complex, multi-layered terpene profile:</p>
      <ul>
        <li><strong>Caryophyllene</strong> — spicy, peppery depth that grounds the sweetness and provides anti-inflammatory effects</li>
        <li><strong>Limonene</strong> — sweet citrus and cherry notes that define the top of the aroma; mood-elevating</li>
        <li><strong>Linalool</strong> — floral sweetness that adds a calming, anti-anxiety dimension</li>
        <li><strong>Myrcene</strong> — earthy base that rounds out the profile and contributes to the body relaxation</li>
      </ul>
      <p>The aroma is a complex blend of sweet and sour fruity citrus — freshly picked cherries, tropical candy, and a subtle earthiness. The flavor delivers floral candy notes, tropical citrus, and creamy undertones with hints of bubblegum and pine. One of the most refreshing and complex flavor profiles in the hybrid category.</p>

      <h2>Effects</h2>
      <p>Zoap delivers a quick-onset, balanced experience:</p>
      <ul>
        <li>A rapid euphoric and positive mental uplift — often leading to giggly, creative states</li>
        <li>A relaxing body high that is not overly sedating, making it suitable for social interaction</li>
        <li>Enhanced creativity and a sense of calm that balances the cerebral stimulation</li>
        <li>Versatile — works for social settings, creative pursuits, and afternoon relaxation</li>
      </ul>
      <p>Zoap is one of the most versatile hybrids available. Its balanced genetics and euphoric onset make it equally suitable for social settings and solo creative work. The body relaxation is present but not overwhelming — you stay functional and engaged.</p>

      <h2>What to Look for in Zoap THCA Flower</h2>
      <ul>
        <li><strong>THCA percentage:</strong> Premium Zoap tests between 25–33% THCA — one of the highest ranges in the hybrid category.</li>
        <li><strong>Visual appeal:</strong> Dense, compact buds with bright greens and deep purple undertones, covered in frosty dark purple-tinted trichomes. Zoap should look as good as it smells.</li>
        <li><strong>Terpene content:</strong> The cherry-citrus aroma is the quality indicator. Total terpenes above 2% is the standard for premium Zoap.</li>
      </ul>

      <h2>Zoap at Luxurious Habbits</h2>
      <p>Zoap is one of our most visually striking and requested strains. When it's in stock, it moves fast. Check our <a href="/products">product catalog</a> for current availability.</p>
    `,
  },
  "white-truffle-thca-strain-review": {
    title: "White Truffle THCA Flower: Full Strain Review",
    category: "Strain Guide",
    categoryColor: "#ff4444",
    excerpt: "White Truffle is a savory, luxurious indica — butter, garlic, and nuts wrapped in a deeply calming high. Nevada's second-best-selling strain in 2025 for a reason.",
    readTime: "7 min read",
    publishDate: "2026-06-05",
    tags: ["White Truffle", "Strain Review", "Indica", "THCA"],
    strainType: "indica",
    terpenes: [
      { slug: "beta-myrcene", name: "Myrcene", pct: "0.40–0.65%", note: "Earthy, musky — relaxation and sedation" },
      { slug: "beta-caryophyllene", name: "Caryophyllene", pct: "0.30–0.55%", note: "Spicy, peppery — anti-inflammatory" },
      { slug: "limonene", name: "Limonene", pct: "0.15–0.35%", note: "Citrus brightness — mood elevation" },
      { slug: "alpha-humulene", name: "Humulene", pct: "0.10–0.25%", note: "Earthy, woody — anti-inflammatory" },
    ],
    content: `
      <h2>Overview</h2>
      <p>White Truffle is a luxury indica that lives up to its name. Bred by Fresh Coast Seeds as a Gorilla Butter backcross — tracing its roots to Gorilla Glue, Peanut Butter Breath, Chem Dawg, and GSC — White Truffle debuted in 2019 and quickly became one of the most sought-after indica strains in premium cannabis markets. In September 2025, Lavi, one of Nevada's largest cannabis brands, ranked it as its second-best-selling strain. It secured second place at the Nevada High Times Cup Best Hybrid category in 2021.</p>
      <p>As a THCA hemp flower, White Truffle delivers THCA percentages between 23–30% with a complex, savory terpene profile that is unlike anything else in the indica category.</p>

      <h2>Genetics & Lineage</h2>
      <p><strong>Type:</strong> Indica-dominant hybrid (60/40 to 80/20)<br/>
      <strong>Parent Strains:</strong> Gorilla Butter (Gorilla Glue × Peanut Butter Breath) backcross<br/>
      <strong>Origin:</strong> Fresh Coast Seeds (also Parabellum Genetics)<br/>
      <strong>Notable lineage:</strong> Chem Dawg, Skunk #1, Sour Diesel, GSC</p>

      <h2>Aroma & Flavor Profile</h2>
      <p>White Truffle has one of the most complex and distinctive terpene profiles in the indica category:</p>
      <ul>
        <li><strong>Myrcene</strong> — dominant earthy, musky base that drives the relaxation and sedation</li>
        <li><strong>Caryophyllene</strong> — spicy, peppery notes that add depth and anti-inflammatory properties</li>
        <li><strong>Limonene</strong> — bright citrus that cuts through the heaviness and adds mood elevation</li>
        <li><strong>Humulene</strong> — earthy, woody, slightly bitter note that reinforces the savory character</li>
      </ul>
      <p>The flavor profile is complex and savory — nuts, butter, garlic, and onion with a smooth, luxurious finish. The aroma opens with diesel and fuel notes that evolve into earthy, organic scents with subtle sweet, spicy, pine, and citrus undertones on the exhale. It is the closest thing to a culinary experience in cannabis.</p>

      <h2>Effects</h2>
      <p>White Truffle delivers a gradual, deeply relaxing experience:</p>
      <ul>
        <li>A quick-hitting head high that clears the mind of worry and stress</li>
        <li>A wave of physical relaxation that spreads throughout the body over 10–15 minutes</li>
        <li>A calming, slightly buzzy experience that leads to deep sedation without overwhelming couch-lock</li>
        <li>Peak effects lasting 2–4 hours — ideal for unwinding after a long day</li>
      </ul>
      <p>White Truffle is an evening strain. Its calming, sedating character makes it ideal for stress relief, pain management, and sleep. It is not a daytime strain — save it for when the day's work is done.</p>

      <h2>What to Look for in White Truffle THCA Flower</h2>
      <ul>
        <li><strong>THCA percentage:</strong> Premium White Truffle tests between 23–30% THCA.</li>
        <li><strong>Terpene content:</strong> The savory, buttery aroma is the quality indicator. If it doesn't smell like nuts and diesel, the terpene profile isn't there.</li>
        <li><strong>Bud structure:</strong> Long, fluffy, pepper-shaped buds with dark olive green hues, deep purple undertones, thick orange hairs, and chunky purple-tinted white crystal trichomes.</li>
      </ul>

      <h2>White Truffle at Luxurious Habbits</h2>
      <p>White Truffle is one of our most requested luxury indica strains. Check our <a href="/products">product catalog</a> for current availability or sign up for restock notifications.</p>
    `,
  },
  "sfv-og-thca-strain-review": {
    title: "SFV OG THCA Flower: Full Strain Review",
    category: "Strain Guide",
    categoryColor: "#ff4444",
    excerpt: "SFV OG is a legendary California OG cut — lemon-pine-diesel aroma, immediate mental calm, and a clean body relaxation that defines West Coast cannabis culture.",
    readTime: "7 min read",
    publishDate: "2026-06-06",
    tags: ["SFV OG", "San Fernando Valley OG", "Strain Review", "Indica", "THCA"],
    strainType: "indica",
    terpenes: [
      { slug: "limonene", name: "Limonene", pct: "0.60–0.90%", note: "Dominant bright lemon-citrus — mood-elevating" },
      { slug: "beta-caryophyllene", name: "Caryophyllene", pct: "0.40–0.60%", note: "Spicy, peppery — anti-inflammatory" },
      { slug: "beta-myrcene", name: "Myrcene", pct: "0.30–0.50%", note: "Earthy, musky — body relaxation" },
      { slug: "alpha-pinene", name: "Pinene", pct: "0.20–0.30%", note: "Fresh pine — focus and memory retention" },
    ],
    content: `
      <h2>Overview</h2>
      <p>SFV OG — San Fernando Valley OG — holds legendary status in California cannabis culture as one of the original OG cuts that established the West Coast's reputation for premium flower. A phenotype of OG Kush from Cali Connection farms, SFV OG has been preserved through cloning for over two decades, known for its consistent potency, effects, and the unmistakably sharp lemon-pine-diesel aroma that defines the OG family.</p>
      <p>As a THCA hemp flower, SFV OG regularly tests between 22–34% THCA — one of the widest ranges in the indica category — and delivers the same immediate mental calm and clean body relaxation that made it a legend in California cannabis culture.</p>

      <h2>Genetics & Lineage</h2>
      <p><strong>Type:</strong> Indica-dominant hybrid (60/40 to 70/30)<br/>
      <strong>Parent Strains:</strong> Phenotype of OG Kush (Chemdawg × Hindu Kush landrace)<br/>
      <strong>Origin:</strong> Cali Connection farms, San Fernando Valley, California<br/>
      <strong>Note:</strong> SFV OG Kush is an Afghani-crossed child of SFV OG, adding additional body weight to the original cut</p>

      <h2>Aroma & Flavor Profile</h2>
      <p>SFV OG presents a sharp, clean, unmistakably OG aroma:</p>
      <ul>
        <li><strong>Limonene</strong> — dominant bright lemon-citrus aroma that defines the top note; mood-elevating and uplifting</li>
        <li><strong>Caryophyllene</strong> — spicy, peppery notes that add the characteristic OG fuel depth and anti-inflammatory properties</li>
        <li><strong>Myrcene</strong> — earthy, musky undertones that ground the profile and contribute to body relaxation</li>
        <li><strong>Pinene</strong> — fresh pine notes that add brightness and contribute to focus and memory retention</li>
      </ul>
      <p>The aroma is lemon squeezed into a pine forest with a distinct diesel undertone. Cracking a nug intensifies the scent with notes of lemon peel, pine sap, diesel fuel, and hints of earth and skunk. The flavor starts with bright lemon and pine, transitions to a sharp fuel note mid-inhale, and finishes with a smooth exhale of lingering citrus and earth.</p>

      <h2>Effects</h2>
      <p>SFV OG initiates quickly and cleanly:</p>
      <ul>
        <li>An almost immediate mental calm that quiets brain chatter and reduces anxiety</li>
        <li>A relaxing body high that eases muscle tension and promotes physical comfort without heavy sedation</li>
        <li>Effects typically last around three hours, with peak effects occurring within 60–90 minutes</li>
        <li>A gentle, gradual comedown — no abrupt drop-off</li>
      </ul>
      <p>SFV OG is versatile for afternoon and evening use. Its mental calming effect makes it excellent for stress and anxiety relief, while the body relaxation addresses muscle tension and pain. It is potent enough for experienced consumers but approachable enough for those with moderate tolerance.</p>

      <h2>What to Look for in SFV OG THCA Flower</h2>
      <ul>
        <li><strong>THCA percentage:</strong> Premium SFV OG tests between 22–34% THCA. The wide range reflects phenotypic variation — look for batches above 24% for the full experience.</li>
        <li><strong>Terpene content:</strong> The sharp lemon-pine-diesel aroma is the quality indicator. If it doesn't smell like a California OG, the terpene profile isn't there.</li>
        <li><strong>Bud structure:</strong> Dense, round buds with varied dark army green and olive green coloring, reddish-brown pistils, and a fine frosty layer of white trichomes.</li>
      </ul>

      <h2>SFV OG at Luxurious Habbits</h2>
      <p>SFV OG is one of our most requested OG-family strains. Check our <a href="/products">product catalog</a> for current availability or sign up for restock notifications.</p>
    `,
  },
  "rs11-thca-strain-review": {
    title: "RS11 (Rainbow Sherbet 11) THCA Flower: Full Strain Review",
    category: "Strain Guide",
    categoryColor: "#ff4444",
    excerpt: "RS11 is a multi-award-winning California hybrid from Deo Farms — vibrant purple buds, sweet cherry-berry aroma, and a versatile high that transitions from creative uplift to deep body relaxation.",
    readTime: "7 min read",
    publishDate: "2026-06-07",
    tags: ["RS11", "Rainbow Sherbet 11", "Strain Review", "Hybrid", "THCA"],
    strainType: "hybrid",
    terpenes: [
      { slug: "limonene", name: "Limonene", pct: "0.35–0.65%", note: "Citrus, mood-lifting — cherry-berry brightness" },
      { slug: "beta-caryophyllene", name: "Caryophyllene", pct: "0.25–0.50%", note: "Pepper, wood — anti-inflammatory, pain-relieving" },
      { slug: "alpha-humulene", name: "Humulene", pct: "0.15–0.30%", note: "Calming, energizing — earthy balance" },
      { slug: "linalool", name: "Linalool", pct: "0.10–0.20%", note: "Floral, calming — smooths the profile" },
    ],
    content: `
      <h2>Overview</h2>
      <p>RS11 — Rainbow Sherbet 11 — is one of the most decorated and sought-after hybrid strains in California cannabis culture. Bred by Deo Farms in Oakland and selected by Wizard Trees in LA, RS11 has accumulated an impressive list of accolades: multiple High Times Cannabis Cup awards, Best of Secret Sesh, Blazer's Cup, and Leaflink's Best-Selling Flower in California. It has also been mentioned by hip-hop artists, cementing its place in both cannabis culture and mainstream awareness.</p>
      <p>As a THCA hemp flower, RS11 regularly tests between 22–36% THCA — among the highest ranges available — while delivering a versatile, long-lasting experience that transitions from creative uplift to deep body relaxation.</p>

      <h2>Genetics & Lineage</h2>
      <p><strong>Type:</strong> Indica-dominant hybrid (70/30)<br/>
      <strong>Parent Strains:</strong> Pink Guava × OZK (or Sunset Sherbert)<br/>
      <strong>Origin:</strong> Deo Farms (Oakland, CA), selected by Wizard Trees (LA)</p>
      <p>Pink Guava brings the vibrant purple coloration and tropical sweetness, while OZK contributes the earthy pine undertones and potency. The result is a strain that is visually stunning — vibrant lime green, space yellow, dark purple, and blue hues — and aromatically complex.</p>

      <h2>Aroma & Flavor Profile</h2>
      <p>RS11 has a complex, fruit-forward terpene profile:</p>
      <ul>
        <li><strong>Limonene</strong> — dominant citrus and mood-lifting note that defines the cherry-berry brightness</li>
        <li><strong>Caryophyllene</strong> — pepper and wood notes that add depth and anti-inflammatory, pain-relieving properties</li>
        <li><strong>Humulene</strong> — calming, energizing earthy balance that rounds out the profile</li>
        <li><strong>Linalool</strong> — floral, calming note that smooths the mid-palate</li>
      </ul>
      <p>The aroma is super sweet and fruity — cherry berry with hints of sour citrus, lemon-lime, and oranges, balanced by an earthy pine overtone with subtle gassy, musky, and spicy undertones. The flavor is rich and refreshing, with a sustained berry-citrus finish.</p>

      <h2>Effects</h2>
      <p>RS11 delivers a versatile, long-lasting experience:</p>
      <ul>
        <li>An uplifting, mentally stimulating onset — alertness, happiness, and enhanced creativity without tension or anxiety</li>
        <li>A gradual transition into deeply relaxing physical sensation — comfortable body high to heavy couchlock at higher doses</li>
        <li>Long-lasting effects that provide sustained relief and enjoyment</li>
        <li>Versatile — works for daytime creative use at lower doses and evening relaxation at higher doses</li>
      </ul>
      <p>RS11 is one of the most versatile strains in the hybrid category. Its dose-dependent effects make it adaptable — a small amount for daytime creativity, a larger amount for evening relaxation and sleep.</p>

      <h2>What to Look for in RS11 THCA Flower</h2>
      <ul>
        <li><strong>THCA percentage:</strong> Premium RS11 tests between 22–36% THCA — one of the highest ranges available in the hybrid category.</li>
        <li><strong>Visual appeal:</strong> Dense, rounded buds with vibrant lime green, space yellow, dark purple, and blue hues, covered in frosty blue-tinted white crystal trichomes with thin light orange or fiery orange hairs.</li>
        <li><strong>Terpene content:</strong> The sweet cherry-berry aroma is the quality indicator. Total terpenes above 2% is the standard for premium RS11.</li>
      </ul>

      <h2>RS11 at Luxurious Habbits</h2>
      <p>RS11 is one of our most visually striking and award-winning strains. Check our <a href="/products">product catalog</a> for current availability.</p>
    `,
  },
  "zkittlez-thca-strain-review": {
    title: "Zkittlez THCA Flower: Full Strain Review",
    category: "Strain Guide",
    categoryColor: "#ff4444",
    excerpt: "Zkittlez — The Original Z — is a multiple Cannabis Cup winner with an unmatched fruit candy aroma, a euphoric creative onset, and a deeply relaxing body high.",
    readTime: "7 min read",
    publishDate: "2026-06-08",
    tags: ["Zkittlez", "The Original Z", "Strain Review", "Indica", "THCA"],
    strainType: "indica",
    terpenes: [
      { slug: "beta-caryophyllene", name: "Caryophyllene", pct: "0.60–0.90%", note: "Spicy, peppery — anti-inflammatory and antidepressant" },
      { slug: "limonene", name: "Limonene", pct: "0.30–0.55%", note: "Bright citrus — mood elevation and mental stimulation" },
      { slug: "beta-myrcene", name: "Myrcene", pct: "0.20–0.40%", note: "Earthy, fruity — calming and sedative" },
      { slug: "alpha-humulene", name: "Humulene", pct: "0.10–0.25%", note: "Hoppy, earthy — anti-inflammatory" },
    ],
    content: `
      <h2>Overview</h2>
      <p>Zkittlez — officially known as The Original Z — is one of the most awarded and beloved indica strains in cannabis history. Bred by 3rd Gen Family and Terp Hogz as a cross between Grape Ape, Grapefruit, and an undisclosed third strain, Zkittlez won 1st Place for Best Indica at the 2015 Cannabis Cups in both San Francisco and Michigan, and 1st Place at the 2016 Emerald Cup. The name was officially changed to "The Original Z" due to a trademark settlement with a candy company — but the strain remains the same legendary cultivar.</p>
      <p>As a THCA hemp flower, Zkittlez delivers THCA percentages between 17–29% with an unmatched fruit candy aroma that is immediately recognizable. It is the definitive fruit candy strain.</p>

      <h2>Genetics & Lineage</h2>
      <p><strong>Type:</strong> Indica-dominant hybrid (60/40)<br/>
      <strong>Parent Strains:</strong> Grape Ape × Grapefruit × undisclosed third strain<br/>
      <strong>Origin:</strong> 3rd Gen Family and Terp Hogz<br/>
      <strong>Also known as:</strong> The Original Z, Z</p>

      <h2>Aroma & Flavor Profile</h2>
      <p>Zkittlez has one of the most distinctive and beloved terpene profiles in the indica category:</p>
      <ul>
        <li><strong>Caryophyllene</strong> — dominant spicy, peppery note (0.8%+) that provides anti-inflammatory and antidepressant effects while grounding the sweetness</li>
        <li><strong>Limonene</strong> — bright citrus that adds mood elevation and mental stimulation to the fruit profile</li>
        <li><strong>Myrcene</strong> — earthy, fruity, clove-like base that contributes to the calming and sedative effects</li>
        <li><strong>Humulene</strong> — hoppy, earthy, herbal note that adds depth and anti-inflammatory properties</li>
      </ul>
      <p>The aroma is a super fruity tropical earth with subtle herbal undertones. The flavor is even more pronounced — sweet berry with a crisp tropical citrus aftertaste that lingers, often described as tasting like fruit candy. It is the most candy-like terpene profile in the indica category.</p>

      <h2>Effects</h2>
      <p>Zkittlez begins with an uplifting onset and transitions to deep relaxation:</p>
      <ul>
        <li>An uplifting head buzz within 5–10 minutes — euphoria, motivation, and creativity with enhanced sensory awareness</li>
        <li>A relaxing body buzz that spreads throughout the body, leading to profound relaxation without heavy sedation at moderate doses</li>
        <li>Peak effects lasting 2–3 hours — happy, calm, and socially engaged</li>
        <li>Higher doses can lead to couch-lock and drowsiness — dose accordingly</li>
      </ul>
      <p>Zkittlez is versatile for evening and late afternoon use. Its euphoric onset makes it enjoyable for social settings, while the body relaxation makes it excellent for unwinding and stress relief.</p>

      <h2>What to Look for in Zkittlez THCA Flower</h2>
      <ul>
        <li><strong>THCA percentage:</strong> Zkittlez tests between 17–29% THCA. The genetics prioritize terpene expression over raw potency — don't overlook a batch with 20% THCA if the aroma is exceptional.</li>
        <li><strong>Terpene content:</strong> The fruit candy aroma is the quality indicator — it should smell like tropical fruit and candy. Total terpenes above 2% is the standard for premium Zkittlez.</li>
        <li><strong>Bud structure:</strong> Medium-sized, lumpy, pepper-shaped buds with dark olive green hues, sparse amber hairs, and a thick frosty coating of tiny crystal white trichomes.</li>
      </ul>

      <h2>Zkittlez at Luxurious Habbits</h2>
      <p>Zkittlez is one of our most requested indica strains for its unmatched fruit candy aroma. Check our <a href="/products">product catalog</a> for current availability.</p>
    `,
  },
  "gsc-thca-strain-review": {
    title: "GSC (Girl Scout Cookies) THCA Flower: Full Strain Review",
    category: "Strain Guide",
    categoryColor: "#ff4444",
    excerpt: "GSC is one of the most awarded and influential cannabis strains ever bred — a Cookie Fam legend with a pungent dessert aroma, potent euphoria, and full-body relaxation.",
    readTime: "7 min read",
    publishDate: "2026-06-09",
    tags: ["GSC", "Girl Scout Cookies", "Strain Review", "Indica", "THCA"],
    strainType: "indica",
    terpenes: [
      { slug: "beta-caryophyllene", name: "Caryophyllene", pct: "0.50–0.80%", note: "Dominant spicy, peppery — defines the cookie character" },
      { slug: "limonene", name: "Limonene", pct: "0.30–0.50%", note: "Citrus, uplifting — mint and lemon brightness" },
      { slug: "alpha-humulene", name: "Humulene", pct: "0.20–0.40%", note: "Earthy, hoppy — anti-inflammatory depth" },
      { slug: "linalool", name: "Linalool", pct: "0.10–0.30%", note: "Floral, calming — smooths the dessert profile" },
    ],
    content: `
      <h2>Overview</h2>
      <p>Girl Scout Cookies — GSC — is one of the most awarded and influential cannabis strains ever bred. Created by the Cookie Fam in San Francisco as a cross between OG Kush and Durban Poison, GSC won multiple Cannabis Cups in 2013 and 2014 and has spawned some of the most popular strains in the modern market — Gelato, Thin Mint GSC, and Sunset Sherbet all trace their lineage directly to GSC. It is a true legend of cannabis genetics.</p>
      <p>As a THCA hemp flower, GSC delivers THCA percentages between 25–28% with a pungent, dessert-like aroma and a potent, balanced high that has made it a staple for experienced consumers worldwide.</p>

      <h2>Genetics & Lineage</h2>
      <p><strong>Type:</strong> Indica-dominant hybrid (60/40)<br/>
      <strong>Parent Strains:</strong> OG Kush × Durban Poison<br/>
      <strong>Origin:</strong> Cookie Fam, San Francisco<br/>
      <strong>Notable offspring:</strong> Gelato, Thin Mint GSC, Sunset Sherbet, Wedding Cake (via Animal Mints)</p>
      <p>The combination of OG Kush's earthy, fuel-forward potency with Durban Poison's sativa energy and sweet anise notes produces a strain that is simultaneously relaxing and euphoric — the template for the modern dessert hybrid.</p>

      <h2>Aroma & Flavor Profile</h2>
      <p>GSC is renowned for its pungent, dessert-like aroma:</p>
      <ul>
        <li><strong>Caryophyllene</strong> — dominant spicy, peppery note that defines the cookie character and provides anti-inflammatory effects</li>
        <li><strong>Limonene</strong> — bright citrus and lemon notes that add uplifting dimension to the dessert profile</li>
        <li><strong>Humulene</strong> — earthy, hoppy depth that reinforces the OG Kush heritage and adds anti-inflammatory properties</li>
        <li><strong>Linalool</strong> — floral, calming note that smooths the mid-palate and adds complexity</li>
      </ul>
      <p>The aroma is bold and unmistakable — mint, sweet cherry, and lemon with earthy undertones and hints of chocolate and spice. The smoke is smooth with a dessert-like finish. If you've smelled GSC before, you'll recognize it immediately.</p>

      <h2>Effects</h2>
      <p>GSC delivers a potent, balanced high best reserved for experienced consumers:</p>
      <ul>
        <li>A euphoric and uplifting cerebral rush that elevates mood and promotes happiness</li>
        <li>A wave of full-body relaxation that builds over the first 20–30 minutes</li>
        <li>Appetite stimulation — the munchies are a signature GSC effect</li>
        <li>Long-lasting effects — typically 3–4 hours for experienced consumers</li>
      </ul>
      <p>GSC is best for evening use. Its potency and full-body relaxation make it ideal for stress relief, pain management, and appetite stimulation. Beginners should start with a very small amount — this is a high-potency strain.</p>

      <h2>What to Look for in GSC THCA Flower</h2>
      <ul>
        <li><strong>THCA percentage:</strong> Premium GSC tests between 25–28% THCA. The genetics are consistently potent.</li>
        <li><strong>Terpene content:</strong> The mint-cherry-lemon aroma is the quality indicator. Total terpenes above 2% is the standard for premium GSC.</li>
        <li><strong>Bud structure:</strong> Dense, resin-heavy buds with vibrant green and purple hues, fiery orange pistils, and a generous coating of glimmering trichomes.</li>
        <li><strong>Authentic genetics:</strong> GSC is one of the most counterfeited strains in the market. Source from vendors who can provide documentation of the cultivar lineage.</li>
      </ul>

      <h2>GSC at Luxurious Habbits</h2>
      <p>GSC is a cornerstone of our strain catalog — one of the most requested and beloved strains we carry. Check our <a href="/products">product catalog</a> for current availability.</p>
    `,
  },
  "grape-gas-thca-strain-review": {
    title: "Grape Gas THCA Flower: Full Strain Review",
    category: "Strain Guide",
    categoryColor: "#ff4444",
    excerpt: "Grape Gas is an 8x award-winning hybrid from Compound Genetics — grape candy meets kerosene in one of the most distinctive and celebrated terpene profiles in premium cannabis.",
    readTime: "7 min read",
    publishDate: "2026-06-10",
    tags: ["Grape Gas", "Strain Review", "Hybrid", "THCA"],
    strainType: "hybrid",
    terpenes: [
      { slug: "beta-myrcene", name: "Myrcene", pct: "0.64–1.50%", note: "Dominant earthy, musky — sedative and relaxing" },
      { slug: "beta-caryophyllene", name: "Caryophyllene", pct: "0.33–0.80%", note: "Spicy, peppery — anti-inflammatory" },
      { slug: "limonene", name: "Limonene", pct: "0.05–0.50%", note: "Citrusy, uplifting — mood-enhancing" },
      { slug: "linalool", name: "Linalool", pct: "0.16–0.30%", note: "Floral, calming — anti-anxiety" },
    ],
    content: `
      <h2>Overview</h2>
      <p>Grape Gas — also known as Grape Gasoline — is one of the most decorated strains in the premium cannabis market. Bred by Compound Genetics as a cross between Grape Pie and Jet Fuel Gelato, Grape Gas has accumulated an extraordinary list of accolades: 2x High Times Cannabis Cup Winner, Best of Secret Sesh Winner, Blazer's Cup Winner, Leaflink's Best-Selling Flower in California 2019, Best Pre-Roll in California by LA Weekly in 2022, Best Pre-Roll in California by Weedmaps in 2023, and 8x Award Winner by Farmers Cup.</p>
      <p>As a THCA hemp flower, Grape Gas delivers THCA percentages between 21–37% — one of the widest ranges available — with a terpene profile that is simultaneously sweet and pungent: grape candy meets kerosene in a combination that is immediately recognizable and deeply satisfying.</p>

      <h2>Genetics & Lineage</h2>
      <p><strong>Type:</strong> Hybrid<br/>
      <strong>Parent Strains:</strong> Grape Pie × Jet Fuel Gelato<br/>
      <strong>Origin:</strong> Compound Genetics</p>
      <p>Grape Pie brings the sweet grape candy terpene profile and dense bud structure, while Jet Fuel Gelato contributes the fuel and diesel notes along with high potency. The combination produces a strain that smells like grape lollipop dipped in kerosene — a distinctive profile that is impossible to mistake for anything else.</p>

      <h2>Aroma & Flavor Profile</h2>
      <p>Grape Gas has one of the most distinctive terpene profiles in the hybrid category:</p>
      <ul>
        <li><strong>Myrcene</strong> — dominant earthy, musky note (0.64–1.5%) that drives the sedative body effect and grounds the grape sweetness</li>
        <li><strong>Caryophyllene</strong> — spicy, peppery depth that adds the fuel character and anti-inflammatory properties</li>
        <li><strong>Limonene</strong> — citrusy, uplifting note that brightens the profile and adds mood-enhancing dimension</li>
        <li><strong>Linalool</strong> — floral, calming note that smooths the mid-palate and adds anti-anxiety properties</li>
      </ul>
      <p>The aroma is a complex, pungent blend of sweet grape candy, sour citrus, and heavy gassy diesel. The flavor delivers a full-bodied smoke with ripe grape and berry notes, followed by earthy and spicy hints on the exhale. Grape lollipop dipped in kerosene — that's Grape Gas.</p>

      <h2>Effects</h2>
      <p>Grape Gas delivers a versatile, multi-phase experience:</p>
      <ul>
        <li>An uplifting, energizing cerebral buzz that promotes euphoria and happiness — suitable for creative tasks or social settings</li>
        <li>A transition into deeply relaxing physical body stone that soothes muscles and eases pain</li>
        <li>A peaceful, kicked-back state that is ideal for afternoon and evening use</li>
        <li>THCA percentages up to 37% mean this is a high-potency strain — dose accordingly</li>
      </ul>
      <p>Grape Gas is versatile for afternoon to nighttime use. Its energizing onset makes it suitable for social settings and creative work, while the body relaxation that follows makes it equally effective for pain relief and evening unwinding.</p>

      <h2>What to Look for in Grape Gas THCA Flower</h2>
      <ul>
        <li><strong>THCA percentage:</strong> Grape Gas tests between 21–37% THCA — one of the widest ranges available. Look for batches above 25% for the full potency experience.</li>
        <li><strong>Terpene content:</strong> The grape-diesel aroma is the quality indicator. Total terpenes above 2% is the standard for premium Grape Gas.</li>
        <li><strong>Bud structure:</strong> Dense, chunky, well-cured buds with deep forest green and rich indigo to dark purple hues, thick orange hairs, and a frosty coating of tiny amber crystal trichomes.</li>
      </ul>

      <h2>Grape Gas at Luxurious Habbits</h2>
      <p>Grape Gas is one of our most award-winning and requested hybrid strains. Check our <a href="/products">product catalog</a> for current availability.</p>
    `,
  },
  "gary-payton-thca-strain-review": {
    title: "Gary Payton THCA Flower: Full Strain Review",
    category: "Strain Guide",
    categoryColor: "#ff4444",
    excerpt: "Gary Payton is a Cookies x Powerzzzup collaboration named after the NBA Hall of Famer — gas and fruit loops in one even-keeled, award-winning hybrid.",
    readTime: "7 min read",
    publishDate: "2026-06-11",
    tags: ["Gary Payton", "Strain Review", "Hybrid", "THCA"],
    strainType: "hybrid",
    terpenes: [
      { slug: "beta-caryophyllene", name: "Caryophyllene", pct: "0.40–0.65%", note: "Pepper, spice, wood — fuel character" },
      { slug: "limonene", name: "Limonene", pct: "0.25–0.50%", note: "Citrus, lemon — uplifting and mood-elevating" },
      { slug: "linalool", name: "Linalool", pct: "0.15–0.30%", note: "Floral, lavender — calming balance" },
      { slug: "beta-myrcene", name: "Myrcene", pct: "0.10–0.25%", note: "Earthy, musky — relaxing body effect" },
    ],
    content: `
      <h2>Overview</h2>
      <p>Gary Payton is one of the most coveted hybrid strains in the premium cannabis market. Bred by Powerzzzup Genetics in collaboration with Cookies as a cross between The Y and Snowman, Gary Payton is named after NBA Hall of Famer Gary Payton — a fitting tribute to a strain that is consistently at the top of its class. It has won multiple cannabis cup awards, including 1st place in the 2022 Errl Cup in Arizona (hash form) and 2nd in 2022's The Emerald Cup.</p>
      <p>As a THCA hemp flower, Gary Payton delivers THCA percentages between 22–36% with a pungent blend of gas, fuel, sweet fruit loops, and citrus that is immediately recognizable and deeply satisfying.</p>

      <h2>Genetics & Lineage</h2>
      <p><strong>Type:</strong> Hybrid (50/50 to 55/45)<br/>
      <strong>Parent Strains:</strong> The Y × Snowman<br/>
      <strong>Origin:</strong> Powerzzzup Genetics in collaboration with Cookies</p>
      <p>The Y brings the fuel and gas terpene profile and dense structure, while Snowman — a Cookies phenotype — contributes the sweet, fruity notes and potency. The combination produces a strain that is simultaneously gassy and sweet, with an even-keeled effect profile that works for a wide range of consumers.</p>

      <h2>Aroma & Flavor Profile</h2>
      <p>Gary Payton has a distinctive pungent-sweet terpene profile:</p>
      <ul>
        <li><strong>Caryophyllene</strong> — dominant pepper, spice, and wood notes that drive the fuel character and provide anti-inflammatory effects</li>
        <li><strong>Limonene</strong> — bright citrus and lemon that add uplifting, mood-elevating dimension</li>
        <li><strong>Linalool</strong> — floral, lavender notes that provide calming balance to the fuel intensity</li>
        <li><strong>Myrcene</strong> — earthy, musky base that contributes to the relaxing body effect</li>
      </ul>
      <p>The flavor and aroma profile is characterized by a pungent blend of gas and fuel that matures into a smooth, spiced finish. Notes of sweet fruit loops, cherries, oranges, and lemon citrus with an earthy undertone and hints of pine and vanilla. It's a complex, multi-layered profile that rewards slow, attentive consumption.</p>

      <h2>Effects</h2>
      <p>Gary Payton delivers a balanced, even-keeled experience:</p>
      <ul>
        <li>An initial clear-headed and euphoric uplift that promotes focus and creativity</li>
        <li>Deep relaxation without heavy sedation — you stay functional and engaged</li>
        <li>Giggly feelings and a sense of calm that make it suitable for social settings</li>
        <li>Long-lasting effects with a gradual, smooth comedown</li>
      </ul>
      <p>Gary Payton is one of the most versatile strains available for afternoon and evening use. Its even-keeled effect profile makes it suitable for a wide range of consumers and settings — social, creative, or solo relaxation.</p>

      <h2>What to Look for in Gary Payton THCA Flower</h2>
      <ul>
        <li><strong>THCA percentage:</strong> Premium Gary Payton tests between 22–36% THCA. The genetics support very high potency when grown properly.</li>
        <li><strong>Terpene content:</strong> The gas-and-fruit-loops aroma is the quality indicator. Total terpenes above 2% is the standard for premium Gary Payton.</li>
        <li><strong>Bud structure:</strong> Dense, heart-shaped, emerald-green buds with dark olive undertones and occasional purple hues, coated in thick frosty white trichomes with super thin fiery orange pistils.</li>
      </ul>

      <h2>Gary Payton at Luxurious Habbits</h2>
      <p>Gary Payton is one of our most requested hybrid strains for its distinctive gas-and-fruit profile. Check our <a href="/products">product catalog</a> for current availability.</p>
    `,
  },
  "tangie-thca-strain-review": {
    title: "Tangie THCA Flower: Full Strain Review",
    category: "Strain Guide",
    categoryColor: "#ff4444",
    excerpt: "Tangie is the definitive tangerine sativa — a 10x award-winning strain from DNA Genetics with an intensely refreshing citrus aroma and a burst of creative, euphoric energy.",
    readTime: "7 min read",
    publishDate: "2026-06-12",
    tags: ["Tangie", "Strain Review", "Sativa", "THCA"],
    strainType: "sativa",
    terpenes: [
      { slug: "beta-myrcene", name: "Myrcene", pct: "0.35–0.55%", note: "Earthy, fruity base — relaxing" },
      { slug: "beta-caryophyllene", name: "Caryophyllene", pct: "0.20–0.40%", note: "Spicy, peppery — anti-inflammatory" },
      { slug: "alpha-pinene", name: "Pinene", pct: "0.10–0.25%", note: "Pine, uplifting — focus and clarity" },
      { slug: "alpha-humulene", name: "Humulene", pct: "0.05–0.15%", note: "Earthy, woody — appetite suppression" },
    ],
    content: `
      <h2>Overview</h2>
      <p>Tangie is the definitive tangerine sativa — a modern remake of the beloved 1990s strain Tangerine Dream, bred by DNA Genetics as a cross between California Orange and Skunk-1. In its first year on the market, Tangie won 10 different strain contests, establishing itself as one of the most acclaimed sativa-dominant strains ever produced. It is particularly popular in Amsterdam and has become a benchmark for citrus terpene expression in cannabis.</p>
      <p>As a THCA hemp flower, Tangie delivers THCA percentages between 19–22% with an intensely refreshing tangerine and citrus aroma that is unlike anything else in the sativa category. It is the go-to strain for daytime creativity and energy.</p>

      <h2>Genetics & Lineage</h2>
      <p><strong>Type:</strong> Sativa-dominant hybrid (70/30)<br/>
      <strong>Parent Strains:</strong> California Orange × Skunk-1<br/>
      <strong>Origin:</strong> DNA Genetics<br/>
      <strong>Heritage:</strong> Modern remake of Tangerine Dream (1990s)</p>
      <p>California Orange brings the intense tangerine terpene profile and uplifting sativa energy, while Skunk-1 contributes the structure, potency, and earthy depth. The result is a strain that is primarily defined by its aroma — intensely citrusy, sweet, and refreshing.</p>

      <h2>Aroma & Flavor Profile</h2>
      <p>Tangie is defined by its extraordinary citrus terpene expression:</p>
      <ul>
        <li><strong>Myrcene</strong> — earthy, fruity base that grounds the citrus profile and contributes to the relaxing dimension</li>
        <li><strong>Caryophyllene</strong> — spicy, peppery notes that add depth and anti-inflammatory properties to the bright citrus</li>
        <li><strong>Pinene</strong> — pine and uplifting notes that add clarity and focus to the aroma</li>
        <li><strong>Humulene</strong> — earthy, woody undertone that adds complexity and depth</li>
      </ul>
      <p>The aroma is intensely refreshing tangerine and citrus — sweet and sour with notes of orange zest. The flavor delivers a juicy, fruity, and sometimes skunky taste that lingers on the palate. If you want the most authentic citrus experience in hemp flower, Tangie is the standard.</p>

      <h2>Effects</h2>
      <p>Tangie delivers a primarily uplifting, daytime-optimized experience:</p>
      <ul>
        <li>A burst of creative energy and mental clarity with immediate onset</li>
        <li>Euphoric uplift that enhances focus and happiness</li>
        <li>Sustained cerebral buzz that lasts several hours</li>
        <li>Suitable for morning to afternoon use — not an evening strain</li>
      </ul>
      <p>Tangie is the ideal daytime strain. Its uplifting, energizing effects make it perfect for creative work, social settings, and any activity requiring focus and motivation. It is not a sedating strain — save the indicas for the evening.</p>

      <h2>What to Look for in Tangie THCA Flower</h2>
      <ul>
        <li><strong>THCA percentage:</strong> Tangie tests between 19–22% THCA — lower than some indica strains, but the genetics prioritize terpene expression over raw potency. The aroma and effects are the point.</li>
        <li><strong>Terpene content:</strong> The tangerine aroma is the quality indicator — it should smell intensely of fresh orange zest. Total terpenes above 2% is the standard for premium Tangie.</li>
        <li><strong>Bud structure:</strong> Dense, spade-shaped buds with vibrant light green hues, fiery orange pistils, and a thick layer of frosty white trichomes.</li>
      </ul>

      <h2>Tangie at Luxurious Habbits</h2>
      <p>Tangie is our go-to recommendation for consumers seeking a daytime sativa with exceptional citrus terpene expression. Check our <a href="/products">product catalog</a> for current availability.</p>
    `,
  },
  "jack-herer-thca-strain-review": {
    title: "Jack Herer THCA Flower: Full Strain Review",
    category: "Strain Guide",
    categoryColor: "#ff4444",
    excerpt: "Jack Herer is a legendary sativa named after the cannabis activist — pine, citrus, and earthy herbs with a clear-headed, energizing high that has won numerous awards since the 1990s.",
    readTime: "7 min read",
    publishDate: "2026-06-13",
    tags: ["Jack Herer", "Strain Review", "Sativa", "THCA"],
    strainType: "sativa",
    terpenes: [
      { slug: "terpinolene", name: "Terpinolene", pct: "0.50–0.80%", note: "Piney-citrus, woody — dominant uplifting note" },
      { slug: "beta-caryophyllene", name: "Caryophyllene", pct: "0.20–0.40%", note: "Spicy, peppery — anti-inflammatory" },
      { slug: "beta-myrcene", name: "Myrcene", pct: "0.10–0.20%", note: "Earthy, musky — grounding base" },
      { slug: "limonene", name: "Limonene", pct: "0.08–0.15%", note: "Citrus, mood elevation — brightness" },
    ],
    content: `
      <h2>Overview</h2>
      <p>Jack Herer is one of the most legendary strains in cannabis history — named after the renowned cannabis activist and author Jack Herer, whose book "The Emperor Wears No Clothes" became a foundational text in the cannabis legalization movement. Developed by Sensi Seeds in the Netherlands in the mid-1990s as a cross between Haze, Northern Lights #5, and Shiva Skunk, Jack Herer has received numerous awards for its quality and potency, and was distributed by Dutch pharmacies as a recognized medical-grade strain.</p>
      <p>As a THCA hemp flower, Jack Herer delivers THCA percentages between 24–29% with a terpinolene-dominant terpene profile — piney-citrus, woody, and uplifting — that is immediately recognizable and deeply satisfying for sativa enthusiasts.</p>

      <h2>Genetics & Lineage</h2>
      <p><strong>Type:</strong> Sativa-dominant hybrid (80/20)<br/>
      <strong>Parent Strains:</strong> Haze × (Northern Lights #5 × Shiva Skunk)<br/>
      <strong>Origin:</strong> Sensi Seeds, Netherlands, mid-1990s<br/>
      <strong>Also known as:</strong> JH, The Jack, Premium Jack, Platinum Jack</p>
      <p>Haze brings the cerebral sativa energy and complex terpene profile, Northern Lights #5 contributes the structure and potency, and Shiva Skunk adds the resin production and earthy depth. The result is a strain that is greater than the sum of its parts — a true classic.</p>

      <h2>Aroma & Flavor Profile</h2>
      <p>Jack Herer has a distinctive terpinolene-dominant terpene profile:</p>
      <ul>
        <li><strong>Terpinolene</strong> — dominant piney-citrus, woody note (34–39% of terpene profile) that defines the Jack Herer character; uplifting and energizing</li>
        <li><strong>Caryophyllene</strong> — spicy, peppery notes that add depth and anti-inflammatory properties</li>
        <li><strong>Myrcene</strong> — earthy, musky base that grounds the bright terpene profile</li>
        <li><strong>Limonene</strong> — citrus brightness that reinforces the uplifting character</li>
      </ul>
      <p>The aroma is a complex blend of sharp pine needles, sweet and sour citrusy lemon, and earthy herbs with subtle peppery undertones. The flavor offers a distinct piney-citrus brightness with a woody quality, complemented by a faint floral sweetness and skunky notes. It is one of the most complex and distinctive sativa terpene profiles available.</p>

      <h2>Effects</h2>
      <p>Jack Herer delivers a lifted, energizing, daytime-optimized experience:</p>
      <ul>
        <li>A lifted, energizing high that begins almost immediately upon exhale</li>
        <li>Clear-headed euphoria and motivation — fills the brain with creative energy</li>
        <li>Enhanced creativity and focus — conversations flow easily, ideas come readily</li>
        <li>Invigorating boost without paranoia or racy thoughts</li>
        <li>Effects lasting several hours — ideal for morning to afternoon use</li>
      </ul>
      <p>Jack Herer is the definitive daytime sativa. Its clear-headed, energizing effects make it ideal for creative work, social settings, exercise, and any activity requiring focus and motivation. It is not a sedating strain — the 80/20 sativa dominance is felt in every session.</p>

      <h2>What to Look for in Jack Herer THCA Flower</h2>
      <ul>
        <li><strong>THCA percentage:</strong> Premium Jack Herer tests between 24–29% THCA. The genetics support consistent potency.</li>
        <li><strong>Terpene content:</strong> The pine-citrus aroma is the quality indicator — it should smell like pine needles and lemon. Terpinolene should be the dominant terpene. Total terpenes above 1.5% is the standard for premium Jack Herer.</li>
        <li><strong>Bud structure:</strong> Oversized, pepper-shaped, bright neon green buds with golden undertones, thick orange hairs, and a generous coating of frosty golden-amber crystal trichomes.</li>
      </ul>

      <h2>Jack Herer at Luxurious Habbits</h2>
      <p>Jack Herer is our top recommendation for consumers seeking a legendary daytime sativa with exceptional terpene complexity. Check our <a href="/products">product catalog</a> for current availability.</p>
    `,
  },
  "blue-dream-thca-strain-review": {
    title: "Blue Dream THCA Flower: Full Strain Review",
    category: "Strain Guide",
    categoryColor: "#ff4444",
    excerpt: "Blue Dream is one of the most iconic strains in cannabis history — a pure sativa known for its sweet berry aroma and powerful cerebral lift.",
    readTime: "7 min read",
    publishDate: "2026-03-15",
    strainType: "sativa",
    terpenes: [
      { slug: "beta-myrcene", name: "Myrcene", pct: "0.30–0.50%", note: "Earthy, musky base — mild body relaxation" },
      { slug: "beta-caryophyllene", name: "Caryophyllene", pct: "0.20–0.35%", note: "Spicy, peppery notes — anti-inflammatory" },
      { slug: "terpinolene", name: "Terpinolene", pct: "0.15–0.30%", note: "Fresh, floral, slightly fruity — bright aroma" },
      { slug: "alpha-pinene", name: "Pinene", pct: "0.10–0.20%", note: "Pine and herbal — focus and alertness" },
    ],
    tags: ["Blue Dream", "Strain Review", "Sativa", "THCA"],
    content: `
      <h2>Overview</h2>
      <p>Blue Dream is one of the most iconic strains in cannabis history — and for good reason. A <strong>pure sativa</strong> with legendary genetics, Blue Dream delivers a powerful yet approachable experience that has made it a staple for both new and experienced consumers alike.</p>
      <p>As a THCA hemp flower, Blue Dream carries the same legendary genetic profile: a sweet berry aroma layered with earthy, floral undertones, a smooth smoke, and effects that are uplifting without being overwhelming.</p>

      <h2>Genetics & Lineage</h2>
      <p><strong>Type:</strong> Pure Sativa<br/>
      <strong>Parent Strains:</strong> Blueberry × Haze<br/>
      <strong>Origin:</strong> Santa Cruz, California</p>
      <p>Blue Dream's genetics deliver the sweet berry terpene profile it is famous for, combined with the cerebral, creative lift that defines a true sativa experience. The result is a strain that energizes without overwhelming.</p>

      <h2>Aroma & Flavor Profile</h2>
      <p>Blue Dream's terpene profile is one of its most recognizable features:</p>
      <ul>
        <li><strong>Myrcene</strong> — earthy, musky base; contributes to the relaxing body effect</li>
        <li><strong>Caryophyllene</strong> — spicy, peppery notes; anti-inflammatory properties</li>
        <li><strong>Terpinolene</strong> — fresh, floral, slightly fruity; adds brightness to the aroma</li>
        <li><strong>Pinene</strong> — pine and herbal notes; associated with focus and alertness</li>
      </ul>
      <p>On the inhale, expect sweet blueberry and vanilla. The exhale brings a smooth, earthy finish with subtle floral notes. The smoke is clean and easy — no harshness.</p>

      <h2>Effects</h2>
      <p>Blue Dream is celebrated for its <strong>balanced, full-body experience</strong>. When smoked or vaped as THCA flower, the effects typically include:</p>
      <ul>
        <li>A gentle, uplifting cerebral buzz that promotes creativity and focus</li>
        <li>Mild body relaxation without heavy sedation</li>
        <li>A mood lift that makes it suitable for daytime or early evening use</li>
        <li>Smooth onset with a long, gradual comedown</li>
      </ul>
      <p>Because of its balanced profile, Blue Dream is often recommended for consumers who want the full THCA experience without feeling locked to the couch or overly stimulated.</p>

      <h2>Ideal Use Cases</h2>
      <ul>
        <li><strong>Creative work</strong> — the Haze genetics make it excellent for art, music, writing, or any activity that benefits from a focused, open mindset</li>
        <li><strong>Social settings</strong> — conversational, uplifting, and not overwhelming</li>
        <li><strong>Afternoon sessions</strong> — energizing enough for daytime but relaxing enough to wind down with</li>
        <li><strong>First-time THCA consumers</strong> — approachable potency and smooth effects make it a great entry point</li>
      </ul>

      <h2>What to Look for in Blue Dream THCA Flower</h2>
      <p>When sourcing Blue Dream as a THCA hemp flower, quality matters. Here's what to look for:</p>
      <ul>
        <li><strong>THCA percentage:</strong> Premium Blue Dream typically tests between 18–26% THCA. Anything below 15% is considered mid-grade.</li>
        <li><strong>Terpene content:</strong> Look for total terpenes above 1.5%. A rich terpene profile means better aroma, flavor, and entourage effect.</li>
        <li><strong>Full-panel COA:</strong> Always verify the lab report covers cannabinoids, terpenes, heavy metals, pesticides, and microbials.</li>
        <li><strong>Cure quality:</strong> Properly cured Blue Dream should be slightly sticky, not bone dry. Dry flower loses terpenes and burns harshly.</li>
      </ul>

      <h2>Blue Dream at Luxurious Habbits</h2>
      <p>At Luxurious Habbits, we only carry Blue Dream that meets our strict sourcing standards. Every batch is hand-selected from cultivators who prioritize genetics, cure, and potency. Full-panel COAs are available for every product — no exceptions.</p>
      <p>If Blue Dream is currently in stock, you'll find it in our <a href="/products">Products</a> section. We rotate inventory as new batches come in, so check back regularly or sign up for restock notifications.</p>
    `,
  },
};

// ─────────────────────────────────────────────
// SimilarStrains — live terpene-matched product block
// Always renders on strain review pages — terpene-matched products first, fallback to featured inventory
// ─────────────────────────────────────────────
function SimilarStrains({ terpenes, strainName }: { terpenes: StrainTerpene[]; strainName: string }) {
  const { addItem } = useCart();
  const slugs = terpenes.map(t => t.slug);

  const { data: matches, isLoading: matchLoading } = trpc.catalog.getRelatedByTerpenes.useQuery(
    { terpeneslugs: slugs, limit: 4 },
    { enabled: slugs.length > 0 }
  );

  const { data: featured, isLoading: featuredLoading } = trpc.catalog.featured.useQuery(
    undefined,
    { enabled: !matchLoading && (!matches || matches.length === 0) }
  );

  const isLoading = matchLoading || featuredLoading;
  const hasTerpeneMatches = !matchLoading && matches && matches.length > 0;

  // Build display products — terpene matches preferred, fallback to featured
  const displayProducts = hasTerpeneMatches
    ? (matches ?? [])
    : (featured ?? []).slice(0, 4).map(r => ({ product: r.product, vendor: r.vendor, matchCount: 0 }));

  // Don't render while loading; if no products at all, skip
  if (isLoading || displayProducts.length === 0) return null;

  return (
    <div style={{ marginTop: "3rem" }}>
      {/* Section header */}
      <div style={{ marginBottom: "1.25rem" }}>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#f5a623", fontWeight: 600, marginBottom: "0.3rem" }}>
          {hasTerpeneMatches ? "Terpene-Matched From Our Inventory" : "From Our Live Inventory"}
        </div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", letterSpacing: "0.05em", color: "oklch(0.96 0 0)", lineHeight: 1 }}>
          {hasTerpeneMatches ? "WE CARRY STRAINS JUST LIKE THIS" : "PREMIUM STRAINS WE CARRY"}
        </div>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "oklch(0.45 0 0)", marginTop: "0.5rem", lineHeight: 1.7 }}>
          {hasTerpeneMatches
            ? <>These strains from our live inventory share the same dominant terpenes as <strong style={{ color: "oklch(0.75 0 0)" }}>{strainName}</strong> — meaning similar aroma, flavor, and effects. If you enjoy {strainName}, these are the closest matches we carry right now.</>
            : <>We don't carry {strainName} directly, but these premium strains from our live inventory are worth exploring. Check back as our catalog grows — we're always adding new genetics.</>
          }
        </p>
      </div>

      {/* Terpene match pills — only show when we have actual terpene-matched products */}
      {hasTerpeneMatches && terpenes.length > 0 && (
      <div style={{ marginBottom: "1.25rem" }}>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "oklch(0.40 0 0)", fontWeight: 600, marginBottom: "0.5rem" }}>
          Shared Terpene Profile
        </div>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
        {terpenes.map(t => (
          <span key={t.slug} style={{
            display: "inline-flex", alignItems: "center", gap: "0.3rem",
            fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", letterSpacing: "0.06em",
            color: "#00e5a0", background: "oklch(0.08 0 0)",
            border: "1px solid #00e5a020", borderRadius: "3px",
            padding: "0.2rem 0.5rem",
          }}>
            <Leaf size={9} />
            {t.name} <span style={{ color: "oklch(0.35 0 0)" }}>{t.pct}</span>
          </span>
        ))}
        </div>
      </div>
      )}

      {/* Product cards grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        gap: "0.85rem",
      }}>
        {displayProducts.map(({ product, vendor, matchCount }) => {
          const img = product.imageUrl;
          const price = product.retailPrice ? `$${Number(product.retailPrice).toFixed(2)}` : null;
          const thca = product.thcaPercent ? `${product.thcaPercent}% THCA` : null;
          const typeColor = product.strainType === "sativa" ? "#ff4444" : product.strainType === "indica" ? "#bf5fff" : "#00e5a0";

          return (
            <div key={product.id} style={{
              background: "oklch(0.06 0 0 / 90%)",
              border: "1px solid oklch(1 0 0 / 10%)",
              borderRadius: "8px",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}>
              {/* Product image */}
              <Link href={`/products/${product.slug}`}>
                <div style={{ aspectRatio: "1", background: "oklch(0.08 0 0)", overflow: "hidden", cursor: "pointer" }}>
                  {img ? (
                    <img src={img} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <FlaskConical size={28} style={{ color: "oklch(0.25 0 0)" }} />
                    </div>
                  )}
                </div>
              </Link>

              {/* Card body */}
              <div style={{ padding: "0.75rem", flex: 1, display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                {/* Strain type + match badge */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.3rem" }}>
                  {product.strainType && (
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.55rem", letterSpacing: "0.1em", textTransform: "uppercase", color: typeColor, fontWeight: 600 }}>
                      {product.strainType}
                    </span>
                  )}
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.55rem", color: "#00e5a0", background: "oklch(0.08 0 0)", border: "1px solid #00e5a020", borderRadius: "2px", padding: "0.1rem 0.3rem" }}>
                    {matchCount} terp match{matchCount !== 1 ? "es" : ""}
                  </span>
                </div>

                {/* Name */}
                <Link href={`/products/${product.slug}`}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", fontWeight: 600, color: "oklch(0.90 0 0)", lineHeight: 1.3, cursor: "pointer" }}>
                    {product.name}
                  </div>
                </Link>

                {/* THCA + price row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: "0.35rem" }}>
                  {thca && <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.45 0 0)" }}>{thca}</span>}
                  {price && <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", letterSpacing: "0.04em", color: "oklch(0.96 0 0)" }}>{price}</span>}
                </div>

                {/* Add to Cart */}
                <button
                  onClick={() => addItem({ productId: product.id, name: product.name, price: product.retailPrice ?? "0", imageUrl: product.imageUrl ?? undefined, quantity: 1 })}
                  style={{
                    marginTop: "0.5rem",
                    width: "100%",
                    padding: "0.5rem",
                    background: "oklch(0.08 0 0)",
                    border: "1px solid oklch(1 0 0 / 15%)",
                    borderRadius: "5px",
                    color: "oklch(0.85 0 0)",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.7rem",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.35rem",
                    transition: "background 160ms ease-out, border-color 160ms ease-out",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "oklch(0.12 0 0)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "oklch(1 0 0 / 25%)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "oklch(0.08 0 0)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "oklch(1 0 0 / 15%)"; }}
                >
                  <Plus size={11} /> Add to Cart
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function BlogPost() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? "";
  const article = ARTICLES[slug];

  if (!article) {
    return (
      <div style={{ background: "transparent", minHeight: "100vh", padding: "8rem 1.5rem 5rem" }}>
        <SEO title="Article Not Found" description="This article could not be found." canonical={`/blog/${slug}`} />
        <div style={{ maxWidth: "720px", margin: "0 auto", textAlign: "center" }}>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "3rem", color: "oklch(0.96 0 0)", letterSpacing: "0.05em", marginBottom: "1rem" }}>
            ARTICLE NOT FOUND
          </h1>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", color: "oklch(0.45 0 0)", marginBottom: "2rem" }}>
            This article doesn't exist yet. Check back soon.
          </p>
          <Link href="/blog">
            <button className="btn-gold"><span>Back to Journal</span></button>
          </Link>
        </div>
      </div>
    );
  }

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    keywords: article.tags.join(", "),
    datePublished: article.publishDate,
    dateModified: article.publishDate,
    author: {
      "@type": "Organization",
      name: "Luxurious Habbits",
      url: "https://luxurioushabbits.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Luxurious Habbits",
      url: "https://luxurioushabbits.com",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://luxurioushabbits.com/blog/${slug}`,
    },
    articleSection: article.category,
  };

  return (
    <div style={{ background: "transparent", minHeight: "100vh" }}>
      <SEO
        title={article.title}
        description={article.excerpt}
        keywords={article.tags.join(", ")}
        canonical={`/blog/${slug}`}
        ogType="article"
        datePublished={article.publishDate}
        dateModified={article.publishDate}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Journal", url: "/blog" },
          { name: article.title, url: `/blog/${slug}` },
        ]}
        jsonLd={articleJsonLd}
      />

      {/* ── ARTICLE HEADER ── */}
      <section style={{ padding: "8rem 1.5rem 0" }}>
        <div style={{
          maxWidth: "720px",
          margin: "0 auto",
          background: "oklch(0.04 0 0 / 85%)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          border: "1px solid oklch(1 0 0 / 8%)",
          borderRadius: "12px 12px 0 0",
          padding: "2.5rem 2.5rem 0",
        }}>
          {/* Back link */}
          <Link href="/blog">
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "oklch(0.40 0 0)", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", marginBottom: "2rem" }}>
              <ArrowLeft size={12} /> Back to Journal
            </div>
          </Link>

          {/* Category */}
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: article.categoryColor, fontWeight: 600, marginBottom: "0.75rem" }}>
            {article.category}
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(2.5rem, 7vw, 4.5rem)",
            letterSpacing: "0.04em",
            color: "oklch(0.96 0 0)",
            lineHeight: 1.0,
            marginBottom: "1.5rem",
          }}>
            {article.title}
          </h1>

          {/* Meta */}
          <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", flexWrap: "wrap", marginBottom: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "oklch(0.40 0 0)" }}>
              <Clock size={12} /> {article.readTime}
            </div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "oklch(0.35 0 0)" }}>
              {new Date(article.publishDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </div>
          </div>

          {/* Tags */}
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "2.5rem" }}>
            {article.tags.map(tag => (
              <span key={tag} style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.6rem",
                letterSpacing: "0.08em",
                color: "oklch(0.40 0 0)",
                background: "oklch(0.08 0 0)",
                border: "1px solid oklch(1 0 0 / 6%)",
                borderRadius: "3px",
                padding: "0.2rem 0.5rem",
              }}>
                {tag}
              </span>
            ))}
          </div>

          {/* Divider */}
          <div style={{ height: "1px", background: "oklch(1 0 0 / 8%)", marginBottom: "2.5rem" }} />
        </div>
      </section>

      {/* ── ARTICLE CONTENT ── */}
      <section style={{ padding: "0 1.5rem 6rem" }}>
        <div style={{
          maxWidth: "720px",
          margin: "0 auto",
          background: "oklch(0.04 0 0 / 85%)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          border: "1px solid oklch(1 0 0 / 8%)",
          borderTop: "none",
          borderRadius: "0 0 12px 12px",
          padding: "0 2.5rem 3rem",
        }}>
          {article.content ? (
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.95rem",
                color: "oklch(0.65 0 0)",
                lineHeight: 1.8,
              }}
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          ) : (
            /* Coming soon state for articles not yet written */
            <div style={{
              background: "oklch(0.06 0 0 / 80%)",
              border: "1px solid oklch(1 0 0 / 8%)",
              borderRadius: "8px",
              padding: "3rem",
              textAlign: "center",
            }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", letterSpacing: "0.08em", color: "oklch(0.96 0 0)", marginBottom: "0.75rem" }}>
                FULL ARTICLE COMING SOON
              </div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.82rem", color: "oklch(0.45 0 0)", lineHeight: 1.7, maxWidth: "480px", margin: "0 auto 2rem" }}>
                {article.excerpt}
              </p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "oklch(0.35 0 0)", marginBottom: "2rem" }}>
                Subscribe to our newsletter to be notified when new articles are published.
              </p>
              <Link href="/blog">
                <button className="btn-outline-white" style={{ fontSize: "0.75rem" }}><span>Browse Other Articles</span></button>
              </Link>
            </div>
          )}

          {/* Similar Strains — always renders on every strain review.
               Shows terpene-matched products when available, falls back to featured inventory.
               This block is the primary sales conversion point from organic SEO traffic. */}
          {article.category === "Strain Guide" && (
            <SimilarStrains
              terpenes={article.terpenes ?? []}
              strainName={article.title.split(" THCA")[0].split(" Full")[0].trim()}
            />
          )}

          {/* Community Comments — strain reviews only */}
          {article.category === "Strain Guide" && (
            <StrainReviewComments slug={slug} />
          )}

          {/* Disclaimer */}
          <div style={{ marginTop: "2rem", padding: "1.25rem", background: "oklch(0.05 0 0)", border: "1px solid oklch(1 0 0 / 6%)", borderRadius: "6px" }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", color: "oklch(0.35 0 0)", lineHeight: 1.6 }}>
              <strong style={{ color: "oklch(0.45 0 0)" }}>Disclaimer:</strong> This article is for informational purposes only and does not constitute legal or medical advice. Hemp laws vary by state and are subject to change. Always verify your local laws before purchasing hemp products. These statements have not been evaluated by the FDA. Hemp products are not intended to diagnose, treat, cure, or prevent any disease.
            </p>
          </div>

          {/* Back link */}
          <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid oklch(1 0 0 / 6%)" }}>
            <Link href="/blog">
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "oklch(0.40 0 0)", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>
                <ArrowLeft size={12} /> Back to The Habbits Journal
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
