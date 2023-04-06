type Sender = {
  name: string;
  id: string;
  avatar?: string;
};

type Message = {
  message: string;
  continued: boolean;
  right: boolean;
  delay: number;
  loading: boolean;
  sender: Sender;
};

interface ChatBubble extends HTMLElement {
  get continued(): boolean
  set continued(v: boolean)
  get right(): boolean
  set right(v: boolean)
  get loading(): boolean
  set loading(v: boolean)
  get msg(): Message;
  set msg(m: Message)
}

declare module 'wc-chatbot' {
  export default class Chatbot extends HTMLElement {
    private props: {
      title: string;
    }
    private _messages: Message[]
    private sender: Sender
    private partner: Sender
    private container: HTMLElement | null
    private header: HTMLElement | null
    private body: HTMLElement | null
    private footer: HTMLElement | null
    private avatarBtn: HTMLElement | null
    private textInput: HTMLInputElement | null
    constructor()
    connectedCallback()
    disconnectedCallback()
    genChatDialogue(): HTMLElement
    genBotAvatar(): HTMLElement
    toggle()
    createTextMessage(s: string | null): string | null
    sendMessage(m: string | null, options: Partial<Message>)
    get messages(): Message[]
    private scrollToBottom(e: Event)
    private dialogueDisplayed()
  }
}