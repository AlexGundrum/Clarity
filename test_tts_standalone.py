import asyncio
from backend.audio.synthesis import synthesize_speech
from backend.config import ELEVENLABS_OUTPUT_FORMAT

async def main():
    print(f'Using format: {ELEVENLABS_OUTPUT_FORMAT}')
    chunks = []
    async for chunk in synthesize_speech('I do not know what is going on here.'):
        chunks.append(chunk)
    
    data = b''.join(chunks)
    print(f'Received {len(data)} bytes')
    
    with open('test_tts_out.raw', 'wb') as f:
        f.write(data)
    
    if 'pcm' in ELEVENLABS_OUTPUT_FORMAT:
        import wave
        with open('test_tts_out.raw', 'rb') as f:
            d = f.read()
        sr = int(ELEVENLABS_OUTPUT_FORMAT.split('_')[1])
        with wave.open('test_tts_out.wav', 'wb') as w:
            w.setnchannels(1)
            w.setsampwidth(2)
            w.setframerate(sr)
            w.writeframes(d)
        print('Saved as WAV as well.')

asyncio.run(main())
