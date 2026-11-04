let count = 0;
const countEl = document.querySelector('#count');
document.querySelectorAll('.add').forEach(btn => {
  btn.addEventListener('click', () => {
    count += 1;
    countEl.textContent = count;
    console.log('cart items:', count);
  });
});
function discount(sum) {
  return sum >= 10000 ? sum * 0.9 : sum;
}
