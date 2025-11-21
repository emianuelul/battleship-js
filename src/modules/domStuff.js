export class DomStuff {
  static createDiv(identifier = 0) {
    const div = document.createElement('div');
    if (identifier[0] === '#') {
      div.id = identifier.slice(1, identifier.length);
    } else if (identifier[0] === '.') {
      div.classList.add(identifier.slice(1, identifier.length));
    }
    return div;
  }

  static createP(text) {
    const p = document.createElement('p');
    p.textContent = text;

    return p;
  }

  static createSpan(text) {
    const span = document.createElement('span');
    span.textContent = text;

    return span;
  }

  static createButton(text, identifier) {
    const btn = document.createElement('button');
    btn.type = 'button';
    if (identifier[0] === '#') {
      btn.id = identifier.slice(1, identifier.length);
    } else if (identifier[0] === '.') {
      btn.classList.add(identifier.slice(1, identifier.length));
    }

    btn.textContent = text;

    return btn;
  }

  static createHeader() {
    const header = DomStuff.createDiv('.header');
    const text = DomStuff.createP('Battleship');
    text.classList.add('logo');

    const resetBtn = DomStuff.createButton('Reset', '.headerBtn');

    header.append(text, resetBtn);

    return header;
  }

  static createBoardWithCoords(board) {
    const mainContainer = DomStuff.createDiv('.boardWithCoords');
    const leftContainer = DomStuff.createDiv('.boardCoordsLeft');
    const topContainer = DomStuff.createDiv('.boardCoordsTop');

    for (let i = 0; i < 10; i++) {
      const char = String.fromCharCode('A'.charCodeAt(0) + i);
      const span = DomStuff.createSpan(char);

      topContainer.appendChild(span);
    }

    for (let i = 0; i < 10; i++) {
      const span = DomStuff.createSpan(i + 1);

      leftContainer.appendChild(span);
    }

    mainContainer.append(topContainer, leftContainer, board);

    return mainContainer;
  }
}
