let count = 0;
const countEl = document.querySelector('#count');
document.querySelectorAll('.add').forEach(btn => {
  btn.addEventListener('click', () => {
    count++;
    countEl.textContent = count;
    console.log('cart:', count);
  });
});