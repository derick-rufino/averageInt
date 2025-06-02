// Variáveis globais
// Number Displays
let num1 = document.getElementById('number1');
let num2 = document.getElementById('number2');
let num3 = document.getElementById('number3');
let num4 = document.getElementById('number4');
let media = null;

// Botões
let randomizeBtn = document.getElementById('randomize-btn')


randomizeBtn.addEventListener("click", function generateRandom(){
    console.clear(); //limpa a tentativa anterior
    num1.innerText = parseInt(Math.random()*20);
    num2.innerText = parseInt(Math.random()*20);
    num3.innerText = parseInt(Math.random()*20);
    num4.innerText = parseInt(Math.random()*20);

    media = (num1 + num2 + num3 + num4)/4;
    
    // for(i = 0; i < 4; i++){
    //   console.log(parseInt(Math.random()*20))
    // }
    console.log("A média é: " + media)
});

// Armazenando a entrada do usuário
const guessForm = document.getElementById('guessForm');

guessForm.addEventListener('submit', (e) => {
    e.preventDefault(); //previne que a página recarregue ao enviar o form
    const formValue = new FormData(guessForm);
    
    for (item of formValue){ //para cada item dentro dos valores do form
        console.log(item) //loga o item que o user deu entrada em formato array
        let userGuessValue = item[1]; //acessa o array e armazena apenas o valor numérico
        console.log("User Input: " + userGuessValue);

        document.getElementById('userGuess').value = "";
    }
});
