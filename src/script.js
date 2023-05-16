document.addEventListener('DOMContentLoaded', main);

function main() {
  document.querySelector('#submit').addEventListener('click', (e) => {
    const content = document.querySelector('#input').value;
    parseHTML(content)
      .then((parsedCode) => {
        document.querySelector('#output').value = parsedCode;
      })
      .catch((error) => {
        console.error('Error parsing HTML:', error);
      });
  });

  document.addEventListener('click', handleCopy);
}

function handleCopy(e) {
  switch (e.target.id) {
    case 'copy': {
      copyText(document.getElementById('output').value);
      break;
    }
    case 'code': {
      copyText(document.getElementById('code').textContent);
      break;
    }
  }
}

function copyText(content) {
  navigator.clipboard
    .writeText(content)
    .then(() => {
      console.log('Code copied to clipboard:', content);
    })
    .catch((error) => {
      console.error('Unable to copy code to clipboard:', error);
    });
}
