import { config } from "dotenv";
config();

async function test() {
    try {
        console.log("Importing...");
        const ChatbotService = await import("./src/services/chatbot-service.js");
        const { ServerConfig } = await import("./src/config/index.js");
        const { DATABASE } = await import("./src/utils/database/index.js");

        console.log("API Key present:", !!ServerConfig.CHAT_GPT_API_KEY);

        console.log("Connecting to DB...");
        await DATABASE.connect(ServerConfig.DATABASE_URL);
        console.log("DB Connected.");

        console.log("Calling ChatbotService...");
        const result = await ChatbotService.chat({ message: "Hello", sessionId: "test-session" });
        console.log("Success:", result);
        process.exit(0);
    } catch (error) {
        console.error("Test failed with error:", error);
        process.exit(1);
    }
}

test();
