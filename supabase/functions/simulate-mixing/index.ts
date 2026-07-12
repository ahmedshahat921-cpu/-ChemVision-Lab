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
  "result_description": "A detailed, professional, easy-to-understand explanation of the reaction, listing hazards, safety measures, and chemical products in Arabic and English.",
  "severity_score": number (1 to 10 scale of danger),
  "product_name": "Name of the resulting product if any (leave empty if none)",
  "product_formula": "Formula of the resulting product if any (leave empty if none)",
  "physical_properties": "Detailed physical and thermal properties of the mixture (e.g. exothermic heat of reaction, temperature changes, miscibility/solubility behavior) in Arabic and English.",
  "safety_measures": "Precise lab safety measures and hazard controls (e.g. required PPE like gloves/goggles type, ventilation/fume hood rules) in Arabic and English.",
  "chemical_properties": "Chemical properties and stability of the resulting mixture (e.g. pH shifts, chemical stability, reactive danger) in Arabic and English."
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
