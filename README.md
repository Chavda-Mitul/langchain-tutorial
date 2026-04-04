# LangChain Tutorial - Minimal Setup

A minimal Node.js project in TypeScript for learning LangChain with Groq's Llama 3.1 8B model.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up your Groq API key:
```bash
cp .env.example .env
# Edit .env and add your Groq API key
```

3. Run the example:
```bash
npm run dev
```

## Project Structure

```
langchain-tutorial/
├── src/
│   └── index.ts          # Main example file
├── package.json           # Project dependencies
├── tsconfig.json          # TypeScript configuration
├── .env.example           # Environment variables template
└── README.md              # This file
```

## Available Scripts

- `npm run dev` - Run the example using ts-node
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run the compiled JavaScript

## Learning LangChain

This project includes a basic example that demonstrates:
- Initializing a ChatGroq model (Llama 3.1 8B - fast and efficient)
- Creating system and human messages
- Invoking the model and getting responses

**Why Groq with Llama 3.1 8B?**
- Fast inference speed
- Low token usage
- Good quality responses
- Cost-effective for learning

Check out the [LangChain documentation](https://js.langchain.com/) for more examples and features.
