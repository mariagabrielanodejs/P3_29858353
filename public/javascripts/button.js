const button = document.getElementById('option');
const fila = document.getElementById('fila');
const hamburguer = document.getElementById('hamburguer');
const categoria = document.getElementById('categoria');
const failed = document.getElementById('failed');


button.addEventListener('click', (e) => {
    console.log(button.textContent)
    if(button.textContent === 'Cambiar a lista'){
        button.textContent = 'Cambiar a cuadricula';
        fila.style.flexDirection = "column";
        fila.classList.add('list');

    }
    else{
        button.textContent = 'Cambiar a lista';
        fila.style.flexDirection = "row";
        fila.classList.remove('list');   
    }
})

hamburguer.addEventListener('click',(e) => {
    categoria.classList.add('aparece');
    hamburguer.classList.add('desaparece')
    failed.classList.add('aparece');
})

failed.addEventListener('click',(e) => {
    categoria.classList.remove('aparece');
    hamburguer.classList.remove('desaparece')
    failed.classList.remove('aparece');
})

