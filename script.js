document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('csv-file');
    input.addEventListener('change', handleFileSelect, false);
});

function handleFileSelect(event) {
    const file = event.target.files[0];
    Papa.parse(file, {
        header: true,
        delimiter: ";",
        complete: function(results) {
            console.log("Parsing completo:", results);
            displayData(results.data);
        }
    });
    
}

function displayData(data) {
    // Configuração das colunas, se necessário, pode ser mais detalhada aqui
    var columns = [
        {title: "Curso", field: "Curso"},
        {title: "Unidade Curricular", field: "Unidade Curricular"},
        {title: "Turno", field: "Turno"},
        {title: "Turma", field: "Turma"},
        {title: "Inscritos no turno", field: "Inscritos no turno"},
        {title: "Dia da semana", field: "Dia da semana"},
        {title: "Hora início da aula", field: "Hora início da aula"},
        {title: "Hora fim da aula", field: "Hora fim da aula"},
        {title: "Data da aula", field: "Data da aula"},
        {title: "Características da sala pedida para a aula", field: "Características da sala pedida para a aula"},
        {title: "Sala atribuída à aula", field: "Sala atribuída à aula"},
    ];

    new Tabulator("#example-table", {
        data: data, // Atribui os dados do CSV à tabela
        autoColumns: true, // Cria colunas automaticamente a partir dos dados
        pagination: "local", // Habilita a paginação local
        paginationSize: 50, // Número de linhas por página
        paginationSizeSelector: [50, 100, 200], // Opções para o tamanho da página
        layout: "fitColumns", // Ajusta as colunas para caber no layout
    });
}
