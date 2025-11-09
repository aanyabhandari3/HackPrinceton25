# LLM Integration Guide

This guide shows how environmental insights are now fed to the forecast LLM.

## How It Works

### Flow Diagram

```
User Request
    ↓
ForecastEnhancementPipeline.generate_enhanced_forecast()
    ↓
1. Fetch Environmental Insights FIRST
    ├─→ Air Quality (AQI)
    ├─→ Emissions Profile
    ├─→ Infrastructure Analysis
    └─→ Impact Radius & QoL
    ↓
2. Format Insights for LLM Prompt
    └─→ Create readable environmental context section
    ↓
3. Enhance Original Prompt
    └─→ Combine user prompt + location + insights + instructions
    ↓
4. Call LLM with Enhanced Prompt
    └─→ LLM generates forecast WITH environmental context
    ↓
5. Combine Results
    ├─→ LLM forecast text
    └─→ Structured environmental insights
    ↓
Enhanced Forecast Response
```

## Key Changes

### Before (Old Flow)
1. Call LLM with original prompt
2. Get forecast from LLM
3. Add environmental insights as metadata

**Problem:** LLM doesn't know about environmental factors when generating forecast

### After (New Flow)
1. **Fetch environmental insights FIRST**
2. **Format insights into prompt section**
3. **Call LLM with enhanced prompt** (includes environmental context)
4. Combine LLM output with structured insights

**Benefit:** LLM can incorporate environmental factors into the forecast itself

## Example Usage

### Basic Integration

```python
from forecast_integration import ForecastEnhancementPipeline
import anthropic

# Create Anthropic client (as in app.py)
client = anthropic.Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))

# Create LLM adapter
class AnthropicLLMAdapter:
    def __init__(self, client):
        self.client = client
    
    async def generate(self, prompt: str, **kwargs):
        message = self.client.messages.create(
            model=kwargs.get('model', 'claude-sonnet-4-5-20250929'),
            max_tokens=kwargs.get('max_tokens', 2048),
            messages=[{"role": "user", "content": prompt}]
        )
        return {
            "forecast_text": message.content[0].text,
            "raw_response": message.model_dump()
        }

# Create pipeline
adapter = AnthropicLLMAdapter(client)
pipeline = ForecastEnhancementPipeline(adapter)

# Generate enhanced forecast
location = {'lat': 40.7128, 'lon': -74.0060}
enhanced = await pipeline.generate_enhanced_forecast(
    prompt="Generate a detailed weather forecast",
    location=location,
    model="claude-sonnet-4-5-20250929",
    max_tokens=2048
)

# Result includes:
# - enhanced['forecast_text'] - LLM forecast (incorporates environmental context)
# - enhanced['environmental_insights'] - Structured insights
# - enhanced['environmental_risk_score'] - Risk assessment
# - enhanced['environmental_recommendations'] - Actionable recommendations
```

### Integration with app.py

To integrate with your existing `app.py` forecast endpoints:

```python
from forecast_integration import ForecastEnhancementPipeline

# In your forecast endpoint
@app.route('/api/forecast', methods=['POST'])
async def forecast_datacenter():
    data = request.json
    lat = data['latitude']
    lon = data['longitude']
    
    # Create pipeline with your Anthropic client
    adapter = AnthropicLLMAdapter(client)  # client from app.py
    pipeline = ForecastEnhancementPipeline(adapter)
    
    # Generate forecast with environmental context
    prompt = f"Analyze the environmental impact of a data center at {lat}, {lon}"
    location = {'lat': lat, 'lon': lon}
    
    enhanced = await pipeline.generate_enhanced_forecast(
        prompt=prompt,
        location=location,
        model="claude-sonnet-4-5-20250929",
        max_tokens=2048
    )
    
    # Return enhanced forecast
    return jsonify(enhanced)
```

## What Gets Fed to the LLM

The enhanced prompt includes:

1. **Original User Prompt** - Your forecast request
2. **Location Coordinates** - Exact lat/lon
3. **Environmental Context Section:**
   - Air Quality Index (AQI) and health category
   - Primary pollutants
   - Emissions profile (grid region, CO2)
   - Infrastructure analysis (density, buildings, roads)
   - Environmental concerns
   - Impact radius (if available)
   - Quality of Life index (if available)
   - Risk assessment
   - Key recommendations
4. **Instructions** - Tell LLM to incorporate environmental factors

### Example Prompt Structure

```
Generate a weather forecast for this location

LOCATION: Latitude 40.7128, Longitude -74.0060

=== ENVIRONMENTAL CONTEXT FOR FORECAST ===

Air Quality Index (AQI): 75
  - Health Category: Moderate
  - Primary Pollutant: PM2.5
  - Pollutant Breakdown:
    • O3: AQI 3
    • PM2.5: AQI 75

Emissions Profile:
  - Grid Region: RFCE
  - CO2 Emissions: 0.37 metric tons/MWh

Infrastructure Analysis:
  - Density Level: Very High
  - Buildings Nearby: 59519
  - Roads: 53352
  - Concerns: Industrial emissions nearby, High traffic pollution

Environmental Impact Radius:
  - Maximum Impact: 57.2 km
  - Safe Zone: 12.5 km

Quality of Life Index:
  - Overall Score: 41.8/100
  - Category: Fair

Environmental Risk Assessment:
  - Overall Risk Score: 65.3/100
  - Risk Level: High

Key Environmental Recommendations:
  1. ⚠️ Environmental impacts extend 57.2km...
  2. Air quality is Moderate. Consider indoor activities...

=== END ENVIRONMENTAL CONTEXT ===

INSTRUCTIONS:
When generating your forecast, please incorporate the environmental context 
provided above. Consider how air quality, emissions, infrastructure, and 
environmental risks may affect the forecasted conditions and recommendations. 
Reference specific environmental factors where relevant to provide a more 
comprehensive and context-aware forecast.
```

## Response Structure

The enhanced forecast includes:

```json
{
  "forecast_text": "LLM-generated forecast that incorporates environmental context...",
  "temperature": 72,
  "conditions": "Partly cloudy",
  "environmental_insights": {
    "air_quality": {...},
    "emissions": {...},
    "infrastructure": {...}
  },
  "environmental_risk_score": {
    "overall_score": 65.3,
    "risk_level": "High",
    "contributing_factors": [...]
  },
  "environmental_recommendations": [...],
  "impact_radius_km": 57.2,
  "quality_of_life_score": 41.8,
  "metadata": {
    "insights_included_in_prompt": true,
    "generated_at": "2024-01-15T10:30:00",
    "enhancement_version": "2.0.0"
  }
}
```

## Testing

Run the integration test to verify:

```bash
python3 test_llm_integration.py
```

This test:
- ✓ Verifies insights are fetched before LLM call
- ✓ Checks that insights are formatted into prompt
- ✓ Confirms LLM receives enhanced prompt
- ✓ Validates response includes both LLM output and structured insights

## Benefits

1. **Context-Aware Forecasts**: LLM can reference specific environmental factors
2. **Better Recommendations**: LLM can suggest actions based on actual environmental data
3. **Structured Data**: Still get machine-readable insights alongside LLM text
4. **Backward Compatible**: Works with existing LLM interfaces

## Migration Notes

If you're updating existing code:

1. **Change order**: Fetch insights BEFORE calling LLM
2. **Enhance prompt**: Include insights section in prompt
3. **Update response**: Include both LLM output and structured insights
4. **Add flag**: Set `insights_included_in_prompt: true` in metadata

The `ForecastEnhancementPipeline` handles all of this automatically!

