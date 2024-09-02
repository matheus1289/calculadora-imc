
const form = document.querySelector('.form');

form.addEventListener('submit', function(e) {
    e.preventDefault();

    
    const peso = document.getElementById('peso').value;
    const altura = document.getElementById('altura').value;

    const imc = (peso / (altura * altura)).toFixed(1);

    let info = '';

    const valor = document.querySelector('.imc-numero');

    document.querySelector('.container-menor').classList.remove('hide');

    if(imc < 18.5){
        info = 'Cuidado! você está abaixo do peso';
    }else if(imc >= 18.5 && imc < 25){
        info = 'Parabéns! você está no peso ideal!!';
        valor.classList.remove('imc-numero');
        valor.classList.add('green');
    }else if(imc >= 25 && imc < 30){
        info = 'Cuidado! você está sobrepeso!';
    }else if(imc >= 30 && imc < 35){
        info = 'Cuidado! você está obesidade moderada!';
    }else if(imc >= 35 && imc < 40){
        info = 'Cuidado! você está obesidade severa!';
    } else{
        info = 'Cuidado! você está obesidade morbida!';
    }


    valor.textContent = imc.replace('.', ',');
    document.getElementById('info').textContent = info;

})