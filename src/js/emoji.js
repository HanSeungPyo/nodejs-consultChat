const button = document.querySelector("#emoji_btn");
const picker = new EmojiButton({
    position: 'bottom-start'
});

button.addEventListener('click', () => {
    picker.togglePicker(button);
});

picker.on('emoji', emoji => {
      const text_box = document.querySelector('.chatting-input');
      text_box.value += emoji;
});