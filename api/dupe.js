export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query, category } = req.body;

  if (!query || query.length < 3) {
    return res.status(400).json({ error: 'Produit invalide' });
  }

  const systemPrompt = `Tu es un expert en cosmétique et en compositions INCI. L'utilisateur te donne le nom d'un produit cosmétique. Tu dois :

1. Identifier le produit original (marque, nom, catégorie, prix moyen, contenance, actifs principaux)
2. Trouver 3 à 5 alternatives RÉELLES (dupes) moins chères avec une composition similaire
3. Pour chaque dupe, expliquer pourquoi c'est une bonne alternative (actifs en commun, texture similaire, même type de résultat)
4. Donner un score de similarité en %

${category !== "all" ? `Concentre-toi sur la catégorie : ${category}` : ""}

IMPORTANT :
- Ne recommande que des produits qui EXISTENT réellement et sont disponibles à l'achat en France
- Les prix doivent être réalistes et actuels
- Privilégie les marques accessibles : The Ordinary, CeraVe, La Roche-Posay, Nivea, Garnier, NYX, Maybelline, Revolution, Essence, Catrice, Bioderma, SVR, Avène, Typology, Drunk Elephant, The Inkey List, etc.
- Pour les parfums, recommande des parfums d'inspiration similaire (notes olfactives proches)

Réponds en JSON :
{
  "original": {
    "nom": "nom complet du produit",
    "marque": "marque",
    "categorie": "Skincare / Maquillage / Parfum / Cheveux",
    "prix": "XX,XX €",
    "prix_num": 29.90,
    "contenance": "50ml",
    "actifs_principaux": ["niacinamide", "acide salicylique", "..."]
  },
  "dupes": [
    {
      "nom": "nom du produit alternatif",
      "marque": "marque",
      "prix": "XX,XX €",
      "prix_num": 6.90,
      "contenance": "30ml",
      "pourquoi": "Contient les mêmes actifs (niacinamide 10%, zinc) dans une formulation très proche...",
      "actifs_communs": ["niacinamide", "zinc"],
      "score_similarite": 88,
      "ou_acheter": [
        { "nom": "Amazon", "url": "" },
        { "nom": "Sephora", "url": "" },
        { "nom": "Nocibé", "url": "" }
      ]
    }
  ]
}

Réponds UNIQUEMENT avec le JSON, sans backticks, sans texte avant ou après.`;

  const userMessage = `Trouve les dupes de ce produit : ${query}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 4000,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const text = data.content
      .filter(item => item.type === "text")
      .map(item => item.text)
      .join("");

    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return res.status(200).json(parsed);
  } catch (err) {
    console.error("API Error:", err);
    return res.status(500).json({ error: "Erreur lors de la recherche" });
  }
}
