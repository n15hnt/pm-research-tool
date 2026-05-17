export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { product } = req.body;
  if (!product) return res.status(400).json({ error: 'Product name required' });

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a senior PM. Analyze "${product}". Return ONLY this JSON, no extra text:
{
  "pain_points": ["point1","point2","point3","point4"],
  "competitors": ["Name — differentiation","Name — differentiation","Name — differentiation","Name — differentiation"],
  "kpis": ["KPI — why it matters","KPI — why it matters","KPI — why it matters","KPI — why it matters","KPI — why it matters"],
  "feature": "One high-impact feature recommendation with 2-sentence rationale.",
  "summary": "3-sentence product position summary."
}`
            }]
          }]
        })
      }
    );

    const data = await response.json();
    if (!data.candidates || !data.candidates[0]) {
      return res.status(500).json({ error: 'Gemini error: ' + JSON.stringify(data) });
    }
    const raw = data.candidates[0].content.parts[0].text.replace(/```json|```/g, '').trim();
    const result = JSON.parse(raw);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}