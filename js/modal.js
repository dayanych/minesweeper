const modalWindow = (isWin, seconds, move, sound) => {
  let audio;
  const modalWindow = document.createElement('div');
  modalWindow.classList.add('modal-window');
  const content = document.createElement('div');
  content.classList.add('modal-content');
  modalWindow.append(content);
  const closeBtn = document.createElement('button');
  closeBtn.classList.add('modal-close');
  closeBtn.innerHTML = '&times;';
  content.append(closeBtn);
  if (isWin) {
    if (sound) {
      audio = new Audio('assets/sound/win.wav');
      audio.play();
    }
    content.insertAdjacentHTML('beforeEnd', `<p>
    You win in ${move} ${move > 1 ? 'moves' : 'move'} and ${seconds} ${seconds > 1 ? 'seconds' : 'second'}! 
    </p>`);
  }
  if (!isWin) {
    if (sound) {
      audio = new Audio('assets/sound/lose.wav');
      audio.play();
    }
    content.insertAdjacentHTML('beforeEnd', `
    <p>F...</p>
    <img class="modal-img" src="assets/img/f.png" alt="F">`);
  }
  document.body.append(modalWindow);
  closeBtn.addEventListener('click', () => {
    if (sound) audio.pause();
    modalWindow.remove();
  });
}

export default modalWindow;