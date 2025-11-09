#!/usr/bin/env python3
"""
Test that environmental insights are being fed to the forecast LLM
"""

import asyncio
import os
import json
from dotenv import load_dotenv

load_dotenv("backend/config.env")

# Test location
TEST_LOCATION = {'lat': 40.7128, 'lon': -74.0060}  # NYC


class MockLLMWithPromptCapture:
    """Mock LLM that captures the prompt to verify insights are included"""
    
    def __init__(self):
        self.last_prompt = None
        self.call_count = 0
    
    async def generate(self, prompt: str, **kwargs):
        """Capture prompt and return mock response"""
        self.last_prompt = prompt
        self.call_count += 1
        
        # Simulate processing
        await asyncio.sleep(0.1)
        
        return {
            "forecast_text": "Mock forecast response that should incorporate environmental context",
            "temperature": 72,
            "conditions": "Partly cloudy",
            "location": "New York, NY"
        }


async def test_insights_in_prompt():
    """Test that insights are included in the LLM prompt"""
    print("="*60)
    print("TEST: Environmental Insights in LLM Prompt")
    print("="*60)
    
    from forecast_integration import ForecastEnhancementPipeline
    
    # Create mock LLM that captures prompts
    mock_llm = MockLLMWithPromptCapture()
    pipeline = ForecastEnhancementPipeline(mock_llm)
    
    # Generate enhanced forecast
    original_prompt = "Generate a weather forecast for this location"
    
    print(f"\nOriginal prompt: {original_prompt}")
    print(f"Location: {TEST_LOCATION}")
    print("\nGenerating enhanced forecast...")
    
    enhanced = await pipeline.generate_enhanced_forecast(
        prompt=original_prompt,
        location=TEST_LOCATION,
        generate_narrative=False
    )
    
    # Check that LLM was called
    assert mock_llm.call_count > 0, "LLM should have been called"
    print(f"✓ LLM was called ({mock_llm.call_count} time(s))")
    
    # Check that prompt contains environmental insights
    captured_prompt = mock_llm.last_prompt
    
    print("\n" + "="*60)
    print("CAPTURED PROMPT (first 500 chars):")
    print("="*60)
    print(captured_prompt[:500] + "..." if len(captured_prompt) > 500 else captured_prompt)
    
    # Verify insights are in the prompt
    checks = {
        "ENVIRONMENTAL CONTEXT": "ENVIRONMENTAL CONTEXT FOR FORECAST" in captured_prompt,
        "Air Quality": "Air Quality" in captured_prompt or "AQI" in captured_prompt,
        "Location coordinates": f"{TEST_LOCATION['lat']:.4f}" in captured_prompt,
        "Instructions": "INSTRUCTIONS:" in captured_prompt or "incorporate" in captured_prompt.lower(),
    }
    
    print("\n" + "="*60)
    print("VERIFICATION:")
    print("="*60)
    
    all_passed = True
    for check_name, passed in checks.items():
        status = "✓" if passed else "✗"
        print(f"{status} {check_name}: {'PASS' if passed else 'FAIL'}")
        if not passed:
            all_passed = False
    
    # Check that enhanced forecast has insights
    print("\n" + "="*60)
    print("ENHANCED FORECAST STRUCTURE:")
    print("="*60)
    
    structure_checks = {
        "environmental_insights": "environmental_insights" in enhanced,
        "environmental_risk_score": "environmental_risk_score" in enhanced,
        "environmental_recommendations": "environmental_recommendations" in enhanced,
        "metadata with insights flag": enhanced.get("metadata", {}).get("insights_included_in_prompt", False),
    }
    
    for check_name, passed in structure_checks.items():
        status = "✓" if passed else "✗"
        print(f"{status} {check_name}: {'PASS' if passed else 'FAIL'}")
        if not passed:
            all_passed = False
    
    # Show sample insights
    if "environmental_insights" in enhanced:
        insights = enhanced["environmental_insights"]
        print(f"\n✓ Insights keys: {list(insights.keys())}")
        
        if "air_quality" in insights:
            aq = insights["air_quality"]
            print(f"  - Air Quality AQI: {aq.get('overall_aqi', 'N/A')}")
    
    if "environmental_risk_score" in enhanced:
        risk = enhanced["environmental_risk_score"]
        print(f"  - Risk Score: {risk.get('overall_score', 'N/A')}/100")
    
    print("\n" + "="*60)
    if all_passed:
        print("✓ ALL TESTS PASSED - Insights are being fed to LLM!")
    else:
        print("✗ SOME TESTS FAILED")
    print("="*60)
    
    return all_passed


async def test_with_anthropic_adapter():
    """Test with an adapter that matches the Anthropic API format from app.py"""
    print("\n" + "="*60)
    print("TEST: Anthropic API Adapter")
    print("="*60)
    
    class AnthropicLLMAdapter:
        """Adapter for Anthropic Claude API (as used in app.py)"""
        
        def __init__(self):
            self.api_key = os.getenv('ANTHROPIC_API_KEY')
            if not self.api_key:
                print("⚠ ANTHROPIC_API_KEY not found - using mock")
                self.use_mock = True
            else:
                self.use_mock = False
                import anthropic
                self.client = anthropic.Anthropic(api_key=self.api_key)
        
        async def generate(self, prompt: str, **kwargs):
            """Generate using Anthropic API or mock"""
            if self.use_mock:
                await asyncio.sleep(0.1)
                return {
                    "forecast_text": f"Mock forecast response. Prompt length: {len(prompt)} chars",
                    "temperature": 72,
                    "conditions": "Partly cloudy"
                }
            
            # Real Anthropic API call
            try:
                message = self.client.messages.create(
                    model=kwargs.get('model', 'claude-sonnet-4-5-20250929'),
                    max_tokens=kwargs.get('max_tokens', 1024),
                    messages=[{
                        "role": "user",
                        "content": prompt
                    }]
                )
                
                # Extract text from response
                text = message.content[0].text if message.content else ""
                
                return {
                    "forecast_text": text,
                    "raw_response": message.model_dump()
                }
            except Exception as e:
                print(f"Error calling Anthropic API: {e}")
                return {"error": str(e)}
    
    from forecast_integration import ForecastEnhancementPipeline
    
    adapter = AnthropicLLMAdapter()
    pipeline = ForecastEnhancementPipeline(adapter)
    
    print(f"\nLocation: {TEST_LOCATION}")
    print("Generating forecast with Anthropic adapter...")
    
    enhanced = await pipeline.generate_enhanced_forecast(
        prompt="Generate a detailed weather forecast considering environmental factors",
        location=TEST_LOCATION,
        model="claude-sonnet-4-5-20250929",
        max_tokens=512
    )
    
    print(f"\n✓ Forecast generated")
    print(f"  - Has insights: {'environmental_insights' in enhanced}")
    print(f"  - Has risk score: {'environmental_risk_score' in enhanced}")
    print(f"  - Insights in prompt: {enhanced.get('metadata', {}).get('insights_included_in_prompt', False)}")
    
    if 'forecast_text' in enhanced:
        print(f"\nForecast text preview (first 200 chars):")
        print(enhanced['forecast_text'][:200] + "...")


async def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("  LLM INTEGRATION TEST SUITE")
    print("  Verifying insights are fed to forecast LLM")
    print("="*60)
    
    # Test 1: Mock LLM with prompt capture
    result1 = await test_insights_in_prompt()
    
    # Test 2: Anthropic adapter (if API key available)
    try:
        await test_with_anthropic_adapter()
    except Exception as e:
        print(f"\n⚠ Anthropic adapter test skipped: {e}")
    
    print("\n" + "="*60)
    if result1:
        print("✓ INTEGRATION TEST PASSED")
    else:
        print("✗ INTEGRATION TEST FAILED")
    print("="*60)


if __name__ == "__main__":
    asyncio.run(main())

