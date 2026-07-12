import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable is not configured in Supabase.")
    }

    const { chemA, chemB } = await req.json()
    if (!chemA || !chemB) {
      return new Response(
        JSON.stringify({ error: "Missing chemical parameters. Both chemA and chemB are required." }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Prompt engineering for Gemini
    const prompt = `You are an advanced chemical safety simulator.
Analyze what happens when mixing Chemical A and Chemical B in a laboratory setting.
Chemical A: ${chemA.name} (${chemA.formula})
Chemical B: ${chemB.name} (${chemB.formula})

Analyze their reactivity, safety, potential products, and hazard severity.
You MUST respond with a valid JSON object matching this schema:
{
  "is_safe": boolean,
  "reaction_type": "safe" | "hazardous" | "explosive" | "toxic" | "produces_gas" | "new_product",
  "severity_score": number (1 to 10 scale of danger),
  "product_name": "Name of the resulting product if any (leave empty if none)",
  "product_formula": "Formula of the resulting product if any (leave empty if none)",
  "result_description_en": "A detailed, professional, easy-to-understand explanation of the reaction in English.",
  "result_description_ar": "A detailed, professional, easy-to-understand explanation of the reaction in Arabic (شرح مفصل للتفاعل باللغة العربية).",
  "physical_properties_en": "Detailed physical and thermal properties of the mixture (e.g. density/solubility shifts) in English.",
  "physical_properties_ar": "Detailed physical and thermal properties of the mixture in Arabic (الخصائص الفيزيائية والحرارية باللغة العربية).",
  "safety_measures_en": "Precise lab safety measures and hazard controls (e.g. required PPE types) in English.",
  "safety_measures_ar": "Precise lab safety measures and hazard controls in Arabic (آلية الأمان والسلامة المخبرية باللغة العربية).",
  "chemical_properties_en": "Chemical properties and stability of the resulting mixture in English.",
  "chemical_properties_ar": "Chemical properties and stability of the resulting mixture in Arabic (الخواص الكيميائية باللغة العربية)."
}

Do not include any markdown styling or extra text. Return ONLY the raw JSON string.`

    // Request to Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`
    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Gemini API returned error code ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!rawText) {
      throw new Error("Empty response received from Gemini API.")
    }

    const parsedResult = JSON.parse(rawText.trim())

    return new Response(
      JSON.stringify(parsedResult),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
