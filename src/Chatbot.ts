/*
  wc-chatbot | Chatbot.ts
  Copyright (C) 2023  yishiashia <yishiashia@gmail.com>

  This program is free software: you can redistribute it and/or modify it
  under the terms of the GNU General Public License as published
  by the Free Software Foundation, either version 3 of the License,
  or (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
  or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License
  for more details.

  You should have received a copy of the GNU General Public License along with
  this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import 'wc-bubble';
import styles from './Chatbot.scss';

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

  constructor() {
    super()

    // Create shadow DOM for the component
    this.attachShadow({ mode: 'open' })

    this.genChatDialogue = this.genChatDialogue.bind(this)
    this.sendMessage = this.sendMessage.bind(this)
    this.toggle = this.toggle.bind(this)
    this.scrollToBottom = this.scrollToBottom.bind(this)
    this.dialogueDisplayed = this.dialogueDisplayed.bind(this)

    // Initialize messages array
    this._messages = []
    this.props = {
      title: "Chatbot"
    }

    // Define default sender / partner
    this.sender =  { name: 'Anonymous', id: '00000123-0000-0000-0000-000000000001' };
    this.partner = { name: 'Bot',       id: '00000123-0000-0000-0000-000000000002' };
    this.container = null
    this.header = null
    this.body = null
    this.footer = null
    this.avatarBtn = null
    this.textInput = null
  }

  connectedCallback() {
    if (this.shadowRoot !== null) {
      // props
      if (this.hasAttribute("title") && String(this.getAttribute("title")).trim() !== "") {
        this.props.title = String(this.getAttribute("title")).trim()
      }

      // DOM
      this.shadowRoot.innerHTML = ""
      this.shadowRoot.appendChild(this.genChatDialogue())
      this.shadowRoot.appendChild(this.genBotAvatar())

      // Styles
      const style = document.createElement("style")
      style.textContent = styles
      this.shadowRoot.appendChild(style)
    }
  }

  disconnectedCallback() {
    if (this.avatarBtn !== null) {
      this.avatarBtn.removeEventListener('click', this.toggle)
    }
  }

  genChatDialogue(): HTMLElement {
    // Create chatbot container
    const chatContainer = document.createElement('div');
    chatContainer.classList.add('chatbot-container');
    chatContainer.classList.add('hidden');

    // Create chatbot header element
    const chatHeader = document.createElement('div');
    chatHeader.classList.add('chatbot-header');
    const leftBlock = document.createElement('div');
    leftBlock.classList.add('left');
    const headerTitleElement = document.createElement('h3');
    const righttBlock = document.createElement('div');
    righttBlock.classList.add('right');
    const minimizeBtn = document.createElement('button');
    minimizeBtn.classList.add('minimize');
    minimizeBtn.addEventListener("click", this.toggle);
    righttBlock.appendChild(minimizeBtn);
    headerTitleElement.textContent = this.props.title;
    chatHeader.append(leftBlock, headerTitleElement, righttBlock);
    this.header = chatHeader;

    // Create chatbot body element
    const chatBody = document.createElement('div');
    chatBody.classList.add('chatbot-body');
    chatContainer.appendChild(chatBody);
    this.body = chatBody;

    // Create chatbot footer element
    const chatFooter = document.createElement('div');
    chatFooter.classList.add('chat-footer');
    const form = document.createElement('form');
    form.setAttribute("autocomplete", "off");
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (event.target !== null) {
        const f = event.target as HTMLFormElement
        if (f.msg.value !== "") {
          this.sendMessage(f.msg.value);
        }
        f.reset();
      }
    });
    const inputDiv = document.createElement('div')
    inputDiv.classList.add('chatbot-input');
    const input = document.createElement('input')
    input.setAttribute('type', 'text')
    input.setAttribute('id', 'msg-input')
    input.setAttribute('name', 'msg')
    input.setAttribute('placeholder', 'Type your message here...')
    input.setAttribute('autocomplete', 'do-not-autofill')
    input.setAttribute('autocorrect', 'off')
    this.textInput = input
    const button = document.createElement('button')
    button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" style="transform: rotate(70deg) scale(1,1.3) translate(1px, -3px);">
        <path fill="currentColor" d="M3.06 19.35c-.24.39-.21.88.06 1.19.27.3.7.38 1.06.19l7.47-4.12 7.47 4.12c.16.09.33.13.5.13.34 0 .67-.15.89-.43.27-.3.3-.78.06-1.19l-7.47-12.36L3.06 19.35z"/>
      </svg>`
    inputDiv.append(input, button)
    form.appendChild(inputDiv);
    chatFooter.appendChild(form);
    this.footer = chatFooter;

    chatContainer.append(chatHeader, chatBody, chatFooter);
    this.container = chatContainer;

    return chatContainer;
  }

  genBotAvatar(): HTMLElement {
    const div = document.createElement('div');
    div.classList.add('bot-button');
    div.classList.add('avatar');
    div.addEventListener('click', this.toggle);
    this.avatarBtn = div;
    return div;
  }

  toggle() {
    if (this.container !== null) {
      this.container.classList.remove("hidden");
      if (this.container.classList.contains("animation-scale-in")) {
        this.container.classList.remove("animation-scale-in");
        this.container.classList.add("animation-scale-out");
      } else if (this.container.classList.contains("animation-scale-out")) {
        this.container.classList.remove("animation-scale-out");
        this.container.classList.add("animation-scale-in");
        this.container.addEventListener("animationend", this.dialogueDisplayed)
      } else {
        this.container.classList.add("animation-scale-in");
        this.container.addEventListener("animationend", this.dialogueDisplayed)
      }
    }
  }

  createTextMessage(s: string | null): string | null {
    if (s === null) {
      return null;
    } else {
      const chatBot = document.querySelector("chat-bot");
      const text = document.createTextNode(s);
      const p = document.createElement('p');
      p.append(text);
      return p.outerHTML;
    }
  }

  sendMessage(m: string | null, options: Partial<Message> = {}) {
    let lastMessage = null;
    if (this._messages.length > 0) {
      lastMessage = this._messages[this._messages.length - 1];
    }

    let msgString = this.createTextMessage(m)
    if (msgString === null && options.message !== undefined) {
      msgString = options.message
    }

    // Merge options with default values for Message properties
    const message: Message = {
      message: msgString === null ? "" : msgString,
      continued: false,
      right: true,
      delay: 0,
      loading: false,
      sender: { name: "", id: "" },
      ...options
    };

    if (message.sender.id === "") {
      message.sender = message.right ? this.sender : this.partner;
    }

    // Add new message to messages array
    this._messages.push(message);

    // Render chat bubble for new message
    const chatBubble: ChatBubble = document.createElement('chat-bubble');
    chatBubble.innerHTML = message.message;
    chatBubble.continued = message.continued;
    chatBubble.setAttribute("part", "chat-bubble");
    if (lastMessage !== null && lastMessage.sender.id === message.sender.id) {
      chatBubble.continued = true;
    }
    chatBubble.right = message.right;
    chatBubble.delay = message.delay;
    chatBubble.loading = message.loading;
    chatBubble.msg = message;
    if (chatBubble.continued) { chatBubble.setAttribute("continued", "") }
    if (chatBubble.right) { chatBubble.setAttribute("right", "") }
    if (chatBubble.loading) { chatBubble.setAttribute("loading", "") }
    if (message.sender.avatar) { chatBubble.setAttribute("avatar", message.sender.avatar) }
    chatBubble.addEventListener("mounted", this.scrollToBottom);
    if (this.body !== null) {
      this.body.appendChild(chatBubble);
    }
  }

  get messages() {
    return this._messages;
  }

  private scrollToBottom(e: Event) {
    const chatBubble = e.target as ChatBubble;
    const sentEvent = new CustomEvent("sent", {
      detail: {
        message: chatBubble.msg
      }
    });
    console.log(sentEvent);
    this.dispatchEvent(sentEvent);
    if (this.body !== null) {
      this.body.scrollTo({ top: this.body.scrollHeight, behavior: 'smooth' })
    }
  }

  private dialogueDisplayed() {
    if(this.container !== null) {
      this.container.removeEventListener("animationend", this.dialogueDisplayed)
      if (this.textInput !== null) {
        this.textInput.focus();
      }
    }
  }
}
