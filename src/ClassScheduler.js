const Papa  = require("papaparse");
const fs = require('node:fs');
const util = require('util');

var classroom = null;
var horario = null;



fs.readFile("CaracterizaçãoDasSalas.csv", 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    classroom = data;
    horarioFile();
});
function horarioFile(){
    fs.readFile("HorarioDeExemplo.csv", 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        horario = data;
        getSalas();
    });
}


function getSalas(){
    Papa.parse(classroom, {
        header:true,
        complete: function(results) {
            classroom = results.data;
            getHorario();
        }
    });
}

function getHorario(){
    Papa.parse(horario, {
        header:true,
        complete: function(results) {
            horario = results.data;
            console.log(getSala());
            //findOpenSlots(new Date(2022,10,23),new Date(2022,10,30));
            //findClassTimes();
        }
    });
}

function findClassTimes(){
    /*console.log( horario.reduce( (acc, curr) => {
        if (!acc.includes(curr['Hora início da aula']+"-"+curr['Hora fim da aula']))
            acc.push(curr['Hora início da aula']+"-"+curr['Hora fim da aula']);
        return acc;
    }, []).sort((a,b) => {
        if(a != undefined && b != undefined){
            const t1 = a.split(":");
            const t2 = b.split(":");
            if(t1[0]!= t2[0]){
                return parseInt(t1[0])-parseInt(t2[0]);
            } else {
                return parseInt(t1[1])-parseInt(t2[1]);
            } 
        }
        return 0;
    }));*/
    /*console.log(horario.reduce( (acc, curr) => {
        if (!acc.includes(curr['Hora fim da aula']))
            acc.push(curr['Hora fim da aula']);
        return acc;
    }, []).sort((a,b) => {
        if(a != undefined && b != undefined){
            const t1 = a.split(":");
            const t2 = b.split(":");
            if(t1[0]!= t2[0]){
                return parseInt(t1[0])-parseInt(t2[0]);
            } else {
                return parseInt(t1[1])-parseInt(t2[1]);
            } 
        }
        return 0;
    }));*/
}

function findOpenSlots(DataIni,DataFim){
    var slots = [];
    console.log(DataIni);
    console.log(DataFim);
    for(let date = new Date(DataIni.getTime()); date <= DataFim;date.setDate(date.getDate()+1)){
        console.log(date);
        slots.push({'data':new Date(date.getTime()),salas:getSala()});
    }
    console.log(slots);
    /*console.log(horario.filter( data => {
        if(data['Data da aula'] != undefined){
            const d = data['Data da aula'].split("/");
            const date = new Date(d[2], parseInt(d[1])-1, d[0]);
            return date>DataIni && date < DataFim;
        }
        return false;
    }).sort((a,b) => {
        if(a['Data da aula'] != undefined && b['Data da aula'] != undefined){
            const d = a['Data da aula'].split("/");
            const d1 = b['Data da aula'].split("/");
            const date = new Date(d[2], parseInt(d[1])-1, d[0]);
            const date1 = new Date(d1[2], parseInt(d1[1])-1, d1[0]);
            return date-date1;
        }
        return 0;
    }));*/
}

function getSala(){
    let res = [];
    classroom.forEach(sala => {
        res.push({sala:sala['Nome sala'],timeslot:[]})
    });
    res.sort((a,b) => a['sala'].localeCompare(b['sala']));
    return res;
}

function getDisponibilidadeSala(nome,dia){
    horario.filter((aula => {
        aula['']
    }));
}