import { useState, useEffect } from "react";

export default function App() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const rechercher = async () => {
    if (!query.trim() || query.trim().length < 3) {
      setError("Entrez le nom d'un produit (ex: La Roche-Posay Effaclar Duo)");
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/dupe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim(), category }),
      });

      const data = await response.json();

      if (data.error) {
        setError("Erreur : " + data.error);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError("Erreur réseau, réessayez");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setQuery("");
    setResult(null);
    setError(null);
    setCategory("all");
  };

  const savings = (original, dupe) => {
    const o = parseFloat(original);
    const d = parseFloat(dupe);
    if (!o || !d || o <= d) return null;
    return Math.round(((o - d) / o) * 100);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#faf8f5",
      color: "#1a1a2e",
      fontFamily: "'DM Sans', -apple-system, sans-serif",
      padding: "0 16px"
    }}>
      {/* Hero */}
      {!result && (
        <div style={{ maxWidth: 720, margin: "0 auto", paddingTop: isMobile ? 40 : 80, textAlign: "center" }}>
          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: isMobile ? 36 : 52,
            fontWeight: 800,
            margin: "0 0 12px",
            color: "#1a1a2e",
            lineHeight: 1.15
          }}>
            Payez moins cher.<br />
            <span style={{ color: "#c2185b" }}>Gardez la qualité.</span>
          </h1>
          <p style={{
            fontSize: isMobile ? 16 : 19,
            color: "#64748b",
            margin: "0 0 40px",
            lineHeight: 1.6,
            maxWidth: 520,
            marginLeft: "auto",
            marginRight: "auto"
          }}>
            Entrez le nom de votre produit cosmétique. Notre IA trouve des alternatives avec une composition similaire — pour 2 à 10 fois moins cher.
          </p>

          {/* Search */}
          <div style={{
            background: "#fff",
            border: "2px solid #e8e0d8",
            borderRadius: 16,
            padding: isMobile ? 20 : 28,
            maxWidth: 600,
            margin: "0 auto 24px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.04)"
          }}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && rechercher()}
              placeholder="Ex: La Roche-Posay Effaclar Duo, Chanel N°5, MAC Ruby Woo..."
              style={{
                width: "100%",
                padding: 16,
                background: "#faf8f5",
                border: "1px solid #e8e0d8",
                borderRadius: 10,
                color: "#1a1a2e",
                fontSize: 16,
                outline: "none",
                fontFamily: "inherit",
                boxSizing: "border-box",
                marginBottom: 12
              }}
            />

            <div style={{
              display: "flex", gap: 8, marginBottom: 16,
              flexWrap: "wrap", justifyContent: "center"
            }}>
              {[
                { key: "all", label: "Tout" },
                { key: "skincare", label: "Skincare" },
                { key: "maquillage", label: "Maquillage" },
                { key: "parfum", label: "Parfum" },
                { key: "cheveux", label: "Cheveux" }
              ].map(c => (
                <button key={c.key} onClick={() => setCategory(c.key)} style={{
                  background: category === c.key ? "#c2185b" : "transparent",
                  border: `1px solid ${category === c.key ? "#c2185b" : "#d4c9be"}`,
                  color: category === c.key ? "#fff" : "#8b7e74",
                  padding: "6px 16px",
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}>
                  {c.label}
                </button>
              ))}
            </div>

            <button
              onClick={rechercher}
              disabled={loading}
              style={{
                width: "100%",
                padding: 16,
                background: loading ? "#94a3b8" : "#c2185b",
                border: "none",
                borderRadius: 10,
                color: "#fff",
                fontSize: 16,
                fontWeight: 600,
                cursor: loading ? "wait" : "pointer",
                transition: "all 0.2s",
                fontFamily: "inherit"
              }}
            >
              {loading ? "Recherche en cours..." : "Trouver les alternatives"}
            </button>
          </div>

          {error && (
            <div style={{
              background: "#fef2f2",
              border: "1px solid #fca5a5",
              borderRadius: 10,
              padding: 14,
              color: "#dc2626",
              fontSize: 14,
              maxWidth: 600,
              margin: "0 auto 20px"
            }}>
              {error}
            </div>
          )}

          {loading && (
            <p style={{ color: "#8b7e74", fontSize: 14, marginTop: 8 }}>
              L'IA analyse les compositions et cherche des alternatives...
            </p>
          )}

          {/* Exemples populaires */}
          <div style={{ marginTop: 40, marginBottom: 60 }}>
            <p style={{ fontSize: 13, color: "#8b7e74", marginBottom: 16 }}>Essayez par exemple :</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
              {[
                "La Roche-Posay Effaclar Duo",
                "Estée Lauder Double Wear",
                "Dior Sauvage",
                "Drunk Elephant Protini",
                "Charlotte Tilbury Pillow Talk"
              ].map(ex => (
                <button key={ex} onClick={() => { setQuery(ex); }} style={{
                  background: "#fff",
                  border: "1px solid #e8e0d8",
                  borderRadius: 20,
                  padding: "8px 16px",
                  fontSize: 13,
                  color: "#64748b",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.2s"
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#c2185b"; e.currentTarget.style.color = "#c2185b"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e8e0d8"; e.currentTarget.style.color = "#64748b"; }}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {/* How it works */}
          <div style={{
            display: "flex", gap: 20, marginBottom: 60,
            flexWrap: "wrap", justifyContent: "center"
          }}>
            {[
              { title: "Entrez votre produit", desc: "Tapez le nom de votre creme, serum, fond de teint ou parfum." },
              { title: "L'IA compare", desc: "Analyse des compositions INCI, des actifs principaux et de l'efficacite." },
              { title: "Economisez", desc: "Decouvrez des alternatives jusqu'a 10x moins cheres, avec les liens pour acheter." }
            ].map((item, i) => (
              <div key={i} style={{
                flex: "1 1 200px", maxWidth: 240,
                padding: 24, textAlign: "center"
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: "#c2185b", color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 12px", fontSize: 16, fontWeight: 700
                }}>
                  {i + 1}
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, color: "#1a1a2e" }}>{item.title}</div>
                <div style={{ fontSize: 13, color: "#8b7e74", lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div style={{ maxWidth: 800, margin: "0 auto", paddingTop: 30, paddingBottom: 60 }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 30 }}>
            <h2 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 28, fontWeight: 700, margin: "0 0 4px", color: "#1a1a2e"
            }}>
              MoinsCher<span style={{ color: "#c2185b" }}>.beauty</span>
            </h2>
            <button onClick={reset} style={{
              background: "none", border: "none", color: "#c2185b",
              fontSize: 13, cursor: "pointer", fontWeight: 500, fontFamily: "inherit"
            }}>
              Nouvelle recherche
            </button>
          </div>

          {/* Original Product */}
          <div style={{
            background: "#fff",
            border: "1px solid #e8e0d8",
            borderRadius: 16,
            padding: 24,
            marginBottom: 24
          }}>
            <div style={{ fontSize: 12, color: "#8b7e74", fontWeight: 500, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
              Produit original
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 6px", color: "#1a1a2e" }}>
              {result.original.nom}
            </h3>
            <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 10px" }}>
              {result.original.marque} — {result.original.categorie}
            </p>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#1a1a2e" }}>
              {result.original.prix}
            </div>
            {result.original.actifs_principaux && (
              <div style={{ marginTop: 12, display: "flex", gap: 6, flexWrap: "wrap" }}>
                {result.original.actifs_principaux.map((a, i) => (
                  <span key={i} style={{
                    background: "#faf8f5", border: "1px solid #e8e0d8",
                    borderRadius: 6, padding: "4px 10px", fontSize: 12, color: "#64748b"
                  }}>
                    {a}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Dupes */}
          <div style={{ fontSize: 12, color: "#8b7e74", fontWeight: 500, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>
            Alternatives moins cheres ({result.dupes.length})
          </div>

          {result.dupes.map((dupe, i) => {
            const pct = savings(
              result.original.prix_num || result.original.prix.replace(/[^\d.,]/g, ''),
              dupe.prix_num || dupe.prix.replace(/[^\d.,]/g, '')
            );
            return (
              <div key={i} style={{
                background: "#fff",
                border: i === 0 ? "2px solid #c2185b" : "1px solid #e8e0d8",
                borderRadius: 16,
                padding: 24,
                marginBottom: 12,
                position: "relative"
              }}>
                {i === 0 && (
                  <div style={{
                    position: "absolute", top: -12, left: 20,
                    background: "#c2185b", color: "#fff",
                    padding: "4px 14px", borderRadius: 20,
                    fontSize: 12, fontWeight: 600
                  }}>
                    Meilleur dupe
                  </div>
                )}

                <div style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "start", flexWrap: "wrap", gap: 12
                }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <h4 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 4px", color: "#1a1a2e" }}>
                      {dupe.nom}
                    </h4>
                    <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 8px" }}>
                      {dupe.marque}
                    </p>
                    <p style={{ fontSize: 13, color: "#8b7e74", margin: "0 0 8px", lineHeight: 1.5 }}>
                      {dupe.pourquoi}
                    </p>
                    {dupe.actifs_communs && (
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }}>
                        {dupe.actifs_communs.map((a, j) => (
                          <span key={j} style={{
                            background: "#fce4ec", border: "1px solid #f8bbd0",
                            borderRadius: 6, padding: "3px 8px", fontSize: 11, color: "#c2185b"
                          }}>
                            {a}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ textAlign: "right", minWidth: 100 }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: "#c2185b" }}>
                      {dupe.prix}
                    </div>
                    {pct && (
                      <div style={{
                        background: "#e8f5e9", color: "#2e7d32",
                        padding: "4px 10px", borderRadius: 8,
                        fontSize: 13, fontWeight: 600, marginTop: 4,
                        display: "inline-block"
                      }}>
                        -{pct}%
                      </div>
                    )}
                    <div style={{ fontSize: 12, color: "#8b7e74", marginTop: 4 }}>
                      {dupe.contenance}
                    </div>
                  </div>
                </div>

                {dupe.score_similarite && (
                  <div style={{
                    marginTop: 12, display: "flex", alignItems: "center", gap: 8
                  }}>
                    <div style={{
                      width: 120, height: 6, background: "#f0ebe4",
                      borderRadius: 3, overflow: "hidden"
                    }}>
                      <div style={{
                        width: `${dupe.score_similarite}%`, height: "100%",
                        background: dupe.score_similarite >= 80 ? "#c2185b" : dupe.score_similarite >= 60 ? "#ff8f00" : "#8b7e74",
                        borderRadius: 3
                      }} />
                    </div>
                    <span style={{ fontSize: 12, color: "#8b7e74", fontWeight: 500 }}>
                      {dupe.score_similarite}% similaire
                    </span>
                  </div>
                )}

                {dupe.ou_acheter && (
                  <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {dupe.ou_acheter.map((shop, j) => (
                      <a key={j} href={shop.url || "#"} target="_blank" rel="noopener noreferrer" style={{
                        background: "#faf8f5", border: "1px solid #e8e0d8",
                        borderRadius: 8, padding: "6px 14px",
                        fontSize: 12, color: "#1a1a2e", fontWeight: 500,
                        textDecoration: "none", transition: "all 0.2s"
                      }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#c2185b"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e8e0d8"; }}
                      >
                        {shop.nom} {shop.prix ? `- ${shop.prix}` : ""}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Disclaimer */}
          <p style={{
            textAlign: "center", fontSize: 11, color: "#8b7e74",
            marginTop: 24, lineHeight: 1.6
          }}>
            Les alternatives sont suggerees par l'IA sur la base des compositions connues.
            Verifiez toujours la liste INCI pour les allergies.
          </p>
        </div>
      )}

      {/* Footer */}
      <div style={{
        maxWidth: 720, margin: "0 auto",
        padding: "20px 0", borderTop: "1px solid #e8e0d8",
        textAlign: "center"
      }}>
        <p style={{ color: "#8b7e74", fontSize: 11, margin: 0 }}>
          MoinsCher.beauty — Trouvez les dupes de vos cosmetiques preferes
        </p>
      </div>
    </div>
  );
}
