import { fireEvent } from "@testing-library/dom";
import "@testing-library/jest-dom";

import Chatbot from "../../src/Chatbot";

window.customElements.define("chat-bot", Chatbot);

// Mock the replaceSync() method
global.CSSStyleSheet.prototype.replaceSync = jest.fn();

describe("Chatbot web component", () => {
  let chatbot;

  beforeEach(() => {
    chatbot = document.createElement("chat-bot");
    document.body.appendChild(chatbot);
    // jest.spyOn(Element, 'scrollTo')
  });

  afterEach(() => {
    document.body.removeChild(chatbot);
  });

  test("renders the chatbot component", () => {
    expect(chatbot).toBeInTheDocument();
  });

  test("renders a header", () => {
    const header = chatbot.shadowRoot.querySelector(".chatbot-header");
    expect(header).not.toBeNull();
  });

  test("renders a footer", () => {
    const footer = chatbot.shadowRoot.querySelector(".chat-footer");
    expect(footer).not.toBeNull();
  });

  test("renders an avatar button", () => {
    const avatarBtn = chatbot.shadowRoot.querySelector(".bot-button.avatar");
    expect(avatarBtn).not.toBeNull();
  });

  test("renders a text input", () => {
    const textInput = chatbot.shadowRoot.querySelector("#msg-input");
    expect(textInput).not.toBeNull();
  });

  test("can send a message", () => {
    chatbot.sendMessage("Hello");
    const messages = chatbot.shadowRoot.querySelectorAll("chat-bubble");
    expect(messages.length).toBe(1);
  });

  test("send a message when form submit", async () => {
    // const textInput = chatbot.shadowRoot.getElementById('msg-input')
    const form = chatbot.shadowRoot.querySelector("form");
    // textInput.value = 'hello'
    form.msg = { value: "hellp" };
    await fireEvent.submit(form);
    const messages = chatbot.shadowRoot.querySelectorAll("chat-bubble");
    expect(messages.length).toBe(1);
  });

  test("get messages from component", () => {
    chatbot.sendMessage("Hello");
    const messages = chatbot.messages;
    expect(messages.length).toBe(1);
  });

  test("scroll to bottom", async () => {
    const dispatchEventSpy = jest.spyOn(chatbot, "dispatchEvent");
    const propertyDescriptor = Object.getOwnPropertyDescriptor(
      Element.prototype,
      "scrollTo"
    );
    const spyScrollTo = jest.fn();
    Object.defineProperty(chatbot.body, "scrollTo", { value: spyScrollTo });
    chatbot.sendMessage("Hello");
    const messages = chatbot.shadowRoot.querySelectorAll("chat-bubble");
    expect(messages.length).toBe(1);
    await fireEvent.animationEnd(messages[0]);
    await fireEvent(messages[0], new CustomEvent("mounted"));
    expect(dispatchEventSpy).toHaveBeenCalled();
  });

  test("title attribute", () => {
    document.body.removeChild(chatbot);
    const titleStr = "JustWe";
    chatbot.setAttribute("title", titleStr);
    document.body.appendChild(chatbot);
    const titleElement = chatbot.shadowRoot.querySelector(".chatbot-header h3");
    expect(titleElement.textContent).toBe(titleStr);
  });

  test("send HTML message", () => {
    chatbot.sendMessage(null, {
      message:
        '<p id="test-p">hello <a id="test-a" href="http://example.org">123</a></p>',
    });
    const aElement = chatbot.shadowRoot.querySelector("#test-a");
    const pElement = chatbot.shadowRoot.querySelector("#test-p");
    expect(aElement).not.toBeNull();
    expect(pElement).not.toBeNull();
  });

  test("send continued message", () => {
    chatbot.sendMessage("Hello");
    chatbot.sendMessage("Hello");
    const messages = chatbot.shadowRoot.querySelectorAll("chat-bubble");
    expect(messages.length).toBe(2);
    expect(messages[1].continued).toBe(true);
  });

  test("can toggle the chatbot", async () => {
    const container = chatbot.shadowRoot.querySelector(".chatbot-container");
    expect(container.classList.contains("hidden")).toBe(true);
    chatbot.toggle();
    expect(container.classList.contains("hidden")).toBe(false);
    expect(container.classList.contains("animation-scale-out")).toBe(false);
    expect(container.classList.contains("animation-scale-in")).toBe(true);
    await fireEvent.animationEnd(chatbot.container);
    chatbot.toggle();
    expect(container.classList.contains("hidden")).toBe(false);
    expect(container.classList.contains("animation-scale-out")).toBe(true);
    expect(container.classList.contains("animation-scale-in")).toBe(false);
    chatbot.toggle();
    expect(container.classList.contains("hidden")).toBe(false);
    expect(container.classList.contains("animation-scale-out")).toBe(false);
    expect(container.classList.contains("animation-scale-in")).toBe(true);
  });
});
