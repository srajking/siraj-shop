let count = 0;
let sum = 0;
const countEl = document.querySelector('#count');
const totalEl = document.querySelector('#total');
document.querySelectorAll('.add').forEach(btn => {
  btn.addEventListener('click', () => {
    count += 1;
    countEl.textContent = count;
    const price = btn.closest('.card').querySelector('.price').textContent;
    sum += Number(price.replace(/[^0-9]/g, ''));
    totalEl.textContent = discount(sum).toLocaleString('en-US');
    btn.textContent = 'تمت الاضافة';
  });
});
function discount(sum) {
  return sum >= 10000 ? sum * 0.9 : sum;
}
