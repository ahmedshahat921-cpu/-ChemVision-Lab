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

    const body = await req.json()
    const { action, chemA, chemB, chemicalName, messages, inventoryContext } = body

    // Helper function to call Gemini API
    async function callGemini(prompt: string, apiKey: string) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`
      const response = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      })
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Gemini API returned error code ${response.status}: ${errorText}`)
      }
      const data = await response.json()
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text
      if (!rawText) throw new Error("Empty response received from Gemini API.")
      return JSON.parse(rawText.trim())
    }

    // ═══════════════════════════════════════════════
    // ACTION: chat
    // Chatbot response with laboratory inventory context
    // ═══════════════════════════════════════════════
    if (action === 'chat') {
      if (!messages || !Array.isArray(messages)) {
        return new Response(
          JSON.stringify({ error: "Missing or invalid messages parameter." }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const inventoryStr = (inventoryContext || [])
        .map((c: any) => `- Name: ${c.name}, Formula: ${c.formula || 'N/A'}, Qty: ${c.quantity} ${c.quantity_unit || ''}, Location: ${c.location || 'N/A'}, Cabinet: ${c.cabinet || 'N/A'}, Status: ${c.is_active ? 'Active' : 'Inactive'}, Expiry: ${c.expiry_date || 'N/A'}`)
        .join('\n')

      const systemInstructionText = `You are a professional chemical laboratory AI assistant named "ChemVision AI Companion".
You assist students, researchers, and laboratory managers with:
1. Finding chemicals in the lab.
2. Checking inventory quantities and status.
3. Reviewing safety precautions, hazard levels, GHS safety codes, and first aid measures.
4. Answering general chemistry questions.

Here is the CURRENT, REAL-TIME chemical inventory in the lab:
${inventoryStr || 'No chemicals are currently in the inventory.'}

IMPORTANT RULES:
- Use the inventory context above to answer location or stock queries accurately. If a chemical is not in the list, state that it is not in the inventory.
- Keep safety as the absolute highest priority. If asked about mixing dangerous chemicals, warn the user.
- Respond in a clear, friendly, and professional manner.
- Answer in the same language the user uses (Arabic or English).`

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${GEMINI_API_KEY}`
      
      const payload = {
        contents: messages.map((m: any) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content || '' }]
        })),
        systemInstruction: {
          parts: [{ text: systemInstructionText }]
        }
      }

      const response = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Gemini API returned error code ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response."

      return new Response(
        JSON.stringify({ text: rawText }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ═══════════════════════════════════════════════
    // ACTION: generate-details
    // Generates full Physical, Chemical, Safety, Uses, and NFPA data
    // ═══════════════════════════════════════════════
    if (action === 'generate-details') {
      if (!chemicalName) {
        return new Response(
          JSON.stringify({ error: "Missing chemicalName parameter." }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const detailsPrompt = `You are an expert chemical safety and data specialist.
Given the chemical name: "${chemicalName}", generate comprehensive detailed data.
Return a valid JSON object with this EXACT structure:
{
  "physical": {
    "boilingPoint": { "en": "value with unit", "ar": "Arabic translation" },
    "meltingPoint": { "en": "value with unit", "ar": "Arabic translation" },
    "density": { "en": "value with unit", "ar": "Arabic translation" },
    "solubility": { "en": "solubility description", "ar": "Arabic translation" },
    "appearance": { "en": "appearance description", "ar": "Arabic translation" },
    "odor": { "en": "odor description", "ar": "Arabic translation" },
    "flashPoint": { "en": "flash point or Non-flammable", "ar": "Arabic translation" },
    "vaporPressure": { "en": "vapor pressure value", "ar": "Arabic translation" },
    "ph": { "en": "pH value and description", "ar": "Arabic translation" }
  },
  "chemical": {
    "class": { "en": "Chemical class (e.g. Organic Solvent, Inorganic Acid)", "ar": "Arabic translation" },
    "molecularStructure": { "en": "Molecular structure description", "ar": "Arabic translation" },
    "reactivity": { "en": "Reactivity description", "ar": "Arabic translation" },
    "incompatible": { "en": "Incompatible materials list", "ar": "Arabic translation" },
    "stability": { "en": "Stability information", "ar": "Arabic translation" },
    "decomposition": { "en": "Decomposition products", "ar": "Arabic translation" }
  },
  "safety": {
    "ppe": {
      "en": ["PPE item 1", "PPE item 2", "PPE item 3", "PPE item 4"],
      "ar": ["Arabic PPE 1", "Arabic PPE 2", "Arabic PPE 3", "Arabic PPE 4"]
    },
    "exposureLimits": { "en": "TWA and STEL values", "ar": "Arabic translation" },
    "fireExtinguishing": { "en": "Fire extinguishing methods", "ar": "Arabic translation" },
    "ldValue": { "en": "LD50 value (oral, rat)", "ar": "Arabic translation" }
  },
  "uses": {
    "en": ["Use 1", "Use 2", "Use 3", "Use 4", "Use 5", "Use 6"],
    "ar": ["Arabic use 1", "Arabic use 2", "Arabic use 3", "Arabic use 4", "Arabic use 5", "Arabic use 6"]
  },
  "nfpa": {
    "health": 0,
    "flammability": 0,
    "reactivity": 0,
    "special": ""
  }
}

IMPORTANT RULES:
- All values must be scientifically accurate based on established chemical data.
- NFPA values are integers: health (0-4), flammability (0-4), reactivity (0-4), special is a string ("" or "OX" or "W" etc).
- PPE arrays should have 3-5 items each.
- Uses arrays should have 4-6 items each.
- Arabic translations must be accurate and professional.
- Return ONLY the raw JSON, no markdown wrappers.`

      const parsedResult = await callGemini(detailsPrompt, GEMINI_API_KEY)

      return new Response(
        JSON.stringify(parsedResult),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ═══════════════════════════════════════════════
    // ACTION: autocomplete
    // Basic chemical data auto-fill
    // ═══════════════════════════════════════════════
    if (action === 'autocomplete') {
      if (!chemicalName) {
        return new Response(
          JSON.stringify({ error: "Missing chemicalName parameter." }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const prompt = `You are an expert chemical data auto-fill assistant.
Given the chemical name: "${chemicalName}", first evaluate if this is a real, valid chemical name, common chemical name, or chemical formula. If it is gibberish, random text (like "asd", "drt", etc.), or a general non-chemical name, flag it as invalid.

Return a valid JSON object with the following fields:
{
  "is_valid": boolean (true if it is a real chemical name/formula, false otherwise),
  "error_message": "string (only if is_valid is false, explaining why it's invalid in English, and advising the user)",
  "suggestions": ["string" (array of 1-3 closest correct chemical names if the input is a typo, e.g., ["Ethanol"] for "ethnol". Leave empty array if no close matches exist)],
  
  // The following fields are ONLY required if is_valid is true:
  "corrected_name": "Standard/proper spelling of the chemical name in Title Case (e.g., 'Ethanol' instead of 'etanol', 'Sulfuric Acid' instead of 'sulfr')",
  "formula": "Chemical formula (e.g. H2SO4)",
  "molecular_weight": number (molecular weight in g/mol, e.g. 98.08),
  "cas_number": "CAS registry number (e.g. 7664-93-9)",
  "hazard_level": "low" | "medium" | "high" | "critical" (evaluate chemical danger),
  "ghs_codes": array of strings (e.g. ["GHS02", "GHS05"] from: GHS01, GHS02, GHS03, GHS04, GHS05, GHS06, GHS07, GHS08, GHS09),
  "description": "Short, clear description of the chemical in English",
  "storage_conditions": "Storage advice in English (e.g. Keep container tightly closed in a dry and well-ventilated place)",
  "first_aid": "First aid instructions in English (e.g. In case of contact, immediately flush eyes or skin with plenty of water)",
  "recommended_shelf_life_months": number (typical safe shelf life in months under recommended storage conditions, e.g. 24 or 36 or 60)
}
Do not return any markdown code block wrappers (like \`\`\`json). Return ONLY the raw JSON string.`

      const parsedResult = await callGemini(prompt, GEMINI_API_KEY)

      return new Response(
        JSON.stringify(parsedResult),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

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

    const parsedResult = await callGemini(prompt, GEMINI_API_KEY)

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
