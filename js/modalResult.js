const modalResult = (arr) => {
  const modalWindow = document.createElement('div');
  modalWindow.classList.add('modal-window');
  const content = document.createElement('div');
  content.classList.add('modal-content');
  modalWindow.append(content);
  const closeBtn = document.createElement('button');
  closeBtn.classList.add('modal-close');
  closeBtn.innerHTML = '&times;';
  if (arr.length > 0) {
    const table = document.createElement('table');
    table.classList.add('results');
    table.innerHTML = '<tr class="results__row"><th class="results__title">&nbsp;</th><th class="results__title">Seconds</th><th class="results__title">Clicks</th><th class="results__title">Level</th><th class="results__title">Mines</th></tr>';
    arr.forEach((el, i) => {
      let level = 'Easy';
      if (el[2] === 15) {
        level = 'Medium';
      }
      if (el[2] === 25) {
        level = 'Hard';
      }
      const tableRow = `<tr class="results__row"><td class="results__data">${i + 1}</td><td class="results__data">${el[0]}</td><td class="results__data">${el[1]}</td><td class="results__data">${level}</td><td class="results__data">${el[3]}</td></tr>`;
      table.insertAdjacentHTML('beforeend', tableRow);
    });
    content.append(table);
  } else {
    const p = document.createElement('p');
    p.innerHTML = 'The list of the last 10 winnings is displayed here. No results yet';
    content.append(p);
  }
  content.append(closeBtn);
  document.body.append(modalWindow);
  closeBtn.addEventListener('click', () => {
    modalWindow.remove();
  });
}

export default modalResult;