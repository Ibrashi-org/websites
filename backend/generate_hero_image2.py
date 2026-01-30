import asyncio
from emergentintegrations.llm.openai.image_generation import OpenAIImageGeneration

async def generate_image():
    api_key = "sk-emergent-5D691C2FaC318B3FcF"
    
    image_gen = OpenAIImageGeneration(api_key=api_key)
    
    prompt = """Professional e-commerce hero banner with dark black background.

Multiple shisha/hookah vape devices floating and flying dynamically in the air at different angles, creating a sense of motion and energy. The vapes are colorful disposable vape pens in red, orange, purple, blue, green colors with glossy finishes.

In the center of the image, bold text logo:
- "MOOKI" in large bold white uppercase letters
- "STORE" directly below in bold red uppercase letters
Both words are centered and stacked vertically.

The vapes are arranged around the central logo text, some tilted, some straight, creating depth and dimension. Dramatic lighting with subtle orange/red glow effects. Clean professional commercial advertising style. 8K quality, sharp details, dark moody atmosphere."""
    
    print("Generating image... This may take up to 60 seconds...")
    
    images = await image_gen.generate_images(
        prompt=prompt,
        model="gpt-image-1",
        number_of_images=1
    )
    
    if images and len(images) > 0:
        with open("/app/frontend/public/hero-banner.png", "wb") as f:
            f.write(images[0])
        print("Image saved to /app/frontend/public/hero-banner.png")
        return True
    else:
        print("No image was generated")
        return False

if __name__ == "__main__":
    asyncio.run(generate_image())
