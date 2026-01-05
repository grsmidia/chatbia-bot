
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { BIA_SYSTEM_PROMPT } from "../constants";

// Função para obter o cliente AI (garante que pega a chave certa do ambiente)
const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Chave API_KEY não configurada nas variáveis de ambiente.");
  }
  return new GoogleGenAI({ apiKey });
};

const generateCheckoutLinkDecl: FunctionDeclaration = {
  name: 'generateCheckoutLink',
  parameters: {
    type: Type.OBJECT,
    description: 'Gera um link de checkout dinâmico baseado no kit escolhido.',
    properties: {
      items: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            color: { type: Type.STRING, enum: ['palha', 'marrom'], description: 'Cor da bolsa' },
            quantity: { type: Type.NUMBER, description: 'Quantidade desta cor' }
          },
          required: ['color', 'quantity']
        }
      }
    },
    required: ['items']
  }
};

const showSupportOptionsDecl: FunctionDeclaration = {
  name: 'showSupportOptions',
  parameters: {
    type: Type.OBJECT,
    description: 'Mostra botões de suporte (Rastreio, Email, WhatsApp).',
    properties: {}
  }
};

// Singleton para a sessão de chat
let currentSession: any = null;

const getChatSession = () => {
  if (!currentSession) {
    const ai = getAIClient();
    currentSession = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: BIA_SYSTEM_PROMPT,
        tools: [{
          functionDeclarations: [generateCheckoutLinkDecl, showSupportOptionsDecl]
        }]
      }
    });
  }
  return currentSession;
};

export async function sendMessage(message: string) {
  try {
    const session = getChatSession();
    const response = await session.sendMessage({ message });
    return response;
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Reinicia a sessão em caso de erro para não travar o chat
    currentSession = null;
    throw error;
  }
}
