"""
Forecast Backend Integration Module
Integrates environmental insights with existing forecast LLM without modifying core generation
"""

import asyncio
import json
from typing import Dict, Any, Optional, List
from datetime import datetime
import logging
from environmental import (
    EnvironmentalInsightsEngine, 
)

logger = logging.getLogger(__name__)


class ForecastEnhancementPipeline:
    """
    Pipeline to enhance existing forecast LLM outputs with environmental insights
    This wraps around your existing forecast backend without modifying it
    """
    
    def __init__(self, 
                 forecast_llm_handler,  # Your existing forecast LLM handler
                 env_config: Optional[Any] = None):
        """
        Args:
            forecast_llm_handler: Your existing forecast LLM model/handler
            env_config: Environmental API configuration
        """
        self.forecast_llm = forecast_llm_handler
        self.env_engine = EnvironmentalInsightsEngine()
        self.cache = {}  # Simple cache for repeated locations
        
    async def generate_enhanced_forecast(self, 
                                        prompt: str,
                                        location: Dict[str, float],
                                        **kwargs) -> Dict[str, Any]:
        """
        Generate forecast using existing LLM with environmental insights fed into the prompt
        
        Args:
            prompt: Forecast prompt for your LLM
            location: Dict with 'lat' and 'lon' keys
            **kwargs: Additional arguments for your forecast LLM
        
        Returns:
            Enhanced forecast combining LLM output and environmental insights
        """
        
        logger.info(f"Generating enhanced forecast for {location}")
        
        # Step 1: Get environmental insights FIRST (before LLM call)
        # This allows us to feed insights into the LLM prompt
        logger.info("Fetching environmental insights...")
        insights_options = {
            'include_air_quality': True,
            'include_emissions': True,
            'include_infrastructure': True,
            'include_demographics': kwargs.get('include_demographics', False),
            'include_satellite': kwargs.get('include_satellite', False),
            'include_consolidated_analysis': kwargs.get('include_consolidated_analysis', True)
        }
        
        # Create a temporary forecast dict for insights (will be replaced by LLM output)
        temp_forecast = {
            'location': f"Lat: {location['lat']}, Lon: {location['lon']}",
            'timestamp': datetime.now().isoformat()
        }
        
        # Get environmental insights
        insights_data = await asyncio.to_thread(
            self.env_engine.enhance_forecast_with_insights,
            temp_forecast,
            location,
            options=insights_options
        )
        
        # Step 2: Format insights for LLM prompt
        insights_prompt_section = self._format_insights_for_prompt(insights_data)
        
        # Step 3: Enhance the original prompt with environmental insights
        enhanced_prompt = self._create_enhanced_prompt(prompt, insights_prompt_section, location)
        
        # Step 4: Call LLM with enhanced prompt that includes environmental context
        logger.info("Calling LLM with environmental insights in prompt...")
        try:
            # Call your existing forecast LLM with enhanced prompt
            if asyncio.iscoroutinefunction(self.forecast_llm.generate):
                llm_output = await self.forecast_llm.generate(enhanced_prompt, **kwargs)
            else:
                llm_output = await asyncio.to_thread(
                    self.forecast_llm.generate, enhanced_prompt, **kwargs
                )
                
        except Exception as e:
            logger.error(f"Error generating forecast from LLM: {e}")
            llm_output = {"error": str(e), "forecast_text": f"Error: {str(e)}"}
        
        # Step 5: Parse the LLM output
        parsed_forecast = self._parse_llm_output(llm_output)
        
        # Step 6: Combine LLM output with structured environmental insights
        enhanced_forecast = {
            **parsed_forecast,  # LLM-generated forecast
            'environmental_insights': insights_data.get('environmental_insights', {}),
            'environmental_risk_score': insights_data.get('environmental_risk_score', {}),
            'environmental_recommendations': insights_data.get('environmental_recommendations', []),
        }
        
        # Add consolidated analysis if available
        if 'consolidated_analysis' in insights_data:
            enhanced_forecast['consolidated_analysis'] = insights_data['consolidated_analysis']
            enhanced_forecast['impact_radius_km'] = insights_data.get('impact_radius_km')
            enhanced_forecast['quality_of_life_score'] = insights_data.get('quality_of_life_score')
        
        # Step 7: Optionally generate an enhanced narrative
        if kwargs.get('generate_narrative', True):
            enhanced_forecast['enhanced_narrative'] = \
                self._generate_enhanced_narrative(enhanced_forecast)
        
        # Step 8: Add metadata
        enhanced_forecast['metadata'] = {
            'generated_at': datetime.now().isoformat(),
            'location': location,
            'enhancement_version': '2.0.0',
            'original_prompt': prompt[:100] + '...' if len(prompt) > 100 else prompt,
            'insights_included_in_prompt': True  # Flag that insights were fed to LLM
        }
        
        return enhanced_forecast
    
    def _format_insights_for_prompt(self, insights_data: Dict[str, Any]) -> str:
        """
        Format environmental insights into a readable section for LLM prompt
        
        Args:
            insights_data: Full insights data from EnvironmentalInsightsEngine
            
        Returns:
            Formatted string section to include in LLM prompt
        """
        sections = []
        sections.append("\n=== ENVIRONMENTAL CONTEXT FOR FORECAST ===\n")
        
        insights = insights_data.get('environmental_insights', {})
        risk_score = insights_data.get('environmental_risk_score', {})
        
        # Air Quality
        if 'air_quality' in insights:
            aq = insights['air_quality']
            aqi = aq.get('overall_aqi', 0)
            if aqi is not None and isinstance(aqi, (int, float)):
                sections.append(f"Air Quality Index (AQI): {aqi}")
                sections.append(f"  - Health Category: {aq.get('health_category', 'Unknown')}")
                sections.append(f"  - Primary Pollutant: {aq.get('primary_pollutant', 'Unknown')}")
                if aq.get('pollutants'):
                    sections.append("  - Pollutant Breakdown:")
                    for pollutant, data in list(aq['pollutants'].items())[:3]:  # Top 3
                        sections.append(f"    • {pollutant}: AQI {data.get('aqi', 'N/A')}")
        
        # Emissions
        if 'emissions' in insights:
            em = insights['emissions']
            sections.append(f"\nEmissions Profile:")
            sections.append(f"  - Grid Region: {em.get('region', 'Unknown')}")
            sections.append(f"  - CO2 Emissions: {em.get('co2_emissions_metric_tons', 0):.2f} metric tons/MWh")
        
        # Infrastructure
        if 'infrastructure' in insights:
            infra = insights['infrastructure']
            sections.append(f"\nInfrastructure Analysis:")
            sections.append(f"  - Density Level: {infra.get('infrastructure_density', 'Unknown')}")
            sections.append(f"  - Buildings Nearby: {infra.get('total_buildings', 0)}")
            sections.append(f"  - Roads: {infra.get('roads_count', 0)}")
            if infra.get('environmental_concerns'):
                sections.append(f"  - Concerns: {', '.join(infra['environmental_concerns'][:3])}")
        
        # Impact Radius & QoL (if available)
        if 'consolidated_analysis' in insights_data:
            consolidated = insights_data['consolidated_analysis']
            if 'impact_radius_analysis' in consolidated:
                radius_data = consolidated['impact_radius_analysis']
                sections.append(f"\nEnvironmental Impact Radius:")
                sections.append(f"  - Maximum Impact: {radius_data.get('maximum_impact_radius_km', 0):.1f} km")
                sections.append(f"  - Safe Zone: {radius_data.get('safe_zone_radius_km', 0):.1f} km")
            
            if 'quality_of_life_analysis' in consolidated:
                qol_data = consolidated['quality_of_life_analysis']
                sections.append(f"\nQuality of Life Index:")
                sections.append(f"  - Overall Score: {qol_data.get('overall_score', 0):.1f}/100")
                sections.append(f"  - Category: {qol_data.get('category', 'Unknown')}")
        
        # Risk Score
        if risk_score:
            sections.append(f"\nEnvironmental Risk Assessment:")
            sections.append(f"  - Overall Risk Score: {risk_score.get('overall_score', 0):.1f}/100")
            sections.append(f"  - Risk Level: {risk_score.get('risk_level', 'Unknown')}")
        
        # Recommendations
        recommendations = insights_data.get('environmental_recommendations', [])
        if recommendations:
            sections.append(f"\nKey Environmental Recommendations:")
            for i, rec in enumerate(recommendations[:3], 1):  # Top 3
                sections.append(f"  {i}. {rec}")
        
        sections.append("\n=== END ENVIRONMENTAL CONTEXT ===\n")
        
        return "\n".join(sections)
    
    def _create_enhanced_prompt(self, 
                               original_prompt: str, 
                               insights_section: str,
                               location: Dict[str, float]) -> str:
        """
        Create enhanced prompt that includes environmental insights
        
        Args:
            original_prompt: User's original forecast prompt
            insights_section: Formatted environmental insights section
            location: Location dict with lat/lon
            
        Returns:
            Enhanced prompt with environmental context
        """
        enhanced = f"""{original_prompt}

LOCATION: Latitude {location['lat']:.4f}, Longitude {location['lon']:.4f}

{insights_section}

INSTRUCTIONS:
When generating your forecast, please incorporate the environmental context provided above. 
Consider how air quality, emissions, infrastructure, and environmental risks may affect 
the forecasted conditions and recommendations. Reference specific environmental factors 
where relevant to provide a more comprehensive and context-aware forecast.
"""
        return enhanced
    
    def _parse_llm_output(self, llm_output: Any) -> Dict[str, Any]:
        """
        Parse LLM output into structured format
        Adapt this based on your LLM's output format
        """
        if isinstance(llm_output, dict):
            return llm_output
        elif isinstance(llm_output, str):
            # Try to parse as JSON
            try:
                return json.loads(llm_output)
            except json.JSONDecodeError:
                # If not JSON, wrap in dict
                return {
                    'forecast_text': llm_output,
                    'raw_output': True
                }
        else:
            return {
                'forecast_text': str(llm_output),
                'raw_output': True
            }
    
    def _generate_enhanced_narrative(self, enhanced_forecast: Dict) -> str:
        """
        Generate a narrative that combines forecast and environmental insights
        """
        narrative_parts = []
        
        # Start with original forecast text if available
        if 'forecast_text' in enhanced_forecast:
            narrative_parts.append(enhanced_forecast['forecast_text'])
        
        # Add environmental context
        insights = enhanced_forecast.get('environmental_insights', {})
        risk_score = enhanced_forecast.get('environmental_risk_score', {})
        
        if risk_score.get('risk_level') in ['High', 'Severe']:
            narrative_parts.append(
                f"\n⚠️ Environmental Alert: {risk_score['risk_level']} "
                f"environmental risk detected (Score: {risk_score.get('overall_score', 0)}/100)."
            )
        
        # Add air quality information
        if 'air_quality' in insights:
            aq = insights['air_quality']
            aqi_value = aq.get('overall_aqi', 0)
            # Handle None values from errors
            if aqi_value is not None and isinstance(aqi_value, (int, float)) and aqi_value > 50:
                narrative_parts.append(
                    f"Air quality is {aq.get('health_category', 'moderate')} "
                    f"with {aq.get('primary_pollutant', 'pollutants')} as the main concern."
                )
        
        # Add recommendations if significant
        recommendations = enhanced_forecast.get('environmental_recommendations', [])
        if recommendations and risk_score.get('overall_score', 0) > 25:
            narrative_parts.append("\nEnvironmental Considerations:")
            for rec in recommendations[:2]:  # Limit to top 2 recommendations
                narrative_parts.append(f"• {rec}")
        
        return "\n".join(narrative_parts)
    
    async def batch_enhance_forecasts(self, 
                                     forecast_requests: List[Dict]) -> List[Dict]:
        """
        Process multiple forecast requests in parallel
        
        Args:
            forecast_requests: List of dicts with 'prompt' and 'location' keys
        
        Returns:
            List of enhanced forecasts
        """
        tasks = [
            self.generate_enhanced_forecast(
                req['prompt'],
                req['location'],
                **req.get('options', {})
            )
            for req in forecast_requests
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Handle any exceptions
        processed_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                logger.error(f"Error processing forecast {i}: {result}")
                processed_results.append({
                    'error': str(result),
                    'request': forecast_requests[i]
                })
            else:
                processed_results.append(result)
        
        return processed_results


class SimpleCache:
    """Simple caching for environmental data to reduce API calls"""
    
    def __init__(self, ttl_seconds: int = 3600):
        self.cache = {}
        self.ttl = ttl_seconds
    
    def get_cache_key(self, lat: float, lon: float, data_type: str) -> str:
        """Generate cache key for location and data type"""
        # Round to 2 decimal places for cache (about 1km resolution)
        lat_rounded = round(lat, 2)
        lon_rounded = round(lon, 2)
        return f"{data_type}:{lat_rounded}:{lon_rounded}"
    
    def get(self, key: str) -> Optional[Dict]:
        """Get cached data if not expired"""
        if key in self.cache:
            entry = self.cache[key]
            if datetime.now().timestamp() - entry['timestamp'] < self.ttl:
                return entry['data']
        return None
    
    def set(self, key: str, data: Dict):
        """Cache data with timestamp"""
        self.cache[key] = {
            'data': data,
            'timestamp': datetime.now().timestamp()
        }


# Example mock forecast LLM for testing
class MockForecastLLM:
    """Mock forecast LLM for demonstration"""
    
    async def generate(self, prompt: str, **kwargs) -> Dict[str, Any]:
        """Simulate forecast generation"""
        await asyncio.sleep(0.1)  # Simulate processing time
        
        return {
            "location": "From prompt",
            "date": datetime.now().strftime("%Y-%m-%d"),
            "temperature": 72,
            "conditions": "Partly cloudy",
            "precipitation": 0.2,
            "wind_speed": 10,
            "humidity": 65,
            "forecast_text": (
                "Partly cloudy skies expected today with temperatures reaching "
                "a comfortable 72°F. Light winds from the southwest at 10 mph. "
                "A 20% chance of scattered showers in the afternoon."
            )
        }


# Integration example with existing backend
class ExistingForecastBackendAdapter:
    """
    Adapter for your existing forecast backend
    Modify this class to match your actual backend interface
    """
    
    def __init__(self, backend_url: Optional[str] = None):
        self.backend_url = backend_url or "http://localhost:8000"
        # Add your authentication, session management, etc.
    
    async def generate(self, prompt: str, **kwargs) -> Dict[str, Any]:
        """
        Call your existing forecast backend
        This is where you'd integrate with your actual LLM service
        """
        # Example using requests (adapt to your actual backend)
        import aiohttp
        
        async with aiohttp.ClientSession() as session:
            payload = {
                "prompt": prompt,
                "parameters": kwargs
            }
            
            # Replace with your actual endpoint
            async with session.post(
                f"{self.backend_url}/forecast/generate",
                json=payload
            ) as response:
                return await response.json()


# Configuration loader (no longer needed - env vars loaded directly)
def load_config_from_env():
    """Deprecated - environment variables are now loaded directly from config.env"""
    pass


# Main integration function
async def main():
    """Example of using the integration"""
    
    # Load configuration
    env_config = load_config_from_env()
    
    # Option 1: Use with mock LLM for testing
    mock_llm = MockForecastLLM()
    
    # Option 2: Use with your existing backend
    # existing_backend = ExistingForecastBackendAdapter("http://your-backend-url")
    
    # Create the enhancement pipeline
    pipeline = ForecastEnhancementPipeline(mock_llm, env_config)
    
    # Single forecast example
    location = {"lat": 40.7128, "lon": -74.0060}  # New York
    prompt = "Generate a detailed weather forecast for New York City"
    
    enhanced_forecast = await pipeline.generate_enhanced_forecast(
        prompt=prompt,
        location=location,
        generate_narrative=True
    )
    
    print("Enhanced Forecast:")
    print(json.dumps(enhanced_forecast, indent=2, default=str))
    
    # Batch processing example
    batch_requests = [
        {
            "prompt": "Forecast for location 1",
            "location": {"lat": 34.0522, "lon": -118.2437},  # Los Angeles
            "options": {"include_demographics": False}
        },
        {
            "prompt": "Forecast for location 2", 
            "location": {"lat": 41.8781, "lon": -87.6298},  # Chicago
            "options": {"include_infrastructure": True}
        }
    ]
    
    batch_results = await pipeline.batch_enhance_forecasts(batch_requests)
    print(f"\nProcessed {len(batch_results)} forecasts")


if __name__ == "__main__":
    # Run the example
    asyncio.run(main())