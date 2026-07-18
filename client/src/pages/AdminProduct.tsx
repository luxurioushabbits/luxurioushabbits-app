/**
 * Admin Add/Edit Product Page — Luxurious Habbits
 * Full product form with image upload and COA PDF upload via S3
 */
import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import SEO from "@/components/SEO";
import { Upload, FileText, Image, ChevronLeft, Save, Loader2, X, Star, GripVertical } from "lucide-react";
import { toast } from "sonner";

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "oklch(0.07 0 0)",
  border: "1px solid oklch(1 0 0 / 12%)",
  borderRadius: "6px",
  padding: "0.65rem 0.9rem",
  color: "oklch(0.85 0 0)",
  fontFamily: "'Inter', sans-serif",
  fontSize: "0.8rem",
  outline: "none",
  boxSizing: "border-box",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: "pointer",
};

const labelStyle: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  fontSize: "0.62rem",
  color: "oklch(0.45 0 0)",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  display: "block",
  marginBottom: "0.35rem",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", letterSpacing: "0.1em", color: "oklch(0.70 0 0)", borderBottom: "1px solid oklch(1 0 0 / 8%)", paddingBottom: "0.5rem", marginBottom: "1.25rem" }}>
      {children}
    </div>
  );
}

async function uploadFile(file: File, endpoint: string): Promise<string> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": file.type },
    body: file,
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Upload failed" }));
    throw new Error(err.error ?? "Upload failed");
  }
  const data = await res.json();
  return data.url;
}

export default function AdminProduct() {
  const { id } = useParams<{ id?: string }>();
  const [, setLocation] = useLocation();
  const { user, loading: authLoading } = useAuth();
  const isEdit = !!id;

  const utils = trpc.useUtils();

  const [form, setForm] = useState({
    vendorId: 0,
    name: "",
    slug: "",
    description: "",
    tagline: "",
    category: "flower" as "flower" | "extract" | "edible" | "tincture" | "topical" | "accessory" | "other",
    strainType: "" as "" | "indica" | "sativa" | "hybrid",
    thcaPercent: "",
    cbdPercent: "",
    terpenes: "",
    effectTags: "",
    genetics: "",
    cultivation: "",
    weightGrams: "",
    retailPrice: "",
    wholesalePrice: "",
    imageUrl: "",
    coaUrl: "",
    coaLab: "",
    coaBatch: "",
    isFeatured: false,
    isActive: true,
    metaDescription: "",
    variationLabel: "",
    parentProductId: "",
  });

  const [imageUploading, setImageUploading] = useState(false);
  const [galleryImages, setGalleryImages] = useState<Array<{ id: number; imageUrl: string; altText?: string | null; sortOrder: number }>>([]);
  const [coaUploading, setCoaUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [parsedTerpenes, setParsedTerpenes] = useState<Array<{ slug: string; name: string; percentage: string | null }> | null>(null);
  const [terpenesSaved, setTerpenesSaved] = useState(false);
  // Inline variation price editing state: { [productId]: { retailPrice, wholesalePrice } }
  const [variationPrices, setVariationPrices] = useState<Record<number, { retailPrice: string; wholesalePrice: string }>>({});

  const vendorsQuery = trpc.admin.vendors.list.useQuery();
  const saveTerpenesMutation = trpc.terpenes.saveTerpenes.useMutation({
    onSuccess: () => { setTerpenesSaved(true); toast.success("Terpenes saved — product will appear on terpene pages"); },
    onError: (err) => toast.error(err.message),
  });
  const productTerpenesQuery = trpc.terpenes.getProductTerpenes.useQuery(
    { productId: parseInt(id ?? "0") },
    { enabled: isEdit && !!id }
  );
  const productQuery = trpc.admin.products.get.useQuery(
    { id: parseInt(id ?? "0") },
    { enabled: isEdit && !!id }
  );

  const addImageMutation = trpc.admin.products.addImage.useMutation({
    onSuccess: () => { utils.admin.products.get.invalidate({ id: parseInt(id ?? "0") }); },
    onError: (err) => toast.error(err.message),
  });
  const removeImageMutation = trpc.admin.products.removeImage.useMutation({
    onSuccess: () => { utils.admin.products.get.invalidate({ id: parseInt(id ?? "0") }); },
    onError: (err) => toast.error(err.message),
  });
  const setPrimaryMutation = trpc.admin.products.setPrimaryImage.useMutation({
    onSuccess: (_, vars) => {
      setForm(f => ({ ...f, imageUrl: vars.imageUrl }));
      toast.success("Primary image updated");
    },
    onError: (err) => toast.error(err.message),
  });

  const updateVariationPriceMutation = trpc.admin.products.updateVariationPrice.useMutation({
    onSuccess: (_, vars) => {
      utils.admin.products.get.invalidate({ id: parseInt(id ?? "0") });
      toast.success(`Price updated`);
    },
    onError: (err) => toast.error(err.message),
  });

  const createMutation = trpc.admin.products.create.useMutation({
    onSuccess: () => {
      utils.admin.products.list.invalidate();
      utils.catalog.list.invalidate();
      toast.success("Product created successfully");
      setLocation("/admin");
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = trpc.admin.products.update.useMutation({
    onSuccess: () => {
      utils.admin.products.list.invalidate();
      utils.catalog.list.invalidate();
      toast.success("Product updated successfully");
      setLocation("/admin");
    },
    onError: (err) => toast.error(err.message),
  });

  // Populate gallery images from query
  useEffect(() => {
    if (isEdit && productQuery.data?.images) {
      const sorted = [...productQuery.data.images].sort((a, b) => a.sortOrder - b.sortOrder);
      setGalleryImages(sorted);
    }
  }, [isEdit, productQuery.data?.images]);

  // Populate variation prices from sibling variations
  useEffect(() => {
    if (isEdit && productQuery.data?.siblingVariations?.length) {
      const prices: Record<number, { retailPrice: string; wholesalePrice: string }> = {};
      for (const v of productQuery.data.siblingVariations) {
        prices[v.id] = {
          retailPrice: v.retailPrice ?? "",
          wholesalePrice: v.wholesalePrice ?? "",
        };
      }
      setVariationPrices(prices);
    }
  }, [isEdit, productQuery.data?.siblingVariations]);

  // Populate form when editing
  useEffect(() => {
    if (isEdit && productQuery.data) {
      const p = productQuery.data.product;
      setForm({
        vendorId: p.vendorId,
        name: p.name,
        slug: p.slug,
        description: p.description ?? "",
        tagline: p.tagline ?? "",
        category: p.category,
        strainType: (p.strainType as any) ?? "",
        thcaPercent: p.thcaPercent ?? "",
        cbdPercent: p.cbdPercent ?? "",
        terpenes: p.terpenes ?? "",
        effectTags: p.effectTags ?? "",
        genetics: (p as any).genetics ?? "",
        cultivation: (p as any).cultivation ?? "",
        weightGrams: p.weightGrams ?? "",
        retailPrice: p.retailPrice,
        wholesalePrice: p.wholesalePrice ?? "",
        imageUrl: p.imageUrl ?? "",
        coaUrl: p.coaUrl ?? "",
        coaLab: p.coaLab ?? "",
        coaBatch: p.coaBatch ?? "",
        isFeatured: p.isFeatured,
        isActive: p.isActive,
        metaDescription: p.metaDescription ?? "",
        variationLabel: p.variationLabel ?? "",
        parentProductId: p.parentProductId ? String(p.parentProductId) : "",
      });
    }
  }, [isEdit, productQuery.data]);

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    setForm(f => ({ ...f, name, slug: isEdit ? f.slug : slug }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const invalidFile = files.find(f => !f.type.startsWith("image/"));
    if (invalidFile) { toast.error("Please select image files only"); return; }
    setImageUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const url = await uploadFile(files[i], "/api/upload/product-image");
        if (isEdit && id) {
          // Add to gallery in DB
          await addImageMutation.mutateAsync({
            productId: parseInt(id),
            imageUrl: url,
            sortOrder: galleryImages.length + i,
          });
          setGalleryImages(prev => [...prev, { id: Date.now() + i, imageUrl: url, sortOrder: prev.length }]);
        } else {
          // Not saved yet — just set as primary for now
          setForm(f => ({ ...f, imageUrl: url }));
        }
        // Set first uploaded image as primary if none set
        if (i === 0 && !form.imageUrl) {
          setForm(f => ({ ...f, imageUrl: url }));
        }
      }
      toast.success(files.length > 1 ? `${files.length} images uploaded` : "Image uploaded");
    } catch (err: any) {
      toast.error(err.message ?? "Image upload failed");
    } finally {
      setImageUploading(false);
      e.target.value = "";
    }
  };

  const handleRemoveGalleryImage = async (imageId: number, imageUrl: string) => {
    if (isEdit) {
      await removeImageMutation.mutateAsync({ imageId });
    }
    setGalleryImages(prev => prev.filter(img => img.id !== imageId));
    if (form.imageUrl === imageUrl) {
      const remaining = galleryImages.filter(img => img.id !== imageId);
      setForm(f => ({ ...f, imageUrl: remaining[0]?.imageUrl ?? "" }));
    }
  };

  const handleSetPrimary = async (imageUrl: string) => {
    if (isEdit && id) {
      await setPrimaryMutation.mutateAsync({ productId: parseInt(id), imageUrl });
    } else {
      setForm(f => ({ ...f, imageUrl }));
    }
  };

  const handleCoaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") { toast.error("Please select a PDF file"); return; }
    setCoaUploading(true);
    setParsedTerpenes(null);
    setTerpenesSaved(false);
    try {
      const res = await fetch("/api/upload/coa", {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
        credentials: "include",
      });
      if (!res.ok) { const err = await res.json().catch(() => ({ error: "Upload failed" })); throw new Error(err.error ?? "Upload failed"); }
      const data = await res.json();
      setForm(f => ({ ...f, coaUrl: data.url }));
      if (data.terpenes && data.terpenes.length > 0) {
        setParsedTerpenes(data.terpenes);
        toast.success(`COA uploaded — ${data.terpenes.filter((t: any) => t.percentage && parseFloat(t.percentage) > 0).length} terpenes detected`);
      } else {
        toast.success("COA uploaded");
      }
    } catch (err: any) {
      toast.error(err.message ?? "COA upload failed");
    } finally {
      setCoaUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vendorId) { toast.error("Please select a vendor"); return; }
    if (!form.retailPrice) { toast.error("Retail price is required"); return; }

    setSaving(true);
    try {
      const payload = {
        ...form,
        strainType: (form.strainType || undefined) as "indica" | "sativa" | "hybrid" | undefined,
        category: form.category as "flower" | "extract" | "edible" | "tincture" | "topical" | "accessory" | "other",
        imageUrl: form.imageUrl || undefined,
        coaUrl: form.coaUrl || undefined,
        coaLab: form.coaLab || undefined,
        coaBatch: form.coaBatch || undefined,
        description: form.description || undefined,
        tagline: form.tagline || undefined,
        thcaPercent: form.thcaPercent || undefined,
        cbdPercent: form.cbdPercent || undefined,
        terpenes: form.terpenes || undefined,
        effectTags: form.effectTags || undefined,
        genetics: form.genetics || undefined,
        cultivation: form.cultivation || undefined,
        weightGrams: form.weightGrams || undefined,
        wholesalePrice: form.wholesalePrice || undefined,
        metaDescription: form.metaDescription || undefined,
        variationLabel: form.variationLabel || undefined,
        parentProductId: form.parentProductId ? parseInt(form.parentProductId) : undefined,
      };

      if (isEdit) {
        await updateMutation.mutateAsync({ id: parseInt(id!), ...payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) return null;
  if (!user || user.role !== "admin") {
    return (
      <div style={{ background: "oklch(0.04 0 0)", minHeight: "100vh", paddingTop: "72px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: "'Inter', sans-serif", color: "oklch(0.40 0 0)" }}>Access denied.</div>
      </div>
    );
  }

  return (
    <div style={{ background: "oklch(0.04 0 0)", minHeight: "100vh", paddingTop: "72px" }}>
      <SEO title={`${isEdit ? "Edit" : "Add"} Product — Admin | Luxurious Habbits`} />

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2.5rem" }}>
          <button
            onClick={() => setLocation("/admin")}
            style={{ background: "none", border: "none", color: "oklch(0.40 0 0)", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: "0.3rem", fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", letterSpacing: "0.08em", textTransform: "uppercase", transition: "color 150ms ease" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#bf5fff"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "oklch(0.40 0 0)"}
          >
            <ChevronLeft size={14} /> Back to Admin
          </button>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.8rem", letterSpacing: "0.1em", color: "oklch(0.96 0 0)" }}>
            {isEdit ? "EDIT PRODUCT" : "ADD PRODUCT"}
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>

          {/* ── BASIC INFO ── */}
          <div style={{ background: "oklch(0.06 0 0)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "12px", padding: "2rem" }}>
            <SectionTitle>Basic Information</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <Field label="Vendor *">
                <select
                  style={selectStyle}
                  value={form.vendorId}
                  onChange={e => setForm(f => ({ ...f, vendorId: parseInt(e.target.value) }))}
                  required
                >
                  <option value={0}>Select vendor...</option>
                  {vendorsQuery.data?.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </Field>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <Field label="Product Name *">
                  <input style={inputStyle} required value={form.name} onChange={e => handleNameChange(e.target.value)} placeholder="e.g. Jealousy" />
                </Field>
                <Field label="URL Slug *">
                  <input style={inputStyle} required value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="e.g. jealousy" />
                </Field>
              </div>

              <Field label="Tagline">
                <input style={inputStyle} value={form.tagline} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))} placeholder="Short headline shown on product cards" maxLength={255} />
              </Field>

              <Field label="Description">
                <textarea
                  style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }}
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Describe the strain, aroma, experience..."
                />
              </Field>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <Field label="Category *">
                  <select style={selectStyle} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as any }))}>
                    <option value="flower">Flower</option>
                    <option value="extract">Extract</option>
                    <option value="preroll">Pre-Roll</option>
                    <option value="edible">Edible</option>
                    <option value="tincture">Tincture</option>
                    <option value="topical">Topical</option>
                    <option value="accessory">Accessory</option>
                    <option value="other">Other</option>
                  </select>
                </Field>
                <Field label="Strain Type">
                  <select style={selectStyle} value={form.strainType} onChange={e => setForm(f => ({ ...f, strainType: e.target.value as any }))}>
                    <option value="">Not specified</option>
                    <option value="indica">Indica</option>
                    <option value="sativa">Sativa</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </Field>
              </div>
            </div>
          </div>

          {/* ── PRICING ── */}
          <div style={{ background: "oklch(0.06 0 0)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "12px", padding: "2rem" }}>
            <SectionTitle>Pricing</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
              <Field label="Retail Price (USD) *">
                <input style={inputStyle} required type="number" step="0.01" min="0" value={form.retailPrice} onChange={e => setForm(f => ({ ...f, retailPrice: e.target.value }))} placeholder="49.99" />
              </Field>
              <Field label="Wholesale / Cost (USD)">
                <input style={inputStyle} type="number" step="0.01" min="0" value={form.wholesalePrice} onChange={e => setForm(f => ({ ...f, wholesalePrice: e.target.value }))} placeholder="30.00" />
              </Field>
              <Field label="Base Weight (grams)">
                <input style={inputStyle} type="number" step="0.1" min="0" value={form.weightGrams} onChange={e => setForm(f => ({ ...f, weightGrams: e.target.value }))} placeholder="3.5" />
              </Field>
            </div>
          </div>

          {/* ── VARIATION GROUPING & PRICE MANAGER ── */}
          <div style={{ background: "oklch(0.06 0 0)", border: "1px solid #bf5fff22", borderRadius: "12px", padding: "2rem" }}>
            <SectionTitle>Variation Grouping & Prices</SectionTitle>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "oklch(0.45 0 0)", marginBottom: "1.25rem", lineHeight: 1.6 }}>
              Set this product's size label and link it to a parent. Once linked, all variations in the group appear below with inline price controls.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
              <Field label="Variation Label (e.g. 3.5g, 7g, 28g, 1oz, 1lb)">
                <input
                  style={inputStyle}
                  value={form.variationLabel}
                  onChange={e => setForm(f => ({ ...f, variationLabel: e.target.value }))}
                  placeholder="e.g. 3.5g"
                  maxLength={100}
                />
              </Field>
              <Field label="Parent Product ID (leave blank if this IS the parent)">
                <input
                  style={inputStyle}
                  type="number"
                  min="1"
                  value={form.parentProductId}
                  onChange={e => setForm(f => ({ ...f, parentProductId: e.target.value }))}
                  placeholder="e.g. 42"
                />
              </Field>
            </div>

            {/* Inline variation price manager — shown when sibling variations exist */}
            {isEdit && productQuery.data?.siblingVariations && productQuery.data.siblingVariations.length > 1 && (
              <div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "oklch(0.40 0 0)", marginBottom: "0.75rem" }}>
                  All Variations in this Group — Edit Prices Inline
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {productQuery.data.siblingVariations
                    .slice()
                    .sort((a, b) => (a.variationLabel ?? a.name).localeCompare(b.variationLabel ?? b.name))
                    .map(v => {
                      const isCurrentProduct = v.id === parseInt(id ?? "0");
                      const prices = variationPrices[v.id] ?? { retailPrice: v.retailPrice ?? "", wholesalePrice: v.wholesalePrice ?? "" };
                      return (
                        <div
                          key={v.id}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr 1fr auto",
                            gap: "0.75rem",
                            alignItems: "center",
                            background: isCurrentProduct ? "#bf5fff0a" : "oklch(0.05 0 0)",
                            border: isCurrentProduct ? "1px solid #bf5fff33" : "1px solid oklch(1 0 0 / 8%)",
                            borderRadius: "8px",
                            padding: "0.75rem 1rem",
                          }}
                        >
                          {/* Label */}
                          <div>
                            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", fontWeight: 700, color: isCurrentProduct ? "#bf5fff" : "oklch(0.75 0 0)" }}>
                              {v.variationLabel ?? v.name}
                              {isCurrentProduct && <span style={{ fontSize: "0.55rem", marginLeft: "0.4rem", color: "oklch(0.40 0 0)", fontWeight: 400 }}>← this product</span>}
                            </div>
                            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", color: "oklch(0.35 0 0)", marginTop: "2px" }}>ID #{v.id}</div>
                          </div>

                          {/* Retail price */}
                          <div>
                            <label style={{ ...labelStyle, marginBottom: "0.2rem" }}>Retail Price ($)</label>
                            <input
                              style={{ ...inputStyle, padding: "0.45rem 0.7rem", fontSize: "0.78rem" }}
                              type="number"
                              step="0.01"
                              min="0"
                              value={prices.retailPrice}
                              onChange={e => setVariationPrices(prev => ({ ...prev, [v.id]: { ...prices, retailPrice: e.target.value } }))}
                              placeholder="0.00"
                            />
                          </div>

                          {/* Wholesale price */}
                          <div>
                            <label style={{ ...labelStyle, marginBottom: "0.2rem" }}>Wholesale ($)</label>
                            <input
                              style={{ ...inputStyle, padding: "0.45rem 0.7rem", fontSize: "0.78rem" }}
                              type="number"
                              step="0.01"
                              min="0"
                              value={prices.wholesalePrice}
                              onChange={e => setVariationPrices(prev => ({ ...prev, [v.id]: { ...prices, wholesalePrice: e.target.value } }))}
                              placeholder="0.00"
                            />
                          </div>

                          {/* Save button */}
                          <button
                            onClick={() => {
                              if (!prices.retailPrice) { toast.error("Retail price is required"); return; }
                              updateVariationPriceMutation.mutate({
                                id: v.id,
                                retailPrice: prices.retailPrice,
                                wholesalePrice: prices.wholesalePrice || undefined,
                              });
                            }}
                            disabled={updateVariationPriceMutation.isPending}
                            style={{
                              background: "#bf5fff18",
                              border: "1px solid #bf5fff44",
                              borderRadius: "6px",
                              padding: "0.45rem 0.9rem",
                              fontFamily: "'Inter', sans-serif",
                              fontSize: "0.68rem",
                              fontWeight: 700,
                              letterSpacing: "0.08em",
                              textTransform: "uppercase",
                              color: "#bf5fff",
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                              alignSelf: "flex-end",
                              marginTop: "1.1rem",
                            }}
                          >
                            Save
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>

          {/* ── STRAIN DETAILS ── */}
          <div style={{ background: "oklch(0.06 0 0)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "12px", padding: "2rem" }}>
            <SectionTitle>Strain Details</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <Field label="THCA %">
                  <input style={inputStyle} type="number" step="0.01" min="0" max="100" value={form.thcaPercent} onChange={e => setForm(f => ({ ...f, thcaPercent: e.target.value }))} placeholder="25.4" />
                </Field>
                <Field label="CBD %">
                  <input style={inputStyle} type="number" step="0.01" min="0" max="100" value={form.cbdPercent} onChange={e => setForm(f => ({ ...f, cbdPercent: e.target.value }))} placeholder="0.5" />
                </Field>
              </div>
              <Field label="Terpenes (comma-separated)">
                <input style={inputStyle} value={form.terpenes} onChange={e => setForm(f => ({ ...f, terpenes: e.target.value }))} placeholder="Caryophyllene, Limonene, Myrcene" />
              </Field>
              <Field label="Effects (comma-separated)">
                <input style={inputStyle} value={form.effectTags} onChange={e => setForm(f => ({ ...f, effectTags: e.target.value }))} placeholder="Relaxing, Euphoric, Sleepy" />
              </Field>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <Field label="Genetics / Cross">
                  <input style={inputStyle} value={form.genetics} onChange={e => setForm(f => ({ ...f, genetics: e.target.value }))} placeholder="Baker's Dozen x Deluxe" />
                </Field>
                <Field label="Cultivation Method">
                  <input style={inputStyle} value={form.cultivation} onChange={e => setForm(f => ({ ...f, cultivation: e.target.value }))} placeholder="Indoor Hydro" />
                </Field>
              </div>
            </div>
          </div>

          {/* ── PRODUCT IMAGE GALLERY ── */}
          <div style={{ background: "oklch(0.06 0 0)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "12px", padding: "2rem" }}>
            <SectionTitle>Product Images</SectionTitle>

            {/* Upload button */}
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
              <label style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "oklch(0.09 0 0)", border: "1px solid oklch(1 0 0 / 12%)", borderRadius: "6px", padding: "0.65rem 1rem", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", fontWeight: 600, color: "oklch(0.65 0 0)", letterSpacing: "0.08em", textTransform: "uppercase", transition: "border-color 150ms ease" }}>
                {imageUploading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Upload size={14} />}
                {imageUploading ? "Uploading..." : "Add Images"}
                <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleImageUpload} disabled={imageUploading} />
              </label>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.62rem", color: "oklch(0.30 0 0)" }}>
                JPG, PNG, or WebP · Max 10MB per image · Multiple files supported
              </div>
            </div>

            {/* Gallery grid */}
            {(isEdit ? galleryImages : (form.imageUrl ? [{ id: 0, imageUrl: form.imageUrl, sortOrder: 0 }] : [])).length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "0.75rem" }}>
                {(isEdit ? galleryImages : (form.imageUrl ? [{ id: 0, imageUrl: form.imageUrl, sortOrder: 0 }] : [])).map((img) => (
                  <div
                    key={img.id}
                    style={{
                      position: "relative",
                      borderRadius: "8px",
                      overflow: "hidden",
                      border: form.imageUrl === img.imageUrl
                        ? "2px solid #bf5fff"
                        : "1px solid oklch(1 0 0 / 10%)",
                      background: "oklch(0.08 0 0)",
                      aspectRatio: "1",
                    }}
                  >
                    <img
                      src={img.imageUrl}
                      alt="Product"
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />

                    {/* Primary badge */}
                    {form.imageUrl === img.imageUrl && (
                      <div style={{
                        position: "absolute", bottom: 0, left: 0, right: 0,
                        background: "linear-gradient(transparent, #bf5fff99)",
                        padding: "0.5rem 0.4rem 0.3rem",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "0.2rem",
                      }}>
                        <Star size={9} fill="#fff" color="#fff" />
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.55rem", fontWeight: 700, color: "#fff", letterSpacing: "0.1em", textTransform: "uppercase" }}>Primary</span>
                      </div>
                    )}

                    {/* Hover overlay */}
                    <div style={{
                      position: "absolute", inset: 0,
                      background: "oklch(0 0 0 / 0%)",
                      display: "flex", alignItems: "flex-start", justifyContent: "flex-end",
                      padding: "0.4rem",
                      gap: "0.3rem",
                      opacity: 0,
                      transition: "opacity 150ms ease",
                    }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = "1"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "0"}
                    >
                      {form.imageUrl !== img.imageUrl && (
                        <button
                          type="button"
                          title="Set as primary"
                          onClick={() => handleSetPrimary(img.imageUrl)}
                          style={{ background: "#bf5fff", border: "none", borderRadius: "4px", padding: "4px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          <Star size={11} color="#fff" />
                        </button>
                      )}
                      <button
                        type="button"
                        title="Remove image"
                        onClick={() => handleRemoveGalleryImage(img.id, img.imageUrl)}
                        style={{ background: "#ef4444", border: "none", borderRadius: "4px", padding: "4px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <X size={11} color="#fff" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100px", border: "1px dashed oklch(1 0 0 / 12%)", borderRadius: "8px" }}>
                <div style={{ textAlign: "center" }}>
                  <Image size={24} style={{ color: "oklch(0.25 0 0)", margin: "0 auto 0.5rem" }} />
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.30 0 0)" }}>No images yet — upload above</div>
                </div>
              </div>
            )}

            {isEdit && galleryImages.length > 0 && (
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", color: "oklch(0.30 0 0)", marginTop: "0.75rem" }}>
                Hover over an image to set it as primary or remove it. The starred image is shown on product cards.
              </div>
            )}
          </div>

          {/* ── COA ── */}
          <div style={{ background: "oklch(0.06 0 0)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "12px", padding: "2rem" }}>
            <SectionTitle>Certificate of Analysis (COA)</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <Field label="Lab Name">
                  <input style={inputStyle} value={form.coaLab} onChange={e => setForm(f => ({ ...f, coaLab: e.target.value }))} placeholder="e.g. ACS Laboratory" />
                </Field>
                <Field label="Batch Number">
                  <input style={inputStyle} value={form.coaBatch} onChange={e => setForm(f => ({ ...f, coaBatch: e.target.value }))} placeholder="e.g. BATCH-2024-001" />
                </Field>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                <label style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "oklch(0.09 0 0)", border: "1px solid #00f5ff20", borderRadius: "6px", padding: "0.65rem 1rem", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", fontWeight: 600, color: "#00f5ff", letterSpacing: "0.08em", textTransform: "uppercase", transition: "background 150ms ease" }}>
                  {coaUploading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <FileText size={14} />}
                  {coaUploading ? "Uploading..." : "Upload COA PDF"}
                  <input type="file" accept="application/pdf" style={{ display: "none" }} onChange={handleCoaUpload} disabled={coaUploading} />
                </label>
                {form.coaUrl && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <a href={form.coaUrl} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "#00f5ff", textDecoration: "none" }}>
                      View uploaded COA
                    </a>
                    <button type="button" onClick={() => setForm(f => ({ ...f, coaUrl: "" }))} style={{ background: "none", border: "none", color: "oklch(0.35 0 0)", cursor: "pointer", padding: 0 }}>
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.62rem", color: "oklch(0.30 0 0)" }}>
                PDF only · Max 20MB · Terpenes auto-detected from COA
              </div>

              {/* Parsed terpenes from COA upload */}
              {parsedTerpenes && parsedTerpenes.length > 0 && (
                <div style={{ background: "oklch(0.04 0 0)", border: "1px solid #00f5ff20", borderRadius: "8px", padding: "1rem" }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.62rem", color: "#00f5ff", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                    Terpenes Detected from COA
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "0.75rem" }}>
                    {parsedTerpenes.filter(t => t.percentage && parseFloat(t.percentage) > 0).map(t => (
                      <span key={t.slug} style={{ background: "#00f5ff15", color: "#00f5ff", fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", fontWeight: 600, letterSpacing: "0.06em", padding: "0.2rem 0.55rem", borderRadius: "20px" }}>
                        {t.name} {t.percentage ? `${parseFloat(t.percentage).toFixed(3)}%` : ""}
                      </span>
                    ))}
                  </div>
                  {isEdit && !terpenesSaved && (
                    <button
                      type="button"
                      onClick={() => saveTerpenesMutation.mutate({ productId: parseInt(id!), terpenes: parsedTerpenes })}
                      disabled={saveTerpenesMutation.isPending}
                      style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "#00f5ff", color: "#000", border: "none", borderRadius: "6px", fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "0.5rem 1rem", cursor: "pointer" }}
                    >
                      {saveTerpenesMutation.isPending ? "Saving..." : "Save Terpene Tags"}
                    </button>
                  )}
                  {terpenesSaved && (
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "#4ade80" }}>✓ Terpenes saved — product linked to terpene pages</div>
                  )}
                  {!isEdit && (
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.62rem", color: "oklch(0.40 0 0)" }}>Save the product first, then re-upload the COA to link terpenes.</div>
                  )}
                </div>
              )}

              {/* Existing terpene tags (edit mode) */}
              {isEdit && productTerpenesQuery.data && productTerpenesQuery.data.length > 0 && !parsedTerpenes && (
                <div style={{ background: "oklch(0.04 0 0)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "8px", padding: "1rem" }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.62rem", color: "oklch(0.40 0 0)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Saved Terpene Tags</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                    {productTerpenesQuery.data.map((t: any) => (
                      <span key={t.terpeneSlug} style={{ background: "oklch(0.09 0 0)", color: "oklch(0.55 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", fontWeight: 600, letterSpacing: "0.06em", padding: "0.2rem 0.55rem", borderRadius: "20px", border: "1px solid oklch(1 0 0 / 8%)" }}>
                        {t.terpeneName} {t.percentage ? `${parseFloat(t.percentage).toFixed(3)}%` : ""}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── SEO + FLAGS ── */}
          <div style={{ background: "oklch(0.06 0 0)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "12px", padding: "2rem" }}>
            <SectionTitle>SEO & Visibility</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <Field label="Meta Description (for Google)">
                <textarea
                  style={{ ...inputStyle, minHeight: "72px", resize: "vertical" }}
                  value={form.metaDescription}
                  onChange={e => setForm(f => ({ ...f, metaDescription: e.target.value }))}
                  placeholder="Shop [Product Name] — premium Farm Bill compliant THCA hemp flower..."
                  maxLength={160}
                />
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", color: "oklch(0.30 0 0)", marginTop: "0.25rem" }}>
                  {form.metaDescription.length}/160 characters
                </div>
              </Field>

              <div style={{ display: "flex", gap: "2rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                  <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))} style={{ accentColor: "#bf5fff" }} />
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "oklch(0.65 0 0)" }}>Featured product</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} style={{ accentColor: "#bf5fff" }} />
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "oklch(0.65 0 0)" }}>Active (visible on site)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={() => setLocation("/admin")}
              style={{ background: "none", border: "1px solid oklch(1 0 0 / 15%)", color: "oklch(0.50 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", padding: "0.75rem 1.5rem", borderRadius: "6px", cursor: "pointer" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-gold"
              style={{ opacity: saving ? 0.7 : 1 }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                {saving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={14} />}
                {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Product"}
              </span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
