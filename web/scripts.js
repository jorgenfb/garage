const garageCard = document.querySelector('.garage-card');
const garageCardTitle = document.querySelector('.garage-card .mdl-card__title-text');
const garageCardAction = document.querySelector('.garage-card a');

fetch('/api/garage-door')
  .then(response => response.json())
  .then(data => {
    if (data.open) {
      garageCard.classList.add('is-open');
      garageCardTitle.innerText = 'Open';
      garageCardAction.innerText = 'Close';
    } else {
      garageCard.classList.remove('is-open');
      garageCardTitle.innerText = 'Closed';
      garageCardAction.innerText = 'Open';
    }
  });
