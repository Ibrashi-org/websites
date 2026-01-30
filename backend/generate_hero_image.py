import asyncio
import base64
from emergentintegrations.llm.openai.image_generation import OpenAIImageGeneration

async def generate_image():
    api_key = "sk-emergent-5D691C2FaC318B3FcF"
    
    image_gen = OpenAIImageGeneration(api_key=api_key)
    
    prompt = """Ultra-high-quality studio product render of multiple modern disposable vape devices arranged symmetrically around a bold central logo reading "MOOKI Store".

Devices feature premium finishes, vibrant colors (red, pink, purple, blue, green), glossy and matte textures, detailed screens and branding, sharp edges, realistic reflections, and precise lighting.

Central logo typography is bold and modern, black uppercase "MOOKI" with a handwritten red script "Store" overlay, perfectly centered and balanced.

Hyper-realistic, commercial advertising style, crisp focus, 8K detail, sharp shadows on the products only, clean edges, professional e-commerce look. Dark background."""
    
    print("Generating image... This may take up to 60 seconds...")
    
    images = await image_gen.generate_images(
        prompt=prompt,
        model="gpt-image-1",
        number_of_images=1
    )
    
    if images and len(images) > 0:
        # Save the image
        with open("/app/frontend/public/hero-banner.png", "wb") as f:
            f.write(images[0])
        print("Image saved to /app/frontend/public/hero-banner.png")
        return True
    else:
        print("No image was generated")
        return False

if __name__ == "__main__":
    asyncio.run(generate_image())
