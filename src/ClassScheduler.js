import DateConverter from './DateConverter.js';

export default class ClassScheduler {
    /**
     * Encontra slots de substituição disponíveis.
     * @param {Object} filters - Filtros para a busca.
     * @param {Object[]} horario - Dados do horário.
     * @param {Object[]} salas - Dados das salas.
     * @returns {Object[]} Slots de substituição disponíveis.
     */
    static findSubstitutionSlots(filters, horario, salas) {
        if (!horario || !salas) {
            alert("Por favor, carregue os ficheiros de horários e salas primeiro.");
            return [];
        }

        return this.findOpenSlots(salas, horario, filters);
    }

    /**
     * Encontra slots de alocação de UC disponíveis.
     * @param {Object} filters - Filtros para a busca.
     * @param {Object[]} horario - Dados do horário.
     * @param {Object[]} salas - Dados das salas.
     * @returns {Object[]} Slots de alocação de UC disponíveis.
     */

    static findUCAllocationSlots(filters, horario, salas) {
        if (!horario || !salas) {
            alert("Por favor, carregue os ficheiros de horários e salas primeiro.");
            return [];
        }
    
        const slots = this.findOpenSlots(salas, horario, filters);
        const allocatedSlots = [];
    
        for (let i = 0; i < filters.NumberOfClasses; i++) {
            if (slots.length > 0) {
                const slot = slots.shift();
                const allocatedSlot = {
                    data: slot.data,
                    sala: slot.sala,
                    HoraIni: slot.HoraIni,
                    HoraFim: slot.HoraFim,
                    UC: filters.UCName,
                };
                allocatedSlots.push(allocatedSlot);
            } else {
                break;
            }
        }
    
        return allocatedSlots;
    }



















    /**
     * Encontra slots abertos com base nos filtros, horário e salas fornecidos.
     * @param {Object[]} classroom - Dados das salas.
     * @param {Object[]} horario - Dados do horário.
     * @param {Object} filters - Filtros para a busca.
     * @param {Date} [filters.DataIni] - Data inicial para busca.
     * @param {Date} [filters.DataFim] - Data final para busca.
     * @returns {Object[]} Slots abertos encontrados.
     */
    static findOpenSlots(classroom, horario, filters) {
        if (filters.DataIni != undefined && filters.DataFim != undefined) {
            var days = [];
            for (let date = new Date(filters.DataIni.getTime()); date <= filters.DataFim; date.setDate(date.getDate() + 1)) {
                days.push(new Date(date.getTime()));
            }

            var fHorario = horario.filter(aula => {
                if (aula['Data da aula'] != undefined) {
                    const d = aula['Data da aula'].split("/");
                    const date = new Date(d[2], parseInt(d[1]) - 1, d[0]);
                    return date.getTime() >= filters.DataIni.getTime() && date.getTime() <= filters.DataFim.getTime();
                }
                return false;
            });

            var salas = this.listSalas(classroom);
            var slots = [];

            days.forEach(data => {
                var dHorario = fHorario.filter(a => {
                    const d = a['Data da aula'].split("/");
                    const date = new Date(d[2], parseInt(d[1]) - 1, d[0]);
                    return data.getTime() === date.getTime();
                });

                salas.forEach(sala => {
                    let daySala = this.getDisponibilidadeSala(dHorario, sala, data);
                    daySala.forEach(time => {
                        slots.push({ data: data.toISOString().split('T')[0], sala: sala, HoraIni: time.HoraIni, HoraFim: time.HoraFim });
                    });
                });
            });

            return slots;
        } else {
            return [];
        }
    }

 //static findUCAllocationSlots(filters, horario, salas) {
   //     if (!horario || !salas) {
     //       alert("Por favor, carregue os ficheiros de horários e salas primeiro.");
       //     return [];
        //}

//        const slots = this.findOpenSlots(salas, horario, filters);
  //      const allocatedSlots = [];

//        for (let i = 0; i < filters.NumberOfClasses; i++) {
  //          if (slots.length > 0) {
    //            const slot = slots.shift();
      //          allocatedSlots.push({
        //            ...slot,
          //          UC: filters.UCName,
                   
           //     });
      //      } else {
     //   break;
        //    }
       // }

    //    return allocatedSlots;
//    }














    /**
     * Lista todas as salas disponíveis.
     * @param {Object[]} classroom - Dados das salas.
     * @returns {string[]} Lista de nomes das salas ordenadas.
     */
    static listSalas(classroom) {
        let res = [];
        classroom.forEach(sala => {
            res.push(sala['Nome sala']);
        });
        res.sort((a, b) => a.localeCompare(b));
        return res;
    }

    /**
     * Obtém a disponibilidade de uma sala em um determinado dia.
     * @param {Object[]} horario - Dados do horário.
     * @param {string} nome - Nome da sala.
     * @param {Date} data - Data para verificar a disponibilidade.
     * @returns {Object[]} Horários disponíveis da sala no dia especificado.
     */
    static getDisponibilidadeSala(horario, nome, data) {
        let daysOcupados = horario.filter(aula => {
            return aula['Sala atribuída à aula'].trim() === nome.trim();
        }).sort((a, b) => {
            if (a['Hora início da aula'] != undefined && b['Hora início da aula'] != undefined) {
                const t1 = a['Hora início da aula'].split(":");
                const t2 = b['Hora início da aula'].split(":");
                if (t1[0] != t2[0]) {
                    return parseInt(t1[0]) - parseInt(t2[0]);
                } else {
                    return parseInt(t1[1]) - parseInt(t2[1]);
                }
            }
            return 0;
        });

        let timedays = [];
        let time = "08:00:00";

        daysOcupados.forEach(aula => {
            if (time < aula['Hora início da aula'].trim()) {
                timedays.push({ 'HoraIni': time, 'HoraFim': aula['Hora início da aula'].trim() });
            }
            time = aula['Hora fim da aula'].trim();
        });

        if (time < "22:30:00") {
            timedays.push({ 'HoraIni': time, 'HoraFim': "22:30:00" });
        }

        return timedays;
    }

    /**
     * Encontra conflitos entre as aulas no horário.
     * @param {Object[]} data - Dados do horário.
     * @returns {Object[]} Lista de conflitos encontrados.
     */
    static findConflicts(data) {
        const conflicts = [];
        for (let i = 0; i < data.length; i++) {
            for (let j = i + 1; j < data.length; j++) {
                if (this.isConflicting(data[i], data[j])) {
                    conflicts.push({ source: data[i], target: data[j] });
                }
            }
        }
        return conflicts;
    }

    /**
     * Verifica se duas aulas estão em conflito.
     * @param {Object} aula1 - Dados da primeira aula.
     * @param {Object} aula2 - Dados da segunda aula.
     * @returns {boolean} Verdadeiro se as aulas estão em conflito, falso caso contrário.
     */
    static isConflicting(aula1, aula2) {
        const date1 = DateConverter.convertToDate(aula1['Data da aula']);
        const date2 = DateConverter.convertToDate(aula2['Data da aula']);
        if (date1.getTime() !== date2.getTime()) {
            return false;
        }

        const start1 = aula1['Hora início da aula'];
        const end1 = aula1['Hora fim da aula'];
        const start2 = aula2['Hora início da aula'];
        const end2 = aula2['Hora fim da aula'];

        return (start1 < end2 && start2 < end1);
    }
}
