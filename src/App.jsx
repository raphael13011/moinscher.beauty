import { useState, useEffect } from "react";

export default function App() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showCGV, setShowCGV] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const rechercher = async () => {
    if (!query.trim() || query.trim().length < 3) {
      setError("Entrez le nom d\u2019un produit (ex: La Roche-Posay Effaclar Duo)");
      return;
    }
    setError(null); setLoading(true); setResult(null);
    try {
      const response = await fetch("/api/dupe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim(), category }),
      });
      const data = await response.json();
      if (data.error) { setError("Erreur : " + data.error); }
      else { setResult(data); }
    } catch (err) { setError("Erreur r\u00E9seau, r\u00E9essayez"); }
    finally { setLoading(false); }
  };

  const reset = () => { setQuery(""); setResult(null); setError(null); setCategory("all"); };

  const savings = (original, dupe) => {
    const o = parseFloat(String(original).replace(/[^\d.,]/g, '').replace(',', '.'));
    const d = parseFloat(String(dupe).replace(/[^\d.,]/g, '').replace(',', '.'));
    if (!o || !d || o <= d) return null;
    return Math.round(((o - d) / o) * 100);
  };

  const getSearchUrl = (shopName, productName, brandName) => {
    const s = encodeURIComponent((brandName || '') + ' ' + productName);
    const urls = { "Amazon": `https://www.amazon.fr/s?k=${s}`, "Sephora": `https://www.sephora.fr/search?q=${s}`, "Nocib\u00E9": `https://www.nocibe.fr/catalogsearch/result/?q=${s}`, "iHerb": `https://fr.iherb.com/search?kw=${s}`, "CDiscount": `https://www.cdiscount.com/search/10/${s}.html`, "Typology": `https://www.typology.com/search?q=${s}` };
    return urls[shopName] || `https://www.google.fr/search?q=${s}+acheter`;
  };

  const renderCGV = () => (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center", padding: 16 }} onClick={() => setShowCGV(false)}>
      <div style={{ background: "#fffaf7", borderRadius: 20, padding: 32, maxWidth: 650, maxHeight: "80vh", overflowY: "auto", color: "#3d2b1f", fontSize: 13, lineHeight: 1.8 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20, fontWeight: 700, margin: 0 }}>Conditions G{"\u00E9"}n{"\u00E9"}rales</h2>
          <button onClick={() => setShowCGV(false)} style={{ background: "none", border: "none", color: "#a08070", fontSize: 22, cursor: "pointer" }}>{"\u2715"}</button>
        </div>
        <h3 style={{ color: "#9b5c5c", fontSize: 14, marginTop: 16, marginBottom: 6 }}>1. Objet du service</h3>
        <p>MoinsCher.beauty est un outil gratuit de recherche d{"\u2019"}alternatives cosm{"\u00E9"}tiques utilisant l{"\u2019"}intelligence artificielle. Les suggestions sont fournies {"\u00E0"} titre informatif uniquement.</p>
        <h3 style={{ color: "#9b5c5c", fontSize: 14, marginTop: 16, marginBottom: 6 }}>2. Caract{"\u00E8"}re indicatif</h3>
        <p><strong>Les alternatives propos{"\u00E9"}es ne constituent en aucun cas un avis dermatologique, m{"\u00E9"}dical ou professionnel.</strong></p>
        <h3 style={{ color: "#9b5c5c", fontSize: 14, marginTop: 16, marginBottom: 6 }}>3. Allergies</h3>
        <p>V{"\u00E9"}rifiez toujours la liste INCI compl{"\u00E8"}te avant tout achat. En cas de doute, consultez un dermatologue. MoinsCher.beauty d{"\u00E9"}cline toute responsabilit{"\u00E9"} en cas de r{"\u00E9"}action allergique.</p>
        <h3 style={{ color: "#9b5c5c", fontSize: 14, marginTop: 16, marginBottom: 6 }}>4. Liens d{"\u2019"}affiliation</h3>
        <p>Certains liens peuvent {"\u00EA"}tre des liens d{"\u2019"}affiliation. MoinsCher.beauty peut percevoir une commission sans surco{"\u00FB"}t pour l{"\u2019"}utilisateur.</p>
        <h3 style={{ color: "#9b5c5c", fontSize: 14, marginTop: 16, marginBottom: 6 }}>5. Donn{"\u00E9"}es personnelles</h3>
        <p>Aucune donn{"\u00E9"}e personnelle n{"\u2019"}est collect{"\u00E9"}e. Google Analytics est utilis{"\u00E9"} pour mesurer l{"\u2019"}audience de mani{"\u00E8"}re anonyme.</p>
        <h3 style={{ color: "#9b5c5c", fontSize: 14, marginTop: 16, marginBottom: 6 }}>6. Droit applicable</h3>
        <p>Droit fran{"\u00E7"}ais. Tribunaux comp{"\u00E9"}tents de Marseille, France.</p>
      </div>
    </div>
  );

  // ============ RESULTS ============
  if (result) {
    return (
      <div style={{ minHeight: "100vh", background: "#fffaf7", color: "#3d2b1f", fontFamily: "'DM Sans', -apple-system, sans-serif", padding: "0 16px" }}>
        <div style={{ maxWidth: 750, margin: "0 auto", paddingTop: 30, paddingBottom: 60 }}>
          <div style={{ textAlign: "center", marginBottom: 30 }}>
            <h2 onClick={reset} style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 24, fontWeight: 700, margin: "0 0 6px", cursor: "pointer" }}>MoinsCher<span style={{ color: "#9b5c5c" }}>.beauty</span></h2>
            <button onClick={reset} style={{ background: "none", border: "none", color: "#9b5c5c", fontSize: 13, cursor: "pointer", fontWeight: 500, fontFamily: "inherit" }}>{"\u2190"} Nouvelle recherche</button>
          </div>

          <div style={{ background: "#fff", border: "1px solid #ede5df", borderRadius: 20, padding: 28, marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: "#a08070", fontWeight: 600, marginBottom: 10, textTransform: "uppercase", letterSpacing: 2 }}>Produit original</div>
            <h3 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 6px" }}>{result.original.nom}</h3>
            <p style={{ fontSize: 14, color: "#7a6b62", margin: "0 0 12px" }}>{result.original.marque} {"\u2014"} {result.original.categorie}{result.original.contenance ? ` \u2014 ${result.original.contenance}` : ""}</p>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#3d2b1f" }}>{result.original.prix}</div>
            {result.original.actifs_principaux && (
              <div style={{ marginTop: 14, display: "flex", gap: 6, flexWrap: "wrap" }}>
                {result.original.actifs_principaux.map((a, i) => (
                  <span key={i} style={{ background: "#f5eeea", borderRadius: 20, padding: "5px 12px", fontSize: 12, color: "#7a6b62" }}>{a}</span>
                ))}
              </div>
            )}
          </div>

          <div style={{ fontSize: 11, color: "#a08070", fontWeight: 600, marginBottom: 14, textTransform: "uppercase", letterSpacing: 2 }}>Alternatives moins ch{"\u00E8"}res ({result.dupes.length})</div>

          {result.dupes.map((dupe, i) => {
            const pct = savings(result.original.prix_num || result.original.prix, dupe.prix_num || dupe.prix);
            return (
              <div key={i} style={{ background: "#fff", border: i === 0 ? "2px solid #9b5c5c" : "1px solid #ede5df", borderRadius: 20, padding: 24, marginBottom: 14, position: "relative" }}>
                {i === 0 && (<div style={{ position: "absolute", top: -13, left: 24, background: "linear-gradient(135deg, #9b5c5c, #c27878)", color: "#fff", padding: "5px 16px", borderRadius: 20, fontSize: 12, fontWeight: 600, letterSpacing: 0.5 }}>Meilleur dupe</div>)}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <h4 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px" }}>{dupe.nom}</h4>
                    <p style={{ fontSize: 13, color: "#7a6b62", margin: "0 0 10px" }}>{dupe.marque}</p>
                    <p style={{ fontSize: 13, color: "#a08070", margin: "0 0 10px", lineHeight: 1.6 }}>{dupe.pourquoi}</p>
                    {dupe.actifs_communs && (<div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>{dupe.actifs_communs.map((a, j) => (<span key={j} style={{ background: "#fce8e8", borderRadius: 20, padding: "3px 10px", fontSize: 11, color: "#9b5c5c", fontWeight: 500 }}>{a}</span>))}</div>)}
                  </div>
                  <div style={{ textAlign: "right", minWidth: 90 }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: "#9b5c5c" }}>{dupe.prix}</div>
                    {pct && (<div style={{ background: "#e8f5e9", color: "#2e7d32", padding: "4px 12px", borderRadius: 20, fontSize: 13, fontWeight: 600, marginTop: 6, display: "inline-block" }}>-{pct}%</div>)}
                    {dupe.contenance && (<div style={{ fontSize: 12, color: "#a08070", marginTop: 4 }}>{dupe.contenance}</div>)}
                  </div>
                </div>
                {dupe.score_similarite && (<div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 100, height: 5, background: "#f0ebe4", borderRadius: 3, overflow: "hidden" }}><div style={{ width: `${dupe.score_similarite}%`, height: "100%", background: "#9b5c5c", borderRadius: 3 }} /></div><span style={{ fontSize: 12, color: "#a08070" }}>{dupe.score_similarite}% similaire</span></div>)}
                {dupe.ou_acheter && (<div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>{dupe.ou_acheter.map((shop, j) => { const url = (shop.url && shop.url.length > 5) ? shop.url : getSearchUrl(shop.nom, dupe.nom, dupe.marque); return (<a key={j} href={url} target="_blank" rel="noopener noreferrer" style={{ background: "linear-gradient(135deg, #9b5c5c, #c27878)", borderRadius: 20, padding: "8px 18px", fontSize: 12, color: "#fff", fontWeight: 600, textDecoration: "none" }}>{shop.nom} {"\u2192"}</a>); })}</div>)}
              </div>
            );
          })}

          <div style={{ background: "#f5eeea", borderRadius: 20, padding: 28, textAlign: "center", marginTop: 20 }}>
            <p style={{ fontSize: 16, fontWeight: 600, margin: "0 0 8px" }}>Partagez {"\u00E0"} quelqu{"\u2019"}un qui paye trop cher</p>
            <button onClick={() => { if (navigator.share) { navigator.share({ title: "MoinsCher.beauty", url: "https://moinscher.beauty" }); } else { navigator.clipboard.writeText("https://moinscher.beauty"); alert("Lien copi\u00E9 !"); } }} style={{ background: "#9b5c5c", color: "#fff", border: "none", padding: "10px 28px", borderRadius: 20, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Partager</button>
          </div>
          <p style={{ textAlign: "center", fontSize: 11, color: "#a08070", marginTop: 20 }}>Suggestions bas{"\u00E9"}es sur l{"\u2019"}IA. V{"\u00E9"}rifiez toujours la liste INCI.</p>
        </div>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 0", borderTop: "1px solid #ede5df", textAlign: "center" }}>
          <button onClick={() => setShowCGV(true)} style={{ background: "none", border: "none", color: "#a08070", fontSize: 11, cursor: "pointer", textDecoration: "underline", fontFamily: "inherit" }}>Conditions G{"\u00E9"}n{"\u00E9"}rales & Mentions l{"\u00E9"}gales</button>
          <p style={{ color: "#a08070", fontSize: 11, margin: "8px 0 0" }}>{"\u00A9"} {new Date().getFullYear()} MoinsCher.beauty</p>
        </div>
        {showCGV && renderCGV()}
      </div>
    );
  }

  // ============ LANDING ============
  return (
    <div style={{ minHeight: "100vh", background: "#fffaf7", color: "#3d2b1f", fontFamily: "'DM Sans', -apple-system, sans-serif" }}>

      {/* HERO */}
      <div style={{ background: "linear-gradient(180deg, #f8ece6 0%, #fffaf7 100%)", padding: isMobile ? "50px 20px 40px" : "80px 20px 60px" }}>
        <div style={{ maxWidth: 650, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: isMobile ? 20 : 24, fontWeight: 700, marginBottom: 40, color: "#3d2b1f" }}>MoinsCher<span style={{ color: "#9b5c5c" }}>.beauty</span></div>

          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: isMobile ? 34 : 52, fontWeight: 800, margin: "0 0 20px", color: "#3d2b1f", lineHeight: 1.12 }}>
            Votre cr{"\u00E8"}me {"\u00E0"} 50{"\u20AC"} existe<br />{"\u00E0"} <span style={{ color: "#9b5c5c" }}>8{"\u20AC"}</span>. M{"\u00EA"}me composition.
          </h1>

          <p style={{ fontSize: isMobile ? 15 : 17, color: "#7a6b62", margin: "0 auto 32px", lineHeight: 1.7, maxWidth: 480 }}>
            Tapez le nom de votre produit. Notre IA compare les compositions INCI et trouve des alternatives jusqu{"\u2019"}{"\u00E0"} 10x moins ch{"\u00E8"}res.
          </p>

          {/* Search */}
          <div style={{ background: "#fff", borderRadius: 24, padding: isMobile ? 20 : 28, maxWidth: 540, margin: "0 auto", boxShadow: "0 12px 48px rgba(155,92,92,0.08)", border: "1px solid #ede5df" }}>
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && rechercher()}
              placeholder="Nom du produit ou de la marque..."
              style={{ width: "100%", padding: "16px 20px", background: "#faf5f2", border: "2px solid #ede5df", borderRadius: 14, color: "#3d2b1f", fontSize: 16, outline: "none", fontFamily: "inherit", boxSizing: "border-box", marginBottom: 14, transition: "border 0.2s" }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#9b5c5c"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "#ede5df"; }}
            />
            <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap", justifyContent: "center" }}>
              {[{ key: "all", label: "Tout" }, { key: "skincare", label: "Skincare" }, { key: "maquillage", label: "Maquillage" }, { key: "parfum", label: "Parfum" }, { key: "cheveux", label: "Cheveux" }].map(c => (
                <button key={c.key} onClick={() => setCategory(c.key)} style={{ background: category === c.key ? "#9b5c5c" : "transparent", border: `1px solid ${category === c.key ? "#9b5c5c" : "#ddd4cd"}`, color: category === c.key ? "#fff" : "#a08070", padding: "7px 16px", borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>{c.label}</button>
              ))}
            </div>
            <button onClick={rechercher} disabled={loading} style={{ width: "100%", padding: 16, background: loading ? "#c9a8a8" : "linear-gradient(135deg, #9b5c5c, #c27878)", border: "none", borderRadius: 14, color: "#fff", fontSize: 16, fontWeight: 700, cursor: loading ? "wait" : "pointer", fontFamily: "inherit", boxShadow: loading ? "none" : "0 6px 24px rgba(155,92,92,0.2)", letterSpacing: 0.5 }}>
              {loading ? "Recherche en cours..." : "D\u00C9COUVRIR LES ALTERNATIVES"}
            </button>
          </div>

          {error && (<div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 12, padding: 14, color: "#dc2626", fontSize: 14, maxWidth: 540, margin: "16px auto 0" }}>{error}</div>)}
          {loading && (<p style={{ color: "#9b5c5c", fontSize: 14, marginTop: 16 }}>L{"\u2019"}IA analyse les compositions et cherche des alternatives...</p>)}
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding: "28px 16px", borderBottom: "1px solid #ede5df" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", display: "flex", justifyContent: "center", gap: isMobile ? 16 : 48, flexWrap: "wrap", textAlign: "center" }}>
          {[{ val: "100%", label: "Gratuit" }, { val: "30 sec", label: "Par recherche" }, { val: "-50 \u00E0 -90%", label: "D\u2019\u00E9conomies" }, { val: "0 pub", label: "Ni tracking" }].map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#9b5c5c" }}>{s.val}</div>
              <div style={{ fontSize: 12, color: "#a08070", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Examples */}
      <div style={{ padding: isMobile ? "40px 16px" : "56px 16px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: isMobile ? 22 : 28, fontWeight: 700, margin: "0 0 8px", textAlign: "center" }}>Exemples de dupes</h2>
          <p style={{ fontSize: 13, color: "#a08070", margin: "0 0 24px", textAlign: "center" }}>Cliquez pour lancer la recherche</p>

          {(() => {
            const examples = [
              { product: "La Roche-Posay Effaclar Duo", price: "18,90\u20AC", dupe: "The Ordinary Niacinamide + Zinc", dupePrice: "6,90\u20AC", saving: "-63%", imgOrig: "/effaclar.jpg", imgDupe: "/ordinary-niacinamide.jpg" },
              { product: "Est\u00E9e Lauder Double Wear", price: "49\u20AC", dupe: "Maybelline SuperStay", dupePrice: "12,90\u20AC", saving: "-74%", imgOrig: "/double-wear.jpg", imgDupe: "/maybelline-superstay.jpg" },
              { product: "Dior Sauvage EDT", price: "95\u20AC", dupe: "Zara Vibrant Leather", dupePrice: "15,99\u20AC", saving: "-83%", imgOrig: "/dior-sauvage.jpg", imgDupe: "/zara-vibrant.jpg" },
              { product: "Charlotte Tilbury Pillow Talk", price: "35\u20AC", dupe: "Essence Cool Collagen", dupePrice: "3,49\u20AC", saving: "-90%", imgOrig: "/pillow-talk.jpg", imgDupe: "/essence-cool.jpg" },
              { product: "Drunk Elephant Protini", price: "72\u20AC", dupe: "CeraVe Cr\u00E8me Hydratante", dupePrice: "11,90\u20AC", saving: "-83%", imgOrig: "/drunk-elephant.jpg", imgDupe: "/cerave.jpg" }
            ];
            const [slide, setSlide] = useState(0);
            const prev = () => setSlide(s => s === 0 ? examples.length - 1 : s - 1);
            const next = () => setSlide(s => s === examples.length - 1 ? 0 : s + 1);
            const ex = examples[slide];
            return (
              <div style={{ position: "relative", maxWidth: 400, margin: "0 auto" }}>
                {/* Arrows */}
                <button onClick={prev} style={{ position: "absolute", left: -50, top: "50%", transform: "translateY(-50%)", background: "#f5eeea", border: "none", borderRadius: "50%", width: 40, height: 40, cursor: "pointer", fontSize: 18, color: "#9b5c5c", fontWeight: 700, display: isMobile ? "none" : "flex", alignItems: "center", justifyContent: "center" }}>{"\u2039"}</button>
                <button onClick={next} style={{ position: "absolute", right: -50, top: "50%", transform: "translateY(-50%)", background: "#f5eeea", border: "none", borderRadius: "50%", width: 40, height: 40, cursor: "pointer", fontSize: 18, color: "#9b5c5c", fontWeight: 700, display: isMobile ? "none" : "flex", alignItems: "center", justifyContent: "center" }}>{"\u203A"}</button>

                <div onClick={() => setQuery(ex.product)} style={{ background: "#fff", border: "1px solid #ede5df", borderRadius: 24, padding: 28, cursor: "pointer", transition: "all 0.3s", textAlign: "center" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#9b5c5c"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(155,92,92,0.1)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#ede5df"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 20, marginBottom: 20 }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ width: 90, height: 120, background: "#faf5f2", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", margin: "0 auto" }}>
                        <img src={ex.imgOrig} alt={ex.product} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} onError={(e) => { e.currentTarget.style.display = "none"; }} />
                      </div>
                      <div style={{ fontSize: 11, color: "#a08070", marginTop: 6, fontWeight: 500 }}>Original</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#3d2b1f", marginTop: 2 }}>{ex.price}</div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #9b5c5c, #c27878)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>VS</div>
                      <span style={{ background: "#e8f5e9", color: "#2e7d32", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{ex.saving}</span>
                    </div>

                    <div style={{ textAlign: "center" }}>
                      <div style={{ width: 90, height: 120, background: "#faf5f2", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", margin: "0 auto" }}>
                        <img src={ex.imgDupe} alt={ex.dupe} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} onError={(e) => { e.currentTarget.style.display = "none"; }} />
                      </div>
                      <div style={{ fontSize: 11, color: "#9b5c5c", marginTop: 6, fontWeight: 600 }}>Dupe</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#9b5c5c", marginTop: 2 }}>{ex.dupePrice}</div>
                    </div>
                  </div>

                  <div style={{ fontSize: 13, color: "#7a6b62" }}>{ex.product}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#9b5c5c", marginTop: 2 }}>vs. {ex.dupe}</div>
                </div>

                {/* Dots */}
                <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16 }}>
                  {examples.map((_, idx) => (
                    <button key={idx} onClick={() => setSlide(idx)} style={{ width: idx === slide ? 24 : 8, height: 8, borderRadius: 4, background: idx === slide ? "#9b5c5c" : "#ddd4cd", border: "none", cursor: "pointer", transition: "all 0.3s", padding: 0 }} />
                  ))}
                </div>

                {/* Swipe hint mobile */}
                {isMobile && (<p style={{ textAlign: "center", fontSize: 12, color: "#a08070", marginTop: 10 }}>Swipez ou cliquez les points</p>)}
              </div>
            );
          })()}
        </div>
      </div>

      {/* How it works */}
      <div style={{ background: "#f5eeea", padding: isMobile ? "40px 16px" : "56px 16px" }}>
        <div style={{ maxWidth: 650, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: isMobile ? 22 : 28, fontWeight: 700, margin: "0 0 32px", textAlign: "center" }}>Comment {"\u00E7"}a marche</h2>
          <div style={{ display: "flex", gap: 28, flexWrap: "wrap", justifyContent: "center" }}>
            {[{ s: "1", t: "Tapez votre produit", d: "Cr\u00E8me, s\u00E9rum, fond de teint, parfum ou shampoing." }, { s: "2", t: "L\u2019IA analyse", d: "Comparaison des compositions INCI et des actifs cl\u00E9s." }, { s: "3", t: "\u00C9conomisez", d: "3 \u00E0 5 alternatives avec les liens pour acheter." }].map((item, i) => (
              <div key={i} style={{ flex: "1 1 180px", maxWidth: 200, textAlign: "center" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#9b5c5c", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", fontSize: 20, fontWeight: 800 }}>{item.s}</div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{item.t}</div>
                <div style={{ fontSize: 13, color: "#7a6b62", lineHeight: 1.6 }}>{item.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div style={{ padding: isMobile ? "40px 16px" : "56px 16px" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: isMobile ? 22 : 26, fontWeight: 700, margin: "0 0 24px", textAlign: "center" }}>Questions fr{"\u00E9"}quentes</h2>
          {[
            { q: "C\u2019est vraiment gratuit ?", a: "Oui, 100% gratuit et sans inscription. Le site est financ\u00E9 par des liens d\u2019affiliation \u2014 si vous achetez via nos liens, nous touchons une petite commission, sans surco\u00FBt pour vous." },
            { q: "Les dupes ont-ils la m\u00EAme composition ?", a: "Ils partagent les m\u00EAmes actifs principaux dans des concentrations similaires. La texture et le packaging diff\u00E8rent, mais l\u2019efficacit\u00E9 est comparable." },
            { q: "Peaux sensibles ?", a: "V\u00E9rifiez toujours la liste INCI compl\u00E8te. En cas d\u2019allergie connue, faites un test sur une petite zone avant utilisation." },
            { q: "Pourquoi les grandes marques co\u00FBtent plus cher ?", a: "Marketing, packaging, R&D de marque et marge distributeur. Les actifs co\u00FBtent souvent le m\u00EAme prix, que le flacon soit \u00E0 8\u20AC ou 80\u20AC." }
          ].map((faq, i) => (
            <div key={i} style={{ background: "#fff", border: "1px solid #ede5df", borderRadius: 16, padding: 20, marginBottom: 10 }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{faq.q}</div>
              <div style={{ fontSize: 13, color: "#7a6b62", lineHeight: 1.7 }}>{faq.a}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div style={{ background: "linear-gradient(135deg, #9b5c5c, #c27878)", padding: isMobile ? "40px 16px" : "50px 16px", textAlign: "center" }}>
        <div style={{ maxWidth: 460, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: isMobile ? 22 : 28, fontWeight: 700, margin: "0 0 12px", color: "#fff" }}>Arr{"\u00EA"}tez de surpayer vos cosm{"\u00E9"}tiques</h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.85)", margin: "0 0 24px", lineHeight: 1.6 }}>M{"\u00EA"}me formule, m{"\u00EA"}me efficacit{"\u00E9"}, prix divis{"\u00E9"} par 5.</p>
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ background: "#fff", color: "#9b5c5c", border: "none", padding: "14px 40px", borderRadius: 20, fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Trouver mes dupes</button>
        </div>
      </div>

      {/* Footer */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px", textAlign: "center" }}>
        <button onClick={() => setShowCGV(true)} style={{ background: "none", border: "none", color: "#a08070", fontSize: 12, cursor: "pointer", textDecoration: "underline", fontFamily: "inherit" }}>Conditions G{"\u00E9"}n{"\u00E9"}rales & Mentions l{"\u00E9"}gales</button>
        <p style={{ color: "#a08070", fontSize: 11, margin: "8px 0 0" }}>{"\u00A9"} {new Date().getFullYear()} MoinsCher.beauty</p>
      </div>
      {showCGV && renderCGV()}
    </div>
  );
}
