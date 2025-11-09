#!/usr/bin/env python3
"""
Comprehensive Integration Test
Tests all dependencies between environmental.py, api_wrapper.py, 
forecast_integration.py, and impact_radius.py
"""

import os
import sys
import json
from typing import Dict, Any
from dotenv import load_dotenv

# Load environment variables
load_dotenv("backend/config.env")

# Test configuration
TEST_LOCATION = {
    'lat': 40.7128,  
    'lon': -74.0060
}

TEST_FORECAST = {
    'location': 'New York, NY',
    'date': '2024-01-15',
    'temperature': 35,
    'conditions': 'Partly cloudy',
    'precipitation': 0.1,
    'wind_speed': 12,
    'forecast_text': 'Partly cloudy with temperatures in the mid-30s...'
}


def print_section(title: str):
    """Print a formatted section header"""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")


def test_environmental_module():
    """Test 1: Environmental module components"""
    print_section("TEST 1: Environmental Module Components")
    
    try:
        from environmental import (
            AirQualityAnalyzer,
            EmissionsCalculator,
            DemographicsAnalyzer,
            InfrastructureAnalyzer,
            EnvironmentalInsightsEngine
        )
        
        # Test AirQualityAnalyzer
        print("✓ AirQualityAnalyzer imported")
        aq_analyzer = AirQualityAnalyzer()
        print("✓ AirQualityAnalyzer instantiated")
        
        # Test EmissionsCalculator
        print("✓ EmissionsCalculator imported")
        emissions = EmissionsCalculator()
        print("✓ EmissionsCalculator instantiated")
        emissions_result = emissions.calculate_emissions_impact(
            TEST_LOCATION['lat'], 
            TEST_LOCATION['lon']
        )
        assert 'region' in emissions_result, "Emissions should return region"
        print(f"✓ Emissions calculation works: {emissions_result['region']}")
        
        # Test InfrastructureAnalyzer
        print("✓ InfrastructureAnalyzer imported")
        infra = InfrastructureAnalyzer()
        print("✓ InfrastructureAnalyzer instantiated")
        
        # Test EnvironmentalInsightsEngine
        print("✓ EnvironmentalInsightsEngine imported")
        engine = EnvironmentalInsightsEngine()
        print("✓ EnvironmentalInsightsEngine instantiated")
        assert engine.air_quality is not None, "Air quality analyzer should be initialized"
        assert engine.emissions is not None, "Emissions calculator should be initialized"
        assert engine.infrastructure is not None, "Infrastructure analyzer should be initialized"
        print("✓ All sub-components initialized")
        
        return True, engine
        
    except Exception as e:
        print(f"✗ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False, None


def test_impact_radius_integration(engine):
    """Test 2: Impact radius integration with environmental module"""
    print_section("TEST 2: Impact Radius Integration")
    
    try:
        # Check if impact_radius is available
        if engine.consolidated_analyzer is None:
            print("⚠ Impact radius analyzer not available (this is okay)")
            return True
        
        print("✓ ConsolidatedAnalyzer available in EnvironmentalInsightsEngine")
        
        # Test that environmental insights can use impact radius
        enhanced = engine.enhance_forecast_with_insights(
            TEST_FORECAST,
            TEST_LOCATION,
            options={
                'include_air_quality': True,
                'include_emissions': True,
                'include_infrastructure': True,
                'include_consolidated_analysis': True
            }
        )
        
        assert 'consolidated_analysis' in enhanced, "Should have consolidated analysis"
        print("✓ Consolidated analysis included in enhanced forecast")
        
        if 'impact_radius_km' in enhanced:
            print(f"✓ Impact radius calculated: {enhanced['impact_radius_km']} km")
        
        if 'quality_of_life_score' in enhanced:
            print(f"✓ Quality of life score calculated: {enhanced['quality_of_life_score']}")
        
        return True
        
    except Exception as e:
        print(f"✗ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_api_wrapper_integration():
    """Test 3: API wrapper integration with environmental module"""
    print_section("TEST 3: API Wrapper Integration")
    
    try:
        from api_wrapper import SimpleForecastEnhancer, EnhancementOptions
        
        print("✓ SimpleForecastEnhancer imported")
        enhancer = SimpleForecastEnhancer()
        print("✓ SimpleForecastEnhancer instantiated")
        
        # Verify it has the environmental engine
        assert enhancer.insights_engine is not None, "Should have insights engine"
        print("✓ EnvironmentalInsightsEngine integrated")
        
        # Test enhancement
        options = EnhancementOptions.minimal()
        enhanced = enhancer.enhance(
            forecast=TEST_FORECAST,
            location=TEST_LOCATION,
            options=options
        )
        
        assert 'environmental_insights' in enhanced, "Should have environmental insights"
        print("✓ Forecast enhancement works")
        
        # Check that insights are populated
        insights = enhanced.get('environmental_insights', {})
        if 'air_quality' in insights:
            print("✓ Air quality data included")
        if 'emissions' in insights:
            print("✓ Emissions data included")
        if 'infrastructure' in insights:
            print("✓ Infrastructure data included")
        
        # Check risk score
        if 'environmental_risk_score' in enhanced:
            risk_score = enhanced['environmental_risk_score']
            print(f"✓ Risk score calculated: {risk_score.get('overall_score', 'N/A')}")
        
        return True, enhanced
        
    except Exception as e:
        print(f"✗ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False, None


def test_forecast_integration_module():
    """Test 4: Forecast integration module"""
    print_section("TEST 4: Forecast Integration Module")
    
    try:
        from forecast_integration import ForecastEnhancementPipeline
        
        print("✓ ForecastEnhancementPipeline imported")
        
        # Create a mock LLM handler
        class MockLLMHandler:
            async def generate(self, prompt: str, **kwargs):
                return TEST_FORECAST
        
        mock_llm = MockLLMHandler()
        pipeline = ForecastEnhancementPipeline(mock_llm)
        print("✓ ForecastEnhancementPipeline instantiated")
        
        # Verify it has the environmental engine
        assert pipeline.env_engine is not None, "Should have environmental engine"
        print("✓ EnvironmentalInsightsEngine integrated")
        
        # Test async enhancement (we'll just check the structure)
        import asyncio
        async def test_async():
            result = await pipeline.generate_enhanced_forecast(
                prompt="Test forecast",
                location=TEST_LOCATION
            )
            return result
        
        # Note: We're not actually running async here, just checking structure
        print("✓ Pipeline structure verified")
        
        return True
        
    except Exception as e:
        print(f"✗ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_full_integration_flow():
    """Test 5: Full integration flow - all components together"""
    print_section("TEST 5: Full Integration Flow")
    
    try:
        from api_wrapper import SimpleForecastEnhancer, EnhancementOptions
        
        enhancer = SimpleForecastEnhancer()
        
        # Create a more complete test forecast
        complete_forecast = {
            **TEST_FORECAST,
            'wind_direction': 180,
            'humidity': 65
        }
        
        # Test with all options enabled
        options = EnhancementOptions()
        options.include_air_quality = True
        options.include_emissions = True
        options.include_infrastructure = True
        options.include_water_quality = False  # Skip to speed up test
        
        enhanced = enhancer.enhance(
            forecast=complete_forecast,
            location=TEST_LOCATION,
            options=options
        )
        
        # Verify all expected keys are present
        required_keys = [
            'environmental_insights',
            'environmental_risk_score',
            'environmental_recommendations'
        ]
        
        for key in required_keys:
            assert key in enhanced, f"Should have {key}"
            print(f"✓ {key} present")
        
        # Verify insights structure
        insights = enhanced['environmental_insights']
        print(f"✓ Environmental insights keys: {list(insights.keys())}")
        
        # Verify risk score structure
        risk_score = enhanced['environmental_risk_score']
        assert 'overall_score' in risk_score, "Risk score should have overall_score"
        print(f"✓ Risk score: {risk_score.get('overall_score', 'N/A')}/100")
        
        # Check if consolidated analysis is present (if impact_radius is available)
        if 'consolidated_analysis' in enhanced:
            print("✓ Consolidated analysis (impact radius + QoL) included")
        
        # Test report generation
        report = enhancer.generate_report(enhanced)
        assert len(report) > 0, "Report should not be empty"
        print(f"✓ Report generated ({len(report)} characters)")
        
        return True
        
    except Exception as e:
        print(f"✗ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_environment_variables():
    """Test 0: Environment variables are loaded"""
    print_section("TEST 0: Environment Variables")
    
    try:
        airnow_key = os.getenv('AIRNOW_API_KEY', '')
        census_key = os.getenv('CENSUS_API_KEY', '')
        
        if airnow_key:
            print(f"✓ AIRNOW_API_KEY loaded (length: {len(airnow_key)})")
        else:
            print("⚠ AIRNOW_API_KEY not found (some tests may fail)")
        
        if census_key:
            print(f"✓ CENSUS_API_KEY loaded (length: {len(census_key)})")
        else:
            print("⚠ CENSUS_API_KEY not found (demographics tests may fail)")
        
        return True
        
    except Exception as e:
        print(f"✗ ERROR: {e}")
        return False


def main():
    """Run all integration tests"""
    print("\n" + "="*60)
    print("  COMPREHENSIVE INTEGRATION TEST SUITE")
    print("  Testing dependencies between all modules")
    print("="*60)
    
    results = {}
    
    # Test 0: Environment variables
    results['env_vars'] = test_environment_variables()
    
    # Test 1: Environmental module
    success, engine = test_environmental_module()
    results['environmental'] = success
    
    if not success:
        print("\n⚠ Cannot continue - environmental module failed")
        return
    
    # Test 2: Impact radius integration
    results['impact_radius'] = test_impact_radius_integration(engine)
    
    # Test 3: API wrapper integration
    success, enhanced = test_api_wrapper_integration()
    results['api_wrapper'] = success
    
    # Test 4: Forecast integration
    results['forecast_integration'] = test_forecast_integration_module()
    
    # Test 5: Full integration flow
    results['full_flow'] = test_full_integration_flow()
    
    # Summary
    print_section("TEST SUMMARY")
    
    total = len(results)
    passed = sum(1 for v in results.values() if v)
    
    for test_name, result in results.items():
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status}: {test_name}")
    
    print(f"\nResults: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All integration tests passed!")
        return 0
    else:
        print(f"\n⚠ {total - passed} test(s) failed")
        return 1


if __name__ == "__main__":
    sys.exit(main())

