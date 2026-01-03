
import Bytez from "bytez.js"

const key = "4fbe90a3c567502654a7a15933c24420"
const sdk = new Bytez(key)

// choose gpt-4o
const model = sdk.model("openai/gpt-4o")

async function test() {
    try {
        console.log("Testing Bytez...");
        // send input to model
        const { error, output } = await model.run([
            {
                "role": "user",
                "content": "Hello, are you working?"
            }
        ]);

        if (error) {
            console.error("Error:", error);
        } else {
            console.log("Output:", output);
        }
    } catch (e) {
        console.error("Exception:", e);
    }
}

test();
