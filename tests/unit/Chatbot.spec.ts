import { fireEvent } from "@testing-library/dom";
import "@testing-library/jest-dom";

import Bubble from "wc-bubble";
import Chatbot from "../../src/Chatbot";

window.customElements.define("chat-bot", Chatbot);

// Mock the replaceSync() method
global.CSSStyleSheet.prototype.replaceSync = jest.fn();

describe("Chatbot web component", () => {
  let chatbot: HTMLElement;

  beforeEach(() => {
    chatbot = document.createElement("chat-bot");
    document.body.appendChild(chatbot);
    // jest.spyOn(Element, 'scrollTo')
    expect(chatbot.shadowRoot).not.toBeNull();
  });

  afterEach(() => {
    document.body.removeChild(chatbot);
  });

  test("renders the chatbot component", () => {
    expect(chatbot).toBeInTheDocument();
  });

  test("renders a header", () => {
    const header = chatbot.shadowRoot!.querySelector(".chatbot-header");
    expect(header).not.toBeNull();
  });

  test("renders a footer", () => {
    const footer = chatbot.shadowRoot!.querySelector(".chat-footer");
    expect(footer).not.toBeNull();
  });

  test("renders an avatar button", () => {
    const avatarBtn = chatbot.shadowRoot!.querySelector(".bot-button.avatar");
    expect(avatarBtn).not.toBeNull();
  });

  test("renders a text input", () => {
    const textInput = chatbot.shadowRoot!.querySelector("#msg-input");
    expect(textInput).not.toBeNull();
  });

  test("can send a message", () => {
    (chatbot as Chatbot).sendMessage("Hello");
    const messages = chatbot.shadowRoot!.querySelectorAll("chat-bubble");
    expect(messages.length).toBe(1);
  });

  test("send a message when form submit", async () => {
    // const textInput = chatbot.shadowRoot.getElementById('msg-input')
    const form = chatbot.shadowRoot!.querySelector("form");
    // textInput.value = 'hello'
    expect(form).not.toBeNull();
    form!.msg = { value: "hellp" };
    await fireEvent.submit(form!);
    const messages = chatbot.shadowRoot!.querySelectorAll("chat-bubble");
    expect(messages.length).toBe(1);
  });

  test("get messages from component", () => {
    (chatbot as Chatbot).sendMessage("Hello");
    const messages = (chatbot as Chatbot).messages;
    expect(messages.length).toBe(1);
  });

  test("scroll to bottom", async () => {
    const dispatchEventSpy = jest.spyOn(chatbot, "dispatchEvent");
    const propertyDescriptor = Object.getOwnPropertyDescriptor(
      Element.prototype,
      "scrollTo"
    );
    const spyScrollTo = jest.fn();
    Object.defineProperty((chatbot as Chatbot).body, "scrollTo", { value: spyScrollTo });
    (chatbot as Chatbot).sendMessage("Hello");
    const messages = chatbot.shadowRoot!.querySelectorAll("chat-bubble");
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
    const titleElement = chatbot.shadowRoot!.querySelector(".chatbot-header h3");
    expect(titleElement).not.toBeNull();
    expect(titleElement!.textContent).toBe(titleStr);
  });

  test("send HTML message", () => {
    (chatbot as Chatbot).sendMessage(null, {
      message:
        '<p id="test-p">hello <a id="test-a" href="http://example.org">123</a></p>',
    });
    const aElement = chatbot.shadowRoot!.querySelector("#test-a");
    const pElement = chatbot.shadowRoot!.querySelector("#test-p");
    expect(aElement).not.toBeNull();
    expect(pElement).not.toBeNull();
  });

  test("send continued message", () => {
    (chatbot as Chatbot).sendMessage("Hello");
    (chatbot as Chatbot).sendMessage("Hello");
    const messages = chatbot.shadowRoot!.querySelectorAll("chat-bubble");
    expect(messages.length).toBe(2);
    expect((messages[1] as Bubble).continued).toBe(true);
  });

  test("can toggle the chatbot", async () => {
    const container = chatbot.shadowRoot!.querySelector(".chatbot-container");
    expect(container).not.toBeNull();
    expect(container!.classList.contains("hidden")).toBe(true);
    (chatbot as Chatbot).toggle();
    expect(container!.classList.contains("hidden")).toBe(false);
    expect(container!.classList.contains("animation-scale-out")).toBe(false);
    expect(container!.classList.contains("animation-scale-in")).toBe(true);
    await fireEvent.animationEnd((chatbot as Chatbot).container!);
    (chatbot as Chatbot).toggle();
    expect(container!.classList.contains("hidden")).toBe(false);
    expect(container!.classList.contains("animation-scale-out")).toBe(true);
    expect(container!.classList.contains("animation-scale-in")).toBe(false);
    (chatbot as Chatbot).toggle();
    expect(container!.classList.contains("hidden")).toBe(false);
    expect(container!.classList.contains("animation-scale-out")).toBe(false);
    expect(container!.classList.contains("animation-scale-in")).toBe(true);
  });

  test('hide last loading bubble', () => {
    (chatbot as Chatbot).sendMessage("", {right: false, loading: true});
    (chatbot as Chatbot).sendMessage("", {right: false, loading: true});
    (chatbot as Chatbot).sendMessage("", {right: false, loading: true});
    let messages = chatbot.shadowRoot!.querySelectorAll("chat-bubble[loading]");
    expect(messages.length).toBe(3);
    messages.forEach((node, i) => {
      node.setAttribute('data-index', String(i))
    });
    (chatbot as Chatbot).hideLastLoading();
    messages = chatbot.shadowRoot!.querySelectorAll("chat-bubble[loading]");
    expect(messages.length).toBe(2);
    expect(messages[messages.length - 1]?.dataset?.index).toBe("1");
  })

  test('hide all loading bubbles', () => {
    (chatbot as Chatbot).sendMessage("", {right: false, loading: true});
    (chatbot as Chatbot).sendMessage("", {right: false, loading: true});
    (chatbot as Chatbot).sendMessage("", {right: false, loading: true});
    let messages = chatbot.shadowRoot!.querySelectorAll("chat-bubble[loading]");
    expect(messages.length).toBe(3);
    (chatbot as Chatbot).hideAllLoading();
    messages = chatbot.shadowRoot!.querySelectorAll("chat-bubble[loading]");
    expect(messages.length).toBe(0);
  })

  test('hide loading bubble at index 1', () => {
    (chatbot as Chatbot).sendMessage("", {right: false, loading: true});
    (chatbot as Chatbot).sendMessage("", {right: false, loading: true});
    (chatbot as Chatbot).sendMessage("", {right: false, loading: true});
    let messages = chatbot.shadowRoot!.querySelectorAll("chat-bubble[loading]");
    expect(messages.length).toBe(3);
    messages.forEach((node, i) => {
      node.setAttribute('data-index', String(i))
    });
    (chatbot as Chatbot).hideLoading(1);
    messages = chatbot.shadowRoot!.querySelectorAll("chat-bubble[loading]");
    expect(messages.length).toBe(2);
    expect(messages[messages.length - 1]?.dataset?.index).toBe("2");
    expect(messages[0]?.dataset?.index).toBe("0");
  })
});
