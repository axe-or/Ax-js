// editor.ts
var ed;
((ed) => {
  const P = (x) => {
    console.log(`>> ${x}`);
    return x;
  };
  function assert(pred) {
    if (!pred) {
      throw new Error("Assertion failure");
    }
  }
  function unimplemented(msg = "") {
    if (msg.length > 0) {
      console.error(msg);
    }
    throw new Error("Unimplemented");
  }
  const min = (a, b) => a < b ? a : b;
  const max = (a, b) => a > b ? a : b;
  const clamp = (lo, x, hi) => min(max(lo, x), hi);
  function initHTMLCursor(cursor) {
    cursor.style.height = Global.FontHeight + 1;
    cursor.style.width = Global.FontWidth;
    cursor.style.position = "absolute";
    cursor.style.backgroundColor = "#3d3d3d";
    cursor.style.margin = 0;
    cursor.style.padding = 0;
    cursor.style.zIndex = -2;
    return cursor;
  }

  class Buffer {
    lines = [];
    cursor = { line: 0, col: 0 };
    constructor() {
    }
    moveCursor(dx, dy) {
      let l = this.cursor.line;
      const c = this.cursor.col;
      this.cursor.line = clamp(0, l + dy, this.lines.length - 1);
      l = this.cursor.line;
      this.cursor.col = clamp(0, c + dx, this.lines[l].length);
    }
    underCursor(cursor = null) {
      const cur = cursor ?? this.cursor;
      return this.lines[cur.line][cur.col];
    }
    checkCursor() {
      const lineSize = this.lines[this.cursor.line].length ?? -1;
      return this.cursor.col < lineSize;
    }
    splitLine(cursor = null) {
      const cur = cursor ?? this.cursor;
      const line = this.lines[cur.line];
      let postCur = line.substring(cur.col, line.length);
      this.lines.splice(cur.line + 1, 0, postCur);
      this.lines[cur.line] = this.lines[cur.line].substring(0, cur.col);
    }
    insertText(text) {
      if (this.lines.length <= 0) {
        this.lines.push("");
      }
      this._insertIntoLine(text);
    }
    deleteLine(idx) {
      this.lines.splice(idx, 1);
    }
    _insertIntoLine(text) {
      const cur = this.cursor;
      const line = this.lines[cur.line];
      const head = line.substring(0, cur.col);
      const tail = line.substring(cur.col, line.length);
      this.lines[cur.line] = head + text + tail;
    }
    get lineCount() {
      return this.lines.length;
    }
  }
  function updateLines(buffer, root) {
    let lines = root.querySelectorAll(".editor-line");
    for (let i = 0;i < lines.length; i++) {
      root.removeChild(lines[i]);
    }
    for (let i = 0;i < buffer.lineCount; i++) {
      let el = document.createElement("div");
      el.className = "editor-line";
      el.style.whiteSpace = "pre";
      el.style.width = "fit-content";
      el.style.height = (Global.FontHeight * 2).toString();
      el.style.padding = "0";
      el.style.margin = "0";
      el.textContent = buffer.lines[i].replaceAll("\t", " ");
      root.appendChild(el);
    }
  }
  function updateHTMLCursor(buf, cur) {
    const left = Global.FontWidth * buf.cursor.col;
    const top = 2 * Global.FontHeight * buf.cursor.line;
    cur.style.left = left;
    cur.style.top = top;
  }
  function initInputHandling(ele) {
    ele.addEventListener("keydown", (ev) => {
      if (ev.isPreventedDefault) {
        return;
      }
      let dirty = false;
      switch (ev.key) {
        case "ArrowUp":
          Global.buffer.moveCursor(0, -1);
          break;
        case "ArrowDown":
          Global.buffer.moveCursor(0, 1);
          break;
        case "ArrowLeft":
          Global.buffer.moveCursor(-1, 0);
          break;
        case "ArrowRight":
          Global.buffer.moveCursor(1, 0);
          break;
        case "Enter":
          Global.buffer.splitLine();
          Global.buffer.moveCursor(0, 1);
          dirty = true;
          break;
        case "Shift":
        case "Control":
          break;
        case "Tab":
          Global.buffer.insertText("    ");
          Global.buffer.moveCursor(4, 0);
          dirty = true;
          break;
        case "End":
          Global.buffer.moveCursor(1e7, 0);
          break;
        case "Home":
          Global.buffer.moveCursor(-1e7, 0);
          break;
        case "Backspace":
          break;
        default:
          Global.buffer.insertText(ev.key);
          Global.buffer.moveCursor(1, 0);
          dirty = true;
          break;
      }
      updateHTMLCursor(Global.buffer, Global.cursorElement);
      if (dirty) {
        updateLines(Global.buffer, Global.bufElement);
      }
      ev.preventDefault();
    }, true);
  }
  function getFontWidth(height) {
    const tmp = document.createElement("div");
    const body = document.querySelector("body");
    tmp.textContent = "X";
    tmp.style.width = "fit-content";
    tmp.style.padding = "0";
    tmp.style.margin = "0";
    tmp.style.fontSize = height;
    body.appendChild(tmp);
    const W = window.getComputedStyle(tmp, null).width;
    body.removeChild(tmp);
    return parseFloat(W);
  }
  let Global = {
    buffer: new Buffer,
    bufElement: document.querySelector("#editor-buffer"),
    cursorElement: document.querySelector("#editor-cursor"),
    FontHeight: 12,
    FontName: "monospace",
    FontWidth: 1
  };
  document.querySelector("body").style.fontSize = Global.FontHeight + "px";
  Global.FontWidth = getFontWidth(Global.FontHeight);
  Global.buffer.lines.push("");
  updateLines(Global.buffer, Global.bufElement);
  initHTMLCursor(Global.cursorElement);
  updateHTMLCursor(Global.buffer, Global.cursorElement);
  initInputHandling(document.querySelector("body"));
})(ed ||= {});
