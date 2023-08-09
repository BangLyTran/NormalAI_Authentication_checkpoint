import bot from './assets/bot.svg'
import user from './assets/user.svg'

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container')

let loadInterval;


function loader(element){
  element.textContent = '';

  loadInterval=setInterval(() => {
    element.textContent += '.';

    if(element.textContent === '....') {
      element.textContent = '';

    }
  }, 300)
}

function typeText (element, text) {
  let index = 0;

  let interval = setInterval(() => { 
    if (index < text.length) {
    element.innerHTML += text.charAt(index);
    index++;
    } else {
      clearInterval(interval)
    }},20)
}

function generateUniqueId() {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
  return (
    `
      <div class="wrapper ${isAi &&'ai'}">
        <div class = "chat">
          <div class = "profile">
            <img
              src="${isAi ? bot:user}"
              alt="${isAi ? 'bot':'user'}"
            />
          </div>
          <div class="message" id=${uniqueId}>${value}</div>
        </div>
      </div>
    `
  )
}

const handleSubmit = async (e) => {
  e.preventDefault();

  const formData = new FormData(form);

  // user's chatstripe
  chatContainer.innerHTML += chatStripe(false, formData.get('prompt'));

  form.reset();

  // bot's chatstripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight;
  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  // fetch data from server -> bot's response
  const response = await fetch('https://enginuitee8.onrender.com/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: formData.get('prompt') // Changed `prompt` to `message`
    })
  })

  clearInterval(loadInterval);
  messageDiv.innerHTML = '';

  const data = await response.json();
  console.log(data); // This will log the entire response to the console

  if(response.ok) {
    const parsedData = data.choices ? data.choices[0].message.content.trim() : JSON.stringify(data); // If data.choices is not available, convert the entire data to a string
    
    const rawResponse = JSON.stringify(data, null, 2); // Convert the entire data object to a string

    const textToShow = `${parsedData}`;

    typeText(messageDiv, textToShow);    
  } else {
    const err = await response.text();

    messageDiv.innerHTML = "Something went wrong";

    alert(err);
  }
}

form.addEventListener('submit', handleSubmit);

form.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSubmit(e);
  }
});
