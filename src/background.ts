import minimatch from "minimatch";
import { sniffHttp, sniffWs, SniffedMessage } from "@tgiardina/sniff";

enum Protocol {
  Any,
  Http,
  Ws,
}

function getProtocol(): Protocol {
  const protocolString = process.env.PROTOCOL;
  let protocol: Protocol;
  if (!protocolString || protocolString === "any") {
    protocol = Protocol.Any;
  } else if (protocolString === "http") {
    protocol = Protocol.Http;
  } else if (protocolString === "ws") {
    protocol = Protocol.Ws;
  } else {
    throw new Error(
      `Invalid Protocol "${protocolString}". Please choose "any", "http", or "ws"`
    );
  }
  return protocol;
}

function isMatch(url: string, urls?: string): boolean {
  if (!urls || urls.length) return true;
  try {
    urls = urls.replace("[", "");
    urls = urls.replace("]", "");
    urls = urls.replace(/"/g, "");
    urls = urls.replace(/'/g, "");
    urls = urls.replace(/ /g, "");
    const split = urls.split(",");
    for (const urlRegex of split) {
      if (minimatch(url, urlRegex)) return true;
    }
    return false;
  } catch (err) {
    throw new Error(
      `Invalid urls "${urls}". Must be of format "["url1", "url2"]"`
    );
  }
}

function sniff(protocol: string, msg: SniffedMessage): void {
  const _isMatch =
    isMatch(msg.srcUrl, process.env.SRC_URLS) &&
    isMatch(msg.targetUrl, process.env.TARGET_URLS);
  if (_isMatch)
    console.log(
      `${msg.srcUrl} received ${protocol} message from ${msg.targetUrl}:\n${msg.data}`
    );
}

console.log("Successfully loaded!");
console.log("Open a new tab to start sniffing traffic.");
const protocol = getProtocol();
if (protocol === Protocol.Any || protocol === Protocol.Http) {
  sniffHttp((msg) => sniff("http", msg));
}
if (protocol === Protocol.Any || protocol === Protocol.Ws) {
  sniffWs((msg) => sniff("ws", msg));
}
