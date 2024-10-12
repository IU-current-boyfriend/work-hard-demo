export function render (currentData, paddingSet, list) {
  const oFragment = document.createDocumentFragment();
  currentData.forEach(item => {
    const oItem = document.createElement('div');
    oItem.className = 'list-item';
    oItem.innerText = item;
    oFragment.appendChild(oItem);
  });

  list.appendChild(oFragment);
  updatePaddingSet(paddingSet, list);
}

export function update (currentData, list) {
  const oItems = list.querySelectorAll('.list-item');

  oItems.forEach((item, index) => {
    item.innerText = currentData[index];
  })
}

export function updatePaddingSet (paddingSet, list) {
  for (let key in paddingSet) {
    list.style[key] = paddingSet[key] + 'px';
  }
}