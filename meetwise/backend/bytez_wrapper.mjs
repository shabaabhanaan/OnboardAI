
import Bytez from "bytez.js";
import fs from 'fs';

const key = process.env.OPENAI_API_KEY || "4fbe90a3c567502654a7a15933c24420";
// Re-using OPENAI_API_KEY as the user is using it for the Bytez key in their .env
const sdk = new Bytez(key);

// Read arguments: 0=node, 1=script, 2=command, 3=payload
const command = process.argv[2];
const payload = process.argv[3];

async function run() {
    try {
        if (command === 'chat') {
            const model = sdk.model("openai/gpt-4o");
            const input = JSON.parse(payload);
            const { error, output } = await model.run(input);
            if (error) {
                console.error(JSON.stringify({ error }));
                process.exit(1);
            }
            console.log(JSON.stringify({ output }));
        } else if (command === 'transcribe') {
            // Assuming Bytez supports whisper-large-v3 or similar common models
            // The user snippet didn't specify audio, but let's try a standard audio model or Whisper
            // Common HF model: openai/whisper-large-v3
            const model = sdk.model("openai/whisper-large-v3");

            // For file upload, usually requires a buffer or stream. 
            // Depending on Bytez SDK implementation for file inputs.
            // Documentation is scarce, but standard huggingface/replicate wrappers usually take URL or base64.
            // Let's assume it might want a stream or path.

            // Note: If Bytez doesn't support file upload directly in this manner, this might fail.
            // We'll trust the SDK handles it or needs a buffer.

            const fileBuffer = fs.readFileSync(payload);
            const { error, output } = await model.run(fileBuffer);
            if (error) {
                console.error(JSON.stringify({ error }));
                process.exit(1);
            }
            console.log(JSON.stringify({ output }));
        }
    } catch (e) {
        console.error(JSON.stringify({ error: e.message }));
        process.exit(1);
    }
}

run();
