/**
 * Terpene Data — Luxurious Habbits
 * Full in-depth content for all 37 terpenes in the Badger Labs full-panel COA.
 * Each entry is SEO-optimized with keyword-rich descriptions, effects, and strain associations.
 */

export interface TerpeneData {
  slug: string;
  name: string;
  aroma: string;
  aromatags: string[];
  effects: string[];
  description: string;
  science: string;
  strains: string[];
  color: string; // accent color for the card
  formula: string; // molecular formula e.g. C₁₀H₁₆
  naturalSources: string[]; // plants/foods/fruits where this terpene naturally occurs
}

export const TERPENES: TerpeneData[] = [
  {
    slug: "alpha-bisabolol",
    name: "alpha-Bisabolol",
    aroma: "Floral · Sweet · Chamomile",
    aromatags: ["Floral", "Sweet", "Chamomile", "Honey"],
    effects: ["Anti-inflammatory", "Skin-soothing", "Calming", "Anti-anxiety"],
    description:
      "alpha-Bisabolol is a gentle, floral terpene best known from chamomile essential oil. It is prized in skincare and aromatherapy for its remarkable anti-inflammatory and skin-healing properties. In hemp and cannabis, it contributes a soft, sweet floral note that rounds out harsher terpene profiles.",
    science:
      "Bisabolol has been extensively studied for its ability to enhance skin permeability, making it a carrier for other active compounds. Research shows it inhibits inflammatory cytokines and may offer neuroprotective benefits. It is a monocyclic sesquiterpene alcohol with a molecular formula of C₁₅H₂₆O.",
    strains: ["Cloudburst", "Kimbo Kush", "Pineapple Treat", "Kaia Kush", "Marshmallow Mountain", "Tropic Super Jet", "Jungle Driver", "Moneyball", "Cake N Bake", "Blue Dream", "Lemon Cherry Gelato", "Garlic Cocktail", "Harle-Tsu", "Pink Kush", "Master Kush"],
    color: "#f9a8d4",
    formula: "C₁₅H₂₆O",
    naturalSources: ["German chamomile", "Candeia tree (Eremanthus erythropappus)", "Myoporum crassifolium", "Some orchid species", "Candeia essential oil"],
  },
  {
    slug: "alpha-cedrene",
    name: "alpha-Cedrene",
    aroma: "Woody · Cedar · Earthy",
    aromatags: ["Woody", "Cedar", "Earthy", "Dry"],
    effects: ["Relaxing", "Grounding", "Mild sedative", "Anti-inflammatory"],
    description:
      "alpha-Cedrene is a woody, cedar-scented sesquiterpene found naturally in cedarwood oil and many coniferous trees. In hemp flower, it contributes a deep, grounding earthiness that anchors more volatile top notes. It is associated with calming and relaxing effects.",
    science:
      "alpha-Cedrene is a bicyclic sesquiterpene (C₁₅H₂₄) that is a major component of cedarwood essential oil. Studies suggest it has mild sedative properties and may interact with GABA receptors. It is also being researched for its potential as a natural insect repellent.",
    strains: ["Garlic Cocktail", "Northern Lights", "OG Kush", "Chemdawg"],
    color: "#a3e635",
    formula: "C₁₅H₂₄",
    naturalSources: ["Texas cedarwood (Juniperus ashei)", "Virginia cedarwood", "Atlas cedar", "Himalayan cedar", "Pencil cedar"],
  },
  {
    slug: "alpha-humulene",
    name: "alpha-Humulene",
    aroma: "Hoppy · Earthy · Woody · Spicy",
    aromatags: ["Hoppy", "Earthy", "Woody", "Spicy"],
    effects: ["Anti-inflammatory", "Appetite suppressant", "Antibacterial", "Pain relief"],
    description:
      "alpha-Humulene is one of the most well-researched terpenes in the cannabis plant. Also found abundantly in hops (giving beer its characteristic bitterness), it brings a distinct earthy, woody, and spicy aroma. Unlike most terpenes, humulene is notable for its appetite-suppressing properties.",
    science:
      "alpha-Humulene (also called α-caryophyllene) is a monocyclic sesquiterpene (C₁₅H₂₄) and an isomer of beta-caryophyllene. It has been shown in studies to reduce inflammation by inhibiting prostaglandin E2 production and may have anti-tumor properties. It is commonly found alongside beta-caryophyllene.",
    strains: ["Garlic Cocktail", "Lemon Cherry Gelato", "Tropic Super Jet", "Jungle Driver", "Moneyball", "Cake N Bake", "Cloudburst", "Kimbo Kush", "Marshmallow Mountain", "Girl Scout Cookies", "GMO", "White Truffle", "RS11", "Headband", "White Widow", "Sour Diesel"],
    color: "#fb923c",
    formula: "C₁₅H₂₄",
    naturalSources: ["Hops (Humulus lupulus)", "Sage", "Ginseng", "Black pepper", "Tobacco", "Ginger"],
  },
  {
    slug: "alpha-phellandrene",
    name: "alpha-Phellandrene",
    aroma: "Citrus · Minty · Peppery",
    aromatags: ["Citrus", "Minty", "Peppery", "Fresh"],
    effects: ["Energizing", "Antifungal", "Pain relief", "Mood-lifting"],
    description:
      "alpha-Phellandrene is a crisp, citrusy-minty terpene found in eucalyptus, dill, and black pepper. In hemp flower, it adds a fresh, bright quality to the aroma profile. It is one of the more energizing terpenes and has been studied for antifungal and analgesic properties.",
    science:
      "alpha-Phellandrene is a cyclic monoterpene (C₁₀H₁₆) that is highly volatile and contributes significantly to the top-note aroma of many cannabis strains. Research has demonstrated antifungal activity against several Candida species and potential analgesic effects through interaction with the endocannabinoid system.",
    strains: ["Jack Herer", "Trainwreck", "Lemon Haze"],
    color: "#fbbf24",
    formula: "C₁₀H₁₆",
    naturalSources: ["Eucalyptus", "Dill", "Black pepper", "Cinnamon", "Ginger", "Water fennel", "Parsley seed oil"],
  },
  {
    slug: "alpha-pinene",
    name: "alpha-Pinene",
    aroma: "Pine · Fresh · Earthy · Resinous",
    aromatags: ["Pine", "Fresh", "Earthy", "Forest"],
    effects: ["Memory retention", "Alertness", "Anti-inflammatory", "Bronchodilator", "Antibacterial"],
    description:
      "alpha-Pinene is the most abundant terpene in nature and one of the most studied in cannabis. Its sharp, fresh pine aroma is instantly recognizable. Beyond its scent, alpha-pinene is a powerful bronchodilator, helping open airways, and has been shown to counteract some of the short-term memory impairment associated with THC.",
    science:
      "alpha-Pinene (C₁₀H₁₆) is a bicyclic monoterpene and a potent acetylcholinesterase inhibitor, which is the mechanism behind its memory-retention properties. It crosses the blood-brain barrier and may help preserve acetylcholine levels. Studies also show strong anti-inflammatory effects via inhibition of NF-κB pathways.",
    strains: ["Garlic Cocktail", "Marshmallow Mountain", "Cake N Bake", "Lemon Cherry Gelato", "Blue Dream", "Jack Herer", "SFV OG", "MAC", "Bubba Kush", "Trainwreck"],
    color: "#4ade80",
    formula: "C₁₀H₁₆",
    naturalSources: ["Pine trees (Pinus species)", "Rosemary", "Basil", "Dill", "Parsley", "Eucalyptus", "Orange peel", "Turpentine"],
  },
  {
    slug: "alpha-terpinene",
    name: "alpha-Terpinene",
    aroma: "Herbal · Citrus · Woody",
    aromatags: ["Herbal", "Citrus", "Woody", "Spicy"],
    effects: ["Antioxidant", "Antifungal", "Antibacterial", "Mild stimulant"],
    description:
      "alpha-Terpinene is a herbal, citrusy monoterpene found in cardamom, marjoram, and tea tree oil. It is a powerful antioxidant and has been used in traditional medicine for centuries. In hemp flower, it contributes to the complex herbal undertones of many strains.",
    science:
      "alpha-Terpinene (C₁₀H₁₆) is a cyclic monoterpene isomer. It is one of the most potent antioxidant terpenes, with studies showing it can scavenge free radicals more effectively than vitamin E in some assays. It also demonstrates significant antifungal activity against dermatophytes.",
    strains: ["Durban Poison", "Super Silver Haze", "Sour Diesel"],
    color: "#86efac",
    formula: "C₁₀H₁₆",
    naturalSources: ["Tea tree oil (Melaleuca alternifolia)", "Cardamom", "Marjoram", "Juniper berries", "Coriander", "Savory"],
  },
  {
    slug: "beta-caryophyllene",
    name: "beta-Caryophyllene",
    aroma: "Spicy · Peppery · Woody · Clove",
    aromatags: ["Spicy", "Peppery", "Woody", "Clove"],
    effects: ["Anti-inflammatory", "Stress relief", "Relaxation", "Pain relief", "Anxiety reduction"],
    description:
      "beta-Caryophyllene is one of the most therapeutically significant terpenes in hemp and cannabis. It is the only known terpene that directly binds to cannabinoid receptors — specifically CB2 receptors — making it technically a dietary cannabinoid. Its warm, spicy, peppery aroma is found in black pepper, cloves, and cinnamon.",
    science:
      "beta-Caryophyllene (BCP) is a bicyclic sesquiterpene (C₁₅H₂₄) and a selective CB2 receptor agonist. This unique property means it can produce anti-inflammatory and analgesic effects without psychoactive activity. Multiple clinical studies have validated its efficacy for chronic pain, anxiety, and depression. It is FDA-approved as a food additive.",
    strains: ["Garlic Cocktail", "Lemon Cherry Gelato", "Marshmallow Mountain", "Tropic Super Jet", "Jungle Driver", "Moneyball", "Cake N Bake", "Blue Dream", "Cloudburst", "Kimbo Kush", "Pineapple Treat", "Kaia Kush", "Girl Scout Cookies", "Gelato", "Wedding Cake", "Runtz", "GMO", "Oreoz", "Zoap", "White Truffle", "RS11", "Grape Gas", "Gary Payton", "MAC"],
    color: "#f97316",
    formula: "C₁₅H₂₄",
    naturalSources: ["Black pepper", "Cloves", "Cinnamon bark", "Basil", "Oregano", "Rosemary", "Hops", "Copaiba balsam"],
  },
  {
    slug: "beta-myrcene",
    name: "beta-Myrcene",
    aroma: "Earthy · Musky · Herbal · Clove",
    aromatags: ["Earthy", "Musky", "Herbal", "Fruity"],
    effects: ["Sedating", "Muscle relaxant", "Pain relief", "Sleep aid", "Anti-inflammatory"],
    description:
      "beta-Myrcene is the most abundant terpene in modern cannabis and hemp strains, often making up over 50% of the total terpene content. It is responsible for the characteristic earthy, musky aroma of many indica-dominant strains. Myrcene is strongly associated with the 'couch-lock' effect and is considered the primary driver of sedating, body-heavy experiences.",
    science:
      "beta-Myrcene (C₁₀H₁₆) is an acyclic monoterpene. Research shows it potentiates the effects of THC by increasing cell membrane permeability in the blood-brain barrier. It acts as a positive allosteric modulator at CB1 receptors and has demonstrated significant analgesic and sedative properties in animal studies. High myrcene content (>0.5%) is traditionally associated with indica-type effects.",
    strains: ["Garlic Cocktail", "Lemon Cherry Gelato", "Marshmallow Mountain", "Tropic Super Jet", "Jungle Driver", "Moneyball", "Cake N Bake", "Blue Dream", "Cloudburst", "Kimbo Kush", "Pineapple Treat", "Kaia Kush", "OG Kush", "Gelato", "Wedding Cake", "GMO", "Oreoz", "Zoap", "White Truffle", "Grape Gas", "Gary Payton"],
    color: "#c084fc",
    formula: "C₁₀H₁₆",
    naturalSources: ["Mango", "Hops (Humulus lupulus)", "Lemongrass", "Thyme", "Bay leaves", "Basil", "Parsley", "Wild thyme"],
  },
  {
    slug: "beta-pinene",
    name: "beta-Pinene",
    aroma: "Pine · Woody · Dill · Parsley",
    aromatags: ["Pine", "Woody", "Herbal", "Fresh"],
    effects: ["Antidepressant", "Antibacterial", "Bronchodilator", "Memory support"],
    description:
      "beta-Pinene is the structural isomer of alpha-pinene, sharing a similar fresh pine aroma but with additional herbal, dill-like qualities. It is found in many coniferous trees and herbs. In hemp, it works synergistically with alpha-pinene to enhance respiratory function and cognitive clarity.",
    science:
      "beta-Pinene (C₁₀H₁₆) is a bicyclic monoterpene. Studies have shown it has antidepressant effects in animal models, potentially through modulation of serotonin and dopamine systems. Like alpha-pinene, it is a bronchodilator and acetylcholinesterase inhibitor, supporting its use for respiratory and cognitive health.",
    strains: ["Garlic Cocktail", "Lemon Cherry Gelato", "Marshmallow Mountain", "Cake N Bake", "Blue Dream", "Kimbo Kush", "Jack Herer", "Harlequin", "Dutch Treat"],
    color: "#34d399",
    formula: "C₁₀H₁₆",
    naturalSources: ["Pine trees", "Rosemary", "Dill", "Parsley", "Basil", "Fennel", "Hops", "Nutmeg"],
  },
  {
    slug: "borneol",
    name: "Borneol",
    aroma: "Camphor · Minty · Woody · Herbal",
    aromatags: ["Camphor", "Minty", "Woody", "Medicinal"],
    effects: ["Analgesic", "Anti-inflammatory", "Neuroprotective", "Sedating"],
    description:
      "Borneol is a camphor-like bicyclic monoterpene with a long history in traditional Chinese medicine (TCM), where it has been used for thousands of years to treat pain and inflammation. Its distinctive medicinal, minty-camphor aroma is immediately recognizable. In hemp, it contributes to the complex medicinal character of certain strains.",
    science:
      "Borneol (C₁₀H₁₈O) is a bicyclic monoterpenoid alcohol. Research demonstrates neuroprotective effects, including protection against ischemic brain injury. It also enhances the absorption of other compounds across the blood-brain barrier, potentially amplifying the entourage effect. TCM practitioners have used it as a 'guide drug' to direct other medicines to target tissues.",
    strains: ["K13 Haze", "Golden Haze", "Amnesia Haze"],
    color: "#7dd3fc",
    formula: "C₁₀H₁₈O",
    naturalSources: ["Camphor tree (Cinnamomum camphora)", "Rosemary", "Valerian", "Ginger", "Thyme", "Lavender", "Sage"],
  },
  {
    slug: "camphene",
    name: "Camphene",
    aroma: "Earthy · Woody · Fir Needles · Damp",
    aromatags: ["Earthy", "Woody", "Fir", "Damp"],
    effects: ["Antioxidant", "Cardiovascular support", "Anti-inflammatory", "Antifungal"],
    description:
      "Camphene has a distinctive earthy, damp, fir-needle aroma reminiscent of a forest after rain. It is found in camphor oil, citronella, and ginger. In hemp, it adds depth and complexity to earthy profiles. Camphene is particularly notable for its potential cardiovascular benefits, with studies suggesting it may help reduce cholesterol and triglycerides.",
    science:
      "Camphene (C₁₀H₁₆) is a bicyclic monoterpene. A landmark study published in the journal Phytomedicine found that camphene significantly reduced plasma cholesterol and triglycerides in hyperlipidemic rats, suggesting potential as a natural cardiovascular protective agent. It also demonstrates antifungal and antioxidant properties.",
    strains: ["Garlic Cocktail", "Lemon Cherry Gelato", "Blue Dream", "Mendocino Purps", "Ghost OG", "Strawberry Banana"],
    color: "#6ee7b7",
    formula: "C₁₀H₁₆",
    naturalSources: ["Camphor oil", "Citronella", "Ginger", "Fir needles (Abies species)", "Valerian root", "Turpentine", "Neroli oil"],
  },
  {
    slug: "camphor",
    name: "Camphor",
    aroma: "Medicinal · Minty · Cooling · Sharp",
    aromatags: ["Medicinal", "Minty", "Cooling", "Sharp"],
    effects: ["Analgesic", "Anti-inflammatory", "Decongestant", "Antifungal"],
    description:
      "Camphor is the terpene responsible for the sharp, medicinal, cooling sensation associated with products like Vicks VapoRub and Tiger Balm. In hemp flower, trace amounts of camphor contribute a medicinal depth to the aroma profile. It has been used topically for centuries to relieve pain and inflammation.",
    science:
      "Camphor (C₁₀H₁₆O) is a bicyclic monoterpenoid ketone. It is a TRPV1 and TRPM8 receptor agonist, which explains its cooling and analgesic effects. Research confirms its efficacy as a topical analgesic and anti-inflammatory agent. It is also a potent decongestant and has demonstrated antifungal activity against Candida species.",
    strains: ["Romulan", "Afgoo", "Granddaddy Purple"],
    color: "#93c5fd",
    formula: "C₁₀H₁₆O",
    naturalSources: ["Camphor tree (Cinnamomum camphora)", "Rosemary (high concentrations)", "Sage", "Lavender (trace)", "Basil", "Mugwort"],
  },
  {
    slug: "3-carene",
    name: "3-Carene",
    aroma: "Sweet · Earthy · Citrus · Pine",
    aromatags: ["Sweet", "Earthy", "Citrus", "Piney"],
    effects: ["Bone health", "Anti-inflammatory", "Memory support", "Drying effect"],
    description:
      "3-Carene (also called delta-3-carene) has a sweet, earthy aroma with citrus and pine undertones. It is found in bell peppers, cedar, and pine resin. In hemp, it contributes to sweet, earthy profiles. Uniquely, 3-carene has been studied for its potential to stimulate bone growth and repair, making it of interest for osteoporosis research.",
    science:
      "3-Carene (C₁₀H₁₆) is a bicyclic monoterpene. Studies have shown it stimulates bone formation and may be beneficial for osteoporosis. It is also a drying agent — it can cause dry eyes and mouth by reducing fluid secretion. Research suggests it may enhance memory consolidation and has demonstrated anti-inflammatory properties.",
    strains: ["Super Silver Haze", "Skunk #1", "AK-47", "Jack Herer"],
    color: "#fde68a",
    formula: "C₁₀H₁₆",
    naturalSources: ["Bell peppers", "Cedar trees", "Pine resin", "Rosemary", "Basil", "Turpentine oil", "Cypress"],
  },
  {
    slug: "caryophyllene-oxide",
    name: "Caryophyllene Oxide",
    aroma: "Woody · Spicy · Dry · Herbal",
    aromatags: ["Woody", "Spicy", "Dry", "Herbal"],
    effects: ["Antifungal", "Antibacterial", "Anti-inflammatory", "Antioxidant"],
    description:
      "Caryophyllene oxide is the oxidized form of beta-caryophyllene and is the compound that drug-sniffing dogs are trained to detect in cannabis. It has a dry, woody, spicy aroma. It is found in lemon balm, eucalyptus, and cloves. In hemp, it contributes to the longevity of the aroma profile as the flower dries and ages.",
    science:
      "Caryophyllene oxide (C₁₅H₂₄O) is a bicyclic sesquiterpene oxide. It is a potent antifungal agent, with studies showing efficacy against Candida species comparable to pharmaceutical antifungals. It also demonstrates significant antibacterial activity and has been shown to inhibit tumor cell growth in several cancer cell lines.",
    strains: ["Lemon Haze", "Gorilla Glue", "Bubba Kush"],
    color: "#d97706",
    formula: "C₁₅H₂₄O",
    naturalSources: ["Lemon balm (Melissa officinalis)", "Eucalyptus", "Cloves", "Oregano", "Rosemary (oxidized)", "Basil (aged)"],
  },
  {
    slug: "cedrol",
    name: "Cedrol",
    aroma: "Woody · Cedar · Earthy · Soft",
    aromatags: ["Woody", "Cedar", "Earthy", "Soft"],
    effects: ["Sedating", "Anxiolytic", "Anti-inflammatory", "Antifungal"],
    description:
      "Cedrol is a sesquiterpene alcohol with a soft, woody, cedar-like aroma. It is a major component of cedarwood essential oil and is widely used in perfumery and aromatherapy for its calming, grounding properties. In hemp, it contributes to deep, woody, relaxing profiles.",
    science:
      "Cedrol (C₁₅H₂₆O) is a sesquiterpene alcohol. Research has demonstrated significant sedative and anxiolytic effects, with animal studies showing it reduces locomotor activity and increases sleep time. It is believed to act on the GABA-A receptor system. It also shows antifungal activity and has been studied for its potential to reduce blood pressure.",
    strains: ["Northern Lights", "Afghani", "Blueberry"],
    color: "#a78bfa",
    formula: "C₁₅H₂₆O",
    naturalSources: ["Cedarwood (Cedrus atlantica)", "Texas cedar (Juniperus ashei)", "Virginia cedarwood", "Cypress", "Juniper berries"],
  },
  {
    slug: "eucalyptol",
    name: "Eucalyptol",
    aroma: "Minty · Cool · Camphor · Medicinal",
    aromatags: ["Minty", "Cool", "Camphor", "Medicinal"],
    effects: ["Decongestant", "Anti-inflammatory", "Antibacterial", "Memory support", "Pain relief"],
    description:
      "Eucalyptol (also known as 1,8-cineole) is the primary terpene in eucalyptus oil and is responsible for the characteristic cooling, medicinal sensation of eucalyptus products. It is widely used in cough drops, mouthwash, and decongestants. In hemp, it adds a fresh, medicinal quality and has been associated with improved cognitive function.",
    science:
      "Eucalyptol (C₁₀H₁₈O) is a cyclic monoterpene ether. It is a potent inhibitor of cytokine production, making it a powerful anti-inflammatory. Multiple studies have demonstrated its efficacy for respiratory conditions including asthma and COPD. A landmark study found eucalyptol significantly improved memory and concentration in Alzheimer's patients.",
    strains: ["Super Silver Haze", "AC/DC", "Girl Scout Cookies", "Headband"],
    color: "#67e8f9",
    formula: "C₁₀H₁₈O",
    naturalSources: ["Eucalyptus leaves", "Rosemary", "Bay leaves", "Sage", "Tea tree", "Cardamom", "Mugwort", "Wormwood"],
  },
  {
    slug: "farnesene",
    name: "Farnesene",
    aroma: "Green Apple · Floral · Woody · Fresh",
    aromatags: ["Green Apple", "Floral", "Woody", "Fresh"],
    effects: ["Anti-inflammatory", "Antioxidant", "Calming", "Antibacterial"],
    description:
      "Farnesene is a sesquiterpene with a unique green apple, floral, and woody aroma. It is found in green apple skin, ginger, and turmeric. In hemp, it contributes a fresh, fruity complexity that lifts heavier terpene profiles. It is also a natural insect deterrent — plants produce it as a defense signal.",
    science:
      "Farnesene (C₁₅H₂₄) exists as multiple isomers (alpha and beta). It is a sesquiterpene that has demonstrated anti-inflammatory properties through inhibition of the COX-2 enzyme pathway. Research also shows antioxidant activity and potential antimicrobial effects.",
    strains: ["Sativa strains", "Durban Poison", "Neville's Haze"],
    color: "#bbf7d0",
    formula: "C₁₅H₂₄",
    naturalSources: ["Green apple skin", "Ginger", "Turmeric", "Sandalwood", "Chamomile", "Ylang-ylang", "Patchouli"],
  },
  {
    slug: "fenchone",
    name: "Fenchone",
    aroma: "Camphor · Minty · Herbal · Fennel",
    aromatags: ["Camphor", "Minty", "Herbal", "Fennel"],
    effects: ["Antibacterial", "Antifungal", "Digestive support", "Anti-inflammatory"],
    description:
      "Fenchone is a bicyclic monoterpenoid ketone with a sharp, camphor-like, fennel aroma. It is the primary active component of fennel essential oil and is also found in absinthe (wormwood). In hemp, it contributes to complex herbal and medicinal aroma profiles. It has been used traditionally to support digestive health.",
    science:
      "Fenchone (C₁₀H₁₆O) is a bicyclic monoterpenoid ketone. Research demonstrates significant antibacterial activity against gram-positive and gram-negative bacteria, as well as antifungal properties. It has been shown to have antispasmodic effects on smooth muscle, supporting its traditional use for digestive complaints. It is also being studied for potential neuroprotective effects.",
    strains: ["Fennel-forward hemp varieties", "Some OG phenotypes"],
    color: "#d9f99d",
    formula: "C₁₀H₁₆O",
    naturalSources: ["Fennel (Foeniculum vulgare)", "Wormwood (Artemisia absinthium)", "Absinthe herb", "Thuja", "Common rue"],
  },
  {
    slug: "fenchyl-alcohol",
    name: "Fenchyl Alcohol",
    aroma: "Pine · Camphor · Herbal · Earthy",
    aromatags: ["Pine", "Camphor", "Herbal", "Earthy"],
    effects: ["Antibacterial", "Anti-inflammatory", "Antioxidant"],
    description:
      "Fenchyl alcohol is a bicyclic monoterpenoid alcohol with a piney, camphor-like, herbal aroma. It is found in fennel, pine, and various medicinal herbs. In hemp, it contributes to the complex, layered medicinal character of certain strains. It is less commonly discussed but plays an important role in the full terpene entourage.",
    science:
      "Fenchyl alcohol (C₁₀H₁₈O) is the alcohol form of fenchone. It demonstrates antibacterial properties and has been studied for anti-inflammatory effects. As with many monoterpenoid alcohols, it shows antioxidant activity and may contribute to the overall therapeutic profile of the entourage effect in full-spectrum hemp products.",
    strains: ["Various full-spectrum hemp strains"],
    color: "#ecfccb",
    formula: "C₁₀H₁₈O",
    naturalSources: ["Fennel seed oil", "Pine essential oil", "Lavender (trace)", "Basil (trace)", "Camphor laurel"],
  },
  {
    slug: "gamma-terpinene",
    name: "gamma-Terpinene",
    aroma: "Citrus · Herbal · Woody · Spicy",
    aromatags: ["Citrus", "Herbal", "Woody", "Spicy"],
    effects: ["Antioxidant", "Antibacterial", "Antifungal", "Anti-inflammatory"],
    description:
      "gamma-Terpinene is a cyclic monoterpene isomer with a citrusy, herbal, and slightly spicy aroma. It is found in citrus peels, cumin, and ajowan. In hemp, it contributes to citrusy, herbal complexity. It is one of the most potent antioxidant terpenes and is widely used in the food industry as a natural preservative.",
    science:
      "gamma-Terpinene (C₁₀H₁₆) is a cyclic monoterpene. Studies have demonstrated it is one of the most effective free-radical scavengers among terpenes, with antioxidant activity superior to BHT (a common synthetic antioxidant). It also shows strong antibacterial activity against food-borne pathogens and antifungal properties against Candida species.",
    strains: ["Cake N Bake", "Blue Dream", "Lemon Cherry Gelato", "Cloudburst", "Kimbo Kush", "Pineapple Treat", "Kaia Kush", "Marshmallow Mountain", "Tropic Super Jet", "Jungle Driver", "Moneyball", "Garlic Cocktail", "Lemon Skunk", "Super Lemon Haze", "Tangie"],
    color: "#fef08a",
    formula: "C₁₀H₁₆",
    naturalSources: ["Citrus peel (lemon, lime, orange)", "Cumin seeds", "Ajowan (carom seeds)", "Coriander", "Savory", "Thyme"],
  },
  {
    slug: "geraniol",
    name: "Geraniol",
    aroma: "Rose · Floral · Sweet · Citrus",
    aromatags: ["Rose", "Floral", "Sweet", "Citrus"],
    effects: ["Neuroprotective", "Antioxidant", "Anti-inflammatory", "Antibacterial", "Calming"],
    description:
      "Geraniol is a beautiful, rose-scented monoterpenoid alcohol found in geranium, rose, and lemongrass essential oils. It is one of the most widely used fragrance compounds in perfumery. In hemp, it contributes a delicate floral sweetness that elevates the overall aroma profile. It has also been studied for impressive neuroprotective properties.",
    science:
      "Geraniol (C₁₀H₁₈O) is an acyclic monoterpenoid alcohol. Research has demonstrated neuroprotective effects in models of Parkinson's and Alzheimer's disease. It is a potent antioxidant and has shown efficacy against multiple cancer cell lines. It also acts as a natural insect repellent and has demonstrated significant antibacterial activity.",
    strains: ["Amnesia Haze", "Great White Shark", "Afghani"],
    color: "#fda4af",
    formula: "C₁₀H₁₈O",
    naturalSources: ["Rose petals", "Geranium (Pelargonium graveolens)", "Lemongrass", "Citronella", "Palmarosa", "Ginger", "Blueberries", "Carrots"],
  },
  {
    slug: "geranyl-acetate",
    name: "Geranyl Acetate",
    aroma: "Floral · Fruity · Rose · Citrus",
    aromatags: ["Floral", "Fruity", "Rose", "Citrus"],
    effects: ["Antimicrobial", "Anti-inflammatory", "Relaxing", "Antifungal"],
    description:
      "Geranyl acetate is the acetate ester of geraniol, sharing its beautiful floral, fruity, rose-like aroma with added fruity complexity. It is found in geranium, citronella, and lemongrass. In hemp, it contributes to sweet, floral, tropical aroma profiles. It is widely used in perfumery and food flavoring.",
    science:
      "Geranyl acetate (C₁₂H₂₀O₂) is a monoterpene ester. Research shows antimicrobial activity against a broad spectrum of bacteria and fungi. It has demonstrated anti-inflammatory properties and may contribute to relaxation through mild interaction with GABA receptors. It is a precursor to geraniol and other important terpenes in the biosynthetic pathway.",
    strains: ["Tropical sativa strains", "Pineapple Express", "Tangie"],
    color: "#fb7185",
    formula: "C₁₂H₂₀O₂",
    naturalSources: ["Geranium oil", "Citronella grass", "Lemongrass", "Carrot seed oil", "Coriander", "Sassafras", "Bergamot"],
  },
  {
    slug: "guaiol",
    name: "Guaiol",
    aroma: "Pine · Rose · Woody · Floral",
    aromatags: ["Pine", "Rose", "Woody", "Floral"],
    effects: ["Anti-inflammatory", "Antibacterial", "Antioxidant", "Diuretic"],
    description:
      "Guaiol is a sesquiterpenoid alcohol with a unique pine-rose, woody-floral aroma. Unlike most terpenes, it is a liquid at room temperature rather than a gas, which gives it a different volatility profile. It is found in guaiacum wood and cypress pine. In hemp, it contributes to complex, multi-layered floral-woody profiles.",
    science:
      "Guaiol (C₁₅H₂₆O) is a sesquiterpenoid alcohol. Research has demonstrated anti-inflammatory properties through inhibition of COX enzymes. It shows antibacterial activity against respiratory pathogens and has been studied for potential anti-tumor properties. Its diuretic properties have been used in traditional medicine for urinary tract support.",
    strains: ["Chernobyl", "Liberty Haze", "ACDC"],
    color: "#86efac",
    formula: "C₁₅H₂₆O",
    naturalSources: ["Guaiacum wood (Guaiacum officinale)", "Cypress pine (Callitris intratropica)", "Niaouli", "Boldo leaf"],
  },
  {
    slug: "hexahydrothymol",
    name: "Hexahydrothymol",
    aroma: "Herbal · Minty · Woody · Medicinal",
    aromatags: ["Herbal", "Minty", "Woody", "Medicinal"],
    effects: ["Antibacterial", "Antifungal", "Anti-inflammatory"],
    description:
      "Hexahydrothymol is a reduced form of thymol, the primary active compound in thyme essential oil. It has a herbal, minty, medicinal aroma. In hemp, it contributes to complex herbal and medicinal terpene profiles. Thymol and its derivatives have been used in traditional medicine for centuries as antiseptics and antimicrobials.",
    science:
      "Hexahydrothymol (C₁₀H₂₀O) is a saturated monoterpenoid alcohol derived from thymol. Research on thymol derivatives shows strong antibacterial and antifungal activity. It may contribute to the overall antimicrobial properties of full-spectrum hemp extracts and plays a role in the complex entourage of minor terpenes.",
    strains: ["Garlic Cocktail", "Moneyball", "Jungle Driver", "Tropicana Cherry", "Thyme-forward hemp cultivars", "Various OG phenotypes"],
    color: "#a5f3fc",
    formula: "C₁₀H₂₀O",
    naturalSources: ["Thyme (Thymus vulgaris)", "Oregano", "Savory", "Marjoram", "Thymol-rich herbs"],
  },
  {
    slug: "isoborneol",
    name: "Isoborneol",
    aroma: "Camphor · Herbal · Woody · Medicinal",
    aromatags: ["Camphor", "Herbal", "Woody", "Medicinal"],
    effects: ["Antiviral", "Antibacterial", "Anti-inflammatory", "Analgesic"],
    description:
      "Isoborneol is a stereoisomer of borneol with a similar camphor-like, herbal, medicinal aroma. It has been studied extensively for antiviral properties, particularly against herpes simplex virus. In hemp, it contributes to the medicinal, camphor-like depth of certain strains. It has a long history of use in traditional Chinese and Ayurvedic medicine.",
    science:
      "Isoborneol (C₁₀H₁₈O) is a bicyclic monoterpenoid alcohol. Research has demonstrated significant antiviral activity against HSV-1 and HSV-2, with studies showing it inhibits viral replication. It also shows antibacterial activity and anti-inflammatory properties. Like borneol, it may enhance the permeability of the blood-brain barrier.",
    strains: ["Medicinal hemp varieties", "High-CBD strains"],
    color: "#bfdbfe",
    formula: "C₁₀H₁₈O",
    naturalSources: ["Camphor tree", "Valerian root", "Rosemary (minor)", "Lavender (minor)", "Mugwort"],
  },
  {
    slug: "isopulegol",
    name: "Isopulegol",
    aroma: "Minty · Herbal · Cool · Fresh",
    aromatags: ["Minty", "Herbal", "Cool", "Fresh"],
    effects: ["Gastroprotective", "Anti-anxiety", "Anti-inflammatory", "Anticonvulsant"],
    description:
      "Isopulegol is a minty, herbal monoterpenoid alcohol that is a chemical precursor to menthol. It has a fresh, cool, minty aroma. In hemp, it contributes to fresh, herbal profiles. It is particularly notable for its gastroprotective properties and has been studied as a potential anti-seizure compound.",
    science:
      "Isopulegol (C₁₀H₁₈O) is a cyclic monoterpenoid alcohol. Research has demonstrated gastroprotective effects, reducing gastric ulcer formation in animal models. It shows significant anti-anxiety effects in behavioral studies and has demonstrated anticonvulsant properties, making it of interest for epilepsy research. It also interacts with GABA-A receptors.",
    strains: ["OG Kush phenotypes", "Kosher Kush", "Headband"],
    color: "#ccfbf1",
    formula: "C₁₀H₁₈O",
    naturalSources: ["Pennyroyal mint (Mentha pulegium)", "Lemon eucalyptus", "Geranium oil", "Citronella grass", "Peppermint (minor)"],
  },
  {
    slug: "limonene",
    name: "Limonene",
    aroma: "Citrus · Lemon · Orange · Fresh",
    aromatags: ["Citrus", "Lemon", "Orange", "Fresh"],
    effects: ["Mood-lifting", "Anti-anxiety", "Antidepressant", "Antifungal", "Antibacterial", "Immune support"],
    description:
      "Limonene is one of the most popular and well-loved terpenes in cannabis and hemp. Its bright, citrusy, lemon-orange aroma is immediately uplifting. It is the second most abundant terpene in nature and is found in the rinds of citrus fruits. Limonene is strongly associated with elevated mood, reduced anxiety, and stress relief.",
    science:
      "Limonene (C₁₀H₁₆) is a cyclic monoterpene. Clinical studies have shown it increases serotonin and dopamine levels in the prefrontal cortex and hippocampus, explaining its antidepressant and anxiolytic effects. It has demonstrated potent antifungal activity and is being studied for anti-tumor properties, particularly against breast cancer. It also enhances the absorption of other terpenes and cannabinoids.",
    strains: ["Garlic Cocktail", "Lemon Cherry Gelato", "Marshmallow Mountain", "Tropic Super Jet", "Jungle Driver", "Moneyball", "Cake N Bake", "Cloudburst", "Kimbo Kush", "Super Lemon Haze", "MAC", "RS11", "SFV OG", "Gelato", "Runtz", "Wedding Cake", "GMO", "Oreoz", "Zoap", "White Truffle", "Grape Gas", "Gary Payton"],
    color: "#fef9c3",
    formula: "C₁₀H₁₆",
    naturalSources: ["Lemon rind", "Orange peel", "Grapefruit", "Lime", "Tangerine", "Juniper berries", "Peppermint", "Rosemary"],
  },
  {
    slug: "linalool",
    name: "Linalool",
    aroma: "Lavender · Floral · Sweet · Spicy",
    aromatags: ["Lavender", "Floral", "Sweet", "Spicy"],
    effects: ["Sedating", "Anti-anxiety", "Antidepressant", "Anticonvulsant", "Analgesic", "Anti-inflammatory"],
    description:
      "Linalool is one of the most therapeutically versatile terpenes in hemp and cannabis. Its beautiful lavender-floral aroma is calming and deeply relaxing. It is the primary active terpene in lavender essential oil and is responsible for lavender's well-documented anxiolytic and sleep-promoting effects. Linalool is a cornerstone of the entourage effect in indica-dominant strains.",
    science:
      "Linalool (C₁₀H₁₈O) is an acyclic monoterpenoid alcohol. It modulates GABA-A receptors (the same target as benzodiazepines), which explains its potent anti-anxiety and sedative effects. Research has demonstrated anticonvulsant properties comparable to pharmaceutical anticonvulsants in some models. It also inhibits glutamate receptor activity, contributing to its neuroprotective effects.",
    strains: ["Garlic Cocktail", "Moneyball", "Tropic Super Jet", "Jungle Driver", "Lemon Cherry Gelato", "Marshmallow Mountain", "Tropicana Cherry", "Lavender", "Gelato", "Runtz", "Oreoz", "Zoap", "Grape Gas", "Gary Payton", "RS11", "LA Confidential"],
    color: "#e9d5ff",
    formula: "C₁₀H₁₈O",
    naturalSources: ["Lavender (Lavandula angustifolia)", "Coriander seed", "Bergamot", "Rosewood", "Basil", "Thyme", "Mint", "Cinnamon"],
  },
  {
    slug: "nerol",
    name: "Nerol",
    aroma: "Sweet · Rose · Citrus · Floral",
    aromatags: ["Sweet", "Rose", "Citrus", "Floral"],
    effects: ["Antimicrobial", "Anti-inflammatory", "Antioxidant", "Calming"],
    description:
      "Nerol is a geometric isomer of geraniol with a sweeter, more delicate rose-citrus aroma. It is found in neroli oil (orange blossom), lemongrass, and hops. In hemp, it contributes to sweet, floral, complex aroma profiles. It is widely used in perfumery and has been studied for antimicrobial and anti-inflammatory properties.",
    science:
      "Nerol (C₁₀H₁₈O) is an acyclic monoterpenoid alcohol and the cis-isomer of geraniol. Research shows antimicrobial activity against a broad range of bacteria and fungi. It demonstrates anti-inflammatory properties and antioxidant activity. Like geraniol, it may have neuroprotective properties and contributes to the overall therapeutic entourage of full-spectrum hemp.",
    strains: ["Neroli-forward hemp cultivars", "Some Haze phenotypes"],
    color: "#fce7f3",
    formula: "C₁₀H₁₈O",
    naturalSources: ["Neroli oil (orange blossom)", "Lemongrass", "Hops", "Ginger", "Citrus peel", "Petitgrain"],
  },
  {
    slug: "nerolidol",
    name: "Nerolidol",
    aroma: "Floral · Woody · Citrus · Fresh Bark",
    aromatags: ["Floral", "Woody", "Citrus", "Fresh Bark"],
    effects: ["Sedating", "Antifungal", "Antiparasitic", "Anti-inflammatory", "Antioxidant"],
    description:
      "Nerolidol is a sesquiterpene alcohol with a complex, multi-layered aroma of fresh bark, flowers, and citrus. It is found in neroli, ginger, jasmine, and lemongrass. In hemp, it contributes to complex, sedating, floral-woody profiles. It is particularly notable for its antiparasitic properties and has been studied as a treatment for malaria.",
    science:
      "Nerolidol (C₁₅H₂₆O) is a sesquiterpene alcohol. Research has demonstrated significant antiparasitic activity against Plasmodium falciparum (malaria), Leishmania, and Trypanosoma. It shows potent antifungal activity and has been shown to enhance skin penetration of other compounds. Its sedative properties are well-documented in animal studies.",
    strains: ["Garlic Cocktail", "Tropic Super Jet", "Jungle Driver", "Moneyball", "Tropicana Cherry", "Jack Herer", "Skywalker OG", "Chemdawg 4", "Sour Kush"],
    color: "#ddd6fe",
    formula: "C₁₅H₂₆O",
    naturalSources: ["Neroli (orange blossom)", "Ginger", "Jasmine", "Lemongrass", "Tea tree", "Niaouli", "Lavender (minor)"],
  },
  {
    slug: "ocimene",
    name: "Ocimene",
    aroma: "Sweet · Herbal · Woody · Citrus",
    aromatags: ["Sweet", "Herbal", "Woody", "Citrus"],
    effects: ["Antiviral", "Antifungal", "Decongestant", "Anti-inflammatory", "Energizing"],
    description:
      "Ocimene is a sweet, herbal, woody terpene found in mint, parsley, orchids, and kumquats. In hemp, it contributes to complex, sweet, tropical aroma profiles and is often associated with uplifting, energizing effects. It is a highly volatile terpene that evaporates quickly, making it a prominent top note in the aroma of fresh-cut cannabis.",
    science:
      "Ocimene (C₁₀H₁₆) exists as multiple isomers (alpha, beta-cis, beta-trans). Research has demonstrated antiviral properties against several viruses and antifungal activity. It shows anti-inflammatory effects and has been studied as a potential decongestant. Its high volatility makes it one of the first terpenes detected when smelling fresh hemp flower.",
    strains: ["Pineapple Treat", "Marshmallow Mountain", "Cake N Bake", "Clementine", "Dutch Treat", "Strawberry Cough", "Golden Goat"],
    color: "#fef3c7",
    formula: "C₁₀H₁₆",
    naturalSources: ["Mint", "Parsley", "Orchids", "Kumquats", "Basil", "Pepper", "Tarragon", "Mangoes"],
  },
  {
    slug: "pulegone",
    name: "Pulegone",
    aroma: "Minty · Camphor · Herbal · Cool",
    aromatags: ["Minty", "Camphor", "Herbal", "Cool"],
    effects: ["Memory support", "Antifungal", "Insecticidal", "Acetylcholinesterase inhibitor"],
    description:
      "Pulegone is a minty, camphor-like monoterpenoid ketone found in pennyroyal, peppermint, and catnip. In hemp, it contributes to cool, herbal, minty aroma profiles. It is particularly interesting for its memory-enhancing properties and has been studied as a potential treatment for Alzheimer's disease. It is also a natural insect repellent.",
    science:
      "Pulegone (C₁₀H₁₆O) is a cyclic monoterpenoid ketone. Research has demonstrated it inhibits acetylcholinesterase, the enzyme that breaks down acetylcholine, which may explain its memory-supporting properties. It shows antifungal activity and is a potent natural insecticide. Note: at very high doses in isolation it can be hepatotoxic, but trace amounts in hemp are considered safe.",
    strains: ["Pennyroyal-influenced cultivars", "Some OG phenotypes"],
    color: "#d1fae5",
    formula: "C₁₀H₁₆O",
    naturalSources: ["Pennyroyal mint (Mentha pulegium)", "Peppermint (minor)", "Catnip", "Spearmint (trace)", "Buchu leaves"],
  },
  {
    slug: "sabinene",
    name: "Sabinene",
    aroma: "Spicy · Woody · Citrus · Pepper",
    aromatags: ["Spicy", "Woody", "Citrus", "Pepper"],
    effects: ["Antioxidant", "Anti-inflammatory", "Antibacterial", "Digestive support"],
    description:
      "Sabinene is a bicyclic monoterpene with a spicy, woody, citrus-pepper aroma. It is found in black pepper, nutmeg, and carrot seeds. In hemp, it contributes to spicy, complex aroma profiles. It is a powerful antioxidant and has been studied for digestive health benefits. Sabinene is one of the terpenes responsible for the characteristic spicy note in black pepper.",
    science:
      "Sabinene (C₁₀H₁₆) is a bicyclic monoterpene. Research demonstrates significant antioxidant activity and anti-inflammatory properties. It shows antibacterial activity against food-borne pathogens and has been studied for hepatoprotective (liver-protecting) effects. It is also a precursor to many other important terpenes in the biosynthetic pathway.",
    strains: ["Super Silver Haze", "Northern Lights", "Trainwreck"],
    color: "#fed7aa",
    formula: "C₁₀H₁₆",
    naturalSources: ["Black pepper", "Nutmeg", "Carrot seeds", "Oak moss", "Tea tree (minor)", "Marjoram", "Holm oak"],
  },
  {
    slug: "sabinene-hydrate",
    name: "Sabinene Hydrate",
    aroma: "Spicy · Herbal · Woody · Pepper",
    aromatags: ["Spicy", "Herbal", "Woody", "Pepper"],
    effects: ["Antibacterial", "Antifungal", "Anti-inflammatory", "Antioxidant"],
    description:
      "Sabinene hydrate is the hydrated form of sabinene, with a similar spicy, herbal, woody-pepper aroma but with additional herbal complexity. It is found in marjoram and various spice plants. In hemp, it contributes to complex spicy-herbal profiles. It has demonstrated strong antimicrobial properties.",
    science:
      "Sabinene hydrate (C₁₀H₁₈O) is a bicyclic monoterpenoid alcohol. Research shows strong antibacterial and antifungal activity, particularly against food-borne pathogens. It demonstrates anti-inflammatory properties and antioxidant activity. As a component of marjoram essential oil, it contributes to that herb's traditional use as an antimicrobial agent.",
    strains: ["Marjoram-influenced cultivars", "Various spice-forward hemp strains"],
    color: "#fdba74",
    formula: "C₁₀H₁₈O",
    naturalSources: ["Marjoram (Origanum majorana)", "Savory", "Thyme", "Carrot seed", "Cardamom (minor)"],
  },
  {
    slug: "terpineol",
    name: "Terpineol",
    aroma: "Lilac · Pine · Floral · Clove",
    aromatags: ["Lilac", "Pine", "Floral", "Clove"],
    effects: ["Sedating", "Antioxidant", "Antibacterial", "Anti-inflammatory", "Antitumor"],
    description:
      "Terpineol (alpha-terpineol) is a monoterpenoid alcohol with a beautiful lilac-pine-floral aroma. It is found in lilac, pine, and eucalyptus. In hemp, it contributes to floral, relaxing profiles and is strongly associated with sedating, couch-lock effects. It is often found alongside linalool and myrcene in indica-dominant strains.",
    science:
      "alpha-Terpineol (C₁₀H₁₈O) is a cyclic monoterpenoid alcohol. Research has demonstrated significant sedative effects, with animal studies showing it reduces locomotor activity and increases sleep time. It shows potent antioxidant activity and has been studied for anti-tumor properties against several cancer cell lines. It also demonstrates strong antibacterial activity.",
    strains: ["Cloudburst", "Kimbo Kush", "Pineapple Treat", "Kaia Kush", "Moneyball", "Garlic Cocktail", "OG Kush", "Jack Herer", "White Widow", "Girl Scout Cookies"],
    color: "#c4b5fd",
    formula: "C₁₀H₁₈O",
    naturalSources: ["Lilac flowers", "Pine trees", "Eucalyptus", "Lime peel", "Petitgrain", "Cajuput", "Marjoram"],
  },
  {
    slug: "terpinolene",
    name: "Terpinolene",
    aroma: "Fresh · Floral · Herbal · Pine · Citrus",
    aromatags: ["Fresh", "Floral", "Herbal", "Pine"],
    effects: ["Antioxidant", "Sedating", "Antibacterial", "Antifungal", "Antitumor"],
    description:
      "Terpinolene is a multifaceted monoterpene with a complex aroma combining fresh, floral, herbal, pine, and citrus notes. It is found in apples, cumin, lilac, and nutmeg. In hemp, it is the dominant terpene in some sativa-leaning strains and is associated with uplifting, creative effects despite also having sedative properties. It is one of the most complex-smelling terpenes.",
    science:
      "Terpinolene (C₁₀H₁₆) is a cyclic monoterpene. Research has demonstrated potent antioxidant activity and significant antifungal properties. A notable study found terpinolene inhibited the proliferation of brain tumor cells. It also shows antibacterial activity and has sedative effects in animal studies, despite being associated with uplifting strains — demonstrating the complexity of the entourage effect.",
    strains: ["Pineapple Treat", "Jungle Driver", "Jack Herer", "Ghost Train Haze", "Chernobyl", "Dutch Treat", "XJ-13"],
    color: "#a7f3d0",
    formula: "C₁₀H₁₆",
    naturalSources: ["Apples", "Cumin", "Lilac", "Nutmeg", "Tea tree", "Conifers", "Sage", "Rosemary"],
  },
  {
    slug: "valencene",
    name: "Valencene",
    aroma: "Sweet Orange · Citrus · Fresh · Woody",
    aromatags: ["Sweet Orange", "Citrus", "Fresh", "Woody"],
    effects: ["Anti-inflammatory", "Insect repellent", "Skin-soothing", "Mood-lifting"],
    description:
      "Valencene is a sesquiterpene named after Valencia oranges, which are its primary natural source. It has a beautiful, sweet, fresh orange-citrus aroma with woody undertones. In hemp, it contributes to bright, citrusy, tropical aroma profiles and is associated with uplifting, mood-enhancing effects. It is also a natural insect repellent.",
    science:
      "Valencene (C₁₅H₂₄) is a bicyclic sesquiterpene. Research has demonstrated significant anti-inflammatory properties through inhibition of inflammatory cytokines. It shows insect-repellent activity comparable to DEET in some studies. It is also being studied for skin-protective properties, including protection against UV-induced skin damage. It is widely used in the fragrance and flavor industries.",
    strains: ["Pineapple Treat", "Kimbo Kush", "Kaia Kush", "Moneyball", "Tangie", "Agent Orange", "Clementine", "Sour Tangie"],
    color: "#fed7aa",
    formula: "C₁₅H₂₄",
    naturalSources: ["Valencia oranges", "Navel oranges", "Tangerines", "Grapefruit", "Clementines", "Other citrus fruits"],
  },
];

export function getTerpeneBySlug(slug: string): TerpeneData | undefined {
  return TERPENES.find(t => t.slug === slug);
}

export function getTerpenesByCategory(slugs: string[]): TerpeneData[] {
  return TERPENES.filter(t => slugs.includes(t.slug));
}

// Primary terpenes (most therapeutically significant and commonly found)
export const PRIMARY_TERPENE_SLUGS = [
  "beta-myrcene",
  "limonene",
  "beta-caryophyllene",
  "linalool",
  "alpha-pinene",
  "terpinolene",
  "alpha-humulene",
  "eucalyptol",
  "ocimene",
];
