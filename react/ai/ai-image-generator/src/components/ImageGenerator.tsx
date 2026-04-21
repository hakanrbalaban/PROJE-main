import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'https://openrouter.ai/api/v1/images/generate'; // Replace with actual endpoint
const API_KEY = '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'; // Replace with your API key

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const generateImage = async () => {
    if (!prompt.trim()) {
      alert('Please enter a valid prompt.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        API_URL,
        {
          model: 'openai/sora-2-pro', // Replace with the correct model name
          prompt: prompt,
          num_images: 1, // Number of images to generate
        },
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const generatedImageUrl = response.data.images[0]; // Adjust based on API response structure
      setImageUrl(generatedImageUrl);
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>AI Image Generator</h1>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe the image you want to generate..."
        rows={4}
        style={{ width: '100%', marginBottom: '10px', padding: '10px' }}
      />
      <button onClick={generateImage} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Image'}
      </button>

      {imageUrl && (
        <div style={{ marginTop: '20px' }}>
          <h2>Generated Image:</h2>
          <img src={imageUrl} alt="Generated" style={{ maxWidth: '100%' }} />
        </div>
      )}
    </div>
  );
};

export default ImageGenerator;