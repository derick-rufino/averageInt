// Acessando os elementos HTML 
let num1 = document.getElementById('number1');
let num2 = document.getElementById('number2');
let num3 = document.getElementById('number3');
let num4 = document.getElementById('number4');
let uMessage = document.getElementById('message');

function getNumberValue(element) { //delcara que cada elemento recebido no parametro
    return parseInt(element.innerText); //será um número inteiro
}

// o "elem" permite que os parametros usados ao chamar essa função, sejam passados como array
function calcularMedia(elem) { 
    const soma = elem.reduce((acc, el) => acc + getNumberValue(el), 0); //soma os valores dos elementos, através da redução do array a um único valor: o reduce tem um acumulador (iniciado em 0) e o valor atual do elemento, que é armazenado na variável "el".
    return soma / elem.length; //retorna a média baseada no número de elementos
}

let mediaAtual = null;

// Aciona a função de aleatorizar
let randomizeBtn = document.getElementById('randomize-btn')
randomizeBtn.addEventListener("click", function generateRandom(){
    console.clear(); //limpa a tentativa anterior
    uMessage.innerText = ''; //limpa o texto exibido para o usuário (acerto, erro ou dica)
    let isInteger = false; //define uma nova variável que por padrão é false, até ser atualizada na linha 37, se o teste "mediaAtual é int" retornar true

    while (!isInteger) {
        num1.innerText = parseInt(Math.random()*30);
        num2.innerText = parseInt(Math.random()*30);
        num3.innerText = parseInt(Math.random()*30);
        num4.innerText = parseInt(Math.random()*30);

        mediaAtual = calcularMedia([num1, num2, num3, num4]);
        console.log("O tipo de mediaAtual é " + typeof(mediaAtual));
        console.log("Média atual: " + mediaAtual);

        if (Number.isInteger(mediaAtual)) {
            console.log("A média é um número inteiro. O usuário pode digitar sua tentativa.");
            isInteger = true;
        } else {
            console.log("A média é um número float. Gerando nova sequência...");
        }
    }
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

        if (mediaAtual !== null) { //verifica se a média foi calculada
            if (userGuessValue == mediaAtual) { // não pode ser estritamente igual, pois o input reserva outro tipo de dado
                uMessage.innerText = "Parabéns! Você acertou a média!";
            } else {
                uMessage.innerText = "Tente novamente! A média correta é: " + mediaAtual;
            }
        }
        // Limpa o campo de entrada do usuário após a tentativa
        document.getElementById('userGuess').value = "";
    }
});
